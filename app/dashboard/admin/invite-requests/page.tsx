import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InviteRequestsClient from './InviteRequestsClient';

export default async function InviteRequestsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's role and company
  const { data: userData } = await supabase
    .from('users')
    .select('role, is_demo, is_superadmin, company_id')
    .eq('auth_user_id', user.id)
    .single();

  // Only super admins can access this page
  if (!userData || userData.role !== 'admin' || userData.is_demo || !userData.is_superadmin) {
    redirect('/dashboard');
  }

  // Fetch pending upgrade requests from the new table
  const { data: upgradeRequests, error } = await supabase
    .from('upgrade_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching upgrade requests:', error);
  }

  const accessRequests = upgradeRequests || [];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Upgrade Requests
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and approve upgrade requests from demo users who want full access to the platform.
        </p>
      </div>

      <InviteRequestsClient
        initialRequests={accessRequests}
        currentUserId={user.id}
        isSuperAdmin={true}
      />
    </div>
  );
}
