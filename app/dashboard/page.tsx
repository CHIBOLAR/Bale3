import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Suspense } from 'react';
import QuickActions from './QuickActions';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';

// Skeleton components for loading states
function DashboardStatsSkeleton() {
  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 animate-pulse rounded-md bg-gray-200" />
                </div>
                <div className="ml-5 w-0 flex-1 space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-12 w-12 animate-pulse rounded-md bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RecentActivitySkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                    </div>
                    <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user just upgraded
  const params = await searchParams;
  const justUpgraded = params.upgraded === 'true';

  // Check if user has a full account
  const { data: userData } = await supabase
    .from('users')
    .select('*, company:companies(*)')
    .eq('auth_user_id', user?.id)
    .maybeSingle();

  // Check if user is demo (either has is_demo flag or no user record)
  const isDemo = userData?.is_demo === true || !userData;

  let companyId = userData?.company_id;
  let companyName = userData?.company?.name;
  let firstName = userData?.first_name;

  // For demo users without proper user record, fallback to demo company
  if (isDemo && !userData) {
    const { data: demoCompany } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_demo', true)
      .single();

    companyId = demoCompany?.id;
    companyName = demoCompany?.name;
    firstName = user?.email?.split('@')[0] || 'Demo User';
  }


  return (
    <div>
      {/* Upgrade Success Banner */}
      {justUpgraded && !isDemo && (
        <div className="mb-6 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-green-200 mr-2"
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
                <h3 className="text-lg font-semibold">🎉 Account Upgraded Successfully!</h3>
              </div>
              <p className="mt-2 text-sm text-green-100">
                Welcome to your full access account! All demo restrictions have been removed. You now have your own private company workspace with unlimited access to all features.
              </p>
              <div className="mt-3 bg-green-800/30 rounded-md p-3">
                <p className="text-sm font-medium text-green-50">✓ Your own private company created</p>
                <p className="text-sm font-medium text-green-50">✓ Unlimited products, partners, and orders</p>
                <p className="text-sm font-medium text-green-50">✓ Team collaboration enabled</p>
                <p className="text-sm font-medium text-green-50">✓ Full data control and management</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/account-status"
                  className="inline-flex items-center px-4 py-2 bg-white text-green-600 rounded-md font-medium hover:bg-green-50 transition-colors"
                >
                  View Full Access Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Banner */}
      {isDemo && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-blue-200 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold">Demo Mode</h3>
              </div>
              <p className="mt-2 text-sm text-blue-100">
                You're exploring with read-only access to sample data. To create your own company
                with full access, team collaboration, and your own data, request official access.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/dashboard/request-upgrade"
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Request Official Access
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 text-white border border-white/30 rounded-md font-medium hover:bg-white/10 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {firstName}!
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {companyName}
          {isDemo && <span className="ml-2 text-blue-600 font-medium">(Demo Mode)</span>}
        </p>
      </div>

      {/* Stats with Suspense for progressive loading */}
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats companyId={companyId!} />
      </Suspense>

      {/* Recent Activities with Suspense */}
      <Suspense fallback={<RecentActivitySkeleton />}>
        <RecentActivity companyId={companyId!} />
      </Suspense>

      <QuickActions isDemo={isDemo} />
    </div>
  );
}
