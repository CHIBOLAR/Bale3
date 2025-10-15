'use client'

import Link from 'next/link';
import { Package, QrCode, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function InventoryDashboardPage() {
  const sections = [
    {
      title: 'Stock Units',
      description: 'View and manage all inventory stock units',
      icon: Package,
      href: '/dashboard/inventory/stock-units',
      color: 'bg-blue-500',
    },
    {
      title: 'QR Codes',
      description: 'Generate and manage QR code labels',
      icon: QrCode,
      href: '/dashboard/inventory/qr-codes',
      color: 'bg-purple-500',
    },
    {
      title: 'Goods Receipt',
      description: 'Record incoming inventory and create stock units',
      icon: ArrowDownToLine,
      href: '/dashboard/inventory/goods-receipts',
      color: 'bg-green-500',
    },
    {
      title: 'Goods Dispatch',
      description: 'Dispatch stock units to customers or warehouses',
      icon: ArrowUpFromLine,
      href: '/dashboard/inventory/goods-dispatch',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your inventory, track stock units, and handle goods movement
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className={`${section.color} rounded-lg p-3 text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats (Optional) */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-gray-900">Quick Overview</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-2xl font-bold text-blue-600">—</p>
              <p className="text-sm text-gray-600">Total Stock Units</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-2xl font-bold text-green-600">—</p>
              <p className="text-sm text-gray-600">Goods Received</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-4">
              <p className="text-2xl font-bold text-orange-600">—</p>
              <p className="text-sm text-gray-600">Goods Dispatched</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
