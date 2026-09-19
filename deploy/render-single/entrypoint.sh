#!/bin/sh
# Runs ONCE when the container boots: creates the Postgres data directory under
# /data if it's empty, symlinks the media directory there too, then hands off to
# supervisord (which manages postgres/redis/backend/frontend/nginx).
set -eu

: "${DB_PASSWORD:?DB_PASSWORD is required in the Render environment settings}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-goldensunlight_db}"

DATA_ROOT=/data
PGDATA="$DATA_ROOT/postgres"
MEDIA_DIR="$DATA_ROOT/media"
PG_BIN="$(find /usr/lib/postgresql -maxdepth 1 -mindepth 1 -type d | sort -V | tail -1)/bin"

mkdir -p "$PGDATA" "$MEDIA_DIR"
chown -R postgres:postgres "$PGDATA"

# Django's MEDIA_ROOT (backend/config/settings.py) is `BASE_DIR / 'media'` — instead
# of changing that, point the same path at the persistent disk via a symlink.
rm -rf /app/backend/media
ln -sfn "$MEDIA_DIR" /app/backend/media

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "==> /data is empty — bootstrapping Postgres and creating $DB_NAME"
  su postgres -c "$PG_BIN/initdb -D $PGDATA --auth=trust --username=$DB_USER"
  su postgres -c "$PG_BIN/pg_ctl -D $PGDATA -o '-c listen_addresses=localhost' -w start"

  cat > /tmp/init.sql <<SQL
ALTER USER "$DB_USER" WITH PASSWORD '$DB_PASSWORD';
SQL
  su postgres -c "$PG_BIN/psql -v ON_ERROR_STOP=1 -f /tmp/init.sql"
  su postgres -c "$PG_BIN/createdb -O \"$DB_USER\" \"$DB_NAME\"" || true
  rm -f /tmp/init.sql

  su postgres -c "$PG_BIN/pg_ctl -D $PGDATA -m fast -w stop"
fi

# nginx's listen port is provided by Render (falls back to 80, matching the
# Dockerfile's EXPOSE).
export PORT="${PORT:-80}"
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
