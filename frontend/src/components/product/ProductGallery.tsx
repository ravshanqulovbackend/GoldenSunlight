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
                "h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity",
                index === activeIndex ? "border-primary" : "border-outline-variant opacity-70 hover:opacity-100"
              )}
            >
              <AppImage src={image.src} alt={image.alt} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}

      <div className="group aspect-square flex-1 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
        {active && (
          <AppImage
            src={active.src}
            alt={active.alt}
            className="h-full w-full transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>
    </div>
  );
}
