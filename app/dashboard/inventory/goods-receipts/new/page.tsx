import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GoodsReceiptForm from './GoodsReceiptForm';

export default async function NewGoodsReceiptPage() {
  const supabase = await createClient();

  // Get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's company_id and user id
  const { data: userData } = await supabase
    .from('users')
    .select('id, company_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!userData?.company_id) {
    redirect('/dashboard');
  }

  // Fetch all required data in parallel
  const [warehousesResult, productsResult, partnersResult] = await Promise.all([
    supabase
      .from('warehouses')
      .select('id, name')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('name'),
    supabase
      .from('products')
      .select('id, name, product_number, measuring_unit, material, color, product_images')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('name'),
    supabase
      .from('partners')
      .select('id, name, partner_code, partner_type')
      .eq('company_id', userData.company_id)
      .is('deleted_at', null)
      .order('name'),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <GoodsReceiptForm
          warehouses={warehousesResult.data || []}
          products={productsResult.data || []}
          partners={partnersResult.data || []}
          userId={userData.id}
          companyId={userData.company_id}
        />
      </div>
    </div>
  );
}
