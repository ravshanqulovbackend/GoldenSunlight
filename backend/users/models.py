from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('staff', 'Customer'),
        ('admin', 'Admin'),
        ('superadmin', 'Super Admin'),
    ]

    phone = models.CharField(max_length=20, blank=True, default='')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    pending_role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, blank=True, default='',
        help_text="Django admin orqali berilgan, lekin foydalanuvchi profilini "
                  "(ism, familiya, telefon, rasm) to'ldirmaguncha kuchga kirmaydigan rol.",
    )
    is_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def __str__(self):
        return self.get_full_name() or self.username

    @property
    def is_admin_user(self):
        return self.role in ('admin', 'superadmin')

    @property
    def is_superadmin(self):
        return self.role == 'superadmin'
