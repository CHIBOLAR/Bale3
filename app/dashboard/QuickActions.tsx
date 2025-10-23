'use client';

import Link from 'next/link';

export default function QuickActions() {
  return (
    <div className="mt-8 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/products/add"
          className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span className="mt-2 block text-sm font-medium text-gray-900">
            Create Product
          </span>
        </Link>
        <Link
          href="/dashboard/sales-orders/new"
          className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span className="mt-2 block text-sm font-medium text-gray-900">
            Create Sales Order
          </span>
        </Link>
      </div>
    </div>
  );
}
