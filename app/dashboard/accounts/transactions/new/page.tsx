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
          <span className="text-gray-900">New Transaction</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Record Manual Transaction</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a journal entry for expenses, income, bank transfers, or other transactions
        </p>
      </div>

      {/* Info Box */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-900">How to use this form:</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
          <li>Select a ledger account and enter amount in either Debit OR Credit column</li>
          <li>Add multiple lines to complete your transaction (minimum 2 lines)</li>
          <li>Total Debits must equal Total Credits before you can submit</li>
          <li>
            Common transactions:
            <ul className="ml-6 mt-1 list-inside list-disc">
              <li>Expense: Dr Expense, Cr Cash/Bank</li>
              <li>Bank Deposit: Dr Bank, Cr Cash</li>
              <li>Income: Dr Cash/Bank, Cr Income</li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Form */}
      <ManualJournalForm />
    </div>
  );
}
