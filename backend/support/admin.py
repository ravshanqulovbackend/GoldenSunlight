from django.contrib import admin
from .models import SupportMessage


@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = ('customer', 'sender', 'message', 'is_read', 'is_read_by_customer', 'created_at')
    list_filter = ('is_read', 'is_read_by_customer')
    search_fields = ('customer__username', 'sender__username', 'message')
