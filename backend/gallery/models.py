from django.db import models


class GalleryCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name_plural = 'Gallery categories'

    def __str__(self):
        return self.name


class GalleryImage(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='gallery/')
    category = models.ForeignKey(GalleryCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='images')
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title
