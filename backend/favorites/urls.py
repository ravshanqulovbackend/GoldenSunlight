from django.urls import path
from . import views

urlpatterns = [
    path('', views.FavoriteListView.as_view(), name='favorite-list'),
    path('toggle/', views.FavoriteToggleView.as_view(), name='favorite-toggle'),
    path('<int:pk>/', views.FavoriteDeleteView.as_view(), name='favorite-delete'),
]
