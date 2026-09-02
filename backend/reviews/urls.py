from django.urls import path
from . import views

urlpatterns = [
    path('product/<int:product_pk>/', views.ReviewListCreateView.as_view(), name='review-list'),
    path('admin/', views.AdminReviewListView.as_view(), name='admin-reviews'),
    path('admin/<int:pk>/', views.AdminReviewDeleteView.as_view(), name='admin-review-delete'),
]
