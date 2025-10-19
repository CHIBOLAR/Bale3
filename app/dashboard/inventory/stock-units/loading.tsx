export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full p-6">
              {/* Table Header */}
              <div className="mb-4 flex gap-4 border-b border-gray-200 pb-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                ))}
              </div>

              {/* Table Rows */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="flex gap-4 border-b border-gray-100 pb-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <div key={j} className="h-10 w-24 animate-pulse rounded bg-gray-200" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination Skeleton */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
