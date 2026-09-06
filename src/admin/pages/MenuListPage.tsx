import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { adminApi } from "../api";
import { useAdminI18n } from "../i18n";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { StatusPill } from "../components/StatusPill";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Input, Select } from "../components/Field";
import type { AdminItem } from "../types";

function Row({
  item,
  locale,
  selected,
  onToggle,
  canDrag,
}: {
  item: AdminItem;
  locale: "ar" | "en";
  selected: boolean;
  onToggle: () => void;
  canDrag: boolean;
}) {
  const { t } = useAdminI18n();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
    disabled: !canDrag,
  });
  const navigate = useNavigate();
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-forest/10 py-3 md:grid-cols-[auto_auto_4.5rem_minmax(0,1.4fr)_minmax(0,1fr)_auto_auto_auto]"
    >
      <input type="checkbox" checked={selected} onChange={onToggle} className="size-4 accent-forest" />
      <button
        type="button"
        className={`min-h-11 px-1 text-sage ${canDrag ? "" : "invisible"}`}
        {...attributes}
        {...listeners}
      >
        ::
      </button>
      {item.image ? (
        <img src={item.image} alt="" className="hidden size-14 object-cover md:block" />
      ) : (
        <span className="hidden size-14 bg-forest/5 md:block" />
      )}
      <button type="button" className="min-w-0 text-start" onClick={() => navigate(`/admin/menu/${item.id}/edit`)}>
        <p className="font-copy truncate">{item.nameAr}</p>
        <p className="truncate text-sm text-forest/45">{item.nameEn ?? t.missingEnglish}</p>
        <p className="mt-1 text-xs text-sage md:hidden">{item.categoryNameAr}</p>
      </button>
      <p className="hidden truncate text-sm text-forest/55 md:block">
        {locale === "ar" ? item.categoryNameAr : item.categoryNameEn}
      </p>
      <p className="font-[family-name:var(--font-latin)] text-terracotta">{item.price}</p>
      <div className="hidden flex-col items-end gap-1 md:flex">
        <StatusPill tone={item.published ? "live" : "draft"}>{item.published ? t.published : t.draft}</StatusPill>
        <StatusPill tone={item.available ? "live" : "warn"}>{item.available ? t.available : t.unavailable}</StatusPill>
      </div>
      <div className="hidden text-end md:block">
        {item.flags.needsReview ? <StatusPill tone="warn">{t.needsReview}</StatusPill> : null}
      </div>
    </div>
  );
}

export function MenuListPage() {
  const { t, locale } = useAdminI18n();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [available, setAvailable] = useState("");
  const [featured, setFeatured] = useState("");
  const [published, setPublished] = useState("");
  const [missingEn, setMissingEn] = useState(false);
  const [missingImage, setMissingImage] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [moveTo, setMoveTo] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId) params.set("categoryId", categoryId);
    if (available) params.set("available", available);
    if (featured) params.set("featured", featured);
    if (published) params.set("published", published);
    if (missingEn) params.set("missingEn", "true");
    if (missingImage) params.set("missingImage", "true");
    const raw = params.toString();
    return raw ? `?${raw}` : "";
  }, [search, categoryId, available, featured, published, missingEn, missingImage]);

  const items = useQuery({ queryKey: ["admin-items", queryString], queryFn: () => adminApi.items(queryString) });
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: adminApi.categories });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const rows = items.data ?? [];

  const reorder = useMutation({
    mutationFn: (ids: string[]) => adminApi.reorderItems(ids),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-items"] }),
  });
  const bulk = useMutation({
    mutationFn: (payload: { action: "show" | "hide" | "delete" | "category"; categoryId?: string }) =>
      adminApi.bulkItems({ ids: selected, ...payload }),
    onSuccess: () => {
      setSelected([]);
      setConfirm(false);
      void client.invalidateQueries({ queryKey: ["admin-items"] });
      void client.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });
  const toggleAvail = useMutation({
    mutationFn: ({ id, available: next }: { id: string; available: boolean }) => adminApi.setAvailability(id, next),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-items"] }),
  });
  const duplicate = useMutation({
    mutationFn: (id: string) => adminApi.duplicateItem(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-items"] }),
  });

  function onDragEnd(event: DragEndEvent) {
    if (!categoryId) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = rows.map((row) => row.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    void reorder.mutate(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-[family-name:var(--font-latin)] text-3xl font-light tracking-[0.08em] uppercase">{t.menu}</h1>
        <Link to="/admin/menu/new">
          <Button variant="terracotta">{t.addDish}</Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} />
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">{t.allCategories}</option>
          {(categories.data ?? []).map((row) => (
            <option key={row.id} value={row.id}>
              {locale === "ar" ? row.nameAr : row.nameEn}
            </option>
          ))}
        </Select>
        <Select value={available} onChange={(e) => setAvailable(e.target.value)}>
          <option value="">{t.allStatus}</option>
          <option value="true">{t.available}</option>
          <option value="false">{t.unavailable}</option>
        </Select>
        <Select value={published} onChange={(e) => setPublished(e.target.value)}>
          <option value="">{t.status}</option>
          <option value="true">{t.published}</option>
          <option value="false">{t.draft}</option>
        </Select>
        <Select value={featured} onChange={(e) => setFeatured(e.target.value)}>
          <option value="">{t.featured}</option>
          <option value="true">{t.featured}</option>
          <option value="false">{t.none}</option>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={missingEn} onChange={(e) => setMissingEn(e.target.checked)} />
          {t.missingEnglish}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={missingImage} onChange={(e) => setMissingImage(e.target.checked)} />
          {t.missingImage}
        </label>
      </div>

      {selected.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border border-forest/10 bg-cream-soft p-3">
          <span className="text-sm">
            {selected.length} {t.selected}
          </span>
          <Button variant="ghost" onClick={() => bulk.mutate({ action: "show" })}>
            {t.bulkShow}
          </Button>
          <Button variant="ghost" onClick={() => bulk.mutate({ action: "hide" })}>
            {t.bulkHide}
          </Button>
          <Select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} className="max-w-48">
            <option value="">{t.bulkMove}</option>
            {(categories.data ?? []).map((row) => (
              <option key={row.id} value={row.id}>
                {row.nameAr}
              </option>
            ))}
          </Select>
          <Button
            variant="ghost"
            disabled={!moveTo}
            onClick={() => bulk.mutate({ action: "category", categoryId: moveTo })}
          >
            {t.confirm}
          </Button>
          <Button variant="danger" onClick={() => setConfirm(true)}>
            {t.bulkDelete}
          </Button>
        </div>
      ) : null}

      <div className="mt-6">
        {!rows.length ? (
          <EmptyState
            title={search || categoryId ? t.emptySearch : t.emptyDishes}
            action={t.addFirstDish}
            to="/admin/menu/new"
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
              {rows.map((item) => (
                <div key={item.id}>
                  <Row
                    item={item}
                    locale={locale}
                    canDrag={Boolean(categoryId)}
                    selected={selected.includes(item.id)}
                    onToggle={() =>
                      setSelected((current) =>
                        current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id],
                      )
                    }
                  />
                  <div className="mb-2 flex flex-wrap gap-2 pb-3 md:hidden">
                    <Button variant="ghost" className="min-h-9 px-3 text-[0.65rem]" onClick={() => toggleAvail.mutate({ id: item.id, available: !item.available })}>
                      {t.hideShow}
                    </Button>
                    <Button variant="ghost" className="min-h-9 px-3 text-[0.65rem]" onClick={() => duplicate.mutate(item.id)}>
                      {t.duplicate}
                    </Button>
                    <Link to={`/admin/menu/${item.id}/edit`}>
                      <Button variant="ghost" className="min-h-9 px-3 text-[0.65rem]">
                        {t.edit}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <ConfirmDialog
        open={confirm}
        title={t.deleteDishTitle}
        body={t.confirmBulkDelete}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        danger
        busy={bulk.isPending}
        onClose={() => setConfirm(false)}
        onConfirm={() => bulk.mutate({ action: "delete" })}
      />
    </div>
  );
}
