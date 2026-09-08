from django.forms.models import model_to_dict
from rest_framework import viewsets, permissions
from .models import Certificate
from .serializers import CertificateSerializer
from users.permissions import IsAdminRole
from common.utils import log_activity, diff_instance


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Certificate.objects.filter(is_active=True)
    serializer_class = CertificateSerializer


class AdminCertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity(self.request.user, 'created', instance, 'Certificate')

    def perform_update(self, serializer):
        before = model_to_dict(serializer.instance)
        instance = serializer.save()
        log_activity(self.request.user, 'updated', instance, 'Certificate', diff_instance(before, instance))

    def perform_destroy(self, instance):
        log_activity(self.request.user, 'deleted', instance, 'Certificate')
        instance.delete()
