import { useState } from "react";
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      {value ? (
        <img src={value.startsWith("http") || value.includes("/") ? value : `/images/categories/${value}-900.webp`} alt="" className="mb-3 aspect-[4/3] max-h-48 w-full max-w-sm object-cover bg-forest/10" />
      ) : (
        <div className="mb-3 flex aspect-[4/3] max-h-48 max-w-sm items-center justify-center border border-dashed border-forest/20 text-sm text-forest/40">
          {t.missingImage}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center bg-forest px-4 text-sm tracking-[0.12em] uppercase text-cream">
          {busy ? t.saving : value ? t.replace : t.upload}
          <input
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
          <Button variant="ghost" onClick={() => onChange(null)}>
            {t.removeImage}
          </Button>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-sm text-terracotta">{error}</p> : null}
    </div>
  );
}
