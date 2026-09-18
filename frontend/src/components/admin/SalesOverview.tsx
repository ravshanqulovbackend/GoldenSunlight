import { formatPrice } from "@/lib/utils/money";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { orderStatusTone } from "@/lib/utils/orderStatusTone";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/types/order";
import type { DashboardStats } from "@/types/dashboard";

interface SalesOverviewProps {
  data: DashboardStats;
}

const PERIODS = [
  { key: "today_revenue", ordersKey: "today_orders", label: "Today", icon: "today" },
  { key: "week_revenue", ordersKey: "week_orders", label: "This week", icon: "date_range" },
  { key: "month_revenue", ordersKey: "month_orders", label: "This month", icon: "calendar_month" },
] as const;

const ORDER_STATUS_KEYS: OrderStatus[] = ["pending", "preparing", "ready", "picked_up", "cancelled", "refunded"];

/** Chart-only compact number (no currency symbol, no Intl — deterministic like the
 * rest of `lib/utils/money.ts`) so a 7-bar row of values still fits at phone width. */
function formatCompact(value: number): string {
  if (value <= 0) return "0";
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(Math.round(value));
}

const CHART_HEIGHT_PX = 128;

/**
 * Daily/weekly/monthly sales — superadmin-only (same visibility rule as
 * `ActivityLogTable`, since this is financial data and "admin" is an operations
 * role, not ownership — see `AdminSidebar.tsx`, which already hides the whole
 * `/admin/dashboard` link from plain `admin`).
 *
 * Revenue only ever counts `picked_up` orders, grouped by `picked_up_at` (when the
 * order was actually collected), not `created_at` — see the comment on
 * `Order.picked_up_at` (backend `orders/models.py`) and `common/views.py`.
 */
export function SalesOverview({ data }: SalesOverviewProps) {
  const weeklyValues = data.weekly_sales.map((d) => parseFloat(d.revenue) || 0);
  const maxValue = Math.max(...weeklyValues, 0);

  return (
    <section className="flex flex-col gap-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <div>
        <h2 className="title-lg text-on-surface">Sales</h2>
        <p className="label-sm normal-case text-on-surface-variant">
          Revenue counted only from picked-up orders, by pickup date.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PERIODS.map((period) => {
          const orderCount = data[period.ordersKey];
          return (
            <div
              key={period.key}
              className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <Icon name={period.icon} className="text-[20px]" />
              </span>
              <div className="min-w-0">
                <p className="title-lg truncate text-on-surface">{formatPrice(data[period.key])}</p>
                <p className="label-sm normal-case text-on-surface-variant">
                  {period.label} · {orderCount} order{orderCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="label-md mb-4 text-on-surface-variant">Last 7 days</h3>
        {maxValue > 0 ? (
          <div className="flex items-end gap-2 sm:gap-4">
            {data.weekly_sales.map((day, i) => {
              const value = weeklyValues[i];
              const barHeight = Math.max((value / maxValue) * CHART_HEIGHT_PX, value > 0 ? 4 : 0);
              return (
                <div key={`${day.day}-${i}`} className="flex flex-1 flex-col items-center gap-2">
                  <span className="label-sm text-on-surface-variant">{formatCompact(value)}</span>
                  {/* border-b anchors every column to a visible zero-baseline, so a day
                      with no sales still reads as "zero", not as missing/broken layout. */}
                  <div
                    className="flex w-full items-end justify-center border-b border-outline-variant"
                    style={{ height: `${CHART_HEIGHT_PX}px` }}
                  >
                    <div
                      className="w-full max-w-10 rounded-t-[4px] bg-primary transition-[height] duration-500 ease-soft"
                      style={{ height: `${barHeight}px` }}
                      role="img"
                      aria-label={`${day.day}: ${formatPrice(value)}`}
                      title={formatPrice(value)}
                    />
                  </div>
                  <span className="label-sm text-on-surface-variant">{day.day}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="show_chart"
            title="No completed sales yet"
            description="Revenue shows up here once an order is marked Picked Up."
          />
        )}
      </div>

      <div>
        <h3 className="label-md mb-3 text-on-surface-variant">Order status breakdown</h3>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUS_KEYS.map((key) => (
            <Badge key={key} tone={orderStatusTone(key)}>
              {ORDER_STATUS_LABELS[key]}: {data.order_stats[key]}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
