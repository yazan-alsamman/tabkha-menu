import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminApi } from "../api";
import { useAdminI18n } from "../i18n";
import { Button } from "../components/Button";

export function OverviewPage() {
  const { t, locale } = useAdminI18n();
  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: adminApi.overview });
  const totals = overview.data?.totals;

  const cards = totals
    ? [
        [t.totalCategories, totals.categories],
        [t.totalDishes, totals.dishes],
        [t.activeDishes, totals.active],
        [t.unavailableDishes, totals.unavailable],
        [t.featuredDishes, totals.featured],
        [t.withoutPhotos, totals.missingPhotos],
        [t.missingEnCount, totals.missingEnglish],
        [t.needsReview, totals.needsReview],
      ]
    : [];

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.28em] uppercase text-terracotta">{t.brand}</p>
      <h1 className="mt-2 font-[family-name:var(--font-latin)] text-3xl font-light tracking-[0.08em] uppercase">{t.overview}</h1>
      <p className="mt-3 max-w-2xl text-sm text-forest/55">{t.reviewBanner}</p>
      <p className="mt-2 text-sm text-sage">{t.liveNote}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="border border-forest/10 bg-cream-soft p-4">
            <p className="text-[0.65rem] tracking-[0.18em] uppercase text-sage">{label}</p>
            <p className="mt-2 font-[family-name:var(--font-latin)] text-3xl font-light">{value}</p>
          </div>
        ))}
      </div>

      {overview.data?.lastUpdated ? (
        <p className="mt-4 text-sm text-forest/45">
          {t.lastUpdated}: {new Date(overview.data.lastUpdated).toLocaleString(locale === "ar" ? "ar-AE" : "en-AE")}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/admin/menu/new">
          <Button variant="terracotta">{t.addDish}</Button>
        </Link>
        <Link to="/admin/categories/new">
          <Button variant="primary">{t.addCategory}</Button>
        </Link>
        <Link to="/admin/menu">
          <Button variant="ghost">{t.manageMenu}</Button>
        </Link>
        <Link to="/admin/preview">
          <Button variant="ghost">{t.previewMenu}</Button>
        </Link>
      </div>
    </div>
  );
}
