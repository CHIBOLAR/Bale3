'use client'

import { useState } from 'react';
import { TruckIcon, CheckCircle, XCircle } from 'lucide-react';
import { GoodsDispatchStatus } from '@/lib/types/inventory';
import { updateDispatchStatus } from '@/app/actions/inventory/goods-dispatch';

interface GoodsDispatchClientProps {
  dispatchId: string;
  currentStatus: GoodsDispatchStatus;
}

export default function GoodsDispatchClient({ dispatchId, currentStatus }: GoodsDispatchClientProps) {
  const [status, setStatus] = useState<GoodsDispatchStatus>(currentStatus);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusUpdate = async (newStatus: GoodsDispatchStatus) => {
    setUpdatingStatus(true);
    try {
      const result = await updateDispatchStatus(dispatchId, newStatus);
      if (result.success) {
        setStatus(newStatus);
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-2">
      {status !== 'in_transit' && status !== 'delivered' && (
        <button
          onClick={() => handleStatusUpdate('in_transit')}
          disabled={updatingStatus}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <TruckIcon className="h-4 w-4" />
          Mark as In Transit
        </button>
      )}
      {status !== 'delivered' && status !== 'cancelled' && (
        <button
          onClick={() => handleStatusUpdate('delivered')}
          disabled={updatingStatus}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <CheckCircle className="h-4 w-4" />
          Mark as Delivered
        </button>
      )}
      {status === 'pending' && (
        <button
          onClick={() => handleStatusUpdate('cancelled')}
          disabled={updatingStatus}
          className="w-full flex items-center justify-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <XCircle className="h-4 w-4" />
          Cancel Dispatch
        </button>
      )}
    </div>
  );
}
