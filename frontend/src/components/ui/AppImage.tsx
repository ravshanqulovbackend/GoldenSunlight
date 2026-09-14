"use client";

import { type ImgHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { PLACEHOLDER_IMAGE } from "@/lib/utils/image";

interface AppImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/**
 * Based on a plain <img> — not next/image, because image origins coming from the
 * backend are inconsistent (relative/absolute) and real product photos don't exist yet.
 * Falls back to a placeholder via onError.
 *
 * Rasm yuklangunicha shaffof turadi va yuklangach yumshoq paydo bo'ladi
 * (`.gs-img` — globals.css), shunda sahifada rasmlar "chaqnab" chiqmaydi.
 */
export function AppImage({ src, alt, className, onLoad, ...props }: AppImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={(node) => {
        // Keshdan kelgan rasm mount paytida allaqachon yuklangan bo'ladi va
        // `onLoad` umuman ishlamaydi — bu holatda rasm abadiy shaffof qolib
        // ketmasligi uchun `complete` shu yerda tekshiriladi.
        if (node?.complete) setLoaded(true);
      }}
      src={failed ? PLACEHOLDER_IMAGE : src}
      alt={alt}
      loading="lazy"
      onError={() => {
        setFailed(true);
        setLoaded(true);
      }}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      data-loaded={loaded}
      className={cn("gs-img object-cover", className)}
      {...props}
    />
  );
}
