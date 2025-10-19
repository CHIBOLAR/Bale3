export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex gap-4">
            <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>

        {/* QR Codes Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-4 flex h-48 w-full items-center justify-center animate-pulse rounded-lg bg-gray-200">
                <div className="h-32 w-32 animate-pulse rounded bg-gray-300" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-8 flex-1 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
