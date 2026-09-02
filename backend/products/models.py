from django.db import models
from categories.models import Category


class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='brands/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    image = models.ImageField(upload_to='products/')
    ingredients = models.TextField(blank=True, default='')
    badge = models.CharField(max_length=50, blank=True, default='')
    sku = models.CharField(max_length=100, blank=True, default='')
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_popular = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    review_count = models.PositiveIntegerField(default=0)
    meta_title = models.CharField(max_length=255, blank=True, default='')
    meta_description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def discount_percent(self):
        if self.old_price and self.old_price > self.price:
            return int(((self.old_price - self.price) / self.old_price) * 100)
        return 0

    @property
    def is_in_stock(self):
        return self.stock > 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=255, blank=True, default='')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.product.name} - image {self.order}'


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=100, blank=True, default='')
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.product.name} - {self.name}'

    @property
    def final_price(self):
        return self.product.price + self.price_adjustment
