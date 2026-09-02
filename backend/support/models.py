from django.conf import settings
from django.db import models


class SupportMessage(models.Model):
    # `customer` — suhbat kimga tegishli (yozgan ham, admin javob yozgan ham bo'lsin,
    # thread har doim shu maydon orqali guruhlanadi). `sender` — bu aniq xabarni
    # kim yozgani (mijozning o'zi yoki javob yozgan admin/superadmin).
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_messages',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sent_support_messages',
    )
    message = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='support/', blank=True, null=True)

    # Shaxsiy emas, JAMOAVIY holat sifatida ishlatiladi — bitta admin o'qisa, boshqa
    # admin uchun ham "o'qilgan" hisoblanadi (umumiy pochta qutisi kabi). Kichik jamoa
    # uchun bu yetarli; "har bir admin uchun alohida o'qilgan holati" kerak bo'lsa,
    # bu maydon YETARLI EMAS — alohida "kim o'qidi" jadvali kerak bo'ladi.
    is_read = models.BooleanField(default=False)
    is_read_by_customer = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = "qo'llab-quvvatlash xabari"
        verbose_name_plural = "qo'llab-quvvatlash xabarlari"

    def __str__(self):
        sender_name = self.sender.username if self.sender else "?"
        return f'{sender_name} → {self.customer.username}: {self.message[:40]}'
