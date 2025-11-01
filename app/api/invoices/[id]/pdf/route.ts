import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInvoicePDF } from '@/lib/utils/invoice-pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company
    const { data: userData } = await supabase
      .from('users')
      .select('company_id, companies!inner(name, address_line1, address_line2, city, state, country, pin_code, gst_number, phone, email)')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get invoice with all related data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*,
          products (name, material, color)
        ),
        partners:customer_id (
          company_name,
          first_name,
          last_name,
          billing_address,
          gstin,
          state
        )
      `)
      .eq('id', invoiceId)
      .eq('company_id', userData.company_id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Transform data for PDF
    const company = userData.companies as any;
    const customer = invoice.partners as any;
    const customerName = customer?.company_name ||
      `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim();

    // Build company address from separate fields
    const addressParts = [
      company.address_line1,
      company.address_line2,
      company.city,
      company.state,
      company.country,
      company.pin_code,
    ].filter(Boolean);
    const companyAddress = addressParts.join(', ');

    // Transform invoice items
    const pdfItems = invoice.invoice_items.map((item: any) => ({
      description: item.description || item.products?.name || '',
      quantity: parseFloat(item.quantity),
      unit_rate: parseFloat(item.unit_rate),
      discount_amount: item.discount_amount ? parseFloat(item.discount_amount) : undefined,
      taxable_amount: parseFloat(item.taxable_amount),
      cgst_rate: item.cgst_rate ? parseFloat(item.cgst_rate) : undefined,
      cgst_amount: item.cgst_amount ? parseFloat(item.cgst_amount) : undefined,
      sgst_rate: item.sgst_rate ? parseFloat(item.sgst_rate) : undefined,
      sgst_amount: item.sgst_amount ? parseFloat(item.sgst_amount) : undefined,
      igst_rate: item.igst_rate ? parseFloat(item.igst_rate) : undefined,
      igst_amount: item.igst_amount ? parseFloat(item.igst_amount) : undefined,
      line_total: parseFloat(item.line_total),
    }));

    // Calculate totals
    const cgstTotal = invoice.invoice_items.reduce(
      (sum: number, item: any) => sum + (parseFloat(item.cgst_amount) || 0),
      0
    );
    const sgstTotal = invoice.invoice_items.reduce(
      (sum: number, item: any) => sum + (parseFloat(item.sgst_amount) || 0),
      0
    );
    const igstTotal = invoice.invoice_items.reduce(
      (sum: number, item: any) => sum + (parseFloat(item.igst_amount) || 0),
      0
    );

    const pdfData = {
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      company: {
        name: company.name,
        address: companyAddress,
        gstin: company.gst_number,
        phone: company.phone,
        email: company.email,
        state: company.state,
      },
      customer: {
        name: customerName,
        address: customer?.billing_address,
        gstin: customer?.gstin,
        state: customer?.state,
      },
      items: pdfItems,
      subtotal: parseFloat(invoice.subtotal),
      total_discount: parseFloat(invoice.discount_amount) || 0,
      taxable_amount: parseFloat(invoice.subtotal) - (parseFloat(invoice.discount_amount) || 0),
      cgst_total: cgstTotal,
      sgst_total: sgstTotal,
      igst_total: igstTotal,
      adjustment_amount: invoice.adjustment_amount ? parseFloat(invoice.adjustment_amount) : undefined,
      total_amount: parseFloat(invoice.total_amount),
      notes: invoice.notes,
      is_credit_note: invoice.is_credit_note,
      credit_note_for: invoice.credit_note_for,
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(pdfData);

    // Return PDF as downloadable file
    const fileName = `${invoice.invoice_number.replace(/\//g, '-')}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
