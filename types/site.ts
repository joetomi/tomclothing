export interface FocalPoint {
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
}

export interface FocalPoints {
  desktop: FocalPoint;
  mobile: FocalPoint;
}

export interface MediaItem {
  id: string;
  src: string;
  mobileImage?: string;
  alt: string;
  caption?: string;
  focalPoint: FocalPoints;
  width?: number;
  height?: number;
}

export interface BrandInfo {
  name: string;
  arabicName: string;
  tagline: string;
  seoDescription: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
}

export interface HeroConfig {
  image: string;
  mobileImage?: string;
  title: string;
  subtitle: string;
  actionText: string;
  actionHref: string;
  visible: boolean;
  focalPoint: FocalPoints;
}

export type SceneType =
  | 'full-width-natural'
  | 'full-screen-cover'
  | 'portrait-natural'
  | 'split'
  | 'asymmetric'
  | 'inset-editorial'
  | 'brand-overlay'
  | 'sequence'
  | 'full-screen'
  | 'full-width'
  | 'split-screen';

export interface EditorialScene {
  id: string;
  type: SceneType;
  visible: boolean;
  order: number;
  title?: string;
  subtitle?: string;
  splitRatio?: '50/50' | '60/40' | '40/60' | '65/35' | '35/65';
  images: MediaItem[];
}

export interface GalleryItem {
  id: string;
  src: string;
  mobileImage?: string;
  alt: string;
  caption?: string;
  visible: boolean;
  order: number;
  focalPoint?: FocalPoints;
}

export interface AboutSection {
  title: string;
  arabicTitle: string;
  subtitle: string;
  text: string;
  image?: string;
  focalPoint?: FocalPoints;
}

export type BranchStatus = 'open' | 'coming-soon' | 'hidden';

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsappDisplay: string;
  whatsappE164: string;
  mapsUrl: string;
  mapEmbedUrl: string;
  status: BranchStatus;
}

export interface ContactInfo {
  phone: string;
  whatsappDisplay: string;
  whatsappE164: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  telegram?: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonicalUrl?: string;
}

export interface SiteConfig {
  brand: BrandInfo;
  navigation: NavItem[];
  hero: HeroConfig;
  editorialScenes: EditorialScene[];
  gallery: GalleryItem[];
  about: AboutSection;
  branches: Branch[];
  contact: ContactInfo;
  seo: SEOConfig;
}
