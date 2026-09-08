from django.conf import settings
from django.db import models


class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('created', "Created"),
        ('updated', "Updated"),
        ('deleted', "Deleted"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='activity_logs',
    )
    # User keyinchalik o'chirilsa ham "kim qilgani" ko'rinib turishi uchun yozuv
    # vaqtidagi F.I.Sh/username snapshot (FK null bo'lib qolganda ham o'qiladi).
    actor_display = models.CharField(max_length=150)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=50)
    object_id = models.PositiveIntegerField()
    object_repr = models.CharField(max_length=255)
    # Yangilanishda o'zgargan maydonlar: {"price": ["45000.00", "52000.00"], ...}
    changes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "activity log entry"
        verbose_name_plural = "activity log"

    def __str__(self):
        return f'{self.actor_display} — {self.get_action_display()} — {self.model_name} #{self.object_id}'


class SiteSettings(models.Model):
    site_name = models.CharField(max_length=255, default='GoldenSunlight')
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=15)

    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
