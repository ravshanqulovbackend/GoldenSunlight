from django.forms.models import model_to_dict
from rest_framework import generics, permissions
from .models import Company, PartnershipRequest
from .serializers import CompanySerializer, PartnershipRequestSerializer
from users.permissions import IsAdminRole
from common.utils import log_activity, diff_instance


class CompanyView(generics.RetrieveUpdateAPIView):
    """"Biz haqimizda" ma'lumoti — hammaga ochiq ko'rish, admin/superadmin tahrirlashi mumkin."""
    serializer_class = CompanySerializer

    def get_object(self):
        return Company.load()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAdminRole()]

    def perform_update(self, serializer):
        before = model_to_dict(serializer.instance)
        instance = serializer.save()
        log_activity(self.request.user, 'updated', instance, 'Company', diff_instance(before, instance))


class PartnershipRequestCreateView(generics.CreateAPIView):
    serializer_class = PartnershipRequestSerializer


class AdminPartnershipRequestListView(generics.ListAPIView):
    serializer_class = PartnershipRequestSerializer
    permission_classes = [IsAdminRole]
    search_fields = ['full_name', 'company_name']
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        return PartnershipRequest.objects.all()
