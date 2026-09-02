from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListCreateView.as_view(), name='order-list'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/cancel/', views.CancelOrderView.as_view(), name='order-cancel'),
    path('validate-coupon/', views.ValidateCouponView.as_view(), name='validate-coupon'),
    path('admin/orders/', views.AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/orders/<int:pk>/', views.AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('admin/orders/<int:pk>/status/', views.AdminOrderStatusView.as_view(), name='admin-order-status'),
    path('admin/orders/<int:pk>/items/', views.AdminOrderItemCreateView.as_view(), name='admin-order-item-create'),
    path('admin/orders/<int:pk>/items/<int:item_id>/', views.AdminOrderItemDetailView.as_view(), name='admin-order-item-detail'),
    path('admin/orders/<int:pk>/notify-ready/', views.AdminOrderNotifyReadyView.as_view(), name='admin-order-notify-ready'),
    path('addresses/', views.AddressListCreateView.as_view(), name='address-list'),
    path('addresses/<int:pk>/', views.AddressDetailView.as_view(), name='address-detail'),
]
