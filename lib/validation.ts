import { z } from "zod";

export const focalPointSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export const focalPointsSchema = z.object({
  desktop: focalPointSchema,
  mobile: focalPointSchema,
});

export const mediaItemSchema = z.object({
  id: z.string(),
  src: z.string(),
  mobileImage: z.string().optional(),
  alt: z.string().default(""),
  caption: z.string().optional(),
  focalPoint: focalPointsSchema,
  width: z.number().optional(),
  height: z.number().optional(),
});

export const navItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  visible: z.boolean(),
});

export const heroSchema = z.object({
  image: z.string(),
  mobileImage: z.string().optional(),
  title: z.string(),
  subtitle: z.string(),
  actionText: z.string(),
  actionHref: z.string(),
  visible: z.boolean(),
  focalPoint: focalPointsSchema,
});

export const editorialSceneSchema = z.object({
  id: z.string(),
  type: z.enum([
    'full-width-natural', 'full-screen-cover', 'portrait-natural', 'split',
    'asymmetric', 'inset-editorial', 'brand-overlay', 'sequence',
    'full-screen', 'full-width', 'split-screen',
  ]),
  visible: z.boolean(),
  order: z.number(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  splitRatio: z.enum(['50/50', '60/40', '40/60', '65/35', '35/65']).optional(),
  images: z.array(mediaItemSchema),
});

export const galleryItemSchema = z.object({
  id: z.string(),
  src: z.string(),
  mobileImage: z.string().optional(),
  alt: z.string().default(""),
  caption: z.string().optional(),
  visible: z.boolean(),
  order: z.number(),
  focalPoint: focalPointsSchema.optional(),
});

export const branchSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string(),
  phone: z.string(),
  whatsappDisplay: z.string(),
  whatsappE164: z.string(),
  mapsUrl: z.string(),
  mapEmbedUrl: z.string(),
  status: z.enum(['open', 'coming-soon', 'hidden']),
});

export const contactSchema = z.object({
  phone: z.string(),
  whatsappDisplay: z.string(),
  whatsappE164: z.string(),
  email: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  telegram: z.string().optional(),
});

export const seoSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.string(),
  ogImage: z.string(),
  canonicalUrl: z.string().optional(),
});

export const siteConfigSchema = z.object({
  brand: z.object({
    name: z.string(),
    arabicName: z.string(),
    tagline: z.string(),
    seoDescription: z.string(),
  }),
  navigation: z.array(navItemSchema),
  hero: heroSchema,
  editorialScenes: z.array(editorialSceneSchema),
  gallery: z.array(galleryItemSchema),
  about: z.object({
    title: z.string(),
    arabicTitle: z.string(),
    subtitle: z.string(),
    text: z.string(),
    image: z.string().optional(),
    focalPoint: focalPointsSchema.optional(),
  }),
  branches: z.array(branchSchema),
  contact: contactSchema,
  seo: seoSchema,
});
