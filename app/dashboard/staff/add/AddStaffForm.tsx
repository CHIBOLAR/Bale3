'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateStaffInvite } from '../actions'

interface Warehouse {
  id: string
  name: string
}

interface AddStaffFormProps {
  warehouses: Warehouse[]
}

export default function AddStaffForm({ warehouses }: AddStaffFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = await generateStaffInvite(formData)

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else if (result.inviteCode) {
      setInviteCode(result.inviteCode)
      setShowSuccessModal(true)
    }
  }

  function handleCopyLink() {
    if (inviteCode) {
      const inviteUrl = `${window.location.origin}/signup?code=${inviteCode}`
      navigator.clipboard.writeText(inviteUrl)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 3000)
    }
  }

  function handleCloseModal() {
    setShowSuccessModal(false)
    router.push('/dashboard/staff')
    router.refresh()
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Add Staff Member</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create an invite for a new staff member. They will receive an invite link to join your team.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name (Required) */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="John"
                />
              </div>

              {/* Last Name (Required) */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="Doe"
                />
              </div>

              {/* Email (Required) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Staff member will receive their invite at this email address
                </p>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="staff@example.com"
                />
              </div>

              {/* Phone Number (Optional) */}
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Warehouse Assignment */}
              <div>
                <label htmlFor="warehouse_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Warehouse
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Staff will only have access to this warehouse. Leave empty for all warehouses (admin access).
                </p>
                <select
                  id="warehouse_id"
                  name="warehouse_id"
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

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">How Staff Invites Work</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• An invite link will be generated for this email address</li>
                      <li>• The invite is valid for 72 hours</li>
                      <li>• Staff member will verify their email using OTP to activate their account</li>
                      <li>• Once verified, they'll have access to their assigned warehouse only</li>
                      <li>• You can manage staff permissions anytime from the staff list</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? 'Generating Invite...' : 'Generate Invite'}
                </button>
                <Link
                  href="/dashboard/staff"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && inviteCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Invite Generated Successfully!
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Share this invite link with your staff member
            </p>

            {/* Invite Code Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Invite Code
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border border-gray-300">
                  {inviteCode}
                </code>
              </div>
            </div>

            {/* Invite Link Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Invite Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/signup?code=${inviteCode}`}
                  className="flex-1 text-xs bg-white px-3 py-2 rounded border border-gray-300 text-gray-700"
                />
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium mb-3 flex items-center justify-center gap-2"
            >
              {copiedToClipboard ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Invite Link
                </>
              )}
            </button>

            {/* Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> This invite expires in 72 hours. The staff member must use it before then.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}
