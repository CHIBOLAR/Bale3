export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Back Button Skeleton */}
        <div className="mb-6">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />
              <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Main Details Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dispatch Information Skeleton */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>

            {/* Dispatched Items Skeleton */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 h-6 w-56 animate-pulse rounded bg-gray-200" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 animate-pulse rounded-md bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Skeleton */}
              <div className="mt-4 rounded-md bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
                  <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Status Skeleton */}
          <div className="space-y-6">
            {/* Status Actions Skeleton */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
                ))}
              </div>
            </div>

            {/* Quick Info Skeleton */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>

            {/* Related Links Skeleton */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 h-6 w-28 animate-pulse rounded bg-gray-200" />
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
