import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InvoiceEditForm } from './InvoiceEditForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
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
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">User not assigned to a company</p>
      </div>
    );
  }

  const company_id = userData.company_id;

  // Fetch invoice with all related data
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      *,
      customers:partners!invoices_customer_id_fkey (
        id,
        first_name,
        last_name,
        company_name,
        gstin,
        state,
        address_line1,
        address_line2,
        city,
        pin_code,
        phone,
        email
      ),
      invoice_items (
        *,
        products (
          id,
          name,
          material,
          color
        )
      )
    `)
    .eq('id', id)
    .eq('company_id', company_id)
    .single();

  if (invoiceError || !invoice) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Invoice not found</p>
      </div>
    );
  }

  // Fetch company details
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', company_id)
    .single();

  if (!company) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Company details not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InvoiceEditForm
        invoice={invoice}
        customer={invoice.customers}
        company={company}
        items={invoice.invoice_items}
      />
    </div>
  );
}
