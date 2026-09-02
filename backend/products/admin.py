from django.contrib import admin
from .models import Product, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'rating', 'is_active', 'is_popular')
    list_filter = ('category', 'is_active', 'is_popular')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
