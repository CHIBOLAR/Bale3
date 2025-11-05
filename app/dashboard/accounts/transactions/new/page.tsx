import { ManualJournalForm } from '@/components/accounting/ManualJournalForm';
import Link from 'next/link';

export default function NewTransactionPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Link href="/dashboard/accounts/journal-entries" className="hover:text-gray-700">
            Journal Entries
          </Link>
          <span>/</span>
          <span className="text-gray-900">New Entry</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Manual Journal Entry</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create adjustments for corrections, opening balances, or accounting entries
        </p>
      </div>

      {/* Warning Alert - Discourage Overuse */}
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-900">Use sparingly</h3>
            <p className="mt-1 text-sm text-amber-800">
              Regular business transactions (sales, purchases, payments) are automatically journalized. Use manual entries only for opening balances, corrections, or adjustments.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ManualJournalForm />
    </div>
  );
}
