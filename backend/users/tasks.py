import secrets
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

CODE_LENGTH = 6
CODE_TTL_MINUTES = 15


def generate_and_send_verification_code(user):
    """Register/resend-verification tomonidan chaqiriladi. Kodni generatsiya qilib
    User'ga saqlash (tez, DB yozuvi) shu yerda — haqiqiy SMTP so'rovi (sekin, tarmoqqa
    bog'liq) `send_verification_email` Celery task'iga ajratilgan, shunda so'rov uni
    kutib turmaydi (production'da; DEBUG'da `CELERY_TASK_ALWAYS_EAGER` orqali baribir
    joyida bajariladi — config/settings.py)."""
    code = f'{secrets.randbelow(10 ** CODE_LENGTH):0{CODE_LENGTH}d}'
    user.email_verification_code = code
    user.email_verification_sent_at = timezone.now()
    user.save(update_fields=['email_verification_code', 'email_verification_sent_at'])
    send_verification_email.delay(user.email, code)


@shared_task
def send_verification_email(email, code):
    send_mail(
        subject='Confirm your email — GoldenSunlight',
        message=(
            f'Your verification code is {code}.\n\n'
            f'This code expires in {CODE_TTL_MINUTES} minutes. If you did not request this, you can ignore this email.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


def is_code_expired(user):
    if not user.email_verification_sent_at:
        return True
    return timezone.now() - user.email_verification_sent_at > timedelta(minutes=CODE_TTL_MINUTES)
