export type ContentFlags = {
  missingEn: boolean;
  missingDescription: boolean;
  missingImage: boolean;
  needsReview: boolean;
};

export function itemFlags(row: {
  nameEn: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  image: string | null;
  needsReview: boolean;
}): ContentFlags {
  const missingEn = !row.nameEn?.trim();
  const missingDescription = !row.descriptionAr?.trim() && !row.descriptionEn?.trim();
  const missingImage = !row.image?.trim();
  return {
    missingEn,
    missingDescription,
    missingImage,
    needsReview: row.needsReview || missingEn,
  };
}

export function categoryFlags(row: {
  descriptionAr: string | null;
  descriptionEn: string | null;
  image: string | null;
  needsReview: boolean;
}): ContentFlags {
  const missingDescription = !row.descriptionAr?.trim() && !row.descriptionEn?.trim();
  const missingImage = !row.image?.trim();
  return {
    missingEn: false,
    missingDescription,
    missingImage,
    needsReview: row.needsReview,
  };
}
