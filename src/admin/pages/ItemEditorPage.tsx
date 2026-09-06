import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, ApiError } from "../api";
import { useAdminI18n } from "../i18n";
import { Button } from "../components/Button";
import { Field, Input, Select, Textarea } from "../components/Field";
import { ImageField } from "../components/ImageField";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Toast } from "../components/Toast";
import { StatusPill } from "../components/StatusPill";

export function ItemEditorPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const isNew = !id || id === "new";
  const { t } = useAdminI18n();
  const navigate = useNavigate();
  const client = useQueryClient();
  const existing = useQuery({
    queryKey: ["admin-item", id],
    queryFn: () => adminApi.item(id!),
    enabled: !isNew,
  });
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: adminApi.categories });

  const [categoryId, setCategoryId] = useState(params.get("category") ?? "");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [price, setPrice] = useState("0");
  const [image, setImage] = useState<string | null>(null);
  const [portionNote, setPortionNote] = useState("");
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [active, setActive] = useState(true);
  const [needsReview, setNeedsReview] = useState(false);
  const [dietaryTags, setDietaryTags] = useState("");
  const [allergens, setAllergens] = useState("");
  const [spicyLevel, setSpicyLevel] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const row = existing.data;
    if (!row) return;
    setCategoryId(row.categoryId);
    setNameAr(row.nameAr);
    setNameEn(row.nameEn ?? "");
    setDescriptionAr(row.descriptionAr ?? "");
    setDescriptionEn(row.descriptionEn ?? "");
    setPrice(String(row.price));
    setImage(row.image);
    setPortionNote(row.portionNote ?? "");
    setFeatured(row.featured);
    setAvailable(row.available);
    setActive(row.active);
    setNeedsReview(row.needsReview);
    setDietaryTags(row.dietaryTags ?? "");
    setAllergens(row.allergens ?? "");
    setSpicyLevel(row.spicyLevel == null ? "" : String(row.spicyLevel));
  }, [existing.data]);

  useEffect(() => {
    if (!categoryId && categories.data?.[0]) setCategoryId(categories.data[0].id);
  }, [categories.data, categoryId]);

  function body(published: boolean) {
    return {
      categoryId,
      nameAr,
      nameEn: nameEn || null,
      descriptionAr: descriptionAr || null,
      descriptionEn: descriptionEn || null,
      price: Number(price),
      image,
      portionNote: portionNote || null,
      featured,
      available,
      active,
      published,
      needsReview,
      dietaryTags: dietaryTags || null,
      allergens: allergens || null,
      spicyLevel: spicyLevel === "" ? null : Number(spicyLevel),
    };
  }

  const save = useMutation({
    mutationFn: (published: boolean) =>
      isNew ? adminApi.createItem(body(published)) : adminApi.updateItem(id!, body(published)),
    onSuccess: (row, published) => {
      setToast(published ? t.published : t.saved);
      void client.invalidateQueries({ queryKey: ["admin-items"] });
      void client.invalidateQueries({ queryKey: ["admin-overview"] });
      if (isNew) navigate(`/admin/menu/${row.id}/edit`, { replace: true });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : t.networkError),
  });

  const remove = useMutation({
    mutationFn: () => adminApi.deleteItem(id!),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin-items"] });
      navigate("/admin/menu");
    },
  });

  const duplicate = useMutation({
    mutationFn: () => adminApi.duplicateItem(id!),
    onSuccess: (row) => navigate(`/admin/menu/${row.id}/edit`),
  });

  const flags = existing.data?.flags;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/menu" className="text-sm text-forest/50">
        ← {t.back}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-[family-name:var(--font-latin)] text-3xl font-light tracking-[0.08em] uppercase">
          {isNew ? t.newDish : t.editDish}
        </h1>
        {existing.data ? (
          <StatusPill tone={existing.data.published ? "live" : "draft"}>
            {existing.data.published ? t.published : t.draft}
          </StatusPill>
        ) : null}
      </div>
      {flags?.needsReview ? (
        <p className="mt-4 border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          {flags.missingEn ? `⚠ ${t.missingEnglish}` : `⚠ ${t.needsReview}`}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6">
        <Field label={t.category}>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {(categories.data ?? []).map((row) => (
              <option key={row.id} value={row.id}>
                {row.nameAr} / {row.nameEn}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.nameAr}>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} required dir="rtl" />
        </Field>
        <Field label={t.nameEn} hint={t.englishNullable}>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} dir="ltr" />
        </Field>
        <Field label={t.descriptionAr} hint={t.optional}>
          <Textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} dir="rtl" />
        </Field>
        <Field label={t.descriptionEn} hint={t.optional}>
          <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} dir="ltr" />
        </Field>
        <Field label={`${t.price} (AED)`}>
          <Input type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label={t.image} hint={t.optional}>
          <ImageField kind="dish" value={image} onChange={setImage} />
        </Field>
        <Field label={t.portionNote} hint={t.optional}>
          <Input value={portionNote} onChange={(e) => setPortionNote(e.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
            {t.available}
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            {t.featured}
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            {t.active}
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={needsReview} onChange={(e) => setNeedsReview(e.target.checked)} />
            {t.needsReview}
          </label>
        </div>
        <Field label={t.dietaryTags} hint={t.optional}>
          <Input value={dietaryTags} onChange={(e) => setDietaryTags(e.target.value)} />
        </Field>
        <Field label={t.allergens} hint={t.optional}>
          <Input value={allergens} onChange={(e) => setAllergens(e.target.value)} />
        </Field>
        <Field label={t.spicyLevel} hint={t.optional}>
          <Select value={spicyLevel} onChange={(e) => setSpicyLevel(e.target.value)}>
            <option value="">{t.none}</option>
            <option value="0">{t.spicy0}</option>
            <option value="1">{t.spicy1}</option>
            <option value="2">{t.spicy2}</option>
            <option value="3">{t.spicy3}</option>
          </Select>
        </Field>
      </div>
      {error ? <p className="mt-4 text-sm text-terracotta">{error}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="ghost" disabled={save.isPending} onClick={() => save.mutate(false)}>
          {t.saveDraft}
        </Button>
        <Button variant="terracotta" disabled={save.isPending} onClick={() => save.mutate(true)}>
          {t.publish}
        </Button>
        {!isNew ? (
          <Button variant="ghost" onClick={() => duplicate.mutate()}>
            {t.duplicate}
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
        title={t.deleteDishTitle}
        body={t.deleteDishBody}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        danger
        busy={remove.isPending}
        onClose={() => setConfirm(false)}
        onConfirm={() => remove.mutate()}
      />
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
