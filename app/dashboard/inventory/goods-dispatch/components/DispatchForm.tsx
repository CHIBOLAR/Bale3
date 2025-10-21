'use client'

import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, FileText, DollarSign, Truck, User, Building2 } from 'lucide-react';
import { GoodsDispatchLinkType } from '@/lib/types/inventory';

interface Partner {
  id: string;
  company_name: string;
  partner_type: string;
}

interface Warehouse {
  id: string;
  name: string;
}

interface Agent {
  id: string;
  name: string;
}

interface SalesOrder {
  id: string;
  order_number: string;
  customer?: {
    company_name: string;
  };
}

interface JobWork {
  id: string;
  job_number: string;
  partner?: {
    company_name: string;
  } | null;
}

interface DispatchFormProps {
  warehouses: Warehouse[];
  partners: Partner[];
  agents: Agent[];
  salesOrders?: SalesOrder[];
  jobWorks?: JobWork[];
  onSubmit: (data: DispatchFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface DispatchFormData {
  warehouse_id: string;
  link_type: GoodsDispatchLinkType;
  sales_order_id?: string;
  job_work_id?: string;
  dispatch_to_partner_id?: string;
  dispatch_to_warehouse_id?: string;
  agent_id?: string;
  dispatch_date: string;
  due_date?: string;
  invoice_number?: string;
  invoice_amount?: string;
  transport_details?: string;
  notes?: string;
}

export default function DispatchForm({
  warehouses,
  partners,
  agents,
  salesOrders = [],
  jobWorks = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: DispatchFormProps) {
  const [formData, setFormData] = useState<DispatchFormData>({
    warehouse_id: '',
    link_type: 'sales_order',
    dispatch_date: new Date().toISOString().split('T')[0],
  });

  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof DispatchFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.warehouse_id) {
      newErrors.warehouse_id = 'Warehouse is required';
    }
    if (!formData.dispatch_date) {
      newErrors.dispatch_date = 'Dispatch date is required';
    }
    if (!formData.dispatch_to_partner_id && !formData.dispatch_to_warehouse_id) {
      newErrors.dispatch_to = 'Dispatch destination is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Create goods dispatch</h2>
          <span className="text-sm text-gray-500">Step 2 of 2</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-full bg-blue-600" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {/* Reason for Dispatch */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Reason for dispatch
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="link_type"
                  value="sales_order"
                  checked={formData.link_type === 'sales_order'}
                  onChange={(e) => handleChange('link_type', e.target.value as GoodsDispatchLinkType)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">Sales order</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="link_type"
                  value="job_work"
                  checked={formData.link_type === 'job_work'}
                  onChange={(e) => handleChange('link_type', e.target.value as GoodsDispatchLinkType)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">Job work</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="link_type"
                  value="purchase_return"
                  checked={formData.link_type === 'purchase_return'}
                  onChange={(e) => handleChange('link_type', e.target.value as GoodsDispatchLinkType)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">Purchase return</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="link_type"
                  value="other"
                  checked={formData.link_type === 'other'}
                  onChange={(e) => handleChange('link_type', e.target.value as GoodsDispatchLinkType)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">Other</span>
              </label>
            </div>
          </div>

          {/* Conditional: Sales Order */}
          {formData.link_type === 'sales_order' && (
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4 text-gray-400" />
                Sales order
              </label>
              <select
                value={formData.sales_order_id || ''}
                onChange={(e) => handleChange('sales_order_id', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select sales order</option>
                {salesOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.order_number}
                    {order.customer?.company_name && ` - ${order.customer.company_name}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional: Job Work */}
          {formData.link_type === 'job_work' && (
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4 text-gray-400" />
                Job work
              </label>
              <select
                value={formData.job_work_id || ''}
                onChange={(e) => handleChange('job_work_id', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select job work</option>
                {jobWorks.map((work) => (
                  <option key={work.id} value={work.id}>
                    {work.job_number}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Source Warehouse */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Building2 className="h-4 w-4 text-gray-400" />
              Dispatch from warehouse <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.warehouse_id}
              onChange={(e) => handleChange('warehouse_id', e.target.value)}
              className={`w-full rounded-md border ${
                errors.warehouse_id ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
            {errors.warehouse_id && (
              <p className="mt-1 text-xs text-red-600">{errors.warehouse_id}</p>
            )}
          </div>

          {/* Dispatch To */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4 text-gray-400" />
              Dispatch to <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.dispatch_to_partner_id || ''}
              onChange={(e) => handleChange('dispatch_to_partner_id', e.target.value)}
              className={`w-full rounded-md border ${
                errors.dispatch_to ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            >
              <option value="">Select partner/customer</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.company_name} ({partner.partner_type})
                </option>
              ))}
            </select>
            {errors.dispatch_to && (
              <p className="mt-1 text-xs text-red-600">{errors.dispatch_to}</p>
            )}
          </div>

          {/* Agent */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4 text-gray-400" />
              Agent
            </label>
            <select
              value={formData.agent_id || ''}
              onChange={(e) => handleChange('agent_id', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select agent (optional)</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Dispatch Date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                Dispatch date
              </label>
              <input
                type="date"
                value={formData.dispatch_date}
                onChange={(e) => handleChange('dispatch_date', e.target.value)}
                className={`w-full rounded-md border ${
                  errors.dispatch_date ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              {errors.dispatch_date && (
                <p className="mt-1 text-xs text-red-600">{errors.dispatch_date}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                Due date
              </label>
              <input
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => handleChange('due_date', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Additional Details (Collapsible) */}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
              className="flex w-full items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span>Additional Details</span>
              {showAdditionalDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showAdditionalDetails && (
              <div className="mt-4 space-y-4">
                {/* Bill Number */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="h-4 w-4 text-gray-400" />
                    Bill number
                  </label>
                  <input
                    type="text"
                    value={formData.invoice_number || ''}
                    onChange={(e) => handleChange('invoice_number', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter bill/invoice number"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.invoice_amount || ''}
                    onChange={(e) => handleChange('invoice_amount', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Transport Details */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Truck className="h-4 w-4 text-gray-400" />
                    Transport details
                  </label>
                  <textarea
                    value={formData.transport_details || ''}
                    onChange={(e) => handleChange('transport_details', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    placeholder="Vehicle number, driver details, etc."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter reason for dispatch, discrepancy note, etc..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Dispatch...' : 'Create Dispatch'}
        </button>
      </div>
    </form>
  );
}
