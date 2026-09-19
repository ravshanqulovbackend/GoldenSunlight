from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

# `orders/views.py`dagi `_STATUS_NOTIFICATION_COPY` bilan bir xil holatlar — faqat
# email uchun ikki tilda (frontend'dagi `OrderStatus`/`OrderTracking` ar.json bilan
# bir xil atamalar ishlatilgan, saytdagi va xatdagi so'zlar mos kelishi uchun).
# `pending`/`picked_up` yo'q — ichki bildirishnoma kabi bularga ham email ketmaydi
# (mijoz o'zi hozirgina buyurtma bergani yoki jismonan do'konda ekanini biladi).
STATUS_EMAIL_COPY = {
    'preparing': {
        'subject_en': 'Your order is being prepared',
        'body_en': 'Your order from {date} is now being prepared.',
        'subject_ar': 'طلبك قيد التجهيز',
        'body_ar': 'طلبك المقدم بتاريخ {date} أصبح الآن قيد التجهيز.',
    },
    'ready': {
        'subject_en': 'Your order is ready for pickup!',
        'body_en': 'Your order from {date} is ready — you can come and pick it up now.',
        'subject_ar': 'طلبك جاهز للاستلام!',
        'body_ar': 'طلبك المقدم بتاريخ {date} جاهز الآن — يمكنك الحضور لاستلامه.',
    },
    'cancelled': {
        'subject_en': 'Your order was cancelled',
        'body_en': 'Your order from {date} has been cancelled.',
        'subject_ar': 'تم إلغاء طلبك',
        'body_ar': 'تم إلغاء طلبك المقدم بتاريخ {date}.',
    },
    'refunded': {
        'subject_en': 'Your order was refunded',
        'body_en': 'Your order from {date} has been refunded.',
        'subject_ar': 'تم استرداد المبلغ',
        'body_ar': 'تم استرداد المبلغ الخاص بطلبك المقدم بتاريخ {date}.',
    },
}


def send_order_status_notification_email(order, status_key):
    """`orders/views.py`dagi `_notify_customer_order_status` chaqiradi — xuddi shu
    trigger nuqtasi saytdagi (ichki) bildirishnoma bilan bir vaqtda emailni ham
    ishga tushiradi. Xat bitta xabarda ikkala tilda ham (ingliz + arab) yoziladi —
    mijozning interfeys tili qanday bo'lishidan qat'iy nazar."""
    copy = STATUS_EMAIL_COPY.get(status_key)
    if not copy or not order.user.email:
        return
    date = f'{order.created_at:%d.%m.%Y}'
    subject = f"{copy['subject_en']} / {copy['subject_ar']}"
    body = (
        f"{copy['body_en'].format(date=date)}\n\n"
        f"{'-' * 40}\n\n"
        f"{copy['body_ar'].format(date=date)}"
    )
    send_order_status_email.delay(order.user.email, subject, body)


@shared_task
def send_order_status_email(email, subject, body):
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
