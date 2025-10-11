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

  // Get user's role
  const { data: userData } = await supabase
    .from('users')
    .select('role, is_demo')
    .eq('auth_user_id', user.id)
    .single();

  // Only admins and non-demo users can access this page
  if (!userData || userData.role !== 'admin' || userData.is_demo) {
    redirect('/dashboard');
  }

  // Fetch all access requests from invites table
  // Filter for records with metadata.request_type = 'access_request'
  const { data: requests, error } = await supabase
    .from('invites')
    .select('*')
    .eq('invite_type', 'platform')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invite requests:', error);
  }

  // Filter for access requests (those with metadata.request_type = 'access_request')
  const accessRequests = requests?.filter(
    (req) => req.metadata && (req.metadata as any).request_type === 'access_request'
  ) || [];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Access Requests</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and approve access requests from potential customers
        </p>
      </div>

      <InviteRequestsClient initialRequests={accessRequests} currentUserId={user.id} />
    </div>
  );
}
