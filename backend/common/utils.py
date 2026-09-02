from django.contrib.auth import get_user_model
from django.forms.models import model_to_dict
from .models import ActivityLog
from notifications.models import Notification

# Fayl maydonlari (solishtirish ma'nosiz) va avtomatik/hisoblab chiqiladigan maydonlar
# diff'ga kiritilmaydi.
DIFF_EXCLUDE = {'image', 'created_at', 'updated_at', 'rating', 'review_count'}


def log_activity(user, action, instance, model_name, changes=None):
    ActivityLog.objects.create(
        user=user,
        actor_display=user.get_full_name() or user.username,
        action=action,
        model_name=model_name,
        object_id=instance.pk,
        object_repr=str(instance),
        changes=changes or {},
    )


def notify_superadmins(title, message, exclude_user=None):
    qs = get_user_model().objects.filter(role='superadmin')
    if exclude_user:
        qs = qs.exclude(pk=exclude_user.pk)
    Notification.objects.bulk_create([Notification(user=u, title=title, message=message) for u in qs])


def diff_instance(before_dict, instance):
    """`before_dict` (perform_update boshida olingan model_to_dict) bilan instance'ning
    saqlangandan keyingi holatini solishtirib, o'zgargan maydonlarni qaytaradi.
    Qiymatlar str()ga o'tkaziladi — Decimal/bool/None kabi turlar JSONField'ga
    to'g'ridan-to'g'ri yozib bo'lmaydi."""
    after_dict = model_to_dict(instance)
    return {
        field: [str(before_dict.get(field)), str(after_dict.get(field))]
        for field in after_dict
        if field not in DIFF_EXCLUDE and before_dict.get(field) != after_dict.get(field)
    }
