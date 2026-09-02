FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DB_ENGINE=django.db.backends.postgresql

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --timeout 300 --retries 5 -i https://pypi.org/simple/ --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --threads 2 --timeout 120"]
