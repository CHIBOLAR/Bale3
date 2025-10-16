'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  QrCode,
  Package,
  MapPin,
  Calendar,
  Award,
  Ruler,
  AlertTriangle,
  FileText,
  Building2,
  Edit,
  Trash2,
} from 'lucide-react';
import { StockUnitWithRelations, StockUnitStatus } from '@/lib/types/inventory';
import { getStockUnit } from '@/app/actions/inventory/data';

export default function StockUnitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const unitId = params.id as string;

  const [stockUnit, setStockUnit] = useState<StockUnitWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnit() {
      try {
        const data = await getStockUnit(unitId);
        setStockUnit(data);
      } catch (error) {
        console.error('Error fetching stock unit:', error);
      } finally {
        setLoading(false);
      }
    }

    if (unitId) {
      fetchUnit();
    }
  }, [unitId]);

  const getStatusBadge = (status: StockUnitStatus) => {
    const styles: Record<StockUnitStatus, string> = {
      in_stock: 'bg-green-100 text-green-800',
      reserved: 'bg-blue-100 text-blue-800',
      dispatched: 'bg-purple-100 text-purple-800',
      sold: 'bg-gray-100 text-gray-800',
      damaged: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[status]}`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading stock unit...</div>
      </div>
    );
  }

  if (!stockUnit) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Stock unit not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The stock unit you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/inventory/stock-units"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Back to Stock Units
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {stockUnit.unit_number}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Stock Unit Details
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button className="flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Product Information</h2>
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {stockUnit.products.product_images?.[0] ? (
                    <Image
                      src={stockUnit.products.product_images[0]}
                      alt={stockUnit.products.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-400">
                      {stockUnit.products.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {stockUnit.products.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {stockUnit.products.material} • {stockUnit.products.color}
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-500">
                    Product #: {stockUnit.products.product_number}
                  </p>
                </div>

                {/* Status Badge */}
                <div>{getStatusBadge(stockUnit.status)}</div>
              </div>
            </div>

            {/* Unit Details */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Unit Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Size */}
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-blue-50 p-2">
                    <Ruler className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Size</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {stockUnit.size_quantity} mtr
                    </p>
                  </div>
                </div>

                {/* Wastage */}
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-red-50 p-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Wastage</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {stockUnit.wastage} mtr
                    </p>
                  </div>
                </div>

                {/* Quality Grade */}
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-yellow-50 p-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quality Grade</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {stockUnit.quality_grade}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-green-50 p-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {stockUnit.location_description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Net Usable */}
              <div className="mt-4 rounded-md bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Net Usable Quantity</span>
                  <span className="text-xl font-bold text-gray-900">
                    {(stockUnit.size_quantity - stockUnit.wastage).toFixed(2)} mtr
                  </span>
                </div>
              </div>
            </div>

            {/* Dates & History */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Dates & History</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Manufacturing Date</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(stockUnit.manufacturing_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Date Received</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(stockUnit.date_received).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Created At</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(stockUnit.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {stockUnit.notes && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <FileText className="h-5 w-5" />
                  Notes
                </h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {stockUnit.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - QR & Warehouse */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-center text-lg font-semibold text-gray-900">QR Code</h2>

              {/* QR Code Display */}
              <div className="mb-4 flex justify-center">
                <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
                  <QRCodeSVG
                    value={stockUnit.qr_code}
                    size={128}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>

              {/* QR Code String */}
              <div className="rounded-md bg-gray-50 p-3">
                <p className="break-all text-center font-mono text-xs text-gray-600">
                  {stockUnit.qr_code}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <Link
                  href={`/dashboard/inventory/qr-codes/new?product=${stockUnit.product_id}&units=${stockUnit.id}`}
                  className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Print QR Label
                </Link>
                <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Download QR Code
                </button>
              </div>
            </div>

            {/* Warehouse Info */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Building2 className="h-5 w-5" />
                Warehouse
              </h2>
              <p className="text-base font-medium text-gray-900">
                {stockUnit.warehouses.name}
              </p>
              <div className="mt-4">
                <Link
                  href={`/dashboard/warehouses/${stockUnit.warehouse_id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View warehouse details →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Change Status
                </button>
                <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Move to Different Warehouse
                </button>
                <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Update Location
                </button>
                <button className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                  Mark as Damaged
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
