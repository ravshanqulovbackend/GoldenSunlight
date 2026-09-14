import { cn } from "@/lib/utils/cn";

type AnimatedTextProps = {
  text: string;
  /** Qaysi teg sifatida render qilinsin (h1/h2/p/span...). Default: `span`. */
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  /** Birinchi so'zgacha kutish (soniya) — sarlavha va matn ketma-ket chiqishi uchun. */
  delay?: number;
  /** So'zlar orasidagi qadam (soniya). */
  step?: number;
};

/**
 * Matnni so'zlarga ajratib, har birini alohida ko'taradi (pastdan + blurdan
 * fokusga). Sahifa almashganda yozuvlarning "jonlanishi" shu komponent orqali.
 *
 * Ajratish SO'Z bo'yicha, harf bo'yicha emas: arabcha (RTL) matn bog'langan
 * yozuv — harflarga bo'lish so'z shaklini buzib yuboradi, so'zlarga bo'lish esa
 * xavfsiz.
 *
 * Server Component — hook ishlatmaydi, shuning uchun `page.tsx` ichida
 * to'g'ridan-to'g'ri chaqirsa bo'ladi.
 */
export function AnimatedText({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  step = 0.055,
}: AnimatedTextProps) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span
            className={cn("gs-word")}
            style={{ animationDelay: `${(delay + index * step).toFixed(3)}s` }}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
