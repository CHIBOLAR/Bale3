'use client';

import { useState } from 'react';
import { recordPayment } from '@/app/actions/accounting/payments';
import { useRouter } from 'next/navigation';

interface PaymentFormProps {
  invoiceId: string;
  balanceDue: number;
  bankAccounts: Array<{
    id: string;
    account_name: string;
    account_number: string;
    bank_name: string;
  }>;
}

export function PaymentForm({ invoiceId, balanceDue, bankAccounts }: PaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type PaymentMethod = 'cash' | 'cheque' | 'bank_transfer' | 'upi' | 'card' | 'neft_rtgs' | 'imps' | 'others';

  const [formData, setFormData] = useState({
    amount: balanceDue.toFixed(2),
    payment_method: 'bank_transfer' as PaymentMethod,
    payment_date: new Date().toISOString().split('T')[0],
    bank_account_id: '',
    cheque_number: '',
    upi_ref: '',
    transaction_reference: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);

      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      if (amount > balanceDue) {
        setError(`Amount cannot exceed balance due (₹${balanceDue.toFixed(2)})`);
        setLoading(false);
        return;
      }

      // Section 269ST check
      if (formData.payment_method === 'cash' && amount > 200000) {
        setError('Section 269ST: Cash payments above ₹2,00,000 are not allowed');
        setLoading(false);
        return;
      }

      const result = await recordPayment({
        invoice_id: invoiceId,
        amount,
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        bank_account_id: formData.bank_account_id || undefined,
        cheque_number: formData.cheque_number || undefined,
        upi_ref: formData.upi_ref || undefined,
        transaction_reference: formData.transaction_reference || undefined,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        router.push(`/dashboard/invoices/${invoiceId}`);
        router.refresh();
      } else {
        setError(result.error || 'Failed to record payment');
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            ₹
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            max={balanceDue}
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Maximum: ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Payment Method */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Payment Method <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.payment_method}
          onChange={(e) =>
            setFormData({
              ...formData,
              payment_method: e.target.value as PaymentMethod,
            })
          }
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="upi">UPI</option>
          <option value="cash">Cash</option>
          <option value="cheque">Cheque</option>
          <option value="neft_rtgs">NEFT/RTGS</option>
          <option value="imps">IMPS</option>
          <option value="card">Card</option>
          <option value="others">Others</option>
        </select>
      </div>

      {/* Bank Account (if not cash) */}
      {formData.payment_method !== 'cash' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Bank Account
          </label>
          <select
            value={formData.bank_account_id}
            onChange={(e) =>
              setFormData({ ...formData, bank_account_id: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Default Bank Account</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_name} - {account.bank_name} ({account.account_number})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Cheque Number */}
      {formData.payment_method === 'cheque' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Cheque Number
          </label>
          <input
            type="text"
            value={formData.cheque_number}
            onChange={(e) =>
              setFormData({ ...formData, cheque_number: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter cheque number"
          />
        </div>
      )}

      {/* UPI Reference */}
      {formData.payment_method === 'upi' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            UPI Reference / Transaction ID
          </label>
          <input
            type="text"
            value={formData.upi_ref}
            onChange={(e) =>
              setFormData({ ...formData, upi_ref: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter UPI transaction ID"
          />
        </div>
      )}

      {/* Transaction Reference for Bank/NEFT/IMPS */}
      {(['bank_transfer', 'neft_rtgs', 'imps'].includes(formData.payment_method)) && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Transaction Reference / UTR
          </label>
          <input
            type="text"
            value={formData.transaction_reference}
            onChange={(e) =>
              setFormData({ ...formData, transaction_reference: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter transaction reference number"
          />
        </div>
      )}

      {/* Payment Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Payment Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          required
          value={formData.payment_date}
          onChange={(e) =>
            setFormData({ ...formData, payment_date: e.target.value })
          }
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Add any additional notes..."
        />
      </div>

      {/* Section 269ST Warning for Cash */}
      {formData.payment_method === 'cash' && parseFloat(formData.amount) > 200000 && (
        <div className="mb-4 rounded-lg bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ Section 269ST Violation
          </p>
          <p className="mt-1 text-xs text-yellow-700">
            Cash payments above ₹2,00,000 are prohibited under Section 269ST of the Income Tax Act.
            Please use bank transfer, cheque, or UPI.
          </p>
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
          disabled={loading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Recording...' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
}
