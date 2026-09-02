import { http } from "../http";
import type { AddToCartPayload, Cart, UpdateCartItemPayload } from "@/types/cart";

export async function getCart(): Promise<Cart> {
  const { data } = await http.get<Cart>("/cart/");
  return data;
}

export async function addToCart(payload: AddToCartPayload): Promise<Cart> {
  const { data } = await http.post<Cart>("/cart/add/", payload);
  return data;
}

export async function updateCartItem(itemId: number, payload: UpdateCartItemPayload): Promise<Cart> {
  const { data } = await http.patch<Cart>(`/cart/item/${itemId}/`, payload);
  return data;
}

export async function removeCartItem(itemId: number): Promise<Cart> {
  const { data } = await http.delete<Cart>(`/cart/item/${itemId}/`);
  return data;
}
