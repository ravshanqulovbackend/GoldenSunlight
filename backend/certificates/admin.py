from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('title', 'issued_by', 'issued_date', 'expiry_date', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('title',)
