'use client';

import Link from 'next/link';

interface QuickActionsProps {
  isDemo: boolean;
}

export default function QuickActions({ isDemo }: QuickActionsProps) {
  const handleDemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="mt-8 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Quick Actions
        {isDemo && (
          <span className="ml-2 text-sm text-gray-500 font-normal">
            (View-only in demo mode)
          </span>
        )}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          href="/dashboard/products/add"
          className={`relative block w-full border-2 border-dashed rounded-lg p-6 text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isDemo
              ? 'border-gray-200 cursor-not-allowed opacity-60'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={isDemo ? handleDemoClick : undefined}
        >
          <span className="mt-2 block text-sm font-medium text-gray-900">
            Create Product
          </span>
        </a>
        <a
          href="/dashboard/sales-orders/add"
          className={`relative block w-full border-2 border-dashed rounded-lg p-6 text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isDemo
              ? 'border-gray-200 cursor-not-allowed opacity-60'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={isDemo ? handleDemoClick : undefined}
        >
          <span className="mt-2 block text-sm font-medium text-gray-900">
            Create Sales Order
          </span>
        </a>
      </div>
      {isDemo && (
        <p className="mt-4 text-sm text-gray-500 text-center">
          Demo users can explore the interface but cannot modify data.{' '}
          <Link href="/request-invite" className="text-blue-600 hover:text-blue-700 font-medium">
            Request full access
          </Link>{' '}
          to create and manage your own inventory.
        </p>
      )}
    </div>
  );
}
