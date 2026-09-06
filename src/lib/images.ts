import manifest from "@/data/generated/images.json";

type ImageEntry = {
  widths: number[];
  aspectRatio: number;
  placeholder: string;
};

const images = manifest as Record<string, ImageEntry>;

export function categoryImage(slug: string) {
  const entry = images[slug];
  if (!entry) {
    return {
      src: "",
      srcSet: "",
      sizes: "100vw",
      placeholder: "",
      aspectRatio: 1.5,
    };
  }
  const srcSet = entry.widths
    .map((width) => `/images/categories/${slug}-${width}.webp ${width}w`)
    .join(", ");
  return {
    src: `/images/categories/${slug}-${entry.widths[0]}.webp`,
    srcSet,
    sizes: "(min-width: 1024px) 520px, 100vw",
    placeholder: entry.placeholder,
    aspectRatio: entry.aspectRatio,
  };
}

export function isUploadedImage(ref: string) {
  return (
    ref.startsWith("http://") ||
    ref.startsWith("https://") ||
    ref.startsWith("/api/") ||
    ref.startsWith("/uploads") ||
    ref.includes("/")
  );
}

export function resolveMenuImage(ref: string | null | undefined) {
  if (!ref) {
    return {
      src: "",
      srcSet: "",
      sizes: "100vw",
      placeholder: "",
      aspectRatio: 1.5,
    };
  }
  if (isUploadedImage(ref)) {
    return {
      src: ref,
      srcSet: "",
      sizes: "100vw",
      placeholder: "",
      aspectRatio: 1.5,
    };
  }
  return categoryImage(ref);
}
