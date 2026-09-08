from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
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
        help_text="Role granted via Django admin, but not yet in effect until the user "
                  "completes their profile (first name, last name, phone, avatar).",
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

    def clean(self):
        super().clean()
        if self.role == 'superadmin':
            existing = User.objects.filter(role='superadmin')
            if self.pk:
                existing = existing.exclude(pk=self.pk)
            if existing.exists():
                raise ValidationError({'role': "There can only be one superadmin."})

    @property
    def is_admin_user(self):
        return self.role in ('admin', 'superadmin')

    @property
    def is_superadmin(self):
        return self.role == 'superadmin'
