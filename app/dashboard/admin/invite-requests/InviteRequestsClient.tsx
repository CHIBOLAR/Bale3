'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InviteRequest {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
  created_at: string;
  updated_at: string;
  metadata?: {
    request_type?: string;
    name?: string;
    phone?: string | null;
    company?: string | null;
    message?: string | null;
    is_demo_upgrade?: boolean;
  };
  code: string;
}

interface InviteRequestsClientProps {
  initialRequests: InviteRequest[];
  currentUserId: string;
}

export default function InviteRequestsClient({
  initialRequests,
  currentUserId,
}: InviteRequestsClientProps) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');
  const [loading, setLoading] = useState<string | null>(null);

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;
    if (filter === 'rejected') return req.status === 'revoked' || req.status === 'rejected';
    return req.status === filter;
  });

  const handleApprove = async (request: InviteRequest) => {
    const name = request.metadata?.name || request.email;
    if (!confirm(`Approve access request from ${name} (${request.email})?`)) {
      return;
    }

    setLoading(request.id);
    try {
      const response = await fetch('/api/admin/approve-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request.id, email: request.email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve request');
      }

      // Update the request in state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === request.id
            ? { ...req, status: 'accepted' as const }
            : req
        )
      );

      const approvalType = data.isUpgrade ? 'Upgrade' : 'New Signup';
      const linkLabel = data.isUpgrade ? 'Upgrade Link' : 'Signup Link';

      // Show modal with copyable link
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;">
          <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%;">
            <h2 style="margin-top: 0; color: #10b981;">✅ Request Approved!</h2>
            <p><strong>Type:</strong> ${approvalType}</p>
            <p><strong>Email:</strong> ${request.email}</p>
            <p><strong>Invite Code:</strong> ${data.inviteCode}</p>
            <div style="margin: 20px 0;">
              <label style="font-weight: bold; display: block; margin-bottom: 8px;">${linkLabel}:</label>
              <div style="display: flex; gap: 10px;">
                <input
                  id="invite-link-input"
                  type="text"
                  value="${data.inviteLink}"
                  readonly
                  style="flex: 1; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 12px;"
                />
                <button
                  onclick="navigator.clipboard.writeText('${data.inviteLink}').then(() => { this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy', 2000); })"
                  style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;"
                >
                  Copy
                </button>
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              📧 <strong>For testing:</strong> Manually send this link to ${email} via WhatsApp or email.<br>
              ℹ️ Automatic emails will be enabled once domain is configured.
            </p>
            <button
              onclick="this.closest('div').parentElement.remove()"
              style="width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 10px;"
            >
              Done
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      router.refresh();
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert(error.message || 'Failed to approve request');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (requestId: string, name: string) => {
    if (!confirm(`Reject access request from ${name}?`)) {
      return;
    }

    setLoading(requestId);
    try {
      const response = await fetch('/api/admin/reject-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject request');
      }

      // Update the request in state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: 'revoked' as const } : req
        )
      );

      alert('Request rejected successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert(error.message || 'Failed to reject request');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      revoked: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pending: 'Pending',
      accepted: 'Approved',
      rejected: 'Rejected',
      revoked: 'Rejected',
      expired: 'Expired',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {labels[status as keyof typeof labels] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pending', label: 'Pending', count: requests.filter((r) => r.status === 'pending').length },
            { key: 'accepted', label: 'Approved', count: requests.filter((r) => r.status === 'accepted').length },
            { key: 'rejected', label: 'Rejected', count: requests.filter((r) => r.status === 'revoked' || r.status === 'rejected').length },
            { key: 'all', label: 'All', count: requests.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
              <span
                className={`${
                  filter === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                } ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'pending'
              ? 'No pending invite requests at this time.'
              : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <li key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {request.metadata?.name || request.email}
                        </h3>
                        {getStatusBadge(request.status)}
                        {request.metadata?.is_demo_upgrade && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Demo Upgrade
                          </span>
                        )}
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
                      {request.metadata?.phone && (
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{request.metadata.phone}</p>
                        </div>
                      )}
                      {request.metadata?.company && (
                        <div>
                          <p className="text-gray-500">Company</p>
                          <p className="font-medium text-gray-900">{request.metadata.company}</p>
                        </div>
                      )}
                      {request.metadata?.message && (
                        <div className="col-span-2">
                          <p className="text-gray-500">Message</p>
                          <p className="font-medium text-gray-900">{request.metadata.message}</p>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={loading === request.id}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === request.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(request.id, request.metadata?.name || request.email)}
                          disabled={loading === request.id}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === request.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
