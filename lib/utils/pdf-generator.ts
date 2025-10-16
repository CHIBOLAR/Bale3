import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { LabelLayoutConfig } from '@/lib/types/inventory';

interface QRLabelData {
  qr_code: string;
  fields: { label: string; value: string }[];
}

/**
 * Generates a PDF with QR code labels
 */
export async function generateQRCodesPDF(
  labels: QRLabelData[],
  batchName: string,
  layout: LabelLayoutConfig
): Promise<ArrayBuffer> {
  console.log(`Starting PDF generation for batch: ${batchName}, ${labels.length} labels`);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: layout.paperSize || 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const labelWidth = layout.labelWidth || 65;
  const labelHeight = layout.labelHeight || 40;
  const marginTop = layout.marginTop || 10;
  const marginLeft = layout.marginLeft || 10;
  const spacing = layout.spacing || 3;
  const qrSize = layout.qrSize || 30;
  const fontSize = layout.fontSize || 7;

  // Calculate labels per row and column based on page size
  const labelsPerRow = Math.floor((pageWidth - 2 * marginLeft + spacing) / (labelWidth + spacing));
  const labelsPerColumn = Math.floor((pageHeight - 2 * marginTop + spacing) / (labelHeight + spacing));
  const labelsPerPage = labelsPerRow * labelsPerColumn;

  console.log(`Page size: ${pageWidth}mm x ${pageHeight}mm`);
  console.log(`Label size: ${labelWidth}mm x ${labelHeight}mm`);
  console.log(`Layout: ${labelsPerRow} per row, ${labelsPerColumn} per column = ${labelsPerPage} per page`);
  console.log(`Total pages needed: ${Math.ceil(labels.length / labelsPerPage)}`);

  // Generate QR codes as data URLs
  const qrDataUrls = await Promise.all(
    labels.map(async (label) => {
      try {
        return await QRCode.toDataURL(label.qr_code, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: qrSize * 3.78, // Convert mm to pixels (roughly)
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
        return '';
      }
    })
  );

  // Draw labels
  labels.forEach((label, index) => {
    const pageIndex = Math.floor(index / labelsPerPage);
    const labelIndexOnPage = index % labelsPerPage;

    // Add new page if needed
    if (pageIndex > 0 && labelIndexOnPage === 0) {
      pdf.addPage();
    }

    const row = Math.floor(labelIndexOnPage / labelsPerRow);
    const col = labelIndexOnPage % labelsPerRow;

    const x = marginLeft + col * (labelWidth + spacing);
    const y = marginTop + row * (labelHeight + spacing);

    // Draw border (optional, for debugging)
    // pdf.setDrawColor(200);
    // pdf.rect(x, y, labelWidth, labelHeight);

    // Draw QR code
    const qrDataUrl = qrDataUrls[index];
    if (qrDataUrl) {
      pdf.addImage(qrDataUrl, 'PNG', x + 2, y + 2, qrSize, qrSize);
    }

    // Draw text fields
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');

    const textX = x + qrSize + 4;
    let textY = y + 4;
    const textWidth = labelWidth - qrSize - 8;

    // Draw first 3 fields next to QR code
    const fieldsNextToQR = label.fields.slice(0, 3);
    fieldsNextToQR.forEach((field) => {
      if (field.value) {
        // Draw label in bold
        pdf.setFont('helvetica', 'bold');
        const labelText = `${field.label}: `;
        const labelWidth = pdf.getTextWidth(labelText);
        pdf.text(labelText, textX, textY);

        // Draw value in normal
        pdf.setFont('helvetica', 'normal');
        const valueLines = pdf.splitTextToSize(field.value, textWidth - labelWidth);
        pdf.text(valueLines[0] || '', textX + labelWidth, textY);

        textY += fontSize * 0.4; // Line spacing
      }
    });

    // Draw remaining fields below
    textY = y + qrSize + 4;
    const fieldsBelow = label.fields.slice(3);
    fieldsBelow.forEach((field) => {
      if (field.value && textY < y + labelHeight - 2) {
        // Draw label in bold
        pdf.setFont('helvetica', 'bold');
        const labelText = `${field.label}: `;
        const labelTextWidth = pdf.getTextWidth(labelText);
        pdf.text(labelText, x + 2, textY);

        // Draw value in normal
        pdf.setFont('helvetica', 'normal');
        const valueLines = pdf.splitTextToSize(field.value, labelWidth - labelTextWidth - 4);
        pdf.text(valueLines[0] || '', x + 2 + labelTextWidth, textY);

        textY += fontSize * 0.4; // Line spacing
      }
    });
  });

  return pdf.output('arraybuffer');
}

/**
 * Helper to format field values
 */
export function formatFieldValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}
