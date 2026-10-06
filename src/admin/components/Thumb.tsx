import { resolveMenuImage } from "@/lib/images";

export function Thumb({ src, className = "size-14" }: { src: string | null | undefined; className?: string }) {
  const preview = resolveMenuImage(src).src;
  if (!preview) return <span className={`shrink-0 bg-forest/8 ${className}`} />;
  return <img src={preview} alt="" className={`shrink-0 object-cover bg-forest/8 ${className}`} />;
}
