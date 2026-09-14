"use client";

import { useEffect, useRef, type ElementType } from "react";
import { cn } from "@/lib/utils/cn";

type RevealVariant = "up" | "side" | "zoom";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Ekranga kirganda qaysi tomondan chiqsin. Default: pastdan (`up`). */
  variant?: RevealVariant;
  /** Kechikish (soniya) — yonma-yon turgan bloklarni ketma-ket chiqarish uchun. */
  delay?: number;
  as?: ElementType;
}

const variantClass: Record<RevealVariant, string | undefined> = {
  up: undefined,
  side: "gs-reveal-side",
  zoom: "gs-reveal-zoom",
};

/**
 * Element ekranga scroll qilinganda bir marta ochiladi (IntersectionObserver).
 *
 * `gs-in` klassi React state orqali emas, to'g'ridan-to'g'ri DOM orqali
 * qo'shiladi: bu sof vizual holat, uni state'ga aylantirish har bir ochilishda
 * keraksiz qayta render qilishga olib keladi (React `className` propi
 * o'zgarmagani uchun qo'lda qo'shilgan klassni o'chirib yubormaydi).
 *
 * Kontent hech qachon ko'rinmay qolmasligi kerak: `prefers-reduced-motion`
 * yoqilgan bo'lsa `.gs-reveal` CSS'da majburan ochiq holatda bo'ladi,
 * IntersectionObserver mavjud bo'lmagan muhitda esa element darhol ochiladi.
 */
export function Reveal({ children, className, variant = "up", delay = 0, as }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("gs-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("gs-in");
            observer.disconnect();
          }
        }
      },
      // Element ekran chetiga tegishi bilan emas, ko'rish maydoniga yaxshi
      // kirganda ochiladi.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? ({ "--gs-delay": `${delay}s` } as React.CSSProperties) : undefined}
      className={cn("gs-reveal", variantClass[variant], className)}
    >
      {children}
    </Tag>
  );
}
