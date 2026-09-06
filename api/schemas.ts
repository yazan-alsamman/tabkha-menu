import { z } from "zod";

export const emailSchema = z.string().trim().email().max(160).toLowerCase();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});

export const idParam = z.object({ id: z.string().min(1).max(80) });

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1).max(80)).min(1).max(200),
});

const surfaceSchema = z.enum(["cream", "forest"]);

export const categoryWriteSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  nameAr: z.string().trim().min(1).max(120),
  nameEn: z.string().trim().min(1).max(120),
  descriptionAr: z.string().trim().max(800).nullable().optional(),
  descriptionEn: z.string().trim().max(800).nullable().optional(),
  image: z.string().trim().max(500).nullable().optional(),
  surface: surfaceSchema.optional(),
  scriptAccent: z.string().trim().max(80).nullable().optional(),
  active: z.boolean().optional(),
  published: z.boolean().optional(),
  needsReview: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(9999).optional(),
});

export const categoryDeleteSchema = z.object({
  reassignTo: z.string().min(1).max(80).optional(),
});

export const itemWriteSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  categoryId: z.string().min(1).max(80),
  nameAr: z.string().trim().min(1).max(160),
  nameEn: z.string().trim().max(160).nullable().optional(),
  descriptionAr: z.string().trim().max(1200).nullable().optional(),
  descriptionEn: z.string().trim().max(1200).nullable().optional(),
  price: z.number().min(0).max(99999),
  currency: z.literal("AED").optional(),
  image: z.string().trim().max(500).nullable().optional(),
  portionNote: z.string().trim().max(200).nullable().optional(),
  featured: z.boolean().optional(),
  available: z.boolean().optional(),
  active: z.boolean().optional(),
  published: z.boolean().optional(),
  needsReview: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(9999).optional(),
  dietaryTags: z.string().trim().max(400).nullable().optional(),
  allergens: z.string().trim().max(400).nullable().optional(),
  spicyLevel: z.number().int().min(0).max(3).nullable().optional(),
});

export const availabilitySchema = z.object({
  available: z.boolean(),
});

export const bulkItemsSchema = z.object({
  ids: z.array(z.string().min(1).max(80)).min(1).max(200),
  action: z.enum(["show", "hide", "delete", "category"]),
  categoryId: z.string().min(1).max(80).optional(),
});

export const publishSchema = z.object({
  published: z.boolean(),
});

export const settingsWriteSchema = z.object({
  nameAr: z.string().trim().min(1).max(160).optional(),
  nameEn: z.string().trim().min(1).max(160).optional(),
  taglineAr: z.string().trim().max(240).optional(),
  taglineEn: z.string().trim().max(240).optional(),
  storyAr: z.string().trim().max(4000).optional(),
  storyEn: z.string().trim().max(4000).optional(),
  logo: z.string().trim().max(500).optional(),
  currency: z.literal("AED").optional(),
  currencyLabelAr: z.string().trim().max(40).optional(),
  defaultLocale: z.enum(["ar", "en"]).optional(),
  qrUrl: z.string().trim().max(500).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  instagram: z.string().trim().max(120).nullable().optional(),
  addressAr: z.string().trim().max(240).nullable().optional(),
  addressEn: z.string().trim().max(240).nullable().optional(),
});

export const itemQuerySchema = z.object({
  search: z.string().max(120).optional(),
  categoryId: z.string().max(80).optional(),
  available: z.enum(["true", "false"]).optional(),
  featured: z.enum(["true", "false"]).optional(),
  published: z.enum(["true", "false"]).optional(),
  missingEn: z.enum(["true", "false"]).optional(),
  missingImage: z.enum(["true", "false"]).optional(),
  needsReview: z.enum(["true", "false"]).optional(),
});
