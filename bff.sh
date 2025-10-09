#!/bin/bash

# Nom du projet Docker Compose (adapté si nécessaire)
PROJECT_NAME="bff-project"
SHOW_LOGS=true  # Changez ce paramètre à false si vous ne voulez pas voir les logs

usage() {
    echo "🚀 Script de gestion BFF (Docker Compose)"
    echo
    echo "Usage: $0 {up [service]|down|list}"
    echo
    echo "  up           : démarre toute la stack"
    echo "  up service   : démarre uniquement le service spécifié"
    echo "  clean        : arrête et nettoie la stack"
    echo "  list         : liste les services disponibles"
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
    *)
        usage
        ;;
esac
