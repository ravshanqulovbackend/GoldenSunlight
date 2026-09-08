/**
 * Narx maydonlari backend'da deyarli hamma joyda Decimal-string ("12000.00"), lekin
 * cart.total_price/total_items xom JSON son sifatida keladi — ikkalasi ham qabul qilinadi.
 *
 * `Intl.NumberFormat`/`Intl.DateTimeFormat` ATAYLAB ishlatilmaydi: Node (server) va
 * brauzer (client) ICU ma'lumotlari bir xil locale uchun ham turlicha guruhlash belgisi
 * qaytarishi mumkin, bu esa Next.js'da hydration mismatch'ga olib keladi (server va
 * client boshqa-boshqa matn render qiladi). Shu sabab qo'lda, determinstik formatlash
 * ishlatiladi — server va client har doim bir xil natija beradi.
 */
export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "AED 0.00";
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(numeric)) return "AED 0.00";
  const [whole, decimals] = numeric.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `AED ${grouped}.${decimals}`;
}

/**
 * Sayt Dubay (BAA, UTC+4) vaqti bo'yicha ishlaydi — bu offset yil davomida o'zgarmaydi
 * (BAA yozgi vaqtga o'tmaydi), shuning uchun uni doim qo'lda qo'shish yetarli.
 *
 * Bu yerda ham (formatDate pastda) mahalliy getDate()/getHours() emas, balki UTC+4
 * ga siljitilgan sana ustidagi UTC getterlar ishlatiladi: Docker'dagi server odatda
 * UTC'da, brauzer esa foydalanuvchining mahalliy zonasida ishlaydi — agar mahalliy
 * getterlar ishlatilsa, ikkalasi boshqa-boshqa natija chiqarib hydration mismatch
 * keltirib chiqarardi. UTC getterlarni oldindan siljitilgan sana ustida ishlatish
 * Intl/mahalliy vaqt zonasiga bog'liq bo'lmasdan har doim Dubay devor vaqtini beradi.
 */
const DUBAI_OFFSET_MS = 4 * 60 * 60 * 1000;

function toDubaiTime(date: Date): Date {
  return new Date(date.getTime() + DUBAI_OFFSET_MS);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const raw = new Date(value);
  if (Number.isNaN(raw.getTime())) return "";
  const date = toDubaiTime(raw);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getUTCFullYear()}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const raw = new Date(value);
  if (Number.isNaN(raw.getTime())) return "";
  const date = toDubaiTime(raw);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day}.${month}.${date.getUTCFullYear()} ${hours}:${minutes}`;
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "";
  const raw = new Date(value);
  if (Number.isNaN(raw.getTime())) return "";
  const date = toDubaiTime(raw);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
