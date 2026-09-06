import sharp from "sharp";

const WIDTHS = [480, 900, 1400];
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
export const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function sniffMime(buffer: Buffer, declared?: string) {
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const png = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const webp = buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  const avif = buffer.toString("ascii", 4, 8) === "ftyp";
  if (jpeg) return "image/jpeg";
  if (png) return "image/png";
  if (webp) return "image/webp";
  if (avif) return "image/avif";
  if (declared && ALLOWED_MIME.has(declared)) return declared;
  return null;
}

export async function optimizeImage(input: Buffer) {
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  if (!meta.width || !meta.height) {
    throw new Error("Could not read image dimensions.");
  }
  const variants: { width: number; buffer: Buffer }[] = [];
  for (const width of WIDTHS) {
    const buffer = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    variants.push({ width, buffer });
  }
  return {
    width: meta.width,
    height: meta.height,
    variants,
  };
}
