import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "../api";
import { useAdminI18n } from "../i18n";
import { Button } from "../components/Button";
import { Field, Input, Select, Textarea } from "../components/Field";
import { ImageField } from "../components/ImageField";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Toast } from "../components/Toast";

export function CategoryEditorPage() {
  const { id } = useParams();
  const isNew = id === "new" || !id;
  const { t } = useAdminI18n();
  const navigate = useNavigate();
  const client = useQueryClient();
  const existing = useQuery({
    queryKey: ["admin-category", id],
    queryFn: () => adminApi.category(id!),
    enabled: !isNew,
  });
  const all = useQuery({ queryKey: ["admin-categories"], queryFn: adminApi.categories });

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [surface, setSurface] = useState<"cream" | "forest">("cream");
  const [scriptAccent, setScriptAccent] = useState("");
  const [active, setActive] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [reassignTo, setReassignTo] = useState("");

  useEffect(() => {
    const row = existing.data;
    if (!row) return;
    setNameAr(row.nameAr);
    setNameEn(row.nameEn);
    setDescriptionAr(row.descriptionAr ?? "");
    setDescriptionEn(row.descriptionEn ?? "");
    setImage(row.image);
    setSurface(row.surface === "forest" ? "forest" : "cream");
    setScriptAccent(row.scriptAccent ?? "");
    setActive(row.active);
  }, [existing.data]);

  const save = useMutation({
    mutationFn: (published: boolean) => {
      const body = {
        nameAr,
        nameEn,
        descriptionAr: descriptionAr || null,
        descriptionEn: descriptionEn || null,
        image,
        surface,
        scriptAccent: scriptAccent || null,
        active,
        published,
      };
      return isNew ? adminApi.createCategory(body) : adminApi.updateCategory(id!, body);
    },
    onSuccess: (row, published) => {
      setToast(published ? t.published : t.saved);
      void client.invalidateQueries({ queryKey: ["admin-categories"] });
      if (isNew) navigate(`/admin/categories/${row.id}`, { replace: true });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : t.networkError),
  });

  const remove = useMutation({
    mutationFn: () => adminApi.deleteCategory(id!, reassignTo || undefined),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin-categories"] });
      navigate("/admin/categories");
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : t.networkError),
  });

  const others = (all.data ?? []).filter((row) => row.id !== id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/categories" className="text-sm text-forest/50">
        ← {t.back}
      </Link>
      <h1 className="mt-4 font-[family-name:var(--font-latin)] text-3xl font-light tracking-[0.08em] uppercase">
        {isNew ? t.newCategory : t.editCategory}
      </h1>
      <div className="mt-8 grid gap-6">
        <Field label={t.nameAr}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} required dir="rtl" />
        </Field>
        <Field label={t.nameEn}>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} required dir="ltr" />
        </Field>
        <Field label={t.descriptionAr} hint={t.optional}>
          <Textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} dir="rtl" />
        </Field>
        <Field label={t.descriptionEn} hint={t.optional}>
          <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} dir="ltr" />
        </Field>
        <Field label={t.image}>
          <ImageField kind="category" value={image} onChange={setImage} />
        </Field>
        <Field label={t.surface}>
          <Select value={surface} onChange={(e) => setSurface(e.target.value === "forest" ? "forest" : "cream")}>
            <option value="cream">{t.cream}</option>
            <option value="forest">{t.forest}</option>
          </Select>
        </Field>
        <Field label={t.scriptAccent} hint={t.optional}>
          <Input value={scriptAccent} onChange={(e) => setScriptAccent(e.target.value)} />
        </Field>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          {t.active}
        </label>
      </div>
      {error ? <p className="mt-4 text-sm text-terracotta">{error}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="ghost" disabled={save.isPending} onClick={() => save.mutate(false)}>
          {t.saveDraft}
        </Button>
        <Button variant="terracotta" disabled={save.isPending} onClick={() => save.mutate(true)}>
          {t.publish}
        </Button>
        {!isNew && existing.data?.published ? (
          <Button variant="ghost" disabled={save.isPending} onClick={() => save.mutate(false)}>
            {t.unpublish}
          </Button>
        ) : null}
        {!isNew ? (
          <Button variant="danger" onClick={() => setConfirm(true)}>
            {t.delete}
          </Button>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirm}
        title={t.deleteCategoryTitle}
        body={t.deleteCategoryBody}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        danger
        busy={remove.isPending}
        onClose={() => setConfirm(false)}
        onConfirm={() => remove.mutate()}
      >
        {others.length ? (
          <label className="mt-4 block text-sm">
            {t.reassign}
            <select
              className="mt-2 min-h-11 w-full border border-forest/15 bg-cream px-3"
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
            >
              <option value="">{t.none}</option>
              {others.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.nameAr} / {row.nameEn}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </ConfirmDialog>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
