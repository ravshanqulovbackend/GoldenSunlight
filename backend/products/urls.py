from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('brands', views.BrandViewSet, basename='brand')
router.register('', views.ProductViewSet, basename='product')

admin_router = DefaultRouter()
admin_router.register('', views.AdminProductViewSet, basename='admin-product')

urlpatterns = [
    # admin/ BIRINCHI bo'lishi shart — aks holda "admin" so'zi pastdagi ''-prefiksli
    # public router'ning slug-detail marshrutiga (masalan /products/<slug>/) tushib
    # qolib, uni mahsulot slug'i deb noto'g'ri talqin qiladi (404 qaytaradi, admin
    # viewset'ga hech qachon yetib bormaydi).
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]
