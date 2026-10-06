import { useRef, useState, type DragEvent } from "react";
import { resolveMenuImage } from "@/lib/images";
import { adminApi, ApiError } from "../api";
import { useAdminI18n } from "../i18n";
import { Button } from "./Button";

export function ImageField({
  kind,
  value,
  onChange,
}: {
  kind: "dish" | "category" | "logo";
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const { t } = useAdminI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = resolveMenuImage(value).src;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const media = await adminApi.upload(file, kind);
      onChange(media.url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.uploadError);
    } finally {
      setBusy(false);
    }
  }

  function onDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setOver(true);
  }

  function onDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setOver(false);
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    setOver(false);
    void onFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative mb-3 block w-full max-w-sm cursor-pointer overflow-hidden border text-start ${
          over ? "border-terracotta bg-terracotta/5" : "border-dashed border-forest/20"
        }`}
      >
        {preview ? (
          <img src={preview} alt="" className="aspect-[4/3] max-h-56 w-full object-cover bg-forest/10" />
        ) : (
          <div className="flex aspect-[4/3] max-h-56 items-center justify-center px-4 text-center text-sm text-forest/45">
            {t.dropImage}
          </div>
        )}
        {busy ? (
          <span className="absolute inset-0 grid place-items-center bg-cream/70 text-sm text-forest">{t.saving}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center bg-forest px-4 text-sm tracking-[0.12em] uppercase text-cream">
          {busy ? t.saving : value ? t.replace : t.upload}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              void onFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {value ? (
          <Button
            variant="ghost"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onChange(null);
            }}
          >
            {t.removeImage}
          </Button>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-forest/50">{t.publishToShow}</p>
      {error ? <p className="mt-2 text-sm text-terracotta">{error}</p> : null}
    </div>
  );
}
