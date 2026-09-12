#!/bin/sh
# Render'ning `dockerCommand` maydoni buyruqni shell orqali emas, bo'laklarga ajratib
# to'g'ridan-to'g'ri bajaradi — shuning uchun `&&` bilan bog'langan ketma-ketlik faqat
# shu kabi alohida skript ichida ishlaydi.
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Bepul rejada shell yo'q, shuning uchun birinchi admin shu yerda yaratiladi.
# Ikkinchi marta ishga tushganda user allaqachon mavjud — xato e'tiborsiz qoldiriladi.
python manage.py createsuperuser --noinput || true

# Bepul rejada doimiy disk yo'q: konteyner qayta ko'tarilganda /app/media tozalanadi,
# shuning uchun demo rasmlar har safar repodan qayta nusxalanadi.
python seed.py || true

# Bepul instansiyada atigi 512 MB RAM bor — bitta worker (ko'p thread bilan) xavfsiz,
# ikkitasi Pillow/DRF bilan birga xotirani tugatib konteynerni o'ldiradi.
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 1 \
    --threads 8 \
    --timeout 120 \
    --max-requests 300 \
    --max-requests-jitter 50
