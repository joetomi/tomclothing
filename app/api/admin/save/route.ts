import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { commitAtomicGitTree, StagedBlobInfo } from '@/lib/github';
import { siteConfigSchema } from '@/lib/validation';
import { checkImageDeletionSafety } from '@/lib/images';

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'غير مصرح للوصول' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { siteConfig, sha, stagedBlobs, deletedPaths } = body;

    const validatedConfig = siteConfigSchema.parse(siteConfig);

    // Deletion Reference-Safety Check: Verify deleted paths are not in active use
    const unsafeDeletions: string[] = [];
    (deletedPaths || []).forEach((path: string) => {
      const { isUsed, usageDetails } = checkImageDeletionSafety(path, validatedConfig as any);
      if (isUsed) {
        unsafeDeletions.push(`${path} (مستخدمة في: ${usageDetails.join(', ')})`);
      }
    });

    if (unsafeDeletions.length > 0) {
      return NextResponse.json({
        success: false,
        error: `لا يمكن حذف الصور التالية لأنها مستخدمة فعلياً في الموقع:\n${unsafeDeletions.join('\n')}`,
      }, { status: 400 });
    }

    const parsedBlobs: StagedBlobInfo[] = (stagedBlobs || []).map((b: { path: string; blobSha: string }) => ({
      path: b.path,
      blobSha: b.blobSha,
    }));

    const result = await commitAtomicGitTree(
      validatedConfig as any,
      parsedBlobs,
      deletedPaths || [],
      sha
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message, sha: result.sha }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      sha: result.sha,
      isGitHub: result.isGitHub,
    });
  } catch (error: any) {
    console.error("Save API Error:", error);
    return NextResponse.json({ success: false, error: error.message || 'فشل حفظ التعديلات' }, { status: 500 });
  }
}
