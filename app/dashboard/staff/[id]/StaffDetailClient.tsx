'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateStaffMember, toggleStaffStatus } from '../actions'

interface Warehouse {
  id: string
  name: string
  location?: string
}

interface StaffMember {
  id: string
  auth_user_id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  role: string
  warehouse_id?: string
  is_active: boolean
  is_demo: boolean
  created_at: string
  updated_at: string
  warehouses?: Warehouse
}

interface StaffDetailClientProps {
  staffMember: StaffMember
  warehouses: Warehouse[]
  isDemo: boolean
}

export default function StaffDetailClient({ staffMember, warehouses, isDemo }: StaffDetailClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateStaffMember(staffMember.id, formData)

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccessMessage('Staff member updated successfully')
      setIsEditing(false)
      router.refresh()
    }
  }

  async function handleToggleStatus() {
    if (confirm(`Are you sure you want to ${staffMember.is_active ? 'deactivate' : 'activate'} this staff member?`)) {
      const result = await toggleStaffStatus(staffMember.id, staffMember.is_active)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMessage(`Staff member ${staffMember.is_active ? 'deactivated' : 'activated'} successfully`)
        router.refresh()
      }
    }
  }

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">Admin</span>
    }
    return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">Staff</span>
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Active</span>
    }
    return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/staff"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Staff
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {staffMember.first_name} {staffMember.last_name}
              </h1>
              <p className="mt-2 text-sm text-gray-600">{staffMember.email}</p>
            </div>
            {!isDemo && !isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleToggleStatus}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    staffMember.is_active
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {staffMember.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            )}
          </div>

          {isDemo && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Demo mode - Staff details are read-only.{' '}
                <Link href="/dashboard/request-upgrade" className="font-semibold underline">
                  Request access
                </Link>
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {isEditing ? (
            // Edit Form
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Staff Member</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    defaultValue={staffMember.first_name}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    defaultValue={staffMember.last_name}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    defaultValue={staffMember.phone_number || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  />
                </div>

                {/* Warehouse */}
                <div>
                  <label htmlFor="warehouse_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Warehouse
                  </label>
                  <select
                    id="warehouse_id"
                    name="warehouse_id"
                    defaultValue={staffMember.warehouse_id || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  >
                    <option value="">All Warehouses (Admin)</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setError(null)
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="p-6">
              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                    <p className="text-base text-gray-900">{staffMember.first_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                    <p className="text-base text-gray-900">{staffMember.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-base text-gray-900">{staffMember.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-base text-gray-900">{staffMember.phone_number || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Role & Access */}
              <div className="mb-8 pb-8 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Role & Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                    <div>{getRoleBadge(staffMember.role)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                    <div>{getStatusBadge(staffMember.is_active)}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Assigned Warehouse</label>
                    <p className="text-base text-gray-900">
                      {staffMember.warehouses?.name || 'All Warehouses (Admin Access)'}
                    </p>
                    {staffMember.warehouses?.location && (
                      <p className="text-sm text-gray-500 mt-1">{staffMember.warehouses.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Record Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Record Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                    <p className="text-base text-gray-900">
                      {new Date(staffMember.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                    <p className="text-base text-gray-900">
                      {new Date(staffMember.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
