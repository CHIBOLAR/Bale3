import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Suspense } from 'react';
import QuickActions from './QuickActions';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import { getCachedUserData } from '@/lib/cache/queries';

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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get user data from cache (5 min cache, includes company info)
  const userData = await getCachedUserData(user.id);

  const companyId = userData?.company_id;
  const companyName = userData?.company?.name;
  const firstName = userData?.first_name;


  return (
    <div>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {firstName}!
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {companyName}
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

      <QuickActions />
    </div>
  );
}
