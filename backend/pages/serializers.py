from rest_framework import serializers
from .models import Company, PartnershipRequest


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ('id', 'name', 'tagline', 'description', 'mission', 'vision', 'founded_year', 'employee_count', 'phone', 'email', 'address', 'website', 'logo', 'experience_years', 'product_types', 'export_countries', 'partner_stores')


class PartnershipRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnershipRequest
        fields = ('id', 'full_name', 'company_name', 'phone', 'email', 'message', 'status', 'created_at')
        read_only_fields = ('id', 'status', 'created_at')
