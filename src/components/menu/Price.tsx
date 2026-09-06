import { formatPrice } from "@/lib/format";
import type { Locale } from "@/types/menu";

export function Price({ value, locale, className = "" }: { value: number; locale: Locale; className?: string }) {
  return <span className={`tabular-nums tracking-wide ${className}`}>{formatPrice(value, locale)}</span>;
}
