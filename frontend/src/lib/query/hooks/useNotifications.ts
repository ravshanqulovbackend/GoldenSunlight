import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/endpoints/notifications";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/lib/stores/authStore";

export function useNotifications() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const access = useAuthStore((s) => s.access);

  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
    enabled: isHydrated && !!access,
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
