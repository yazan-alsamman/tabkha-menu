import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { PetalMark, WordmarkAr, WordmarkLatin } from "@/components/branding/PetalMark";
import { ArchDivider } from "@/components/branding/ArchDivider";
import { VegaCoreMark } from "@/components/branding/VegaCoreMark";
import { INSTAGRAM_HANDLE, publicMenuUrl } from "@/lib/contact";

export function TableCardPage() {
  const url = publicMenuUrl("ar");
  const [src, setSrc] = useState("");

  useEffect(() => {
    document.title = "Tabkha table card";
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    QRCode.toDataURL(url, {
      width: 640,
      margin: 1,
      color: { dark: "#233025", light: "#EDDFCE" },
    }).then(setSrc);
  }, [url]);

  return (
    <div className="min-h-dvh bg-cream text-forest">
      <div className="no-print mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5">
        <p className="font-copy text-sm leading-snug">بطاقة طاولة للطباعة — A4، بطاقتان. قصّ على الخط المنقط.</p>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 shrink-0 rounded-full bg-forest px-5 text-[0.7rem] tracking-[0.28em] uppercase text-cream"
        >
          طباعة
        </button>
      </div>

      <div className="mx-auto grid max-w-[210mm] gap-8 px-5 pb-12 print:max-w-none print:gap-[12mm] print:px-0 print:pb-0 md:grid-cols-2">
        <TableCard src={src} url={url} />
        <TableCard src={src} url={url} />
      </div>
    </div>
  );
}

function TableCard({ src, url }: { src: string; url: string }) {
  return (
    <article className="flex aspect-[90/128] flex-col items-center justify-between border border-forest/15 bg-forest px-6 py-7 text-cream print:break-inside-avoid">
      <div className="flex flex-col items-center text-center">
        <PetalMark className="size-14 text-cream" title="Tabkha" />
        <WordmarkAr className="mt-5 h-9 w-48" />
        <WordmarkLatin className="mt-2 h-4 w-44 opacity-80" />
        <ArchDivider className="mt-4 text-terracotta" />
        <p className="font-copy mt-4 text-[1.05rem] leading-snug">امسح لفتح القائمة</p>
        <p className="mt-1 text-[0.65rem] tracking-[0.22em] uppercase text-sage">Scan to open the menu</p>
      </div>

      <div className="border border-cream/15 bg-cream p-3">
        {src ? (
          <img src={src} alt={url} width={220} height={220} className="size-[min(42vw,11.5rem)]" />
        ) : (
          <div className="size-[min(42vw,11.5rem)] bg-forest/10" />
        )}
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-[0.7rem] tracking-[0.18em] uppercase text-sage" dir="ltr">
          @{INSTAGRAM_HANDLE}
        </p>
        <p className="text-[0.55rem] tracking-[0.24em] uppercase text-cream/45">Designed & developed by</p>
        <VegaCoreMark tone="cream" />
      </div>
    </article>
  );
}
