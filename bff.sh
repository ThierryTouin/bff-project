#!/bin/bash

# Nom du projet Docker Compose (adapté si nécessaire)
PROJECT_NAME="bff-project"
SHOW_LOGS=true  # Changez ce paramètre à false si vous ne voulez pas voir les logs

usage() {
    echo "🚀 Script de gestion BFF (Docker Compose)"
    echo
    echo "Usage: $0 {up [service]|down|list|check-fake-oidc}"
    echo
    echo "  up              : démarre toute la stack"
    echo "  up service      : démarre uniquement le service spécifié"
    echo "  clean           : arrête et nettoie la stack"
    echo "  list            : liste les services disponibles"
    echo "  check-fake-oidc : teste les endpoints du service fake-oidc"
    echo
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

case "$1" in
    up)
        if [ $# -eq 2 ]; then
            SERVICE_NAME=$2
            echo "🔧 Démarrage du service: $SERVICE_NAME..."
            docker compose -p $PROJECT_NAME up --build --no-deps $SERVICE_NAME -d

            if [ "$SHOW_LOGS" = true ]; then
                echo "📝 Affichage des logs pour $SERVICE_NAME..."
                docker compose -p $PROJECT_NAME logs -f $SERVICE_NAME
            fi
        else
            echo "🔧 Démarrage de la stack Docker Compose..."
            docker compose -p $PROJECT_NAME up --build -d

            if [ "$SHOW_LOGS" = true ]; then
                echo "📝 Affichage des logs..."
                docker compose -p $PROJECT_NAME logs -f
            fi
        fi
        ;;
    clean)
        echo "🛑 Arrêt de la stack..."
        docker compose -p $PROJECT_NAME down --volumes --rmi local

        echo "🧹 Nettoyage des volumes orphelins..."
        docker volume prune -f

        echo "✅ Terminé."
        ;;
    list)
        echo "📋 Services disponibles :"
        docker compose -p $PROJECT_NAME config --services
        ;;
    check-fake-oidc)
        FAKE_OIDC_URL="http://fake-oidc:8080"
        NETWORK="bff-project_default"
        echo "🔍 Test des endpoints fake-oidc depuis le réseau Docker ($FAKE_OIDC_URL)..."
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
                echo "✅ HTTP $HTTP_CODE"
                PASS=$((PASS + 1))
            else
                echo "❌ HTTP $HTTP_CODE"
                FAIL=$((FAIL + 1))
            fi
        }

        check_endpoint "GET" "/.well-known/openid-configuration" "OpenID Configuration"
        check_endpoint "GET" "/jwks" "JWKS (clés publiques)"
        check_endpoint "GET" "/userinfo" "UserInfo"
        check_endpoint "POST" "/token" "Token" "-d grant_type=authorization_code -d code=fake-code"
        check_endpoint "GET" "/authorize?redirect_uri=http://localhost&state=test" "Authorize (redirect)" "-L"

        echo
        echo "📊 Résultats: $PASS réussi(s), $FAIL échoué(s) sur $((PASS + FAIL)) endpoints."
        if [ "$FAIL" -gt 0 ]; then
            exit 1
        fi
        ;;
    *)
        usage
        ;;
esac
