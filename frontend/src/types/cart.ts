import type { ProductListItem } from "./product";

export interface CartItem {
  id: number;
  product: ProductListItem;
  quantity: number;
  /** Backend SerializerMethodField — Decimal xom JSON son sifatida keladi, string emas. */
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  /** Boshqa barcha narx maydonlaridan farqli o'laroq raw JSON son (string emas). */
  total_price: number;
  total_items: number;
}

export interface AddToCartPayload {
  product_id: number;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}
