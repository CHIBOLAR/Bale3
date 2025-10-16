'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Share2, Download, QrCode, Eye, CheckCircle2, Printer, Tag } from 'lucide-react';
import { BarcodeBatchWithRelations } from '@/lib/types/inventory';

interface QRCodesClientProps {
  batches: BarcodeBatchWithRelations[];
}

export default function QRCodesClient({ batches }: QRCodesClientProps) {
  const router = useRouter();

  const handleShare = async (batch: BarcodeBatchWithRelations, e: React.MouseEvent) => {
    e.stopPropagation();
    if (batch.pdf_url && navigator.share) {
      try {
        await navigator.share({
          title: batch.batch_name,
          text: `QR Code batch: ${batch.batch_name}`,
          url: batch.pdf_url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleDownload = (batch: BarcodeBatchWithRelations, e: React.MouseEvent) => {
    e.stopPropagation();
    if (batch.pdf_url) {
      window.open(batch.pdf_url, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      generated: { icon: CheckCircle2, label: 'Generated', color: 'bg-green-100 text-green-700' },
      printed: { icon: Printer, label: 'Printed', color: 'bg-blue-100 text-blue-700' },
      applied: { icon: Tag, label: 'Applied', color: 'bg-purple-100 text-purple-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.generated;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  if (batches.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-sm">
        <QrCode className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No QR code batches</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by generating QR codes for your stock units
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/inventory/qr-codes/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Generate QR Codes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {batches.map((batch) => (
        <div
          key={batch.id}
          className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
        >
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{batch.batch_name}</h3>
                  {getStatusBadge(batch.status)}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-gray-500">QR Codes</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{batch.items_count || 0} units</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Warehouse</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {batch.warehouses?.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {new Date(batch.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Pages</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      ~{Math.ceil((batch.items_count || 0) / 12)} {Math.ceil((batch.items_count || 0) / 12) === 1 ? 'page' : 'pages'}
                    </p>
                  </div>
                </div>

                {batch.notes && (
                  <div className="mt-3">
                    <p className="text-xs text-amber-600">
                      ⚠️ {batch.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <button
                onClick={() => router.push(`/dashboard/inventory/qr-codes/${batch.id}`)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>

              <div className="flex items-center gap-2">
                {batch.pdf_url ? (
                  <>
                    {navigator.share && (
                      <button
                        onClick={(e) => handleShare(batch, e)}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDownload(batch, e)}
                      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-gray-500 italic">PDF not available</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
