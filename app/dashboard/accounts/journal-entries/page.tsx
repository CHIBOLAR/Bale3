'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJournalEntries, type JournalEntry } from '@/app/actions/accounting/journal-entries';

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [search, setSearch] = useState('');

  const loadEntries = async () => {
    setLoading(true);
    setError(null);

    const result = await getJournalEntries({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      transactionType: transactionType !== 'all' ? transactionType : undefined,
      search: search || undefined,
    });

    if (result.success && result.data) {
      setEntries(result.data);
    } else {
      setError(result.error || 'Failed to load journal entries');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, [startDate, endDate, transactionType, search]);

  const toggleExpand = (entryId: string) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
          <p className="mt-1 text-sm text-gray-500">
            View all accounting transactions and journal entries
          </p>
        </div>
        <Link
          href="/dashboard/accounts/transactions/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Transaction
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="invoice">Invoice</option>
              <option value="payment">Payment</option>
              <option value="manual">Manual Entry</option>
              <option value="opening">Opening Balance</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              placeholder="Search by entry #, narration..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-500">Loading journal entries...</div>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No journal entries found</p>
          <Link
            href="/dashboard/accounts/transactions/new"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
          >
            Create your first transaction
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg bg-white shadow-sm">
              {/* Entry Header - Clickable */}
              <div
                onClick={() => toggleExpand(entry.id)}
                className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex flex-1 items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="text-sm font-medium text-gray-900">{entry.entry_number}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.entry_date).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.narration || 'No narration'}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          entry.transaction_type === 'invoice'
                            ? 'bg-blue-100 text-blue-800'
                            : entry.transaction_type === 'payment'
                              ? 'bg-green-100 text-green-800'
                              : entry.transaction_type === 'manual'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {entry.transaction_type}
                      </span>
                      {entry.is_opening_entry && (
                        <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                          Opening
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{entry.total_debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-500">{entry.lines.length} lines</div>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${expandedEntry === entry.id ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Entry Lines - Expandable */}
              {expandedEntry === entry.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Ledger Account
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Type
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Debit
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {entry.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900">
                            {line.ledger_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                            {line.account_type}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right text-sm text-gray-900">
                            {line.debit_amount > 0
                              ? `₹${line.debit_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                              : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right text-sm text-gray-900">
                            {line.credit_amount > 0
                              ? `₹${line.credit_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                      {/* Totals Row */}
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-3 py-2 text-sm text-gray-900" colSpan={2}>
                          Total
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right text-sm text-gray-900">
                          ₹{entry.total_debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right text-sm text-gray-900">
                          ₹{entry.total_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
