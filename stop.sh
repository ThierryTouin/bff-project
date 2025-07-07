#!/bin/bash

echo "🛑 Arrêt de la stack..."
docker compose down --volumes --rmi local

echo "🧹 Nettoyage des volumes orphelins..."
docker volume prune -f

echo "✅ Terminé."
