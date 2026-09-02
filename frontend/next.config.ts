import type { NextConfig } from "next";

/**
 * Lokal backend'ni (localhost:8000) shu Next.js server orqali bir xil origin sifatida
 * ochish uchun — masalan tunnel (cloudflared/ngrok) orqali mijozga faqat BITTA havola
 * (frontend) ulashilganda, brauzer /api va /media so'rovlarini ham o'sha tunnel domenidan
 * yuboradi, Next.js esa buni server-tomonda haqiqiy backend'ga uzatadi. Productionda
 * (docker-compose/Railway) NEXT_PUBLIC_API_URL to'liq/tashqi manzil bo'lgani uchun bu
 * qoidalar hech qachon ishga tushmaydi — faqat shu vaqtinchalik-havola ssenariysida kerak.
 */
const backendOrigin = (process.env.API_URL_INTERNAL || "http://localhost:8000/api").replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  // Django REST Framework barcha /api/ yo'llarida OXIRIDA "/" talab qiladi (aks holda
  // 301 bilan qayta yo'naltiradi). Next.js'ning `:path*` catch-all'i esa destination'ni
  // qurishda oxirgi "/" ni har doim yo'qotadi — shuning uchun pastda uni qo'lda qaytarib
  // qo'yamiz (aks holda Next -> Django -> Next -> Django cheksiz redirect hosil bo'ladi,
  // chunki Next Django'ning 301'ini ham xuddi shu buzilgan qoida bilan qayta uzatadi).
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendOrigin}/api/:path*/` },
      { source: "/media/:path*", destination: `${backendOrigin}/media/:path*` },
    ];
  },
};

export default nextConfig;
