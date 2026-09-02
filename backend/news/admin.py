from django.contrib import admin
from .models import News


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'views_count', 'created_at')
    list_filter = ('is_published',)
    search_fields = ('title', 'summary')
    prepopulated_fields = {'slug': ('title',)}
