export function StatusPill({
  tone,
  children,
}: {
  tone: "live" | "draft" | "warn" | "muted";
  children: string;
}) {
  const cls =
    tone === "live"
      ? "bg-forest text-cream"
      : tone === "draft"
        ? "border border-forest/20 text-forest/70"
        : tone === "warn"
          ? "bg-terracotta/15 text-terracotta"
          : "text-sage";
  return <span className={`inline-block px-2 py-0.5 text-[0.65rem] tracking-[0.16em] uppercase ${cls}`}>{children}</span>;
}
