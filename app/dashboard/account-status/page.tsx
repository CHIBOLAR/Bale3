import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AccountStatusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get full user details
  const { data: userData } = await supabase
    .from('users')
    .select('*, company:companies(*)')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  const isDemo = userData?.is_demo === true || !userData;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Account Status</h1>

      <div className="space-y-6">
        {/* Account Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Type</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isDemo
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {isDemo ? 'Demo Account' : 'Full Access'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span className="text-gray-700">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Auth User ID:</span>
              <span className="text-gray-700 text-sm font-mono">{user.id}</span>
            </div>
          </div>
        </div>

        {/* User Record */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Record</h2>
          {userData ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">User ID:</span>
                <span className="text-gray-700 font-mono">{userData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span className="text-gray-700">
                  {userData.first_name} {userData.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span className="text-gray-700">{userData.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">is_demo flag:</span>
                <span
                  className={`font-semibold ${
                    userData.is_demo ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {userData.is_demo ? 'TRUE (Demo)' : 'FALSE (Full Access)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Company ID:</span>
                <span className="text-gray-700 font-mono">{userData.company_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Company Name:</span>
                <span className="text-gray-700">{userData.company?.name}</span>
              </div>
            </div>
          ) : (
            <p className="text-red-600">No user record found in database</p>
          )}
        </div>

        {/* Capabilities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Capabilities</h2>
          <div className="space-y-3">
            <CapabilityItem
              name="Create Products"
              allowed={!isDemo}
              description="Add unlimited products to your inventory"
            />
            <CapabilityItem
              name="Create Partners"
              allowed={!isDemo}
              description="Add customers and suppliers"
            />
            <CapabilityItem
              name="Create Sales Orders"
              allowed={!isDemo}
              description="Create and manage sales orders"
            />
            <CapabilityItem
              name="Delete Records"
              allowed={!isDemo}
              description="Delete products, partners, and orders"
            />
            <CapabilityItem
              name="Invite Staff Members"
              allowed={!isDemo}
              description="Add team members to your company"
            />
            <CapabilityItem
              name="Manage Warehouses"
              allowed={!isDemo}
              description="Create and configure warehouses"
            />
            <CapabilityItem
              name="Full Data Control"
              allowed={!isDemo}
              description="Complete control over your company data"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
          {isDemo && (
            <Link
              href="/dashboard/request-upgrade"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Request Full Access
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function CapabilityItem({
  name,
  allowed,
  description,
}: {
  name: string;
  allowed: boolean;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="mt-0.5">
        {allowed ? (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{name}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <div>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${
            allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {allowed ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  );
}
