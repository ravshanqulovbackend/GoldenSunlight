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
  // `next dev` sukut bo'yicha faqat `localhost`dan kelgan so'rovlarni qabul qiladi (dev-only
  // asset/HMR endpoint'larini himoya qilish uchun) — cloudflared/ngrok orqali tunnel ochilganda
  // brauzer boshqa origin'dan (masalan *.trycloudflare.com) so'rov yuboradi va Next uni bloklab,
  // sahifa JS'siz qoladi (tugmalar bosilmaydi, hydration ishlamaydi). Shu origin'larni oq
  // ro'yxatga qo'shib qo'yamiz — faqat dev-rejimga ta'sir qiladi, production build'da bu
  // tekshiruv umuman yo'q.
  allowedDevOrigins: ["*.trycloudflare.com", "*.ngrok-free.app", "*.ngrok.io", "*.ngrok.app"],
  // Next.js dev-rejim indikatori (chap-pastdagi "N" tugmasi) sidebar'ning "Back to Site"
  // havolasi bilan bir joyga to'g'ri kelib, uni yopib qo'yardi. Faqat `next dev`ga tegishli —
  // productionda bu indikator umuman chiqmaydi, shuning uchun bu sozlama u yerda ta'sir qilmaydi.
  devIndicators: false,
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
