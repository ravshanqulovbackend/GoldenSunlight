from django.db import models


class Company(models.Model):
    name = models.CharField(max_length=255, default='GoldenSunlight')
    slug = models.SlugField(unique=True, default='goldensunlight')
    tagline = models.CharField(max_length=500, blank=True, default='')
    description = models.TextField(blank=True, default='')
    mission = models.TextField(blank=True, default='')
    vision = models.TextField(blank=True, default='')
    founded_year = models.PositiveIntegerField(null=True, blank=True)
    employee_count = models.CharField(max_length=50, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    address = models.TextField(blank=True, default='')
    website = models.URLField(blank=True, default='')
    logo = models.ImageField(upload_to='company/', blank=True, null=True)
    experience_years = models.CharField(max_length=20, blank=True, default='')
    product_types = models.CharField(max_length=50, blank=True, default='')
    export_countries = models.CharField(max_length=50, blank=True, default='')
    partner_stores = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Company'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class PartnershipRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    full_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    message = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name} - {self.company_name or "Individual"}'
