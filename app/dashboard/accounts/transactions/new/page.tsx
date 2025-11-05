import { ManualJournalForm } from '@/components/accounting/ManualJournalForm';
import Link from 'next/link';

export default function NewTransactionPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard/accounts/journal-entries" className="hover:text-gray-700">
            Journal Entries
          </Link>
          <span>/</span>
          <span className="text-gray-900">Manual Adjustment</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">✏️ Manual Journal Entry</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a manual adjustment for corrections, opening balances, or non-business transactions
        </p>
      </div>

      {/* Info Box */}
      <div className="mb-6 rounded-lg bg-purple-50 border border-purple-200 p-4">
        <div className="flex items-start gap-2">
          <span className="text-lg">ℹ️</span>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-purple-900">When to use manual entries:</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-purple-800">
              <li>Opening balances for ledgers</li>
              <li>Accounting corrections or adjustments</li>
              <li>Non-business transactions (owner drawings, capital)</li>
              <li>Bank reconciliation adjustments</li>
            </ul>
            <p className="mt-3 text-xs text-purple-700 font-medium">
              💡 Note: Business transactions like sales, purchases, and payments are automatically recorded when you create invoices, bills, or payments.
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-900">How to use this form:</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
          <li>Select a ledger account and enter amount in either Debit OR Credit column</li>
          <li>Add multiple lines to complete your transaction (minimum 2 lines)</li>
          <li>Total Debits must equal Total Credits before you can submit</li>
          <li>
            Common examples:
            <ul className="ml-6 mt-1 list-inside list-disc">
              <li>Opening Balance: Dr Asset Account, Cr Capital</li>
              <li>Bank Charges: Dr Bank Charges, Cr Bank</li>
              <li>Interest Earned: Dr Bank, Cr Interest Income</li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Form */}
      <ManualJournalForm />
    </div>
  );
}
