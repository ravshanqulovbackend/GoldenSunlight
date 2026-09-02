from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.prefetch_related('items__product__category', 'items__product__brand').get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        item, created = CartItem.objects.get_or_create(
            cart=cart, product_id=product_id,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item.quantity = serializer.validated_data['quantity']
        item.save()
        cart = item.cart
        return Response(CartSerializer(cart).data)

    def delete(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data)
