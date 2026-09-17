from django.conf import settings
from django.db import models


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    # Ixtiyoriy — buyurtma holati o'zgarishi haqidagi bildirishnoma shu buyurtmaga
    # bog'lanadi, shunga qarab admin order sahifasida "mijoz ko'rdimi" (ikki ptichka)
    # ko'rsatiladi (`orders/serializers.py`dagi `notification_sent`/`notification_seen`).
    # Boshqa turdagi bildirishnomalar (masalan mahsulot/kategoriya o'chirilgani haqida
    # superadmin'ga) buyurtmaga aloqasi yo'q, shuning uchun null qoldiriladi.
    order = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
