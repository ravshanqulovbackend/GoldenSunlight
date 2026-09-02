import { cn } from "@/lib/utils/cn";

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  label?: string;
}

/** Google Material Symbols Outlined ligature-shrift atrofidagi wrapper. */
export function Icon({ name, className, filled, label }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", filled && "icon-fill", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {name}
    </span>
  );
}
