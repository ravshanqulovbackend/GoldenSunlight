export const queryKeys = {
  cart: ["cart"] as const,
  favorites: ["favorites"] as const,
  orders: ["orders"] as const,
  order: (id: number) => ["orders", id] as const,
  addresses: ["addresses"] as const,
  notifications: ["notifications"] as const,
};
