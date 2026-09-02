from django.urls import path
from . import views

urlpatterns = [
    path('company/', views.CompanyView.as_view(), name='company'),
    path('partnership/', views.PartnershipRequestCreateView.as_view(), name='partnership-request'),
    path('admin/partnerships/', views.AdminPartnershipRequestListView.as_view(), name='admin-partnerships'),
]
