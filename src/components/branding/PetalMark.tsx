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

/** Four-petal mark: rounded corners face out, star left as negative space. */
export function PetalMark({ className = "size-16", title }: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`inline-block ${className}`}
      fill="currentColor"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M12 50V20c0-8 6-14 14-14h24v28c0 9-7 16-16 16H12Z" />
      <path d="M50 12h30c8 0 14 6 14 14v24H66c-9 0-16-7-16-16V12Z" />
      <path d="M88 50v30c0 8-6 14-14 14H50V66c0-9 7-16 16-16h22Z" />
      <path d="M50 88H20c-8 0-14-6-14-14V50h28c9 0 16 7 16 16v22Z" />
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
