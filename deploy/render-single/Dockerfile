# Runs backend + frontend + Postgres + Redis + nginx together inside ONE paid Render
# Web Service (managed by supervisord), instead of paying for 4 separate Render
# resources (~$7/mo x 4).
#
# Build context MUST be the repo root (needs to see both backend/ and frontend/) —
# hence `dockerContext: .` in render-single.yaml.
#
# NOTE: Postgres and uploaded media are stored under /data — attach a persistent
# Render Disk at that path (already set up in render-single.yaml), otherwise ALL DATA
# (orders, users, images) is lost on every deploy/restart.

# ---- Stage 1: build the frontend (Next.js standalone output) ----
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .

# NEXT_PUBLIC_* get baked into the client bundle at `next build` time — since
# backend and frontend now sit behind the same nginx (like in docker-compose.yml),
# a relative "/api" is enough.
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_MEDIA_ORIGIN=
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_MEDIA_ORIGIN=$NEXT_PUBLIC_MEDIA_ORIGIN \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

# ---- Stage 2: final image — Postgres + Redis + Python + Node + nginx + supervisor ----
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    DB_ENGINE=django.db.backends.postgresql \
    DB_HOST=localhost \
    DB_PORT=5432 \
    REDIS_URL=redis://localhost:6379/0

# gettext-base -> envsubst (for templating nginx's port); postgresql/redis-server/
# nginx/supervisor -> the 4 core services; curl/gnupg -> adding the NodeSource repo.
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl gnupg ca-certificates gcc libpq-dev \
      postgresql postgresql-contrib redis-server redis-tools nginx supervisor gettext-base \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --timeout 300 --retries 5 -r requirements.txt
COPY backend/ .
RUN python manage.py collectstatic --noinput || true

WORKDIR /app/frontend
COPY --from=frontend-builder /app/frontend/public ./public
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./.next/static

WORKDIR /app
COPY deploy/render-single/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/render-single/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY deploy/render-single/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && rm -f /etc/nginx/sites-enabled/default

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
