import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { adminApi } from "../api";
import { useAdminI18n } from "../i18n";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { StatusPill } from "../components/StatusPill";
import type { AdminCategory } from "../types";

function SortableRow({ category, locale }: { category: AdminCategory; locale: "ar" | "en" }) {
  const { t } = useAdminI18n();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-forest/10 py-3"
    >
      <button type="button" className="min-h-11 px-2 text-sage" aria-label={t.orderHint} {...attributes} {...listeners}>
        ::
      </button>
      <Link to={`/admin/categories/${category.id}`} className="min-w-0">
        <p className="font-copy truncate">{locale === "ar" ? category.nameAr : category.nameEn}</p>
        <p className="truncate text-sm text-forest/45">{locale === "ar" ? category.nameEn : category.nameAr}</p>
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <StatusPill tone={category.published ? "live" : "draft"}>{category.published ? t.published : t.draft}</StatusPill>
        <span className="text-xs text-sage">{category.itemCount ?? 0}</span>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const { t, locale } = useAdminI18n();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin-categories"], queryFn: adminApi.categories });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const reorder = useMutation({
    mutationFn: (ids: string[]) => adminApi.reorderCategories(ids),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  const categories = query.data ?? [];

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = categories.map((row) => row.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    void reorder.mutate(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-latin)] text-3xl font-light tracking-[0.08em] uppercase">{t.categories}</h1>
          <p className="mt-2 max-w-xl text-sm text-forest/50">{t.orderHint}</p>
        </div>
        <Link to="/admin/categories/new">
          <Button variant="terracotta">{t.addCategory}</Button>
        </Link>
      </div>
      <div className="mt-8">
        {!categories.length ? (
          <EmptyState title={t.emptyCategories} action={t.addFirstCategory} to="/admin/categories/new" />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={categories.map((row) => row.id)} strategy={verticalListSortingStrategy}>
              {categories.map((category) => (
                <SortableRow key={category.id} category={category} locale={locale} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
