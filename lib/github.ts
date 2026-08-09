import { SiteConfig } from '@/types/site';
import { saveSiteContentLocal } from './content';

export interface StagedBlobInfo {
  path: string; // e.g. "public/uploads/17231920-summer-look.webp"
  blobSha: string;
}

export interface CommitResult {
  success: boolean;
  message: string;
  sha?: string;
  isGitHub?: boolean;
}

export async function fetchGitHubFileSHA(path: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) return null;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'TOM-Fashion-CMS',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
  } catch {
    return null;
  }
}

/**
 * Step 1: Create an unreferenced GitHub Git Blob for an uploaded media binary.
 * DOES NOT create a commit, tree update, or branch reference change.
 * DOES NOT trigger a Vercel deployment.
 */
export async function createGitHubBlob(
  relativePath: string,
  buffer: Buffer
): Promise<{ success: boolean; blobSha?: string; path?: string; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return { success: false, error: 'GitHub environment variables not set' };
  }

  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const fullPath = cleanPath.startsWith('public/') ? cleanPath : `public/${cleanPath}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'TOM-Fashion-CMS',
      },
      body: JSON.stringify({
        content: buffer.toString('base64'),
        encoding: 'base64',
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.message || 'Failed to create GitHub Blob' };
    }

    const data = await res.json();
    return {
      success: true,
      blobSha: data.sha,
      path: fullPath,
    };
  } catch (error: any) {
    console.error("Error creating GitHub Blob:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Step 2: Atomic Save Changes
 * Creates ONE Git Blob for site.json, constructs ONE Git Tree referencing site.json blob + staged image blob SHAs + explicit deletions,
 * creates ONE Git Commit, and updates branch reference EXACTLY ONCE to trigger ONE Vercel deployment.
 */
export async function commitAtomicGitTree(
  content: SiteConfig,
  stagedBlobs: StagedBlobInfo[] = [],
  deletedPaths: string[] = [],
  expectedSHA?: string
): Promise<CommitResult> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    return {
      success: false,
      message: 'إعدادات GitHub غير مكتملة. لم يتم حفظ أي تعديل حتى لا يختلف الموقع المحلي عن النسخة المنشورة.',
      isGitHub: false,
    };
  }

  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'TOM-Fashion-CMS',
    };

    // 1. Fetch HEAD commit SHA for target branch
    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      headers,
      cache: 'no-store',
    });
    if (!refRes.ok) {
      throw new Error(`Failed to fetch GitHub branch ref: ${refRes.statusText}`);
    }
    const refData = await refRes.json();
    const headCommitSha = refData.object.sha;

    // 2. Fetch base tree SHA from HEAD commit
    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${headCommitSha}`, {
      headers,
      cache: 'no-store',
    });
    if (!commitRes.ok) {
      throw new Error(`Failed to fetch HEAD commit details: ${commitRes.statusText}`);
    }
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // SHA Conflict Protection Check
    const siteJsonSHA = await fetchGitHubFileSHA('content/site.json');
    if (expectedSHA && siteJsonSHA && expectedSHA !== siteJsonSHA) {
      return {
        success: false,
        message: 'تنبيه SHA: تم تعديل المحتوى من مصادر أخرى. يرجى تحديث الصفحة لمراجعة النسخة الأخيرة.',
        sha: siteJsonSHA,
        isGitHub: true,
      };
    }

    // 3. Create Blob for content/site.json
    const siteJsonStr = JSON.stringify(content, null, 2);
    const jsonBlobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: Buffer.from(siteJsonStr, 'utf-8').toString('base64'),
        encoding: 'base64',
      }),
    });
    if (!jsonBlobRes.ok) throw new Error('Failed to create site.json blob');
    const jsonBlobData = await jsonBlobRes.json();

    // 4. Construct Git Tree array
    const treeItems: Array<{ path: string; mode: string; type: string; sha: string | null }> = [];

    // site.json item
    treeItems.push({
      path: 'content/site.json',
      mode: '100644',
      type: 'blob',
      sha: jsonBlobData.sha,
    });

    // Staged Blob items (already existing on GitHub server via POST /git/blobs)
    for (const blobItem of stagedBlobs) {
      const cleanPath = blobItem.path.startsWith('/') ? blobItem.path.slice(1) : blobItem.path;
      const fullPath = cleanPath.startsWith('public/') ? cleanPath : `public/${cleanPath}`;

      treeItems.push({
        path: fullPath,
        mode: '100644',
        type: 'blob',
        sha: blobItem.blobSha,
      });
    }

    // Deleted items (sha: null instructs Git tree to remove file)
    for (const delPath of deletedPaths) {
      const cleanPath = delPath.startsWith('/') ? delPath.slice(1) : delPath;
      const fullPath = cleanPath.startsWith('public/') ? cleanPath : `public/${cleanPath}`;

      treeItems.push({
        path: fullPath,
        mode: '100644',
        type: 'blob',
        sha: null,
      });
    }

    // 5. POST /git/trees to create ONE Git Tree
    const newTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    });
    if (!newTreeRes.ok) {
      const err = await newTreeRes.json();
      throw new Error(`Failed to create Git Tree: ${err.message || newTreeRes.statusText}`);
    }
    const newTreeData = await newTreeRes.json();

    // 6. POST /git/commits to create ONE Git Commit
    const commitMsg = stagedBlobs.length > 0
      ? `تم تعديل الموقع عبر لوحة TOM وإضافة ${stagedBlobs.length} صورة`
      : 'تم تعديل الموقع عبر لوحة TOM';

    const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: commitMsg,
        tree: newTreeData.sha,
        parents: [headCommitSha],
      }),
    });
    if (!newCommitRes.ok) throw new Error('Failed to create Git Commit');
    const newCommitData = await newCommitRes.json();

    // 7. PATCH /git/refs/heads/{branch} to update branch reference EXACTLY ONCE
    const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitData.sha,
        force: false,
      }),
    });
    if (!updateRefRes.ok) throw new Error('Failed to update branch ref');

    // Also update local file
    try {
      await saveSiteContentLocal(content);
    } catch {}

    return {
      success: true,
      message: `تم إنشاء Commit موحد بنجاح على GitHub! SHA: ${newCommitData.sha.substring(0, 7)}`,
      sha: newCommitData.sha,
      isGitHub: true,
    };
  } catch (error: any) {
    console.error("Atomic Git Tree Commit Error:", error);
    return {
      success: false,
      message: `فشل الحفظ على GitHub ولم تُعتمد التعديلات: ${error.message}`,
      isGitHub: true,
    };
  }
}
