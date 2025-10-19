'use client'

import { useRouter } from 'next/navigation';
import { QrCode, MapPin, Calendar, Award } from 'lucide-react';
import { StockUnitWithRelations, StockUnitStatus } from '@/lib/types/inventory';

interface StockUnitsTableProps {
  stockUnits: StockUnitWithRelations[];
}

export default function StockUnitsTable({ stockUnits }: StockUnitsTableProps) {
  const router = useRouter();

  const handleRowClick = (unitId: string) => {
    router.push(`/dashboard/inventory/stock-units/${unitId}`);
  };

  const getStatusBadge = (status: StockUnitStatus) => {
    const styles: Record<StockUnitStatus, string> = {
      received: 'bg-blue-100 text-blue-800',
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      dispatched: 'bg-purple-100 text-purple-800',
      removed: 'bg-red-100 text-red-800',
    };

    const labels: Record<StockUnitStatus, string> = {
      received: 'Received',
      available: 'Available',
      reserved: 'Reserved',
      dispatched: 'Dispatched',
      removed: 'Removed',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Unit Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              QR Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Warehouse
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Quality
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Received
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {stockUnits.map((unit) => (
            <tr
              key={unit.id}
              onClick={() => handleRowClick(unit.id)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-gray-400" />
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {unit.unit_number}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="font-mono text-xs text-gray-600">
                  {unit.qr_code}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {unit.products.name}
                  </div>
                  <div className="text-gray-500">
                    {unit.products.material}, {unit.products.color}
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {unit.warehouses.name}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="text-sm text-gray-900">
                  {unit.size_quantity} mtr
                </span>
                {unit.wastage > 0 && (
                  <span className="ml-1 text-xs text-red-600">
                    (-{unit.wastage})
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {unit.quality_grade}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {getStatusBadge(unit.status)}
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-900">
                  {unit.location_description}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(unit.date_received).toLocaleDateString()}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
