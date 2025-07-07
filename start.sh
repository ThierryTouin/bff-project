#!/bin/bash

# Nom du projet Docker Compose (adapté si nécessaire)
PROJECT_NAME="bff-project"
SHOW_LOGS=true  # Changez ce paramètre à true si vous souhaitez voir les logs

# Vérifier s'il y a un argument pour spécifier un service
if [ $# -eq 1 ]; then
    SERVICE_NAME=$1
    echo "🔧 Démarrage du service: $SERVICE_NAME..."
    docker compose up --build --no-deps $SERVICE_NAME -d

    # Affichage des logs uniquement pour le service spécifié si SHOW_LOGS est vrai
    if [ "$SHOW_LOGS" = true ]; then
        echo "📝 Affichage des logs pour $SERVICE_NAME..."
        docker compose logs -f $SERVICE_NAME
    fi
else
    echo "🔧 Démarrage de la stack Docker Compose..."
    docker compose up --build -d

    # Affichage des logs pour tous les services si SHOW_LOGS est vrai
    if [ "$SHOW_LOGS" = true ]; then
        echo "📝 Affichage des logs..."
        docker compose logs -f
    fi
fi

echo "✅ Terminé."
