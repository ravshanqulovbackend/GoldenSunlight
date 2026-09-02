import type { ProductListItem } from "./product";

export interface Favorite {
  id: number;
  product: ProductListItem;
  created_at: string;
}

export interface FavoriteToggleResponse {
  favorited: boolean;
}
