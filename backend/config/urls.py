from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve as serve_static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/categories/', include('categories.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/favorites/', include('favorites.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/common/', include('common.urls')),
    path('api/news/', include('news.urls')),
    path('api/gallery/', include('gallery.urls')),
    path('api/certificates/', include('certificates.urls')),
    path('api/pages/', include('pages.urls')),
    path('api/contacts/', include('contacts.urls')),
    path('api/support/', include('support.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger'),
    # `django.views.static.serve` to'g'ridan-to'g'ri ulanadi (`django.conf.urls.static.static()`
    # helper'i EMAS) — chunki bu Django versiyasida `static()` DEBUG=False bo'lsa har doim bo'sh
    # ro'yxat qaytaradi (eski `insecure=True` bypass parametri olib tashlangan). docker-compose'da
    # /media/ ni nginx to'g'ridan-to'g'ri diskdan uzatadi, lekin bitta nginx qatlami bo'lmagan
    # muhitlarda (masalan Railway — har bir servis o'z domenida, umumiy reverse-proxy yo'q) Django
    # buni DEBUG=False bo'lsa ham o'zi uzatishi kerak, aks holda avatar/mahsulot rasmlari 404
    # qaytaradi.
    re_path(r'^media/(?P<path>.*)$', serve_static, {'document_root': settings.MEDIA_ROOT}),
]
