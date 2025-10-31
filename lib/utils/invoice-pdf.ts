/**
 * Invoice PDF Generator - GST Compliant
 * Creates professional GST-compliant invoice PDFs per Section 31 CGST Act 2017
 * All mandatory fields included
 */

export interface InvoicePDFData {
  // Invoice Info
  invoice_number: string;
  invoice_date: string;
  due_date?: string | null;

  // Company Info (FULL details required)
  company: {
    name: string;
    address?: string;
    gstin?: string;
    phone?: string;
    email?: string;
    state?: string;
  };

  // Customer Info (FULL details required)
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

  // GST Compliance (MANDATORY)
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
 * Generates a GST-compliant invoice PDF
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
  const margin = 12;
  let yPos = margin;

  // ===== HEADER SECTION =====
  // Company Name (LARGE, NO LOGO - as per user requirement)
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company.name, margin, yPos);
  yPos += 6;

  // Company Address (FULL - GST mandatory)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (data.company.address) {
    const addressLines = doc.splitTextToSize(data.company.address, 90);
    doc.text(addressLines, margin, yPos);
    yPos += addressLines.length * 4;
  }

  // Company GSTIN and State (MANDATORY)
  if (data.company.gstin) {
    doc.text(`GSTIN: ${data.company.gstin}`, margin, yPos);
    yPos += 4;
  }
  if (data.company.state) {
    doc.text(`State: ${data.company.state}`, margin, yPos);
    yPos += 4;
  }
  if (data.company.phone) {
    doc.text(`Phone: ${data.company.phone}`, margin, yPos);
    yPos += 4;
  }
  if (data.company.email) {
    doc.text(`Email: ${data.company.email}`, margin, yPos);
    yPos += 4;
  }

  // Top-right info box with background
  const boxX = pageWidth - margin - 72;
  const boxY = 12;
  const boxWidth = 72;
  const boxHeight = 55;

  doc.setFillColor(240, 240, 240);
  doc.setDrawColor(200, 200, 200);
  doc.rect(boxX, boxY, boxWidth, boxHeight, 'FD');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', boxX + boxWidth / 2, boxY + 6, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No:', boxX + 2, boxY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoice_number, boxX + 22, boxY + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', boxX + 2, boxY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(data.invoice_date).toLocaleDateString('en-IN'), boxX + 22, boxY + 20);

  if (data.due_date) {
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', boxX + 2, boxY + 26);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(data.due_date).toLocaleDateString('en-IN'), boxX + 22, boxY + 26);
  }

  // Place of Supply (MANDATORY)
  if (data.place_of_supply) {
    doc.setFont('helvetica', 'bold');
    doc.text('Place of Supply:', boxX + 2, boxY + 32);
    doc.setFont('helvetica', 'normal');
    const placeText = doc.splitTextToSize(data.place_of_supply, boxWidth - 4);
    doc.text(placeText, boxX + 2, boxY + 37);
  }

  // Invoice Type Badge (B2B/B2C)
  if (data.invoice_type) {
    doc.setFillColor(59, 130, 246);
    doc.rect(boxX + 2, boxY + 43, 20, 6, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(data.invoice_type, boxX + 12, boxY + 47.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }

  // Reverse Charge (MANDATORY indicator)
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reverse Charge: ${data.reverse_charge ? 'Yes' : 'No'}`, boxX + 25, boxY + 47.5);

  yPos = Math.max(yPos, boxY + boxHeight) + 8;

  // ===== BILL TO SECTION =====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, yPos);
  yPos += 5;

  // Customer Name
  doc.setFontSize(11);
  doc.text(data.customer.name, margin, yPos);
  yPos += 5;

  // Customer Address (FULL - GST mandatory)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (data.customer.address) {
    const custAddressLines = doc.splitTextToSize(data.customer.address, 90);
    doc.text(custAddressLines, margin, yPos);
    yPos += custAddressLines.length * 4;
  }

  // Customer State (MANDATORY)
  if (data.customer.state) {
    doc.text(`State: ${data.customer.state}`, margin, yPos);
    yPos += 4;
  }

  // Customer GSTIN (MANDATORY for B2B)
  if (data.customer.gstin) {
    doc.text(`GSTIN: ${data.customer.gstin}`, margin, yPos);
    yPos += 4;
  }

  yPos += 6;

  // ===== ITEMS TABLE WITH BORDERS =====
  const col1X = margin;
  const col2X = margin + 8;
  const col3X = margin + 78;
  const col4X = margin + 105;
  const col5X = margin + 120;
  const col6X = margin + 138;
  const col7X = margin + 158;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'S');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('#', col1X + 2, yPos + 5);
  doc.text('Description', col2X + 2, yPos + 5);
  doc.text('HSN/SAC', col3X + 2, yPos + 5);
  doc.text('UOM', col4X + 2, yPos + 5);
  doc.text('Qty', col5X + 2, yPos + 5);
  doc.text('Rate', col6X + 2, yPos + 5, { align: 'right' });
  doc.text('Amount', col7X + 2, yPos + 5, { align: 'right' });

  yPos += 8;

  // Table rows with borders
  doc.setFont('helvetica', 'normal');
  data.items.forEach((item, index) => {
    // Check for page break
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    const itemStartY = yPos;
    const rowHeight = 6;

    // Draw borders
    doc.setDrawColor(220, 220, 220);
    doc.rect(margin, itemStartY, pageWidth - 2 * margin, rowHeight);

    // Content
    doc.setFontSize(7);
    doc.text((index + 1).toString(), col1X + 2, itemStartY + 4);

    const descLines = doc.splitTextToSize(item.description, 65);
    doc.text(descLines[0] || '', col2X + 2, itemStartY + 4);

    const hsnSac = item.hsn_code || item.sac_code || '-';
    doc.text(hsnSac, col3X + 2, itemStartY + 4);

    const uom = item.unit_of_measurement || 'PCS';
    doc.text(uom, col4X + 2, itemStartY + 4);

    doc.text(item.quantity.toFixed(2), col5X + 2, itemStartY + 4);
    doc.text('₹' + item.unit_rate.toFixed(2), col6X + 2, itemStartY + 4, { align: 'right' });
    doc.text('₹' + item.line_total.toFixed(2), col7X + 2, itemStartY + 4, { align: 'right' });

    yPos += rowHeight;

    // Tax breakdown with RATES (MANDATORY - user correction)
    const taxLines: string[] = [];
    if (item.cgst_rate && item.cgst_amount) {
      taxLines.push(`CGST @${item.cgst_rate}%: ₹${item.cgst_amount.toFixed(2)}`);
    }
    if (item.sgst_rate && item.sgst_amount) {
      taxLines.push(`SGST @${item.sgst_rate}%: ₹${item.sgst_amount.toFixed(2)}`);
    }
    if (item.igst_rate && item.igst_amount) {
      taxLines.push(`IGST @${item.igst_rate}%: ₹${item.igst_amount.toFixed(2)}`);
    }

    if (taxLines.length > 0) {
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text(taxLines.join(' | '), col2X + 2, yPos + 3);
      doc.setTextColor(0, 0, 0);
      yPos += 4;
    }
  });

  yPos += 4;

  // ===== TOTALS SECTION WITH TAX RATES =====
  const totalsX = pageWidth - margin - 60;

  doc.setFontSize(8);
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

  // Tax breakdown with RATES (MANDATORY)
  if (data.cgst_total > 0) {
    // Calculate CGST rate from first item
    const cgstRate = data.items.find(i => i.cgst_rate)?.cgst_rate || 0;
    doc.text(`CGST @ ${cgstRate}%:`, totalsX, yPos);
    doc.text('₹' + data.cgst_total.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 5;

    doc.text(`SGST @ ${cgstRate}%:`, totalsX, yPos);
    doc.text('₹' + data.sgst_total.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 5;
  }

  if (data.igst_total > 0) {
    const igstRate = data.items.find(i => i.igst_rate)?.igst_rate || 0;
    doc.text(`IGST @ ${igstRate}%:`, totalsX, yPos);
    doc.text('₹' + data.igst_total.toFixed(2), pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 5;
  }

  if (data.adjustment_amount && data.adjustment_amount !== 0) {
    doc.text('Adjustment:', totalsX, yPos);
    doc.text(
      (data.adjustment_amount > 0 ? '+' : '') + '₹' + data.adjustment_amount.toFixed(2),
      pageWidth - margin - 2,
      yPos,
      { align: 'right' }
    );
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
  if (
    data.vehicle_number ||
    data.lr_rr_number ||
    data.transport_mode ||
    data.e_way_bill_number
  ) {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Transport Details:', margin, yPos);
    yPos += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const transportInfo: string[] = [];
    if (data.vehicle_number) transportInfo.push(`Vehicle: ${data.vehicle_number}`);
    if (data.transport_mode) transportInfo.push(`Mode: ${data.transport_mode}`);
    if (data.lr_rr_number) {
      const lrText = `LR/RR No.: ${data.lr_rr_number}${
        data.lr_rr_date
          ? ` (${new Date(data.lr_rr_date).toLocaleDateString('en-IN')})`
          : ''
      }`;
      transportInfo.push(lrText);
    }
    if (data.transporter_name) transportInfo.push(`Transporter: ${data.transporter_name}`);
    if (data.distance_km) transportInfo.push(`Distance: ${data.distance_km} km`);
    if (data.e_way_bill_number) {
      const ewbText = `E-Way Bill: ${data.e_way_bill_number}${
        data.e_way_bill_date
          ? ` (${new Date(data.e_way_bill_date).toLocaleDateString('en-IN')})`
          : ''
      }`;
      transportInfo.push(ewbText);
    }

    transportInfo.forEach((info) => {
      doc.text(info, margin, yPos);
      yPos += 4;
    });

    yPos += 3;
  }

  // ===== NOTES/TERMS =====
  if (data.notes) {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', margin, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const notesLines = doc.splitTextToSize(data.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
    yPos += notesLines.length * 4 + 5;
  }

  // ===== AUTHORIZED SIGNATORY (MANDATORY) =====
  // Position at bottom right
  const sigY = pageHeight - 30;
  const sigX = pageWidth - margin - 50;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`For ${data.company.name}`, sigX, sigY);
  doc.line(sigX, sigY + 8, sigX + 45, sigY + 8); // Signature line
  doc.setFont('helvetica', 'italic');
  doc.text('Authorized Signatory', sigX + 22.5, sigY + 12, { align: 'center' });

  // ===== FOOTER (MANDATORY) =====
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(
    'This is a computer-generated GST-compliant invoice',
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  return doc.output('arraybuffer');
}
