import fs from 'fs';
import path from 'path';
import { SiteConfig } from '@/types/site';

export interface ImageUploadResult {
  success: boolean;
  filePath?: string;
  url?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  orientation?: 'portrait' | 'landscape' | 'square';
  warning?: string;
  error?: string;
}

export function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase() || '.webp';
  const basename = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const timestamp = Date.now();
  const safeBase = basename || 'look';
  return `${timestamp}-${safeBase}${ext}`;
}

export async function processAndSaveUploadedImage(
  buffer: Buffer,
  originalFilename: string
): Promise<ImageUploadResult> {
  try {
    const filename = sanitizeFilename(originalFilename);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const targetPath = path.join(uploadsDir, filename);

    // Save buffer
    fs.writeFileSync(targetPath, buffer);

    let width = 1200;
    let height = 1600;
    let warning: string | undefined;

    // Try reading dimensions using sharp if available
    try {
      const sharp = require('sharp');
      const metadata = await sharp(buffer).metadata();
      if (metadata.width && metadata.height) {
        width = metadata.width;
        height = metadata.height;

        // Resolution warning
        if (width < 800 || height < 800) {
          warning = "دقة الصورة منخفضة نسبياً (أقل من 800px)، قد تظهر بكسلة بسيطة على الشاشات الكبيرة.";
        }
      }
    } catch {
      // Sharp optional fallback
    }

    const aspectRatio = width / height;
    let orientation: 'portrait' | 'landscape' | 'square' = 'square';
    if (aspectRatio < 0.9) orientation = 'portrait';
    else if (aspectRatio > 1.1) orientation = 'landscape';

    const url = `/uploads/${filename}`;

    return {
      success: true,
      filePath: targetPath,
      url,
      width,
      height,
      aspectRatio,
      orientation,
      warning,
    };
  } catch (error: any) {
    console.error("Error processing uploaded image:", error);
    return {
      success: false,
      error: `فشل معالجة ونقل الصورة: ${error.message}`,
    };
  }
}

export function checkImageDeletionSafety(imageUrl: string, siteConfig: SiteConfig): { isUsed: boolean; usageDetails: string[] } {
  const usageDetails: string[] = [];

  if (siteConfig.hero.image === imageUrl || siteConfig.hero.mobileImage === imageUrl) {
    usageDetails.push('قسم الواجهة الرئيسية (Hero)');
  }

  siteConfig.editorialScenes.forEach((scene, sIdx) => {
    scene.images.forEach((img, iIdx) => {
      if (img.src === imageUrl || img.mobileImage === imageUrl) {
        usageDetails.push(`المشهد التحريري ${sIdx + 1} (${scene.title || scene.type})`);
      }
    });
  });

  siteConfig.gallery.forEach((item, idx) => {
    if (item.src === imageUrl || item.mobileImage === imageUrl) {
      usageDetails.push(`المعرض الجانبي - صورة رقم ${idx + 1}`);
    }
  });

  if (siteConfig.about.image === imageUrl) {
    usageDetails.push('قسم عن TOM');
  }

  return {
    isUsed: usageDetails.length > 0,
    usageDetails,
  };
}
