'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getJournalEntries, type JournalEntry } from '@/app/actions/accounting/journal-entries';

// Generate Tally XML format
function generateTallyXML(entries: JournalEntry[]): string {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">`;

  const xmlFooter = `
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  let vouchers = '';

  entries.forEach((entry) => {
    const voucherType = entry.transaction_type === 'invoice' ? 'Sales'
      : entry.transaction_type === 'payment' ? 'Receipt'
      : 'Journal';

    vouchers += `
          <VOUCHER VCHTYPE="${voucherType}" ACTION="Create">
            <DATE>${new Date(entry.entry_date).toISOString().split('T')[0].replace(/-/g, '')}</DATE>
            <VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${entry.entry_number}</VOUCHERNUMBER>
            <NARRATION>${entry.narration || ''}</NARRATION>`;

    entry.lines.forEach((line) => {
      if (line.debit_amount > 0) {
        vouchers += `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${line.ledger_name}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${line.debit_amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;
      }
      if (line.credit_amount > 0) {
        vouchers += `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${line.ledger_name}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${line.credit_amount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;
      }
    });

    vouchers += `
          </VOUCHER>`;
  });

  return xmlHeader + vouchers + xmlFooter;
}

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
  const [showOnlyManual, setShowOnlyManual] = useState(false);

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

  // Helper to get source transaction link
  const getSourceLink = (entry: JournalEntry): { url: string; label: string } | null => {
    if (!entry.source_table || !entry.source_id) return null;

    switch (entry.source_table) {
      case 'invoices':
        return {
          url: `/dashboard/invoices/${entry.source_id}`,
          label: 'View Invoice',
        };
      case 'payments_received':
        return {
          url: `/dashboard/invoices`, // Could enhance to link to specific payment
          label: 'View Payment',
        };
      case 'payments_made':
        return {
          url: `/dashboard/purchases/payments`, // Adjust based on your routing
          label: 'View Payment',
        };
      case 'purchase_bills':
        return {
          url: `/dashboard/purchases/${entry.source_id}`,
          label: 'View Purchase Bill',
        };
      case 'expenses':
        return {
          url: `/dashboard/expenses/${entry.source_id}`,
          label: 'View Expense',
        };
      default:
        return null;
    }
  };

  // Helper to get transaction type badge config
  const getTransactionBadge = (type: string, voucherType: string | null) => {
    const configs: Record<string, { color: string; icon: string; label: string }> = {
      sales: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📊', label: 'Sales' },
      invoice: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📄', label: 'Invoice' },
      receipt: { color: 'bg-green-100 text-green-800 border-green-200', icon: '💰', label: 'Receipt' },
      payment: { color: 'bg-red-100 text-red-800 border-red-200', icon: '💳', label: 'Payment' },
      purchase: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🛒', label: 'Purchase' },
      expense: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '💸', label: 'Expense' },
      manual: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '✏️', label: 'Manual' },
      opening: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '🔓', label: 'Opening' },
    };

    const key = voucherType || type;
    return configs[key] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📋', label: type };
  };

  // Filter entries
  const filteredEntries = showOnlyManual
    ? entries.filter(e => e.transaction_type === 'manual' || !e.source_id)
    : entries;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Journal Entries</h1>
          <p className="mt-1 text-sm text-gray-600">
            All accounting transactions automatically created from business operations
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Generate Tally XML export
              const xml = generateTallyXML(entries);
              const blob = new Blob([xml], { type: 'application/xml' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `tally-export-${new Date().toISOString().split('T')[0]}.xml`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={entries.length === 0}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Tally
          </button>
          <Link
            href="/dashboard/accounts/transactions/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Manual Entry
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="sales">Sales</option>
              <option value="receipt">Receipt</option>
              <option value="payment">Payment</option>
              <option value="purchase">Purchase</option>
              <option value="expense">Expense</option>
              <option value="manual">Manual Entry</option>
              <option value="opening">Opening Balance</option>
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Entry number or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-md border-gray-300 pl-10 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Manual Entries Toggle */}
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-100">
          <input
            type="checkbox"
            id="showOnlyManual"
            checked={showOnlyManual}
            onChange={(e) => setShowOnlyManual(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="showOnlyManual" className="text-sm text-gray-700 cursor-pointer">
            Show only manual adjustments
          </label>
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
      ) : filteredEntries.length === 0 ? (
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
        <div className="space-y-2">
          {filteredEntries.map((entry) => {
            const badge = getTransactionBadge(entry.transaction_type, entry.voucher_type);
            const sourceLink = getSourceLink(entry);
            const isAutoGenerated = !!entry.source_id;

            return (
            <div key={entry.id} className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              {/* Entry Header - Clickable */}
              <div
                onClick={() => toggleExpand(entry.id)}
                className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex flex-1 items-center gap-6">
                  <div className="flex-shrink-0 w-24">
                    <div className="text-sm font-medium text-gray-900">{entry.entry_number}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.entry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">
                      {entry.narration || 'No description'}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {isAutoGenerated && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Auto
                        </span>
                      )}
                      {entry.is_opening_entry && (
                        <span className="inline-flex rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                          Opening
                        </span>
                      )}
                      {sourceLink && (
                        <Link
                          href={sourceLink.url}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          {sourceLink.label}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{entry.total_debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-500">{entry.lines.length} account{entry.lines.length > 1 ? 's' : ''}</div>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedEntry === entry.id ? 'rotate-180' : ''}`}
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
                <div className="border-t border-gray-200 bg-gray-50 p-5">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Account
                          </th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Type
                          </th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Debit
                          </th>
                          <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Credit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {entry.lines.map((line) => (
                          <tr key={line.id} className="border-b border-gray-100">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {line.ledger_name}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {line.account_type}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900 tabular-nums">
                              {line.debit_amount > 0
                                ? `₹${line.debit_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-900 tabular-nums">
                              {line.credit_amount > 0
                                ? `₹${line.credit_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr className="border-t-2 border-gray-300">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900" colSpan={2}>
                            Total
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 tabular-nums">
                            ₹{entry.total_debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 tabular-nums">
                            ₹{entry.total_credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
