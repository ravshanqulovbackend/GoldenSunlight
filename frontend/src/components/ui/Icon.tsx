import { cn } from "@/lib/utils/cn";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  label?: string;
  /** Directional glyphs (arrows/chevrons) don't auto-flip under dir="rtl" — set this
   *  for icons whose *meaning* is direction-relative (back/next, expand-toward-end)
   *  so they visually mirror in Arabic instead of pointing the wrong way. */
  mirrorInRtl?: boolean;
}

/** Google Material Symbols Outlined ligature-shrift atrofidagi wrapper. */
export function Icon({ name, className, filled, label, mirrorInRtl }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", filled && "icon-fill", mirrorInRtl && "rtl:-scale-x-100", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {name}
    </span>
  );
}
