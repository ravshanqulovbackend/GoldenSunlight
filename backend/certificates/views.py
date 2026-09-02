from rest_framework import viewsets, permissions
from .models import Certificate
from .serializers import CertificateSerializer
from users.permissions import IsAdminRole


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Certificate.objects.filter(is_active=True)
    serializer_class = CertificateSerializer


class AdminCertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [IsAdminRole]
