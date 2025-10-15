'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Share2, Download, QrCode } from 'lucide-react';
import { BarcodeBatchWithRelations } from '@/lib/types/inventory';

interface QRCodesClientProps {
  batches: BarcodeBatchWithRelations[];
}

export default function QRCodesClient({ batches }: QRCodesClientProps) {
  const router = useRouter();

  const handleShare = async (batch: BarcodeBatchWithRelations) => {
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

  const handleDownload = (batch: BarcodeBatchWithRelations) => {
    if (batch.pdf_url) {
      window.open(batch.pdf_url, '_blank');
    }
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
    <div className="space-y-3">
      {batches.map((batch) => (
        <div
          key={batch.id}
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <button
            onClick={() => router.push(`/dashboard/inventory/qr-codes/${batch.id}`)}
            className="flex-1 text-left"
          >
            <h3 className="font-medium text-gray-900">{batch.batch_name}</h3>
            <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
              <span>{batch.items_count || 0} codes</span>
              <span>•</span>
              <span>Created on {new Date(batch.created_at).toLocaleDateString()}</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {batch.pdf_url && (
              <>
                <button
                  onClick={() => handleShare(batch)}
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDownload(batch)}
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
