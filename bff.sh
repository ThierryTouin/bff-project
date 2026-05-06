#!/bin/bash

PROJECT_NAME="bff-project"
SHOW_LOGS=true

usage() {
    echo "Script de gestion BFF (Docker Compose)"
    echo
    echo "Usage: $0 {up [service]|clean|list|check-fake-oidc|switch <mode>}"
    echo
    echo "  up              : demarre toute la stack"
    echo "  up service      : demarre uniquement le service specifie"
    echo "  clean           : arrete et nettoie la stack"
    echo "  list            : liste les services disponibles"
    echo "  check-fake-oidc : teste les endpoints du service fake-oidc"
    echo "  switch keycloak : bascule la config sur Keycloak"
    echo "  switch fake-oidc: bascule la config sur fake-oidc"
    echo "  switch status   : affiche le mode actuel"
    echo
    exit 1
}

# Commente les lignes entre deux marqueurs (preservant l'indentation)
comment_block() {
    local file="$1"
    local start_marker="$2"
    local end_marker="$3"
    awk -v start="$start_marker" -v end="$end_marker" '
    $0 ~ start { inside=1; print; next }
    $0 ~ end   { inside=0; print; next }
    inside {
        # Deja commente ? on laisse tel quel
        if ($0 ~ /^[[:space:]]*#/) { print; next }
        # Sinon on commente en preservant l indentation
        match($0, /^[[:space:]]*/);
        ws = substr($0, 1, RLENGTH);
        rest = substr($0, RLENGTH + 1);
        print ws "# " rest;
        next
    }
    { print }
    ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
}

# Decommente les lignes entre deux marqueurs (preservant l'indentation)
uncomment_block() {
    local file="$1"
    local start_marker="$2"
    local end_marker="$3"
    awk -v start="$start_marker" -v end="$end_marker" '
    $0 ~ start { inside=1; print; next }
    $0 ~ end   { inside=0; print; next }
    inside {
        # Supprimer le premier "# " ou "#" apres les espaces
        match($0, /^[[:space:]]*/);
        ws = substr($0, 1, RLENGTH);
        rest = substr($0, RLENGTH + 1);
        sub(/^# ?/, "", rest);
        print ws rest;
        next
    }
    { print }
    ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
}

if [ $# -lt 1 ]; then
    usage
fi

case "$1" in
    up)
        if [ $# -eq 2 ]; then
            SERVICE_NAME=$2
            echo "Demarrage du service: $SERVICE_NAME..."
            docker compose -p $PROJECT_NAME up --build --no-deps $SERVICE_NAME -d
            if [ "$SHOW_LOGS" = true ]; then
                docker compose -p $PROJECT_NAME logs -f $SERVICE_NAME
            fi
        else
            echo "Demarrage de la stack Docker Compose..."
            docker compose -p $PROJECT_NAME up --build -d
            if [ "$SHOW_LOGS" = true ]; then
                docker compose -p $PROJECT_NAME logs -f
            fi
        fi
        ;;
    clean)
        echo "Arret de la stack..."
        docker compose -p $PROJECT_NAME down --volumes --rmi local
        echo "Nettoyage des volumes orphelins..."
        docker volume prune -f
        echo "Termine."
        ;;
    list)
        echo "Services disponibles :"
        docker compose -p $PROJECT_NAME config --services
        ;;
    check-fake-oidc)
        FAKE_OIDC_URL="http://fake-oidc:8080"
        NETWORK="bff-project_default"
        echo "Test des endpoints fake-oidc..."
        echo

        PASS=0
        FAIL=0

        check_endpoint() {
            local method=$1
            local path=$2
            local description=$3
            local extra_args=$4

            printf "  %-50s" "$description ($method $path)"
            HTTP_CODE=$(docker run --rm --network $NETWORK curlimages/curl -s -o /dev/null -w "%{http_code}" $extra_args -X "$method" "${FAKE_OIDC_URL}${path}")
            if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
                echo "OK HTTP $HTTP_CODE"
                PASS=$((PASS + 1))
            else
                echo "FAIL HTTP $HTTP_CODE"
                FAIL=$((FAIL + 1))
            fi
        }

        check_endpoint "GET" "/.well-known/openid-configuration" "OpenID Configuration"
        check_endpoint "GET" "/jwks" "JWKS"
        check_endpoint "GET" "/userinfo" "UserInfo"
        check_endpoint "POST" "/token" "Token" "-d grant_type=authorization_code -d code=fake-code"
        check_endpoint "GET" "/authorize?redirect_uri=http://localhost&state=test" "Authorize" "-L"

        echo
        echo "Resultats: $PASS OK, $FAIL FAIL sur $((PASS + FAIL)) endpoints."
        [ "$FAIL" -gt 0 ] && exit 1
        ;;
    switch)
        if [ $# -ne 2 ]; then
            echo "Usage: $0 switch {keycloak|fake-oidc|status}"
            exit 1
        fi

        COMPOSE_FILE="docker-compose.yml"
        DOCKERFILE="bff/Dockerfile"

        case "$2" in
            keycloak)
                echo "Bascule vers Keycloak..."

                uncomment_block "$COMPOSE_FILE" "@KEYCLOAK-SERVICE-START" "@KEYCLOAK-SERVICE-END"
                comment_block "$COMPOSE_FILE" "@FAKEOIDC-SERVICE-START" "@FAKEOIDC-SERVICE-END"

                uncomment_block "$COMPOSE_FILE" "@KEYCLOAK-ENV-START" "@KEYCLOAK-ENV-END"
                comment_block "$COMPOSE_FILE" "@FAKEOIDC-ENV-START" "@FAKEOIDC-ENV-END"

                uncomment_block "$COMPOSE_FILE" "@KEYCLOAK-DEPENDS-START" "@KEYCLOAK-DEPENDS-END"
                comment_block "$COMPOSE_FILE" "@FAKEOIDC-DEPENDS-START" "@FAKEOIDC-DEPENDS-END"

                uncomment_block "$DOCKERFILE" "@KEYCLOAK-ENTRYPOINT-START" "@KEYCLOAK-ENTRYPOINT-END"

                echo "OK - Configuration basculee sur Keycloak."
                echo "Relancez: ./bff.sh clean && ./bff.sh up"
                ;;
            fake-oidc)
                echo "Bascule vers fake-oidc..."

                comment_block "$COMPOSE_FILE" "@KEYCLOAK-SERVICE-START" "@KEYCLOAK-SERVICE-END"
                uncomment_block "$COMPOSE_FILE" "@FAKEOIDC-SERVICE-START" "@FAKEOIDC-SERVICE-END"

                comment_block "$COMPOSE_FILE" "@KEYCLOAK-ENV-START" "@KEYCLOAK-ENV-END"
                uncomment_block "$COMPOSE_FILE" "@FAKEOIDC-ENV-START" "@FAKEOIDC-ENV-END"

                comment_block "$COMPOSE_FILE" "@KEYCLOAK-DEPENDS-START" "@KEYCLOAK-DEPENDS-END"
                uncomment_block "$COMPOSE_FILE" "@FAKEOIDC-DEPENDS-START" "@FAKEOIDC-DEPENDS-END"

                comment_block "$DOCKERFILE" "@KEYCLOAK-ENTRYPOINT-START" "@KEYCLOAK-ENTRYPOINT-END"

                echo "OK - Configuration basculee sur fake-oidc."
                echo "Relancez: ./bff.sh clean && ./bff.sh up"
                ;;
            status)
                if grep -q "^  fake-oidc:" "$COMPOSE_FILE"; then
                    echo "Mode actuel: fake-oidc"
                elif grep -q "^  keycloak:" "$COMPOSE_FILE"; then
                    echo "Mode actuel: keycloak"
                else
                    echo "Mode actuel: inconnu"
                fi
                ;;
            *)
                echo "Mode inconnu: $2. Utilisez 'keycloak' ou 'fake-oidc'."
                exit 1
                ;;
        esac
        ;;
    *)
        usage
        ;;
esac
