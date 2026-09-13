import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ScrollProgress } from "./ScrollProgress";

export function GuestChrome({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] isolate">{children}</div>,
    document.body,
  );
}

export function GuestBar({
  eyebrow,
  title,
  onBack,
}: {
  eyebrow: string;
  title: string;
  onBack: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="pointer-events-auto border-b border-cream/10 bg-forest text-cream" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex items-center gap-2 py-2 screen-gutter">
        <button type="button" onClick={onBack} className="min-h-11 shrink-0 px-1 text-sm text-cream/80">
          {t.back}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[0.62rem] tracking-[0.28em] uppercase text-terracotta">{eyebrow}</p>
          <p className="font-copy truncate text-[1.05rem] leading-tight">{title}</p>
        </div>
        <LanguageSwitcher />
      </div>
      <ScrollProgress />
    </div>
  );
}
