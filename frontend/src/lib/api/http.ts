import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { BROWSER_API_URL } from "./config";
import { useAuthStore } from "@/lib/stores/authStore";
import type { AuthTokens } from "@/types/auth";

/** Auth talab qiladigan/mutatsiya endpoint'lari uchun — faqat client komponentlarda ishlatiladi. */
export const http = axios.create({ baseURL: BROWSER_API_URL });

/** Faqat refresh so'rovi uchun — asosiy instance interceptor zanjiriga tushib qolmasligi uchun. */
const refreshClient = axios.create({ baseURL: BROWSER_API_URL });

http.interceptors.request.use((config) => {
  const access = useAuthStore.getState().access;
  if (access) {
    config.headers.set("Authorization", `Bearer ${access}`);
  }
  return config;
});

/**
 * Bir vaqtda bir nechta 401 kelsa (React Query bir necha so'rovni parallel yuboradi),
 * hammasi BITTA refresh so'roviga ulanadi. Aks holda ikkinchi refresh so'rovi
 * allaqachon aylantirilgan (blacklist'langan) tokenni yuboradi va hali amal qiluvchi
 * foydalanuvchi chiqarib yuboriladi — shuning uchun await ishlatilmaydi (guard va
 * tayinlash sinxron bajarilishi kerak, aks holda race yuzaga keladi).
 */
let refreshPromise: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  const refresh = useAuthStore.getState().refresh;
  if (!refresh) return Promise.resolve(null);

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<AuthTokens>("/users/token/refresh/", { refresh })
      .then((res) => {
        useAuthStore.getState().setTokens(res.data);
        return res.data.access;
      })
      .catch(() => {
        useAuthStore.getState().logout();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const isAuthEndpoint =
      config?.url?.includes("/users/token/refresh/") ||
      config?.url?.includes("/users/login/");

    if (status === 401 && config && !config._retried && !isAuthEndpoint) {
      config._retried = true;
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        config.headers.set("Authorization", `Bearer ${newAccess}`);
        return http(config);
      }
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/login")) {
        const next = window.location.pathname + window.location.search;
        // Bu axios interceptor — React komponenti emas, useRouter()/redirect() ishlatib
        // bo'lmaydi. Qattiq reload butun in-memory state'ni (Query cache, Zustand) tozalaydi.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/auth/login?next=${encodeURIComponent(next)}`;
      }
    }

    return Promise.reject(error);
  }
);
