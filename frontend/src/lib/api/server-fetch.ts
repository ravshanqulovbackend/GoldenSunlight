import { SERVER_API_URL } from "./config";
import { ApiError, type ApiErrorBody } from "@/types/api";

interface ServerFetchOptions {
  searchParams?: Record<string, string | number | boolean | undefined | null>;
  revalidate?: number | false;
  tags?: string[];
}

function buildUrl(path: string, searchParams?: ServerFetchOptions["searchParams"]) {
  const url = new URL(path.replace(/^\//, ""), `${SERVER_API_URL}/`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Faqat public GET endpoint'lar uchun (mahsulotlar, kategoriyalar, yangiliklar va h.k.) —
 * Server Component'lar ichida ishlatiladi, auth kerak emas. Auth/mutatsiya talab
 * qiladigan hamma narsa `lib/api/http.ts` (axios, client komponent) orqali o'tadi.
 */
export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {}
): Promise<T> {
  const { searchParams, revalidate = 60, tags } = options;
  const url = buildUrl(path, searchParams);

  // Bepul hostingda backend harakatsizlikdan keyin uxlaydi va uyg'onish lahzasida
  // qisqa muddat 502/503 qaytaradi. Bitta urinish bilan cheklansak, tashrifchi
  // butun sahifa o'rniga xato ekranini ko'radi — shuning uchun qayta uriniladi.
  let res: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, attempt * 2000));
    try {
      res = await fetch(url, { next: { revalidate, tags } });
    } catch {
      continue;
    }
    if (res.ok || res.status < 500) break;
  }

  if (!res) {
    throw new ApiError(503, null, "Backend javob bermadi");
  }

  if (!res.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = await res.json();
    } catch {
      // javob JSON emas
    }
    throw new ApiError(res.status, body, `So'rov muvaffaqiyatsiz: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
