import type { CategoryWithItems, MenuItemSeed, MenuPayload, Restaurant, Surface } from "../../src/types/menu.ts";

export type PublicItem = MenuItemSeed;
export type PublicCategory = CategoryWithItems;

export function isLiveCategory(row: { active: boolean; published: boolean }) {
  return row.active && row.published;
}

export function isLiveItem(row: { active: boolean; published: boolean; available: boolean }) {
  return row.active && row.published && row.available;
}

export function toPublicRestaurant(row: {
  id: string;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  storyAr: string;
  storyEn: string;
  logo: string;
  currency: string;
  currencyLabelAr: string;
}): Restaurant {
  return {
    id: row.id,
    nameAr: row.nameAr,
    nameEn: row.nameEn,
    taglineAr: row.taglineAr,
    taglineEn: row.taglineEn,
    storyAr: row.storyAr,
    storyEn: row.storyEn,
    logo: row.logo,
    currency: (row.currency === "AED" ? "AED" : "AED") as "AED",
    currencyLabelAr: row.currencyLabelAr,
  };
}

export function toPublicItem(item: {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: string | number;
  currency: string;
  image: string | null;
  displayOrder: number;
  portionNote: string | null;
  featured: boolean;
  available: boolean;
  active: boolean;
}): PublicItem {
  return {
    id: item.id,
    categoryId: item.categoryId,
    nameAr: item.nameAr,
    nameEn: item.nameEn,
    descriptionAr: item.descriptionAr,
    descriptionEn: item.descriptionEn,
    price: Number(item.price),
    currency: "AED",
    image: item.image,
    displayOrder: item.displayOrder,
    portionNote: item.portionNote,
    featured: item.featured,
    available: item.available,
    active: item.active,
  };
}

export function assembleMenu(params: {
  restaurant: Restaurant;
  categories: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    image: string | null;
    displayOrder: number;
    surface: string;
    scriptAccent: string | null;
    active: boolean;
    published: boolean;
  }>;
  items: Array<{
    id: string;
    categoryId: string;
    nameAr: string;
    nameEn: string | null;
    descriptionAr: string | null;
    descriptionEn: string | null;
    price: string | number;
    currency: string;
    image: string | null;
    displayOrder: number;
    portionNote: string | null;
    featured: boolean;
    available: boolean;
    active: boolean;
    published: boolean;
  }>;
  mode: "live" | "preview";
}): MenuPayload {
  const live = params.mode === "live";
  const categories = params.categories
    .filter((category) => (live ? isLiveCategory(category) : category.active))
    .map((category) => {
      const items = params.items
        .filter((item) => item.categoryId === category.id)
        .filter((item) => (live ? isLiveItem(item) : item.active))
        .map(toPublicItem);
      return {
        id: category.id,
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        descriptionAr: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        image: category.image ?? category.id,
        displayOrder: category.displayOrder,
        surface: (category.surface === "forest" ? "forest" : "cream") as Surface,
        scriptAccent: category.scriptAccent,
        items,
      };
    })
    .filter((category) => (live ? category.items.length > 0 : true));

  return { restaurant: params.restaurant, categories };
}
