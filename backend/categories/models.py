from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, default='')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    meta_title = models.CharField(max_length=255, blank=True, default='')
    meta_description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

    @property
    def full_name(self):
        if self.parent:
            return f'{self.parent.full_name} > {self.name}'
        return self.name
