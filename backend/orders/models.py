from django.conf import settings
from django.db import models


class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses = models.PositiveIntegerField(default=0)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

    @property
    def is_valid(self):
        from django.utils import timezone
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        if self.max_uses > 0 and self.used_count >= self.max_uses:
            return False
        return True


class Address(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    title = models.CharField(max_length=100, default='Asosiy manzil')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True, default='')
    street = models.CharField(max_length=255)
    building = models.CharField(max_length=50, blank=True, default='')
    apartment = models.CharField(max_length=50, blank=True, default='')
    landmark = models.CharField(max_length=255, blank=True, default='')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f'{self.title}: {self.city}, {self.street}'


class Order(models.Model):
    # Yetkazib berish yo'q — buyurtma faqat do'kondan olib ketiladi (pickup).
    # pending: mijoz endigina buyurtma berdi ("jarayonda"). preparing: admin buyurtmani
    # qabul qilib, tayyorlashni boshladi. ready: buyurtma tayyor, mijoz kelib olib
    # ketishi mumkin. picked_up: mijoz haqiqatan kelib olib ketdi — shu holat "sotuv
    # yakunlandi" deb hisoblanadi (dashboard'dagi revenue FAQAT shu holatdagi
    # buyurtmalarni qo'shadi, `common/views.py`ga qarang). `ready`ga o'tgach buyurtma
    # tahrirlanmaydi (TERMINAL_STATUSES, `orders/views.py`).
    STATUS_CHOICES = [
        ('pending', 'Processing'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready for Pickup'),
        ('picked_up', 'Picked Up'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    PAYMENT_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)
    address_text = models.TextField(default='')
    landmark = models.CharField(max_length=255, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cash')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # Yetkazib berish yo'q (faqat pickup) — bu maydon endi doim 0, faqat eski buyurtmalar
    # tarixida saqlanib qolgan qiymatlarni ko'rsatish uchun saqlab qolingan.
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Status `picked_up`ga BIRINCHI marta o'tgan payt (`orders/views.py`dagi
    # `AdminOrderStatusView.post`da to'ldiriladi, keyin qayta yozilmaydi). Dashboard'dagi
    # kunlik/haftalik savdo shu maydon bo'yicha guruhlanadi — `created_at` (buyurtma
    # BERILGAN sana) emas, chunki buyurtma bir kuni berilib boshqa kuni olib ketilishi
    # mumkin, "savdo" esa haqiqatan olib ketilgan (pul/mahsulot almashgan) kunga tegishli
    # bo'lishi kerak. `common/views.py`ga qarang.
    picked_up_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.pk} - {self.full_name}'

    def recalculate_totals(self):
        """Item(lar) tahrirlangach subtotal/total qayta hisoblanadi.
        discount_amount ataylab qo'zg'atilmaydi — u buyurtma berilgan paytdagi
        holatda muzlab qoladi (bekor qilish oqimidagi kabi)."""
        self.subtotal = sum((item.subtotal for item in self.items.all()), 0)
        self.total_amount = max(self.subtotal + self.delivery_fee - self.discount_amount + self.tax_amount, 0)
        self.save(update_fields=['subtotal', 'total_amount'])


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    # SET_NULL (CASCADE emas) — admin mahsulotni butunlay o'chirsa ham, bu buyurtma
    # qatori (demak butun buyurtma tarixi) saqlanib qolishi kerak. `product_name`
    # buyurtma berilgan paytdagi nomni "muzlatib" saqlaydi, shu tufayli mahsulot
    # o'chirilgandan keyin ham eski buyurtmada nima sotib olingani ko'rinib turadi.
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255, blank=True, default='')
    variant = models.ForeignKey('products.ProductVariant', on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        name = self.product.name if self.product else self.product_name
        return f'{name} x {self.quantity}'

    @property
    def subtotal(self):
        return self.price * self.quantity
