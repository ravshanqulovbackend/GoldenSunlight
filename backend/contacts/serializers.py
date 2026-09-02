from rest_framework import serializers
from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ('id', 'full_name', 'email', 'phone', 'subject', 'message', 'status', 'created_at')
        read_only_fields = ('id', 'status', 'created_at')


class ContactMessageAdminSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='')

    class Meta:
        model = ContactMessage
        fields = ('id', 'user', 'user_name', 'full_name', 'email', 'phone', 'subject', 'message', 'status', 'created_at')
        read_only_fields = ('id', 'created_at')
