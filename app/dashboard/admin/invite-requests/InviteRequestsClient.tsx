'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UpgradeRequest {
  id: string;
  auth_user_id: string;
  email: string;
  name: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  status: string;
  created_at: string;
}

interface InviteRequestsClientProps {
  initialRequests: UpgradeRequest[];
  currentUserId: string;
  isSuperAdmin: boolean;
}

export default function InviteRequestsClient({
  initialRequests,
  currentUserId,
  isSuperAdmin,
}: InviteRequestsClientProps) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (request: UpgradeRequest) => {
    const company = request.company || `${request.name}'s Company`;

    if (!confirm(`Approve upgrade request from ${request.name} (${request.email})?\n\nThis will INSTANTLY create company "${company}" and upgrade their account.`)) {
      return;
    }

    setLoading(request.id);
    try {
      const response = await fetch('/api/admin/approve-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve upgrade');
      }

      // Remove from list (no longer pending)
      setRequests((prev) => prev.filter((req) => req.id !== request.id));

      // Show success modal
      alert(`🎉 Upgrade Complete!\n\nUser: ${request.email}\nCompany: ${data.company.name}\n\nThe user has been upgraded instantly and can now log in with full access.`);

      router.refresh();
    } catch (error: any) {
      console.error('Error approving upgrade:', error);
      alert(error.message || 'Failed to approve upgrade');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-4 text-sm text-gray-600">
        {requests.length} pending upgrade request{requests.length !== 1 ? 's' : ''}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Pending Requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            All upgrade requests have been processed.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {requests.map((request) => {
              return (
                <li key={request.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.name}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Demo → Full Access
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{request.email}</p>
                        </div>
                        {request.phone && (
                          <div>
                            <p className="text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{request.phone}</p>
                          </div>
                        )}
                        {request.company && (
                          <div>
                            <p className="text-gray-500">Company</p>
                            <p className="font-medium text-gray-900">{request.company}</p>
                          </div>
                        )}
                        {request.message && (
                          <div className="col-span-2">
                            <p className="text-gray-500">Message</p>
                            <p className="font-medium text-gray-900">{request.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={loading === request.id}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === request.id ? 'Upgrading...' : '✅ Approve & Upgrade Instantly'}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
