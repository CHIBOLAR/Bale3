'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus } from 'lucide-react'

interface JobWork {
  id: string
  job_number: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  job_description?: string
  expected_delivery_date?: string
  created_at: string
  partner: {
    id: string
    partner_name: string
    partner_type: string
  }
  warehouse: {
    id: string
    warehouse_name: string
  }
  sales_order?: {
    id: string
    order_number: string
  }
  raw_materials: any[]
  finished_goods: any[]
}

interface JobWorksClientProps {
  jobWorks: JobWork[]
  partners: any[]
  warehouses: any[]
  userWarehouseId?: string | null
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

export default function JobWorksClient({
  jobWorks,
  partners,
  warehouses,
  userWarehouseId,
}: JobWorksClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [partnerFilter, setPartnerFilter] = useState<string>('all')
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all')

  const filteredJobWorks = useMemo(() => {
    return jobWorks.filter((jobWork) => {
      const matchesSearch =
        searchTerm === '' ||
        jobWork.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobWork.job_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobWork.partner.partner_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || jobWork.status === statusFilter
      const matchesPartner = partnerFilter === 'all' || jobWork.partner.id === partnerFilter
      const matchesWarehouse = warehouseFilter === 'all' || jobWork.warehouse.id === warehouseFilter

      return matchesSearch && matchesStatus && matchesPartner && matchesWarehouse
    })
  }, [jobWorks, searchTerm, statusFilter, partnerFilter, warehouseFilter])

  const calculateProgress = (jobWork: JobWork) => {
    if (jobWork.finished_goods.length === 0) return 0

    const totalExpected = jobWork.finished_goods.reduce(
      (sum, item) => sum + (item.expected_quantity || 0),
      0
    )
    const totalReceived = jobWork.finished_goods.reduce(
      (sum, item) => sum + (item.received_quantity || 0),
      0
    )

    return totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Job Works</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage job work orders sent to partners for processing
          </p>
        </div>
        <Link
          href="/dashboard/job-works/add"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="h-5 w-5" />
          Create Job Work
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search job works..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Partner Filter */}
        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="all">All Partners</option>
          {partners.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.partner_name}
            </option>
          ))}
        </select>

        {/* Warehouse Filter - only show if user is admin (no assigned warehouse) */}
        {!userWarehouseId && (
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.warehouse_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-700">
        Showing {filteredJobWorks.length} of {jobWorks.length} job works
      </div>

      {/* Job Works List */}
      <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <ul role="list" className="divide-y divide-gray-200">
          {filteredJobWorks.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">No job works found</p>
            </li>
          ) : (
            filteredJobWorks.map((jobWork) => {
              const progress = calculateProgress(jobWork)

              return (
                <li key={jobWork.id}>
                  <Link
                    href={`/dashboard/job-works/${jobWork.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {jobWork.job_number}
                            </p>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                statusColors[jobWork.status]
                              }`}
                            >
                              {statusLabels[jobWork.status]}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Partner:</span>
                              {jobWork.partner.partner_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Warehouse:</span>
                              {jobWork.warehouse.warehouse_name}
                            </span>
                            {jobWork.sales_order && (
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Sales Order:</span>
                                {jobWork.sales_order.order_number}
                              </span>
                            )}
                          </div>

                          {jobWork.job_description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-1">
                              {jobWork.job_description}
                            </p>
                          )}

                          {/* Progress Bar for In Progress status */}
                          {jobWork.status === 'in_progress' && progress > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="ml-6 flex flex-col items-end gap-2 text-sm text-gray-500">
                          {jobWork.expected_delivery_date && (
                            <span className="text-xs">
                              Expected: {new Date(jobWork.expected_delivery_date).toLocaleDateString()}
                            </span>
                          )}
                          <span className="text-xs">
                            Created: {new Date(jobWork.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-3 text-xs">
                            <span>{jobWork.raw_materials.length} materials</span>
                            <span>{jobWork.finished_goods.length} returns</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>
  )
}
