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
  // Use maybeSingle() to handle new users who don't have a record yet
  const { data: userData } = await supabase
    .from('users')
    .select('*, company:companies(name)')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  // Check if user is admin (no assigned warehouse)
  const isAdmin = !userData?.warehouse_id;

  return (
    <div className="min-h-screen bg-brand-cream">
      <DashboardNav
        user={userData}
        isAdmin={isAdmin}
      />
      {/* Mobile: no left padding. Desktop: left padding for sidebar */}
      <main className="lg:pl-64 min-h-screen">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
