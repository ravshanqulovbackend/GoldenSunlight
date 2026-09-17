from django.db import transaction
from django.db.models import Prefetch
from django.forms.models import model_to_dict
from rest_framework import generics, permissions, status, filters
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderItem, Coupon, Address
from .serializers import OrderSerializer, CreateOrderSerializer, AddressSerializer, ValidateCouponSerializer
from cart.models import Cart
from products.models import Product
from notifications.models import Notification
from users.permissions import IsAdminRole
from common.utils import log_activity, diff_instance

TERMINAL_STATUSES = ('ready', 'cancelled', 'refunded')


def _adjust_stock(product, delta):
    """delta > 0 — zaxiradan kamaytiradi (yetarli bo'lmasa xato), delta < 0 — qaytaradi."""
    if delta > 0 and product.stock < delta:
        raise ValidationError(f"Not enough stock for {product.name} ({product.stock} left)")
    product.stock -= delta
    product.save(update_fields=['stock'])


# List view'larda `OrderSerializer.notification_sent`/`notification_seen` N+1
# so'rov qilmasligi uchun — `orders/serializers.py`dagi `_latest_notification`ga qarang.
_NOTIFICATIONS_PREFETCH = Prefetch('notifications', queryset=Notification.objects.order_by('-created_at'), to_attr='prefetched_notifications')

# `pending` — bu buyurtma yaratilgan paytdagi boshlang'ich holat, mijozning o'zi
# shuni bilib turadi (o'zi hozirgina buyurtma berdi), shuning uchun ro'yxatda yo'q —
# unga o'tish hech qachon bildirishnoma keltirib chiqarmaydi.
_STATUS_NOTIFICATION_COPY = {
    'preparing': ('Your order is being prepared', 'is now being prepared'),
    'ready': ('Your order is ready!', 'is ready — you can come and pick it up now'),
    'cancelled': ('Your order was cancelled', 'has been cancelled'),
    'refunded': ('Your order was refunded', 'has been refunded'),
}


def _notify_customer_order_status(order, status_key):
    """Mijozga buyurtma holati haqida xabar beradi — `AdminOrderStatusView` (har
    qanday holat o'zgarishida) va `AdminOrderNotifyReadyView` ("Notify again")
    tomonidan chaqiriladi. `order.id` (saytdagi umumiy ketma-ket raqam) ATAYLAB
    matnda ko'rsatilmaydi — sababi `orders/[id]/page.tsx`dagi bilan bir xil: bu
    mijozning "nechinchi buyurtmasi" emas, butun sayt bo'yicha umumiy hisob."""
    copy = _STATUS_NOTIFICATION_COPY.get(status_key)
    if not copy:
        return
    title, tail = copy
    Notification.objects.create(
        user=order.user,
        order=order,
        title=title,
        message=f'Your order from {order.created_at:%d.%m.%Y} {tail}.',
    )


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items__product__category', 'items__product__brand', _NOTIFICATIONS_PREFETCH
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        if request.user.is_admin_user:
            return Response({'detail': 'Admins cannot place orders'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # select_for_update — checkout paytida boshqa parallel so'rov bir xil mahsulot
        # zaxirasini o'qib/kamaytirib ulgurmasligi uchun (aks holda ikkala so'rov ham
        # eski stock qiymatini ko'rib, uni manfiyga tushirishi mumkin).
        cart_items = cart.items.select_related('product').select_for_update(of=('product',)).all()
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        delivery_fee = 0  # Yetkazib berish yo'q — mahsulot faqat do'kondan olib ketiladi
        discount = 0
        coupon = None

        # Stock tekshirish
        for cart_item in cart_items:
            if cart_item.product.stock < cart_item.quantity:
                return Response(
                    {'detail': f'Not enough stock for {cart_item.product.name} ({cart_item.product.stock} left)'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if data.get('coupon_code'):
            try:
                coupon = Coupon.objects.get(code=data['coupon_code'], is_active=True)
                if coupon.is_valid and subtotal >= coupon.min_order_amount:
                    if coupon.discount_percent > 0:
                        discount = subtotal * coupon.discount_percent / 100
                    else:
                        discount = coupon.discount_amount
                    coupon.used_count += 1
                    coupon.save()
            except Coupon.DoesNotExist:
                pass

        total = max(subtotal + delivery_fee - discount, 0)
        address_text = data.get('address_text', '')
        if data.get('address_id'):
            try:
                addr = Address.objects.get(pk=data['address_id'], user=request.user)
                address_text = f'{addr.city}, {addr.district}, {addr.street}, {addr.building}'
            except Address.DoesNotExist:
                pass

        order = Order.objects.create(
            user=request.user,
            full_name=data['full_name'],
            phone=data['phone'],
            address_text=address_text,
            landmark=data.get('landmark', ''),
            notes=data.get('notes', ''),
            payment_method=data['payment_method'],
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            discount_amount=discount,
            total_amount=total,
            coupon=coupon,
        )
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                quantity=cart_item.quantity,
                price=cart_item.product.price,
            )
            # Stock kamaytirish
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save(update_fields=['stock'])
        cart.items.all().delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        if order.status not in ('pending', 'preparing'):
            return Response({'detail': 'This order cannot be cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = 'cancelled'
        order.save()
        # Stockni qaytarish
        for item in order.items.select_related('product').all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save(update_fields=['stock'])
        return Response(OrderSerializer(order).data)


class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ValidateCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            coupon = Coupon.objects.get(code=serializer.validated_data['code'], is_active=True)
            if not coupon.is_valid:
                return Response({'detail': 'Coupon has expired or reached its usage limit'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({
                'code': coupon.code,
                'discount_percent': str(coupon.discount_percent),
                'discount_amount': str(coupon.discount_amount),
                'min_order_amount': str(coupon.min_order_amount),
            })
        except Coupon.DoesNotExist:
            return Response({'detail': 'Coupon not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminRole]
    search_fields = ['full_name', 'phone', 'tracking_number']
    ordering_fields = ['created_at', 'total_amount', 'status']
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        return Order.objects.select_related('user').prefetch_related(
            'items__product__category', 'items__product__brand', _NOTIFICATIONS_PREFETCH
        ).all()


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return Order.objects.select_related('user').prefetch_related(
            'items__product__category', 'items__product__brand', _NOTIFICATIONS_PREFETCH
        ).all()

    def perform_update(self, serializer):
        before = model_to_dict(serializer.instance)
        instance = serializer.save()
        log_activity(self.request.user, 'updated', instance, 'Order', diff_instance(before, instance))


class AdminOrderStatusView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        before = model_to_dict(order)
        status_changed = new_status != order.status
        # Bekor qilish/qaytarishga o'tilganda (avval shunday bo'lmagan bo'lsa) zaxira qaytariladi —
        # mijozning o'zi bekor qilgandagi CancelOrderView bilan bir xil xulq-atvor.
        if new_status in ('cancelled', 'refunded') and order.status not in ('cancelled', 'refunded'):
            for item in order.items.select_related('product').all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save(update_fields=['stock'])
        order.status = new_status
        if request.data.get('tracking_number'):
            order.tracking_number = request.data['tracking_number']
        order.save()
        log_activity(request.user, 'updated', order, 'Order', diff_instance(before, order))
        # Holat haqiqatan o'zgargandagina — bir xil holatni qayta "saqlash" (masalan
        # faqat tracking number yangilash uchun) qayta-qayta bildirishnoma jo'natmasin.
        if status_changed:
            _notify_customer_order_status(order, new_status)
        return Response(OrderSerializer(order).data)


class AdminOrderItemCreateView(APIView):
    """Mavjud buyurtmaga yangi mahsulot qo'shish."""
    permission_classes = [IsAdminRole]

    @transaction.atomic
    def post(self, request, pk):
        try:
            order = Order.objects.select_for_update().get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        if order.status in TERMINAL_STATUSES:
            return Response({'detail': 'Completed orders cannot be edited'}, status=status.HTTP_400_BAD_REQUEST)

        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        if quantity < 1:
            return Response({'detail': 'Quantity must be at least 1'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.select_for_update().get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        if order.items.filter(product=product).exists():
            return Response(
                {'detail': 'This product is already in the order — update its quantity instead'},
                status=status.HTTP_400_BAD_REQUEST
            )

        _adjust_stock(product, quantity)
        OrderItem.objects.create(order=order, product=product, product_name=product.name, quantity=quantity, price=product.price)
        order.recalculate_totals()
        log_activity(request.user, 'updated', order, 'Order', {'item_added': ['None', f'{product.name} x{quantity}']})
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class AdminOrderItemDetailView(APIView):
    """Buyurtmadagi bitta mahsulot qatorini tahrirlash/o'chirish."""
    permission_classes = [IsAdminRole]

    @transaction.atomic
    def patch(self, request, pk, item_id):
        order, item = self._get_order_and_item(pk, item_id)
        if order.status in TERMINAL_STATUSES:
            return Response({'detail': 'Completed orders cannot be edited'}, status=status.HTTP_400_BAD_REQUEST)

        new_quantity = int(request.data.get('quantity', 0))
        if new_quantity < 1:
            return Response({'detail': 'Quantity must be at least 1 — use DELETE to remove it'}, status=status.HTTP_400_BAD_REQUEST)

        if item.product:
            product = Product.objects.select_for_update().get(pk=item.product_id)
            _adjust_stock(product, new_quantity - item.quantity)
        old_quantity = item.quantity
        item.quantity = new_quantity
        item.save(update_fields=['quantity'])
        order.recalculate_totals()
        log_activity(
            request.user, 'updated', order, 'Order',
            {'item_quantity': [f'{item.product_name} x{old_quantity}', f'{item.product_name} x{new_quantity}']},
        )
        return Response(OrderSerializer(order).data)

    @transaction.atomic
    def delete(self, request, pk, item_id):
        order, item = self._get_order_and_item(pk, item_id)
        if order.status in TERMINAL_STATUSES:
            return Response({'detail': 'Completed orders cannot be edited'}, status=status.HTTP_400_BAD_REQUEST)
        if order.items.count() <= 1:
            return Response(
                {'detail': 'Cannot remove the last item in an order — change the order status to cancel it instead'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if item.product:
            product = Product.objects.select_for_update().get(pk=item.product_id)
            _adjust_stock(product, -item.quantity)
        removed_repr = f'{item.product_name} x{item.quantity}'
        item.delete()
        order.recalculate_totals()
        log_activity(request.user, 'updated', order, 'Order', {'item_removed': [removed_repr, 'None']})
        return Response(OrderSerializer(order).data)

    def _get_order_and_item(self, pk, item_id):
        try:
            order = Order.objects.select_for_update().get(pk=pk)
        except Order.DoesNotExist:
            raise NotFound({'detail': 'Order not found'})
        try:
            item = order.items.get(pk=item_id)
        except OrderItem.DoesNotExist:
            raise NotFound({'detail': 'Order item not found'})
        return order, item


class AdminOrderNotifyReadyView(APIView):
    """Buyurtmani 'ready' holatiga o'tkazadi va mijozga olib ketish mumkinligi haqida xabar yuboradi."""
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        if order.status not in TERMINAL_STATUSES:
            before = model_to_dict(order)
            order.status = 'ready'
            order.save(update_fields=['status', 'updated_at'])
            log_activity(request.user, 'updated', order, 'Order', diff_instance(before, order))
        # Status allaqachon 'ready' bo'lsa ham — bu action tugmasining o'zi "Notify
        # again" (mijoz bildirishnomani ko'rmagan/eslatish kerak bo'lgan holat uchun),
        # shuning uchun `AdminOrderStatusView`dagi kabi `status_changed` tekshiruvi
        # yo'q — har bosilganda qayta jo'natadi.
        _notify_customer_order_status(order, 'ready')
        return Response(OrderSerializer(order).data)
