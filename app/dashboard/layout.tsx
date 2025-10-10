import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/layouts/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user details from database
  const { data: userData } = await supabase
    .from('users')
    .select('*, company:companies(name)')
    .eq('auth_user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNav user={userData} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
