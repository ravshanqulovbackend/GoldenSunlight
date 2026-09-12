"""Birinchi superadmin akkauntini yaratadi va rolini `superadmin`ga o'tkazadi.

Render'ning bepul rejasida shell yo'q, shuning uchun bu skript har ishga tushishda
`render-start.sh` orqali chaqiriladi. Django'ning `createsuperuser --noinput` buyrug'i
DJANGO_SUPERUSER_EMAIL bo'sh bo'lsa xato beradi va `role` maydonini ham `superadmin`
qilmaydi (u faqat Django'ning is_superuser bayrog'ini qo'yadi) — shu ikkalasini hal
qiladi. Takroran ishga tushirilsa hech narsa o'zgartirmaydi.
"""

import os
import sys

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.environ.get('DJANGO_SUPERUSER_USERNAME', '').strip() or 'admin'
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '').strip() or f'{username}@example.com'
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '').strip()

user = User.objects.filter(username=username).first()

if user is None:
    if not password:
        print('DJANGO_SUPERUSER_PASSWORD is empty — skipping admin bootstrap.')
        raise SystemExit(0)
    user = User.objects.create_superuser(username=username, email=email, password=password)
    print(f'Superuser created: {username}')

if user.role != 'superadmin' and not User.objects.filter(role='superadmin').exclude(pk=user.pk).exists():
    user.role = 'superadmin'
    user.save(update_fields=['role'])
    print(f'Role set to superadmin: {username}')
