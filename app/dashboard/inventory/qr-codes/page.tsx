import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import QRCodesClient from './QRCodesClient';

export default async function QRCodesPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get user details
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id')
    .eq('auth_user_id', user.id)
    .single();

  if (userError || !userData?.company_id) {
    redirect('/dashboard');
  }

  // Fetch barcode batches
  const { data: batches } = await supabase
    .from('barcode_batches')
    .select(
      `
      *,
      warehouses (id, name)
    `
    )
    .eq('company_id', userData.company_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Get item counts for each batch
  const batchesWithCounts = await Promise.all(
    (batches || []).map(async (batch: any) => {
      const { count } = await supabase
        .from('barcode_batch_items')
        .select('*', { count: 'exact', head: true })
        .eq('batch_id', batch.id);

      return {
        ...batch,
        items_count: count || 0,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
              <p className="mt-1 text-sm text-gray-600">
                Generate and manage QR code labels for your inventory
              </p>
            </div>
            <Link
              href="/dashboard/inventory/qr-codes/new"
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Generate QR Codes
            </Link>
          </div>
        </div>

        {/* Client Component with batches list */}
        <QRCodesClient batches={batchesWithCounts} />
      </div>
    </div>
  );
}
