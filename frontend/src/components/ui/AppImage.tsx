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
 */
export function AppImage({ src, alt, className, ...props }: AppImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failed ? PLACEHOLDER_IMAGE : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
      {...props}
    />
  );
}
