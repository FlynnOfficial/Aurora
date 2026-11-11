set -eu

if [ -n "${DB_SSL_ROOT_CERT:-}" ]; then
    umask 077
    printf '%s\n' "$DB_SSL_ROOT_CERT" > /tmp/aurora-db-ca.crt
fi

exec java -jar /app/app.jar "$@"
