from django.db import models


class Certificate(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='certificates/')
    issued_by = models.CharField(max_length=255, blank=True, default='')
    issued_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title
