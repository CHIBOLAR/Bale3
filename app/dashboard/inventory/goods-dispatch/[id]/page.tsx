'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Calendar,
  TruckIcon,
  FileText,
  Building2,
  User,
  Edit,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { GoodsDispatchStatus } from '@/lib/types/inventory';
import { getGoodsDispatch, updateDispatchStatus } from '@/app/actions/inventory/goods-dispatch';

export default function GoodsDispatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatchId = params.id as string;

  const [dispatch, setDispatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchDispatch() {
      try {
        const data = await getGoodsDispatch(dispatchId);
        setDispatch(data);
      } catch (error) {
        console.error('Error fetching dispatch:', error);
      } finally {
        setLoading(false);
      }
    }

    if (dispatchId) {
      fetchDispatch();
    }
  }, [dispatchId]);

  const getStatusBadge = (status: GoodsDispatchStatus) => {
    const styles: Record<GoodsDispatchStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles[status]}`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  };

  const handleStatusUpdate = async (newStatus: GoodsDispatchStatus) => {
    setUpdatingStatus(true);
    try {
      const result = await updateDispatchStatus(dispatchId, newStatus);
      if (result.success && dispatch) {
        setDispatch({ ...dispatch, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getTotalQuantity = () => {
    if (!dispatch?.items) return 0;
    return dispatch.items.reduce(
      (sum: number, item: any) =>
        sum + (item.stock_units.size_quantity - item.stock_units.wastage),
      0
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading dispatch...</div>
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Dispatch not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The dispatch you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/inventory/goods-dispatch"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Back to Dispatches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
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
                {dispatch.dispatch_number}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Dispatch Details
              </p>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(dispatch.status)}
              <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dispatch Information */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Dispatch Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Dispatch Type</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {dispatch.link_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Warehouse</p>
                  <p className="mt-1 text-sm text-gray-900">{dispatch.warehouses.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Dispatch To</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {dispatch.dispatch_to_partner?.company_name || dispatch.dispatch_to_warehouse?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Dispatch Date</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(dispatch.dispatch_date).toLocaleDateString()}
                  </p>
                </div>
                {dispatch.due_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(dispatch.due_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {dispatch.invoice_number && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                    <p className="mt-1 text-sm text-gray-900">{dispatch.invoice_number}</p>
                  </div>
                )}
                {dispatch.invoice_amount && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Invoice Amount</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      ₹{dispatch.invoice_amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {dispatch.transport_details && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <TruckIcon className="h-4 w-4" />
                    Transport Details
                  </p>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {dispatch.transport_details}
                  </p>
                </div>
              )}

              {dispatch.notes && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FileText className="h-4 w-4" />
                    Notes
                  </p>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {dispatch.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Dispatched Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Dispatched Stock Units ({dispatch.items?.length || 0})
              </h2>
              <div className="space-y-3">
                {dispatch.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Product Image */}
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {item.stock_units.products.image_url ? (
                          <Image
                            src={item.stock_units.products.image_url}
                            alt={item.stock_units.products.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400">
                            {item.stock_units.products.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Unit Info */}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.stock_units.products.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-mono">#{item.stock_units.unit_number}</span>
                          <span>•</span>
                          <span>{item.stock_units.quality_grade}</span>
                        </div>
                      </div>
                    </div>

                    {/* Size */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {item.stock_units.size_quantity - item.stock_units.wastage} mtr
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.stock_units.location_description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 rounded-md bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Quantity</span>
                  <span className="text-xl font-bold text-gray-900">
                    {getTotalQuantity().toFixed(2)} mtr
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Status Actions */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Update Status</h2>
              <div className="space-y-2">
                {dispatch.status !== 'in_transit' && dispatch.status !== 'delivered' && (
                  <button
                    onClick={() => handleStatusUpdate('in_transit')}
                    disabled={updatingStatus}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <TruckIcon className="h-4 w-4" />
                    Mark as In Transit
                  </button>
                )}
                {dispatch.status !== 'delivered' && dispatch.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={updatingStatus}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Delivered
                  </button>
                )}
                {dispatch.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updatingStatus}
                    className="w-full flex items-center justify-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Dispatch
                  </button>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Info</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Units</span>
                  <span className="font-medium text-gray-900">
                    {dispatch.items?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Quantity</span>
                  <span className="font-medium text-gray-900">
                    {getTotalQuantity().toFixed(2)} mtr
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created At</span>
                  <span className="font-medium text-gray-900">
                    {new Date(dispatch.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Links */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Related Links</h2>
              <div className="space-y-2">
                <Link
                  href={`/dashboard/warehouses/${dispatch.warehouse_id}`}
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  View warehouse details →
                </Link>
                {dispatch.dispatch_to_partner_id && (
                  <Link
                    href={`/dashboard/partners/${dispatch.dispatch_to_partner_id}`}
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    View partner details →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
