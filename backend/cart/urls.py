from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('add/', views.AddToCartView.as_view(), name='cart-add'),
    path('item/<int:pk>/', views.CartItemView.as_view(), name='cart-item'),
]
