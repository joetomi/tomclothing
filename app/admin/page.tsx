import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getSiteContent } from '@/lib/content';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { fetchGitHubFileSHA } from '@/lib/github';

export default async function AdminPage() {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect('/admin/login');
  }

  const initialContent = await getSiteContent();
  const initialSha = await fetchGitHubFileSHA('content/site.json');

  return <AdminDashboardClient initialContent={initialContent} initialSha={initialSha || undefined} />;
}
