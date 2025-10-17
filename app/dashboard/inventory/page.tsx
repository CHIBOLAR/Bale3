import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InventoryClient from './InventoryClient';

export default async function InventoryDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('*, company:companies(*)')
    .eq('auth_user_id', user.id)
    .single();

  const isDemo = !userData;
  let companyId = userData?.company_id;

  if (isDemo) {
    const { data: demoCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('is_demo', true)
      .single();
    companyId = demoCompany?.id;
  }

  // Get inventory stats
  const { count: totalStockUnits } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const { count: inStockUnits } = await supabase
    .from('stock_units')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'in_stock');

  const { count: totalReceipts } = await supabase
    .from('goods_receipts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const { count: totalDispatches } = await supabase
    .from('goods_dispatches')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const { count: qrBatches } = await supabase
    .from('barcode_batches')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const sections = [
    {
      title: 'Stock Units',
      description: 'View and manage all inventory stock units',
      icon: 'Package',
      href: '/dashboard/inventory/stock-units',
      color: 'bg-blue-500',
      count: totalStockUnits || 0,
    },
    {
      title: 'QR Codes',
      description: 'Generate and manage QR code labels',
      icon: 'QrCode',
      href: '/dashboard/inventory/qr-codes',
      color: 'bg-purple-500',
      count: qrBatches || 0,
    },
    {
      title: 'Goods Receipt',
      description: 'Record incoming inventory and create stock units',
      icon: 'ArrowDownToLine',
      href: '/dashboard/inventory/goods-receipts',
      color: 'bg-green-500',
      count: totalReceipts || 0,
    },
    {
      title: 'Goods Dispatch',
      description: 'Dispatch stock units to customers or warehouses',
      icon: 'ArrowUpFromLine',
      href: '/dashboard/inventory/goods-dispatch',
      color: 'bg-orange-500',
      count: totalDispatches || 0,
    },
  ];

  const stats = {
    totalStockUnits: totalStockUnits || 0,
    inStockUnits: inStockUnits || 0,
    totalReceipts: totalReceipts || 0,
    totalDispatches: totalDispatches || 0,
  };

  return <InventoryClient sections={sections} stats={stats} />;
}
