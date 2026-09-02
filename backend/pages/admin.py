from django.contrib import admin
from .models import Company, PartnershipRequest


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name',)


@admin.register(PartnershipRequest)
class PartnershipRequestAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'company_name', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('full_name', 'company_name')
