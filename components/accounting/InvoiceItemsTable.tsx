'use client';

/**
 * Invoice Items Table Component
 * Editable table for invoice line items with partial quantity support
 */

import { useState } from 'react';
import type { InvoiceItem } from '@/lib/accounting/types';

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
  editable?: boolean;
}

export function InvoiceItemsTable({
  items,
  onChange,
  editable = true,
}: InvoiceItemsTableProps) {
  const handleQuantityChange = (index: number, newQuantity: number) => {
    const updatedItems = [...items];
    const item = updatedItems[index];

    // Recalculate line total
    const taxableAmount = (newQuantity * item.unit_rate) - (item.discount_amount || 0);
    const gstAmount = (item.cgst_amount || 0) + (item.sgst_amount || 0) + (item.igst_amount || 0);
    const lineTotal = taxableAmount + gstAmount;

    updatedItems[index] = {
      ...item,
      quantity: newQuantity,
      taxable_amount: taxableAmount,
      line_total: lineTotal,
    };

    onChange(updatedItems);
  };

  const handleUnitRateChange = (index: number, newRate: number) => {
    const updatedItems = [...items];
    const item = updatedItems[index];

    // Recalculate line total
    const taxableAmount = (item.quantity * newRate) - (item.discount_amount || 0);
    const gstAmount = (item.cgst_amount || 0) + (item.sgst_amount || 0) + (item.igst_amount || 0);
    const lineTotal = taxableAmount + gstAmount;

    updatedItems[index] = {
      ...item,
      unit_rate: newRate,
      taxable_amount: taxableAmount,
      line_total: lineTotal,
    };

    onChange(updatedItems);
  };

  const handleDiscountChange = (index: number, discountAmount: number) => {
    const updatedItems = [...items];
    const item = updatedItems[index];

    // Recalculate line total
    const taxableAmount = (item.quantity * item.unit_rate) - discountAmount;
    const gstAmount = (item.cgst_amount || 0) + (item.sgst_amount || 0) + (item.igst_amount || 0);
    const lineTotal = taxableAmount + gstAmount;

    updatedItems[index] = {
      ...item,
      discount_amount: discountAmount,
      taxable_amount: taxableAmount,
      line_total: lineTotal,
    };

    onChange(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange(updatedItems);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Product
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Quantity
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Rate
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Discount
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Taxable
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              GST
            </th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Total
            </th>
            {editable && (
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => {
            const gstAmount = (item.cgst_amount || 0) + (item.sgst_amount || 0) + (item.igst_amount || 0);

            return (
              <tr key={index}>
                <td className="px-3 py-4 text-sm text-gray-900">
                  {item.product_name || item.description || 'Product'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 text-right">
                  {editable ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                    />
                  ) : (
                    item.quantity.toFixed(2)
                  )}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 text-right">
                  {editable ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_rate}
                      onChange={(e) =>
                        handleUnitRateChange(index, parseFloat(e.target.value) || 0)
                      }
                      className="w-28 px-2 py-1 border border-gray-300 rounded text-right"
                    />
                  ) : (
                    `₹${item.unit_rate.toFixed(2)}`
                  )}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 text-right">
                  {editable ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.discount_amount || 0}
                      onChange={(e) =>
                        handleDiscountChange(index, parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                    />
                  ) : (
                    `₹${(item.discount_amount || 0).toFixed(2)}`
                  )}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 text-right">
                  ₹{item.taxable_amount.toFixed(2)}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 text-right">
                  ₹{gstAmount.toFixed(2)}
                  {item.cgst_amount && item.sgst_amount ? (
                    <div className="text-xs">
                      CGST: ₹{item.cgst_amount.toFixed(2)}
                      <br />
                      SGST: ₹{item.sgst_amount.toFixed(2)}
                    </div>
                  ) : item.igst_amount ? (
                    <div className="text-xs">IGST: ₹{item.igst_amount.toFixed(2)}</div>
                  ) : null}
                </td>
                <td className="px-3 py-4 text-sm font-medium text-gray-900 text-right">
                  ₹{item.line_total.toFixed(2)}
                </td>
                {editable && (
                  <td className="px-3 py-4 text-center">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={editable ? 6 : 5} className="px-3 py-3 text-right text-sm font-medium text-gray-900">
              Total:
            </td>
            <td className="px-3 py-3 text-right text-sm font-bold text-gray-900">
              ₹{items.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)}
            </td>
            {editable && <td></td>}
          </tr>
        </tfoot>
      </table>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No items selected. Please add items to the invoice.
        </div>
      )}
    </div>
  );
}
