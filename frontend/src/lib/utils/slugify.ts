/**
 * "Nomi" maydonidan "slug"ni avtomatik taklif qilish uchun — o'zbekcha tutuq belgisi
 * (' / ‘ / ’) va boshqa maxsus belgilarni olib tashlaydi, bo'shliqlarni "-" bilan almashtiradi.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’‘`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
