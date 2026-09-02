from django.urls import path
from . import views

urlpatterns = [
    path('messages/', views.SupportMessageCreateView.as_view(), name='support-message-create'),
    path('messages/mine/', views.MyMessagesView.as_view(), name='support-my-messages'),
    path('messages/mine/unread-count/', views.MyUnreadCountView.as_view(), name='support-my-unread-count'),
    path('conversations/', views.ConversationListView.as_view(), name='support-conversations'),
    path('conversations/unread-count/', views.ConversationUnreadCountView.as_view(), name='support-conversations-unread-count'),
    path('conversations/<int:customer_id>/', views.ConversationDetailView.as_view(), name='support-conversation-detail'),
]
