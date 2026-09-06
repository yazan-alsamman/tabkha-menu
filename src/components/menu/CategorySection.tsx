import { Atmosphere } from "@/components/animations/Atmosphere";
import { ArchDivider } from "@/components/branding/ArchDivider";
import { useI18n } from "@/lib/i18n";
import { MenuItemCard } from "./MenuItemCard";
import { CategoryPhoto } from "./CategoryPhoto";
import type { CategoryWithItems, MenuItemSeed } from "@/types/menu";

export function CategorySection({
  category,
  onOpen,
}: {
  category: CategoryWithItems;
  onOpen: (item: MenuItemSeed) => void;
}) {
  const { locale, t } = useI18n();
  const forest = category.surface === "forest";
  const title = locale === "ar" ? category.nameAr : category.nameEn;

  return (
    <section
      id={category.id}
      className={`relative overflow-hidden ${forest ? "bg-forest text-cream" : "bg-cream text-forest"}`}
    >
      <Atmosphere tone={forest ? "forest" : "cream"} />
      <div className="layout-split relative mx-auto grid w-full max-w-[90rem] gap-8 py-[clamp(2.5rem,7vh,6rem)] screen-gutter md:items-start md:gap-10 xl:gap-16 2xl:max-w-[110rem]">
        <div className="[@media(min-width:768px)_and_(min-height:640px)]:sticky [@media(min-width:768px)_and_(min-height:640px)]:top-28">
          <p className="text-[0.7rem] tracking-[0.35em] uppercase text-terracotta">
            {category.scriptAccent ?? t.menu}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-latin)] text-[clamp(2rem,5vw,3.4rem)] font-light tracking-[0.08em] uppercase">
            {category.nameEn}
          </h2>
          <p className="font-copy mt-2 text-[clamp(1.25rem,3vw,1.85rem)]">{category.nameAr}</p>
          <ArchDivider className="mx-0 mt-5 text-terracotta" />
          <div className="-mx-[max(clamp(1rem,4vw,3.5rem),env(safe-area-inset-left),env(safe-area-inset-right))] mt-6 [@media(min-width:768px)_and_(min-height:640px)]:mx-0">
            <CategoryPhoto slug={category.image} alt={title} />
          </div>
        </div>
        <div className="relative lg:grid lg:grid-cols-2 lg:gap-x-8 xl:gap-x-10 2xl:gap-x-14">
          {category.items.length ? (
            category.items.map((item, index) => (
              <MenuItemCard
                key={item.id}
                item={item}
                surface={category.surface}
                index={index}
                onOpen={() => onOpen(item)}
              />
            ))
          ) : (
            <p className="py-10 text-current/60">{t.noItems}</p>
          )}
        </div>
      </div>
    </section>
  );
}
