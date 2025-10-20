'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Archive,
} from 'lucide-react'
import { updateJobWorkStatus, deleteJobWork } from '../actions'

interface JobWorkDetailProps {
  jobWork: any
  dispatches: any[]
  receipts: any[]
  isDemo: boolean
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function JobWorkDetail({
  jobWork,
  dispatches,
  receipts,
  isDemo,
}: JobWorkDetailProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: string) => {
    if (isDemo) {
      setError('Cannot update job works in demo mode')
      return
    }

    setIsUpdating(true)
    setError(null)

    const result = await updateJobWorkStatus(jobWork.id, newStatus)

    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }

    setIsUpdating(false)
  }

  const handleDelete = async () => {
    if (isDemo) {
      setError('Cannot delete job works in demo mode')
      return
    }

    if (!confirm('Are you sure you want to delete this job work? This action cannot be undone.')) {
      return
    }

    setIsUpdating(true)
    setError(null)

    const result = await deleteJobWork(jobWork.id)

    if (result.error) {
      setError(result.error)
      setIsUpdating(false)
    } else {
      router.push('/dashboard/job-works')
    }
  }

  // Calculate progress
  const totalExpected = jobWork.finished_goods.reduce(
    (sum: number, item: any) => sum + (item.expected_quantity || 0),
    0
  )
  const totalReceived = jobWork.finished_goods.reduce(
    (sum: number, item: any) => sum + (item.received_quantity || 0),
    0
  )
  const progress = totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/job-works"
            className="rounded-md p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{jobWork.job_number}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Created on {new Date(jobWork.created_at).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              statusColors[jobWork.status as keyof typeof statusColors]
            }`}
          >
            {statusLabels[jobWork.status as keyof typeof statusLabels]}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Actions */}
          {jobWork.status === 'pending' && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
            >
              <Clock className="h-5 w-5" />
              Start Work
            </button>
          )}

          {jobWork.status === 'in_progress' && (
            <>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
              >
                <CheckCircle className="h-5 w-5" />
                Mark Complete
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
              >
                <XCircle className="h-5 w-5" />
                Cancel
              </button>
            </>
          )}

          {(jobWork.status === 'completed' || jobWork.status === 'cancelled') && (
            <button
              onClick={handleDelete}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Progress Bar */}
      {jobWork.status === 'in_progress' && progress > 0 && (
        <div className="rounded-lg bg-white p-6 shadow ring-1 ring-black ring-opacity-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-900">Progress</h3>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {totalReceived} of {totalExpected} units received
          </p>
        </div>
      )}

      {/* Main Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Job Work Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="rounded-lg bg-white p-6 shadow ring-1 ring-black ring-opacity-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Work Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Partner</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Link
                    href={`/dashboard/partners/${jobWork.partner.id}`}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    {jobWork.partner.partner_name}
                  </Link>
                  {jobWork.partner.contact_person && (
                    <span className="text-gray-500 ml-2">({jobWork.partner.contact_person})</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Warehouse</dt>
                <dd className="mt-1 text-sm text-gray-900">{jobWork.warehouse.warehouse_name}</dd>
              </div>

              {jobWork.sales_order && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Sales Order</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Link
                      href={`/dashboard/sales-orders/${jobWork.sales_order.id}`}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {jobWork.sales_order.order_number}
                    </Link>
                  </dd>
                </div>
              )}

              {jobWork.expected_delivery_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expected Delivery</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(jobWork.expected_delivery_date).toLocaleDateString()}
                  </dd>
                </div>
              )}

              {jobWork.job_description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{jobWork.job_description}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Raw Materials */}
          <div className="rounded-lg bg-white p-6 shadow ring-1 ring-black ring-opacity-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw Materials Sent</h2>
            {jobWork.raw_materials.length === 0 ? (
              <p className="text-sm text-gray-500">No raw materials specified</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Required Quantity
                      </th>
                      <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {jobWork.raw_materials.map((material: any) => (
                      <tr key={material.id}>
                        <td className="py-3 text-sm text-gray-900">
                          <Link
                            href={`/dashboard/products/${material.product.id}`}
                            className="text-indigo-600 hover:text-indigo-500"
                          >
                            {material.product.product_name}
                          </Link>
                        </td>
                        <td className="py-3 text-sm text-gray-900 text-right">
                          {material.required_quantity}
                        </td>
                        <td className="py-3 text-sm text-gray-500 text-right">
                          {material.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Expected Returns (Finished Goods) */}
          <div className="rounded-lg bg-white p-6 shadow ring-1 ring-black ring-opacity-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Returns</h2>
            {jobWork.finished_goods.length === 0 ? (
              <p className="text-sm text-gray-500">No finished goods specified</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expected
                      </th>
                      <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Received
                      </th>
                      <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {jobWork.finished_goods.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-3 text-sm text-gray-900">
                          <Link
                            href={`/dashboard/products/${item.product.id}`}
                            className="text-indigo-600 hover:text-indigo-500"
                          >
                            {item.product.product_name}
                          </Link>
                        </td>
                        <td className="py-3 text-sm text-gray-900 text-right">
                          {item.expected_quantity}
                        </td>
                        <td className="py-3 text-sm text-gray-900 text-right">
                          {item.received_quantity || 0}
                        </td>
                        <td className="py-3 text-sm text-gray-500 text-right">
                          {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel - Dispatches & Receipts */}
        <div className="space-y-6">
          {/* Goods Dispatches */}
          <div className="rounded-lg bg-white p-6 shadow ring-1 ring-black ring-opacity-5">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">Goods Dispatched</h3>
            </div>
            {dispatches.length === 0 ? (
              <p className="text-sm text-gray-500">No dispatches yet</p>
            ) : (
              <ul className="space-y-3">
                {dispatches.map((dispatch) => (
                  <li key={dispatch.id} className="border-l-4 border-indigo-500 pl-3">
                    <Link
                      href={`/dashboard/goods-dispatch/${dispatch.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      {dispatch.dispatch_number}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(dispatch.dispatch_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {dispatch.items?.length || 0} stock units
                    </p>
                    {dispatch.items && dispatch.items.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {dispatch.items.map((item: any) => (
                          <li key={item.id} className="text-xs text-gray-600">
                            <Link
                              href={`/dashboard/inventory/${item.stock_unit_id}`}
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              {item.stock_unit?.product?.product_name} - {item.stock_unit?.size_quantity} {item.stock_unit?.product?.measuring_unit}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Goods Receipts */}
          <div className="rounded-lg bg-white p-6 shadow ring-1 ring-black ring-opacity-5">
            <div className="flex items-center gap-2 mb-4">
              <Archive className="h-5 w-5 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">Goods Received</h3>
            </div>
            {receipts.length === 0 ? (
              <p className="text-sm text-gray-500">No receipts yet</p>
            ) : (
              <ul className="space-y-3">
                {receipts.map((receipt) => (
                  <li key={receipt.id} className="border-l-4 border-green-500 pl-3">
                    <Link
                      href={`/dashboard/goods-receipt/${receipt.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      {receipt.receipt_number}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(receipt.receipt_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {receipt.items?.length || 0} stock units
                    </p>
                    {receipt.items && receipt.items.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {receipt.items.map((item: any) => (
                          <li key={item.id} className="text-xs text-gray-600">
                            <Link
                              href={`/dashboard/inventory/${item.stock_unit_id}`}
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              {item.stock_unit?.product?.product_name} - {item.stock_unit?.size_quantity} {item.stock_unit?.product?.measuring_unit}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
