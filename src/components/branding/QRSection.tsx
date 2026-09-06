import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useI18n } from "@/lib/i18n";
import { PetalMark } from "./PetalMark";
import { ArchDivider } from "./ArchDivider";

export function QRSection() {
  const { t, locale } = useI18n();
  const [src, setSrc] = useState<string>("");
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const url = `${import.meta.env.VITE_PUBLIC_URL || origin}/${locale}`;

  useEffect(() => {
    if (!url || url.endsWith("undefined/ar")) return;
    QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      color: { dark: "#233025", light: "#EDDFCE" },
    }).then(setSrc);
  }, [url]);

  return (
    <section id="qr" className="bg-cream py-[clamp(4rem,10vh,7rem)] text-forest screen-gutter">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <PetalMark className="size-14" />
        <h2 className="font-copy mt-6 text-3xl">{t.scanToOpen}</h2>
        <ArchDivider className="mt-5 text-terracotta" />
        <p className="mt-4 text-sm tracking-wide text-forest/70">{t.qrCaption}</p>
        <div className="mt-10 border border-forest/15 bg-cream-warm p-4">
          {src ? (
            <img src={src} alt={url} width={260} height={260} className="size-52 sm:size-64" />
          ) : (
            <div className="size-52 bg-forest/10 sm:size-64" />
          )}
        </div>
        <p className="mt-4 font-mono text-xs text-forest/55" dir="ltr">
          {url}
        </p>
      </div>
    </section>
  );
}
