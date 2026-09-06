import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "../api";
import { useAdminI18n } from "../i18n";
import { Button } from "../components/Button";
import { Field, Input, Select, Textarea } from "../components/Field";
import { ImageField } from "../components/ImageField";
import { Toast } from "../components/Toast";

export function SettingsPage() {
  const { t } = useAdminI18n();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin-settings"], queryFn: adminApi.settings });
  const [form, setForm] = useState({
    nameAr: "",
    nameEn: "",
    taglineAr: "",
    taglineEn: "",
    storyAr: "",
    storyEn: "",
    logo: "",
    defaultLocale: "ar",
    qrUrl: "",
    phone: "",
    instagram: "",
    addressAr: "",
    addressEn: "",
  });
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const row = query.data?.restaurant;
    if (!row) return;
    setForm({
      nameAr: row.nameAr,
      nameEn: row.nameEn,
      taglineAr: row.taglineAr,
      taglineEn: row.taglineEn,
      storyAr: row.storyAr,
      storyEn: row.storyEn,
      logo: row.logo,
      defaultLocale: row.defaultLocale || "ar",
      qrUrl: row.qrUrl ?? "",
      phone: row.phone ?? "",
      instagram: row.instagram ?? "",
      addressAr: row.addressAr ?? "",
      addressEn: row.addressEn ?? "",
    });
  }, [query.data]);

  const save = useMutation({
    mutationFn: () =>
      adminApi.saveSettings({
        ...form,
        qrUrl: form.qrUrl || null,
        phone: form.phone || null,
        instagram: form.instagram || null,
        addressAr: form.addressAr || null,
        addressEn: form.addressEn || null,
      }),
    onSuccess: () => {
      setToast(t.saved);
      void client.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : t.networkError),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-[family-name:var(--font-latin)] text-3xl font-light tracking-[0.08em] uppercase">{t.settings}</h1>
      <p className="mt-3 text-sm text-forest/50">{t.qrUrlHint}</p>
      <div className="mt-8 grid gap-6">
        <Field label={t.restaurantNameAr}>
          <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} dir="rtl" />
        </Field>
        <Field label={t.restaurantNameEn}>
          <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} dir="ltr" />
        </Field>
        <Field label={t.taglineAr}>
          <Input value={form.taglineAr} onChange={(e) => setForm({ ...form, taglineAr: e.target.value })} dir="rtl" />
        </Field>
        <Field label={t.taglineEn}>
          <Input value={form.taglineEn} onChange={(e) => setForm({ ...form, taglineEn: e.target.value })} dir="ltr" />
        </Field>
        <Field label={t.storyAr}>
          <Textarea value={form.storyAr} onChange={(e) => setForm({ ...form, storyAr: e.target.value })} dir="rtl" />
        </Field>
        <Field label={t.storyEn}>
          <Textarea value={form.storyEn} onChange={(e) => setForm({ ...form, storyEn: e.target.value })} dir="ltr" />
        </Field>
        <Field label={t.logo}>
          <ImageField kind="logo" value={form.logo || null} onChange={(url) => setForm({ ...form, logo: url ?? "/brand/petal-mark.svg" })} />
        </Field>
        <Field label={t.defaultLanguage}>
          <Select value={form.defaultLocale} onChange={(e) => setForm({ ...form, defaultLocale: e.target.value })}>
            <option value="ar">{t.arabic}</option>
            <option value="en">{t.english}</option>
          </Select>
        </Field>
        <Field label={t.qrUrl} hint={t.qrUrlHint}>
          <Input value={form.qrUrl} onChange={(e) => setForm({ ...form, qrUrl: e.target.value })} dir="ltr" placeholder="https://…/ar" />
        </Field>
        <Field label={t.phone} hint={t.optional}>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label={t.instagram} hint={t.optional}>
          <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} dir="ltr" />
        </Field>
        <Field label={t.addressAr} hint={t.optional}>
          <Input value={form.addressAr} onChange={(e) => setForm({ ...form, addressAr: e.target.value })} dir="rtl" />
        </Field>
        <Field label={t.addressEn} hint={t.optional}>
          <Input value={form.addressEn} onChange={(e) => setForm({ ...form, addressEn: e.target.value })} dir="ltr" />
        </Field>
      </div>
      {error ? <p className="mt-4 text-sm text-terracotta">{error}</p> : null}
      <Button className="mt-8" variant="terracotta" disabled={save.isPending} onClick={() => save.mutate()}>
        {save.isPending ? t.saving : t.saved === toast ? t.saved : t.publish}
      </Button>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
