from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('activity-log/', views.ActivityLogListView.as_view(), name='activity-log'),
]
