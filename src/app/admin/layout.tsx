import { forbidden, redirect } from 'next/navigation';
import { isAdminEmail } from '@/lib/security/admin';
import { createClient } from '@/utils/supabase/server';

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');
  if (!isAdminEmail(user.email)) forbidden();
  return children;
}
