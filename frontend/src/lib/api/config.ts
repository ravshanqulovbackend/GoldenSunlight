/**
 * Ikki xil bazaviy API URL kerak:
 * - NEXT_PUBLIC_API_URL — brauzerdan chaqiriladi, nginx orqali (odatda nisbiy "/api").
 * - API_URL_INTERNAL — Server Component'lardan konteyner ichida chaqiriladi, nginx'ni
 *   aylanib o'tib to'g'ridan-to'g'ri Docker tarmog'idagi backend xostiga boradi (nisbiy
 *   URL serverda ishlamaydi, chunki brauzer yo'q). docker-compose.yml'da beriladi.
 */
export const BROWSER_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const SERVER_API_URL =
  process.env.API_URL_INTERNAL || "http://localhost:8000/api";

/** products app'ning nisbiy rasm yo'llari uchun (FlexibleImageField). Prod'da bo'sh —
 * nginx /media/ ni frontend bilan bir xil originda uzatadi. */
export const MEDIA_ORIGIN = process.env.NEXT_PUBLIC_MEDIA_ORIGIN ?? "";
