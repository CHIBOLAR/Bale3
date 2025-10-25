import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStandardGoodsReceiptDetail } from '@/lib/queries/goods-receipts';
import { GoodsReceiptDetail } from '@/components/inventory/GoodsReceiptDetail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GoodsReceiptDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's company_id
  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData?.company_id) {
    redirect('/dashboard');
  }

  // Fetch goods receipt using standardized query
  const receipt = await getStandardGoodsReceiptDetail(id, userData.company_id);

  if (!receipt) {
    notFound();
  }

  return <GoodsReceiptDetail receipt={receipt} showBackButton={true} />;
}
