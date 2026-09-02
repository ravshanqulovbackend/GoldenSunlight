from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.CertificateViewSet, basename='certificate')

admin_router = DefaultRouter()
admin_router.register('', views.AdminCertificateViewSet, basename='admin-certificate')

urlpatterns = [
    # admin/ BIRINCHI — aks holda "admin" so'zi pastdagi detail marshrutiga tushib
    # qolib, uni sertifikat ID'si deb noto'g'ri talqin qiladi (404).
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]
