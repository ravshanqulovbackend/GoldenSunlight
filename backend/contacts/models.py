from django.conf import settings
from django.db import models


class ContactMessage(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('read', 'Read'),
        ('replied', 'Replied'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    subject = models.CharField(max_length=255, blank=True, default='')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} - {self.subject or "Message"}'
