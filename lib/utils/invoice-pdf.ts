/**
 * Invoice PDF Generator
 * Creates professional GST-compliant invoice PDFs
 */

export interface InvoicePDFData {
  // Invoice Info
  invoice_number: string;
  invoice_date: string;
  due_date?: string | null;

  // Company Info
  company: {
    name: string;
    address?: string;
    gstin?: string;
    phone?: string;
    email?: string;
    state?: string;
  };

  // Customer Info
  customer: {
    name: string;
    address?: string;
    gstin?: string;
    state?: string;
  };

  // Items
  items: Array<{
    description: string;
    hsn_code?: string;
    sac_code?: string;
    unit_of_measurement?: string;
    quantity: number;
    unit_rate: number;
    discount_amount?: number;
    taxable_amount: number;
    cgst_rate?: number;
    cgst_amount?: number;
    sgst_rate?: number;
    sgst_amount?: number;
    igst_rate?: number;
    igst_amount?: number;
    line_total: number;
  }>;

  // Totals
  subtotal: number;
  total_discount: number;
  taxable_amount: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  adjustment_amount?: number;
  total_amount: number;

  // GST Compliance
  place_of_supply?: string;
  invoice_type?: string;
  reverse_charge?: boolean;

  // Transport Details
  vehicle_number?: string;
  lr_rr_number?: string;
  lr_rr_date?: string;
  transport_mode?: string;
  transporter_name?: string;
  distance_km?: number;

  // E-Way Bill
  e_way_bill_number?: string;
  e_way_bill_date?: string;

  // E-Invoice
  e_invoice_irn?: string;
  e_invoice_qr?: string;

  // Additional
  notes?: string;
  is_credit_note?: boolean;
  credit_note_for?: string;
}

/**
 * Generates an invoice PDF
 * Lazy loads jsPDF to reduce bundle size
 */
export async function generateInvoicePDF(data: InvoicePDFData): Promise<ArrayBuffer> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth?: number, options?: any) => {
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y, options);
      return y + (lines.length * 5);
    }
    doc.text(text, x, y, options);
    return y + 5;
  };

  // ===== HEADER =====
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.is_credit_note ? 'CREDIT NOTE' : 'TAX INVOICE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Company Details (Left)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  yPos = addText(data.company.name, margin, yPos);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (data.company.address) {
    yPos = addText(data.company.address, margin, yPos, 80);
  }
  if (data.company.gstin) {
    yPos = addText(`GSTIN: ${data.company.gstin}`, margin, yPos);
  }
  if (data.company.phone) {
    yPos = addText(`Phone: ${data.company.phone}`, margin, yPos);
  }
  if (data.company.email) {
    yPos = addText(`Email: ${data.company.email}`, margin, yPos);
  }

  // Invoice Info (Right)
  const rightX = pageWidth - margin - 60;
  let rightY = 30;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoice_number, rightX + 25, rightY);
  rightY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(data.invoice_date).toLocaleDateString('en-IN'), rightX + 25, rightY);
  rightY += 5;

  if (data.due_date) {
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', rightX, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(data.due_date).toLocaleDateString('en-IN'), rightX + 25, rightY);
    rightY += 5;
  }

  if (data.is_credit_note && data.credit_note_for) {
    doc.setFont('helvetica', 'bold');
    doc.text('Against:', rightX, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.credit_note_for, rightX + 25, rightY);
  }

  yPos = Math.max(yPos, rightY) + 10;

  // ===== BILL TO =====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  yPos = addText('Bill To:', margin, yPos);

  doc.setFontSize(11);
  yPos = addText(data.customer.name, margin, yPos);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (data.customer.address) {
    yPos = addText(data.customer.address, margin, yPos, 80);
  }
  if (data.customer.state) {
    yPos = addText(`State: ${data.customer.state}`, margin, yPos);
  }
  if (data.customer.gstin) {
    yPos = addText(`GSTIN: ${data.customer.gstin}`, margin, yPos);
  }

  yPos += 5;

  // ===== ITEMS TABLE =====
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('#', margin + 2, yPos + 5);
  doc.text('Description', margin + 8, yPos + 5);
  doc.text('HSN/SAC', margin + 65, yPos + 5);
  doc.text('UOM', pageWidth - 125, yPos + 5);
  doc.text('Qty', pageWidth - 110, yPos + 5, { align: 'right' });
  doc.text('Rate', pageWidth - 90, yPos + 5, { align: 'right' });
  doc.text('Taxable', pageWidth - 65, yPos + 5, { align: 'right' });
  doc.text('GST', pageWidth - 45, yPos + 5, { align: 'right' });
  doc.text('Total', pageWidth - margin - 2, yPos + 5, { align: 'right' });

  yPos += 8;
  doc.setFont('helvetica', 'normal');

  // Item rows
  data.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    const gstAmount = (item.cgst_amount || 0) + (item.sgst_amount || 0) + (item.igst_amount || 0);
    const hsnSac = item.hsn_code || item.sac_code || '-';
    const uom = item.unit_of_measurement || 'PCS';

    doc.setFontSize(7);
    doc.text((index + 1).toString(), margin + 2, yPos + 4);

    const descLines = doc.splitTextToSize(item.description, 50);
    doc.text(descLines, margin + 8, yPos + 4);

    doc.text(hsnSac, margin + 65, yPos + 4);
    doc.text(uom, pageWidth - 125, yPos + 4);
    doc.text(item.quantity.toFixed(2), pageWidth - 110, yPos + 4, { align: 'right' });
    doc.text('₹' + item.unit_rate.toFixed(2), pageWidth - 90, yPos + 4, { align: 'right' });
    doc.text('₹' + item.taxable_amount.toFixed(2), pageWidth - 65, yPos + 4, { align: 'right' });
    doc.text('₹' + gstAmount.toFixed(2), pageWidth - 45, yPos + 4, { align: 'right' });
    doc.text('₹' + item.line_total.toFixed(2), pageWidth - margin - 2, yPos + 4, { align: 'right' });

    yPos += Math.max(descLines.length * 4, 6);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  });

  yPos += 5;

  // ===== TOTALS =====
  const totalsX = pageWidth - margin - 60;
  doc.setFont('helvetica', 'normal');

  doc.text('Subtotal:', totalsX, yPos);
  doc.text('₹' + data.subtotal.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
  yPos += 5;

  if (data.total_discount > 0) {
    doc.text('Discount:', totalsX, yPos);
    doc.text('-₹' + data.total_discount.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 5;
  }

  doc.text('Taxable Amount:', totalsX, yPos);
  doc.text('₹' + data.taxable_amount.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
  yPos += 5;

  if (data.cgst_total > 0) {
    doc.text('CGST:', totalsX, yPos);
    doc.text('₹' + data.cgst_total.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 5;

    doc.text('SGST:', totalsX, yPos);
    doc.text('₹' + data.sgst_total.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 5;
  }

  if (data.igst_total > 0) {
    doc.text('IGST:', totalsX, yPos);
    doc.text('₹' + data.igst_total.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 5;
  }

  if (data.adjustment_amount && data.adjustment_amount !== 0) {
    doc.text('Adjustment:', totalsX, yPos);
    doc.text((data.adjustment_amount > 0 ? '+' : '') + '₹' + data.adjustment_amount.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 5;
  }

  // Total line
  doc.setLineWidth(0.5);
  doc.line(totalsX - 5, yPos, pageWidth - margin, yPos);
  yPos += 5;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', totalsX, yPos);
  doc.text('₹' + data.total_amount.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });

  yPos += 10;

  // ===== TRANSPORT DETAILS =====
  if (data.vehicle_number || data.lr_rr_number || data.transport_mode || data.e_way_bill_number) {
    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    yPos = addText('Transport Details:', margin, yPos);
    yPos += 2;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const transportInfo: string[] = [];
    if (data.vehicle_number) transportInfo.push(`Vehicle: ${data.vehicle_number}`);
    if (data.transport_mode) transportInfo.push(`Mode: ${data.transport_mode}`);
    if (data.lr_rr_number) {
      const lrText = `LR/RR No.: ${data.lr_rr_number}${data.lr_rr_date ? ` (${new Date(data.lr_rr_date).toLocaleDateString('en-IN')})` : ''}`;
      transportInfo.push(lrText);
    }
    if (data.transporter_name) transportInfo.push(`Transporter: ${data.transporter_name}`);
    if (data.distance_km) transportInfo.push(`Distance: ${data.distance_km} km`);
    if (data.e_way_bill_number) {
      const ewbText = `E-Way Bill: ${data.e_way_bill_number}${data.e_way_bill_date ? ` (${new Date(data.e_way_bill_date).toLocaleDateString('en-IN')})` : ''}`;
      transportInfo.push(ewbText);
    }

    transportInfo.forEach(info => {
      yPos = addText(info, margin, yPos);
    });

    yPos += 3;
  }

  // ===== GST COMPLIANCE INFO =====
  if (data.place_of_supply || data.invoice_type || data.reverse_charge) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const gstInfo: string[] = [];
    if (data.place_of_supply) gstInfo.push(`Place of Supply: ${data.place_of_supply}`);
    if (data.invoice_type) gstInfo.push(`Invoice Type: ${data.invoice_type}`);
    if (data.reverse_charge) gstInfo.push('Reverse Charge: Yes');

    gstInfo.forEach(info => {
      yPos = addText(info, margin, yPos);
    });

    yPos += 3;
  }

  // ===== E-INVOICE QR CODE =====
  if (data.e_invoice_qr) {
    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    yPos = addText('E-Invoice QR Code:', margin, yPos);
    yPos += 3;

    // Add QR code placeholder (actual QR generation would require qrcode library)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    yPos = addText('(Scan for E-Invoice verification)', margin, yPos);

    if (data.e_invoice_irn) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      yPos = addText(`IRN: ${data.e_invoice_irn}`, margin, yPos, pageWidth - 2 * margin);
    }

    yPos += 5;
  }

  // ===== NOTES =====
  if (data.notes) {
    // Check if we need a new page
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    yPos = addText('Notes:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    yPos = addText(data.notes, margin, yPos, pageWidth - 2 * margin);
  }

  // ===== FOOTER =====
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated GST-compliant invoice', pageWidth / 2, pageHeight - 10, { align: 'center' });

  return doc.output('arraybuffer');
}
