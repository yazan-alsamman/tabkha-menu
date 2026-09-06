import { useState } from "react";
import { useAdminI18n } from "../i18n";
import { Button } from "../components/Button";

export function PreviewPage() {
  const { t } = useAdminI18n();
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const src = `/${locale}?preview=1`;
  const width = device === "mobile" ? 390 : 1280;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-latin)] text-3xl font-light tracking-[0.08em] uppercase">{t.preview}</h1>
      <p className="mt-3 max-w-2xl text-sm text-forest/55">{t.previewHint}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant={locale === "ar" ? "primary" : "ghost"} onClick={() => setLocale("ar")}>
          {t.arabic}
        </Button>
        <Button variant={locale === "en" ? "primary" : "ghost"} onClick={() => setLocale("en")}>
          {t.english}
        </Button>
        <Button variant={device === "mobile" ? "terracotta" : "ghost"} onClick={() => setDevice("mobile")}>
          {t.mobile}
        </Button>
        <Button variant={device === "desktop" ? "terracotta" : "ghost"} onClick={() => setDevice("desktop")}>
          {t.desktop}
        </Button>
        <a href={src} target="_blank" rel="noreferrer" className="inline-flex">
          <Button variant="ghost">{t.previewMenu}</Button>
        </a>
      </div>
      <div className="mt-8 overflow-auto border border-forest/10 bg-forest/5 p-4">
        <div className="mx-auto bg-forest shadow-lift" style={{ width, maxWidth: "100%" }}>
          <p className="bg-terracotta px-3 py-2 text-center text-[0.65rem] tracking-[0.22em] uppercase text-cream">
            {t.draftPreview}
          </p>
          <iframe title={t.draftPreview} src={src} className="h-[70vh] w-full border-0 bg-cream" />
        </div>
      </div>
    </div>
  );
}
