import { PetalMark } from "./PetalMark";
import { VegaCoreMark } from "./VegaCoreMark";
import { InstagramIcon, PhoneIcon, PinIcon } from "./SocialIcons";
import { useI18n } from "@/lib/i18n";
import {
  ADDRESS_AR,
  ADDRESS_EN,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  MAPS_URL,
  PHONE_DISPLAY,
  PHONE_E164,
} from "@/lib/contact";

export function Footer() {
  const { locale, t } = useI18n();
  const address = locale === "ar" ? ADDRESS_AR : ADDRESS_EN;

  return (
    <footer className="bg-forest-deep py-[clamp(2.75rem,8vh,5rem)] text-cream screen-gutter">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <PetalMark className="size-10 text-cream/80" />
        <p className="font-copy mt-6 text-xl">{t.thankYou}</p>
        <p className="mt-3 text-sm tracking-[0.2em] uppercase text-sage">
          {locale === "ar" ? "طبخة آند مور" : "Tabkha and More"}
        </p>

        <ul className="mt-8 flex w-full flex-col gap-3 text-sm text-cream/80">
          <li>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2.5"
            >
              <PinIcon className="size-4 shrink-0 text-terracotta" />
              <span>{address}</span>
            </a>
          </li>
          <li>
            <a dir="ltr" href={`tel:${PHONE_E164}`} className="inline-flex min-h-11 items-center justify-center gap-2.5">
              <PhoneIcon className="size-4 shrink-0 text-terracotta" />
              <span>{PHONE_DISPLAY}</span>
            </a>
          </li>
          <li>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2.5"
              aria-label="Instagram"
            >
              <InstagramIcon className="size-4 shrink-0 text-terracotta" />
              <span dir="ltr">@{INSTAGRAM_HANDLE}</span>
            </a>
          </li>
        </ul>

        <div className="mt-10 w-full border-t border-cream/10 pt-8">
          <p className="text-[0.62rem] tracking-[0.28em] uppercase text-sage">{t.designedBy}</p>
          <VegaCoreMark tone="cream" className="mt-3" />
        </div>
      </div>
    </footer>
  );
}
