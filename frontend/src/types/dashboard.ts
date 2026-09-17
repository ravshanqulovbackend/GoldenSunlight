export interface DashboardOrderStats {
  pending: number;
  preparing: number;
  ready: number;
  picked_up: number;
  cancelled: number;
  refunded: number;
}

export interface DashboardRecentOrder {
  id: number;
  full_name: string;
  status: string;
  total_amount: string;
  created_at: string;
}

export interface DashboardPopularProduct {
  id: number;
  name: string;
  price: string;
  review_count: number;
  rating: string;
}

export interface DashboardWeeklySale {
  day: string;
  revenue: string;
}

export interface DashboardStats {
  total_revenue: string;
  total_orders: number;
  total_users: number;
  total_products: number;
  today_orders: number;
  today_revenue: string;
  week_orders: number;
  week_revenue: string;
  month_orders: number;
  month_revenue: string;
  order_stats: DashboardOrderStats;
  recent_orders: DashboardRecentOrder[];
  popular_products: DashboardPopularProduct[];
  weekly_sales: DashboardWeeklySale[];
}
