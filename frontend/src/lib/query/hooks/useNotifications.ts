import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/endpoints/notifications";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/lib/stores/authStore";

/** `enabled` — pass `false` when the caller already knows the viewer can never
 * have any (e.g. `AdminSidebar` for a plain `admin`: only superadmins get
 * notifications, so there's no point polling for them). */
export function useNotifications(enabled = true) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);

  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
    enabled: enabled && isHydrated && !!access,
    // Support'dagi kabi — admin/superadmin "buyurtma tayyor" yoki mahsulot/kategoriya
    // o'chirilgani haqidagi bildirishnomani sahifani qayta ochmasdan ham ko'rishi uchun.
    refetchInterval: enabled ? 60_000 : false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
