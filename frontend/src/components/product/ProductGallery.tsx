"use client";

import { useState } from "react";
import { AppImage } from "@/components/ui/AppImage";
import { cn } from "@/lib/utils/cn";

interface GalleryImage {
  src: string;
  alt: string;
}

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
          {images.map((image, index) => (
            <button
              key={image.src + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "gs-press h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 sm:h-20 sm:w-20",
                index === activeIndex
                  ? "scale-105 border-primary shadow-md shadow-primary/25"
                  : "border-outline-variant opacity-70 hover:-translate-y-0.5 hover:border-primary/50 hover:opacity-100"
              )}
            >
              <AppImage src={image.src} alt={image.alt} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}

      <div className="group aspect-square flex-1 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
        {active && (
          // `key` — boshqa rasmga o'tilganda element qayta mount bo'lib, kirish
          // animatsiyasi qaytadan ijro etiladi.
          <AppImage
            key={active.src}
            src={active.src}
            alt={active.alt}
            className="h-full w-full transition-transform duration-[600ms] ease-soft group-hover:scale-110"
          />
        )}
      </div>
    </div>
  );
}
