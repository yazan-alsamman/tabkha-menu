type MarkProps = {
  className?: string;
  title?: string;
};

function MaskedAsset({
  src,
  className,
  title,
}: {
  src: string;
  className: string;
  title?: string;
}) {
  return (
    <span
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`inline-block ${className}`}
      style={{
        backgroundColor: "currentColor",
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
      }}
    />
  );
}

/** Facade mark from `referenses/Restaurant Facade Logo2.pdf` (public/brand/petal-mark.svg). */
export function PetalMark({ className = "size-16", title }: MarkProps) {
  return (
    <svg
      viewBox="9977.96 2040.96 2154.31 2154.31"
      className={`inline-block overflow-visible ${className}`}
      fill="currentColor"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path transform="matrix(10,0,0,-10,10448.556,3200.5723)" d="M0 0H.11C28.994 0 52.41-23.416 52.41-52.3V-52.319C52.41-78.359 31.3-99.469 5.259-99.469H-47.059V-47.059C-47.059-21.069-25.99 0 0 0" />
      <path transform="matrix(10,0,0,-10,11137.579,3724.672)" d="M0 0V.11C0 28.994 23.416 52.41 52.3 52.41H52.319C78.359 52.41 99.469 31.3 99.469 5.259V-47.059H47.059C21.069-47.059 0-25.99 0 0" />
      <path transform="matrix(10,0,0,-10,11661.68,3035.6485)" d="M0 0H-.008C-28.949 0-52.41 23.461-52.41 52.402V52.41C-52.41 78.4-31.341 99.469-5.351 99.469H47.059V47.059C47.059 21.069 25.99 0 0 0" />
      <path transform="matrix(10,0,0,-10,10501.148,2040.9556)" d="M0 0C26.041 0 47.151-21.11 47.151-47.151V-47.169C47.151-76.054 23.735-99.469-5.15-99.469H-5.168C-31.208-99.469-52.319-78.359-52.319-52.319V0Z" />
      <path transform="matrix(10,0,0,-10,11054.438,3410.2752)" d="M0 0V0C0 16.323-13.232 29.555-29.555 29.555-13.232 29.555 0 42.787 0 59.11 0 42.787 13.232 29.555 29.555 29.555 13.232 29.555 0 16.323 0 0" />
    </svg>
  );
}

export function WordmarkAr({ className = "h-10 w-48" }: { className?: string }) {
  return <MaskedAsset src="/brand/wordmark-ar.svg" className={className} />;
}

export function WordmarkLatin({ className = "h-6 w-56" }: { className?: string }) {
  return <MaskedAsset src="/brand/wordmark-latin.svg" className={className} />;
}

export function TabkhaGlyph({ className = "h-16 w-24" }: { className?: string }) {
  return <MaskedAsset src="/brand/glyph-tabkha.svg" className={className} />;
}

/** Isolated ط from the facade wordmark طبخة. */
export function TaaMark({ className = "h-16 w-12" }: { className?: string }) {
  return <MaskedAsset src="/brand/glyph-taa.svg" className={className} />;
}
