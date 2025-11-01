'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createManualJournalEntry,
  getLedgerAccounts,
} from '@/app/actions/accounting/journal-entries';

interface JournalLine {
  id: string;
  ledger_account_id: string;
  debit_amount: string;
  credit_amount: string;
}

interface LedgerAccount {
  id: string;
  name: string;
  account_type: string;
  current_balance: number;
}

export function ManualJournalForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ledgers, setLedgers] = useState<LedgerAccount[]>([]);

  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    narration: '',
  });

  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', ledger_account_id: '', debit_amount: '', credit_amount: '' },
    { id: '2', ledger_account_id: '', debit_amount: '', credit_amount: '' },
  ]);

  // Load ledgers
  useEffect(() => {
    const loadLedgers = async () => {
      const result = await getLedgerAccounts();
      if (result.success && result.data) {
        setLedgers(result.data);
      }
    };
    loadLedgers();
  }, []);

  const addLine = () => {
    const newId = (Math.max(...lines.map((l) => parseInt(l.id)), 0) + 1).toString();
    setLines([
      ...lines,
      { id: newId, ledger_account_id: '', debit_amount: '', credit_amount: '' },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) {
      setError('At least 2 lines are required');
      return;
    }
    setLines(lines.filter((line) => line.id !== id));
  };

  const updateLine = (id: string, field: keyof JournalLine, value: string) => {
    setLines(
      lines.map((line) => {
        if (line.id === id) {
          // If entering debit, clear credit and vice versa
          if (field === 'debit_amount' && value) {
            return { ...line, debit_amount: value, credit_amount: '' };
          } else if (field === 'credit_amount' && value) {
            return { ...line, credit_amount: value, debit_amount: '' };
          } else {
            return { ...line, [field]: value };
          }
        }
        return line;
      })
    );
  };

  const calculateTotals = () => {
    const totalDebit = lines.reduce((sum, line) => sum + parseFloat(line.debit_amount || '0'), 0);
    const totalCredit = lines.reduce((sum, line) => sum + parseFloat(line.credit_amount || '0'), 0);
    return { totalDebit, totalCredit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate all lines have ledger selected
    const invalidLines = lines.filter((line) => !line.ledger_account_id);
    if (invalidLines.length > 0) {
      setError('Please select a ledger account for all lines');
      setLoading(false);
      return;
    }

    // Validate all lines have either debit or credit
    const emptyLines = lines.filter(
      (line) => !line.debit_amount && !line.credit_amount
    );
    if (emptyLines.length > 0) {
      setError('All lines must have either a debit or credit amount');
      setLoading(false);
      return;
    }

    // Check if balanced
    const { totalDebit, totalCredit } = calculateTotals();
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      setError(
        `Journal entry is not balanced. Debit: ₹${totalDebit.toFixed(2)}, Credit: ₹${totalCredit.toFixed(2)}`
      );
      setLoading(false);
      return;
    }

    // Prepare data
    const entryData = {
      entry_date: formData.entry_date,
      narration: formData.narration,
      lines: lines.map((line) => ({
        ledger_account_id: line.ledger_account_id,
        debit_amount: parseFloat(line.debit_amount || '0'),
        credit_amount: parseFloat(line.credit_amount || '0'),
      })),
    };

    const result = await createManualJournalEntry(entryData);

    if (result.success) {
      router.push('/dashboard/accounts/journal-entries');
      router.refresh();
    } else {
      setError(result.error || 'Failed to create journal entry');
      setLoading(false);
    }
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Info */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Entry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Entry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.entry_date}
              onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Narration */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Narration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.narration}
              onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Brief description of this transaction"
            />
          </div>
        </div>
      </div>

      {/* Journal Lines */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Journal Entry Lines</h3>
          <button
            type="button"
            onClick={addLine}
            className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            + Add Line
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ledger Account
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Debit
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Credit
                </th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-3 py-2">
                    <select
                      value={line.ledger_account_id}
                      onChange={(e) => updateLine(line.id, 'ledger_account_id', e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Ledger</option>
                      {ledgers.map((ledger) => (
                        <option key={ledger.id} value={ledger.id}>
                          {ledger.name} ({ledger.account_type})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.debit_amount}
                      onChange={(e) => updateLine(line.id, 'debit_amount', e.target.value)}
                      disabled={!!line.credit_amount}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.credit_amount}
                      onChange={(e) => updateLine(line.id, 'credit_amount', e.target.value)}
                      disabled={!!line.debit_amount}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-3 py-2">
                    {lines.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr className="bg-gray-50 font-medium">
                <td className="px-3 py-2 text-sm text-gray-900">Total</td>
                <td className="px-3 py-2 text-right text-sm text-gray-900">
                  ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2 text-right text-sm text-gray-900">
                  ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2"></td>
              </tr>

              {/* Balance Check Row */}
              <tr
                className={`font-medium ${isBalanced ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <td className="px-3 py-2 text-sm" colSpan={3}>
                  {isBalanced ? (
                    <span className="text-green-800">✓ Balanced (Dr = Cr)</span>
                  ) : (
                    <span className="text-red-800">
                      ✗ Not Balanced (Difference: ₹
                      {Math.abs(totalDebit - totalCredit).toFixed(2)})
                    </span>
                  )}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !isBalanced}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Journal Entry'}
        </button>
      </div>
    </form>
  );
}
