#!/bin/bash
set -e

echo "Waiting for Keycloak to be ready..."

until curl -s http://bff-keycloak:8080/realms/myrealm/.well-known/openid-configuration > /dev/null; do
  >&2 echo "Keycloak is unavailable - sleeping"
  sleep 2
done

echo "Keycloak is up - executing application"
exec "$@"
