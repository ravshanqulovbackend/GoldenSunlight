import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getUser, getUsers, updateUserRole, type AdminUserFilters } from "@/lib/api/endpoints/adminUsers";
import { toast } from "@/lib/stores/toastStore";
import { parseApiError } from "@/lib/api/parseApiError";
import type { UserRole } from "@/types/auth";

const USERS_KEY = ["admin-users"];
const userKey = (id: number) => ["admin-users", id];

export function useUsers(filters: AdminUserFilters = {}) {
  return useQuery({
    queryKey: [...USERS_KEY, filters],
    queryFn: () => getUsers(filters),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKey(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) => updateUserRole(id, role),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.invalidateQueries({ queryKey: userKey(updated.id) });
      toast("Role updated", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "Error updating role", "error"),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast("User deleted", "success");
    },
    onError: (error) => toast(parseApiError(error).message || "Error deleting", "error"),
  });
}
