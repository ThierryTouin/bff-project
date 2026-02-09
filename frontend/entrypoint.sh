#!/bin/sh
set -e

ASSETS_DIR="/usr/share/nginx/html/assets"

mkdir -p "$ASSETS_DIR"

# Si une variable d'environnement GTM_ID est fournie, mettez à jour le fichier de configuration
if [ -n "$GTM_ID" ]; then
  echo "Configuring GTM with ID: $GTM_ID"
  echo "{\"gtmId\": \"$GTM_ID\"}" > "$ASSETS_DIR/gtm-config.json"
else
  echo "No GTM_ID provided, using default configuration"
fi

# Exécutez la commande originale
exec "$@"