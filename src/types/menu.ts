export type Locale = "ar" | "en";
export type Surface = "forest" | "cream";

export type Restaurant = {
  id: string;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  storyAr: string;
  storyEn: string;
  logo: string;
  currency: "AED";
  currencyLabelAr: string;
};

export type CategorySeed = {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  image: string;
  displayOrder: number;
  surface: Surface;
  scriptAccent: string | null;
};

export type MenuItemSeed = {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: number;
  currency: "AED";
  image: string | null;
  displayOrder: number;
  portionNote: string | null;
  featured: boolean;
  available: boolean;
  active: boolean;
};

export type CategoryWithItems = CategorySeed & { items: MenuItemSeed[] };

export type MenuPayload = {
  restaurant: Restaurant;
  categories: CategoryWithItems[];
};
