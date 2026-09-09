from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from orders.models import Order
from products.models import Product
from django.contrib.auth import get_user_model
from users.permissions import IsAdminRole, IsSuperAdminRole
from .models import ActivityLog
from .serializers import ActivityLogSerializer

User = get_user_model()


class DashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        now = timezone.now()
        today = timezone.localdate()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        total_revenue = Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        total_orders = Order.objects.count()
        total_users = User.objects.filter(role='staff').count()
        total_products = Product.objects.filter(is_active=True).count()

        today_orders = Order.objects.filter(created_at__date=today).count()
        today_revenue = Order.objects.filter(created_at__date=today).aggregate(total=Sum('total_amount'))['total'] or 0

        week_orders = Order.objects.filter(created_at__gte=week_ago).count()
        week_revenue = Order.objects.filter(created_at__gte=week_ago).aggregate(total=Sum('total_amount'))['total'] or 0

        month_orders = Order.objects.filter(created_at__gte=month_ago).count()
        month_revenue = Order.objects.filter(created_at__gte=month_ago).aggregate(total=Sum('total_amount'))['total'] or 0

        pending_orders = Order.objects.filter(status='pending').count()
        preparing_orders = Order.objects.filter(status='preparing').count()
        ready_orders = Order.objects.filter(status='ready').count()
        cancelled_orders = Order.objects.filter(status='cancelled').count()
        refunded_orders = Order.objects.filter(status='refunded').count()

        recent_orders = Order.objects.select_related('user').order_by('-created_at')[:10]
        recent_orders_data = []
        for o in recent_orders:
            recent_orders_data.append({
                'id': o.id,
                'full_name': o.full_name,
                'status': o.status,
                'total_amount': str(o.total_amount),
                'created_at': o.created_at.strftime('%d.%m.%Y'),
            })

        popular_products = Product.objects.filter(is_active=True).order_by('-review_count')[:5]
        popular_products_data = []
        for p in popular_products:
            popular_products_data.append({
                'id': p.id,
                'name': p.name,
                'price': str(p.price),
                'review_count': p.review_count,
                'rating': str(p.rating),
            })

        # Haftalik sotuvlar (real data)
        weekly_sales = []
        day_names = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
        for i in range(7):
            day = now - timedelta(days=6 - i)
            day_revenue = Order.objects.filter(
                created_at__date=day.date(),
                status__in=['preparing', 'ready']
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            weekly_sales.append({
                'day': day_names[i],
                'revenue': str(day_revenue),
            })

        return Response({
            'total_revenue': str(total_revenue),
            'total_orders': total_orders,
            'total_users': total_users,
            'total_products': total_products,
            'today_orders': today_orders,
            'today_revenue': str(today_revenue),
            'week_orders': week_orders,
            'week_revenue': str(week_revenue),
            'month_orders': month_orders,
            'month_revenue': str(month_revenue),
            'order_stats': {
                'pending': pending_orders,
                'preparing': preparing_orders,
                'ready': ready_orders,
                'cancelled': cancelled_orders,
                'refunded': refunded_orders,
            },
            'recent_orders': recent_orders_data,
            'popular_products': popular_products_data,
            'weekly_sales': weekly_sales,
        })


class ActivityLogListView(generics.ListAPIView):
    """Kim, nimani, qachon o'zgartirgani — faqat superadmin ko'ra oladi."""
    queryset = ActivityLog.objects.select_related('user').all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsSuperAdminRole]
