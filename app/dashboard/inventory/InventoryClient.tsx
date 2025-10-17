'use client';

import Link from 'next/link';
import { Package, QrCode, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface Section {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  count: number;
}

interface Stats {
  totalStockUnits: number;
  inStockUnits: number;
  totalReceipts: number;
  totalDispatches: number;
}

interface InventoryClientProps {
  sections: Section[];
  stats: Stats;
}

export default function InventoryClient({ sections, stats }: InventoryClientProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package':
        return Package;
      case 'QrCode':
        return QrCode;
      case 'ArrowDownToLine':
        return ArrowDownToLine;
      case 'ArrowUpFromLine':
        return ArrowUpFromLine;
      default:
        return Package;
    }
  };

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
            const Icon = getIcon(section.icon);
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
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                        {section.title}
                      </h2>
                      <span className="text-2xl font-bold text-gray-700">{section.count}</span>
                    </div>
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

        {/* Quick Stats */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Overview</h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
              <p className="text-3xl font-bold text-blue-600">{stats.totalStockUnits}</p>
              <p className="text-sm text-gray-600 mt-1">Total Stock Units</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <p className="text-3xl font-bold text-green-600">{stats.inStockUnits}</p>
              <p className="text-sm text-gray-600 mt-1">In Stock</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 border border-purple-200">
              <p className="text-3xl font-bold text-purple-600">{stats.totalReceipts}</p>
              <p className="text-sm text-gray-600 mt-1">Total Receipts</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 border border-orange-200">
              <p className="text-3xl font-bold text-orange-600">{stats.totalDispatches}</p>
              <p className="text-sm text-gray-600 mt-1">Total Dispatches</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
