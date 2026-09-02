import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { Favorite, FavoriteToggleResponse } from "@/types/favorite";

export async function getFavorites(): Promise<Paginated<Favorite>> {
  const { data } = await http.get<Paginated<Favorite>>("/favorites/");
  return data;
}

/** {favorited:true} javobida yangi Favorite'ning id'si qaytmaydi — pk kerak bo'lsa ro'yxatni qayta so'rash kerak. */
export async function toggleFavorite(productId: number): Promise<FavoriteToggleResponse> {
  const { data } = await http.post<FavoriteToggleResponse>("/favorites/toggle/", {
    product_id: productId,
  });
  return data;
}

export async function removeFavorite(favoriteId: number): Promise<void> {
  await http.delete(`/favorites/${favoriteId}/`);
}
