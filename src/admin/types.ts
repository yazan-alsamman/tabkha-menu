export type AdminUser = {
  id: string;
  email: string;
  name: string;
  restaurantId: string;
  role: string;
};

export type ContentFlags = {
  missingEn: boolean;
  missingDescription: boolean;
  missingImage: boolean;
  needsReview: boolean;
};

export type AdminCategory = {
  id: string;
  restaurantId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  image: string | null;
  displayOrder: number;
  surface: "cream" | "forest" | string;
  scriptAccent: string | null;
  active: boolean;
  published: boolean;
  publishedAt: string | null;
  needsReview: boolean;
  updatedAt: string;
  itemCount?: number;
  flags: ContentFlags;
};

export type AdminItem = {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: number;
  currency: string;
  image: string | null;
  displayOrder: number;
  portionNote: string | null;
  featured: boolean;
  available: boolean;
  active: boolean;
  published: boolean;
  publishedAt: string | null;
  needsReview: boolean;
  dietaryTags: string | null;
  allergens: string | null;
  spicyLevel: number | null;
  updatedAt: string;
  categoryNameAr?: string;
  categoryNameEn?: string;
  flags: ContentFlags;
};

export type Overview = {
  totals: {
    categories: number;
    dishes: number;
    active: number;
    unavailable: number;
    featured: number;
    drafts: number;
    missingPhotos: number;
    missingEnglish: number;
    needsReview: number;
  };
  lastUpdated: string | null;
};

export type AdminSettings = {
  restaurant: {
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
    phone: string | null;
    instagram: string | null;
    addressAr: string | null;
    addressEn: string | null;
    defaultLocale: string;
    qrUrl: string | null;
  };
};

export type MediaRecord = {
  id: string;
  url: string;
  variants: Record<string, string> | null;
};
