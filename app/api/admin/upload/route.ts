import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sanitizeFilename } from '@/lib/images';
import { createGitHubBlob } from '@/lib/github';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'غير مصرح للوصول' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'لم يتم اختيار ملف' }, { status: 400 });
    }

    // 1. Validation (MIME type, file size limit 25MB)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'صيغة الملف غير مدعومة (يسمح فقط بـ JPG, PNG, WebP)' }, { status: 400 });
    }

    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'حجم الصورة كبير جداً (الحد الأقصى 25MB)' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    let filename = sanitizeFilename(file.name);

    let width = 1200;
    let height = 1600;
    let warning: string | undefined;

    // 2. Sharp Image Optimization to WebP
    try {
      const sharp = require('sharp');
      const imagePipeline = sharp(buffer);
      const metadata = await imagePipeline.metadata();

      if (metadata.width && metadata.height) {
        width = metadata.width;
        height = metadata.height;

        if (width < 800 || height < 800) {
          warning = "دقة الصورة منخفضة نسبياً (أقل من 800px)، قد تظهر بكسلة بسيطة على الشاشات الكبيرة.";
        }
      }

      buffer = await sharp(buffer)
        .resize({ width: Math.min(width, 2400), withoutEnlargement: true })
        .webp({ quality: 93, smartSubsample: true })
        .toBuffer();
      filename = filename.replace(/\.[^.]+$/, '.webp');

    } catch (sharpErr) {
      console.warn("Sharp optimization fallback:", sharpErr);
    }

    const fileSize = buffer.length;
    const relativeUrl = `/uploads/${filename}`;
    const repoPath = `public/uploads/${filename}`;
    const isGitHubConfigured = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO);

    let blobSha: string | undefined;

    if (isGitHubConfigured) {
      // Step 3: Create GitHub Git Blob (POST /git/blobs)
      // DOES NOT create a commit, tree update, or trigger Vercel deployment
      const blobRes = await createGitHubBlob(repoPath, buffer);
      if (!blobRes.success || !blobRes.blobSha) {
        return NextResponse.json({
          success: false,
          error: `فشل إنشاء GitHub Blob للصورة: ${blobRes.error}`,
        }, { status: 500 });
      }
      blobSha = blobRes.blobSha;
    }

    // Always attempt local disk save for dev preview fallback
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    } catch {}

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      path: repoPath,
      blobSha,
      width,
      height,
      fileSize,
      warning,
      isGitHub: isGitHubConfigured,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
