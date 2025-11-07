/**
 * Sandbox E-Invoice Client
 * Handles IRN generation, cancellation, and e-invoice operations
 */

import {
  SandboxCredentials,
  EInvoiceRequest,
  EInvoiceResponse,
  EInvoiceCancelRequest,
  EInvoiceCancelResponse,
  SandboxAPIResponse,
} from './types';

const SANDBOX_BASE_URL = 'https://api.sandbox.co.in';

/**
 * Get base URL - Always use Sandbox.co.in as the API gateway
 * The 'environment' setting determines test vs live GST portal access
 */
function getBaseUrl(environment: 'sandbox' | 'production'): string {
  // Always use Sandbox.co.in - they provide the gateway to GST portal
  return SANDBOX_BASE_URL;
}

/**
 * Generate IRN for an invoice
 * Uses E-Invoice taxpayer access token (from username/password auth)
 */
export async function generateIRN(
  credentials: SandboxCredentials,
  eInvoiceAccessToken: string, // E-Invoice specific token, not OTP token
  invoiceData: EInvoiceRequest
): Promise<EInvoiceResponse> {
  const baseUrl = getBaseUrl(credentials.environment);

  try {
    console.log('🔵 E-Invoice IRN Generation Request:', {
      url: `${baseUrl}/gst/compliance/e-invoice/tax-payer/invoice`,
      headers: {
        'Content-Type': 'application/json',
        'authorization': eInvoiceAccessToken.substring(0, 20) + '...', // Masked token
        'x-api-key': credentials.apiKey.substring(0, 10) + '...',
        'x-api-version': '1.0.0',
      },
      invoiceNumber: invoiceData.DocDtls?.No,
    });

    const response = await fetch(`${baseUrl}/gst/compliance/e-invoice/tax-payer/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': eInvoiceAccessToken, // NO 'Bearer' prefix
        'x-api-key': credentials.apiKey,
        'x-api-version': '1.0.0', // MUST be 1.0.0, not 1.0
      },
      body: JSON.stringify(invoiceData),
    });

    console.log('🔵 E-Invoice IRN Response Status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.errorCode || 'IRN_GENERATION_FAILED',
          message: data.message || 'Failed to generate IRN',
          details: data.errors || data.details,
        },
      };
    }

    return {
      success: true,
      data: {
        Irn: data.Irn || data.irn,
        AckNo: data.AckNo || data.ackNo,
        AckDt: data.AckDt || data.ackDt,
        SignedInvoice: data.SignedInvoice || data.signedInvoice,
        SignedQRCode: data.SignedQRCode || data.signedQRCode,
        Status: data.Status || data.status || 'ACT',
        EwbNo: data.EwbNo || data.ewbNo,
        EwbDt: data.EwbDt || data.ewbDt,
        EwbValidTill: data.EwbValidTill || data.ewbValidTill,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Get e-invoice details by IRN
 * Uses E-Invoice taxpayer access token
 */
export async function getEInvoiceByIRN(
  credentials: SandboxCredentials,
  eInvoiceAccessToken: string, // E-Invoice token, not OTP token
  irn: string
): Promise<SandboxAPIResponse> {
  const baseUrl = getBaseUrl(credentials.environment);

  try {
    console.log('🔵 Fetching E-Invoice by IRN:', {
      url: `${baseUrl}/gst/compliance/tax-payer/e-invoice/${irn}`,
      headers: {
        'authorization': eInvoiceAccessToken.substring(0, 20) + '...',
        'x-api-key': credentials.apiKey.substring(0, 10) + '...',
        'x-api-version': '1.0',
      },
      irn: irn.substring(0, 20) + '...',
    });

    const response = await fetch(`${baseUrl}/gst/compliance/tax-payer/e-invoice/${irn}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'authorization': eInvoiceAccessToken, // NO 'Bearer' prefix
        'x-api-key': credentials.apiKey,
        'x-api-version': '1.0', // Note: GET uses 1.0, not 1.0.0
      },
    });

    console.log('🔵 E-Invoice Fetch Response Status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.errorCode || 'FETCH_FAILED',
          message: data.message || 'Failed to fetch e-invoice',
          httpStatus: response.status,
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Cancel an e-invoice
 * Note: Can only be cancelled within 24 hours of generation
 * Uses E-Invoice taxpayer access token (from username/password auth)
 */
export async function cancelIRN(
  credentials: SandboxCredentials,
  eInvoiceAccessToken: string, // E-Invoice specific token, not OTP token
  cancelRequest: EInvoiceCancelRequest
): Promise<EInvoiceCancelResponse> {
  const baseUrl = getBaseUrl(credentials.environment);

  try {
    console.log('🔵 E-Invoice IRN Cancellation Request:', {
      url: `${baseUrl}/gst/compliance/e-invoice/tax-payer/invoice/${cancelRequest.irn}/cancel`,
      headers: {
        'authorization': eInvoiceAccessToken.substring(0, 20) + '...', // Masked token
        'x-api-key': credentials.apiKey.substring(0, 10) + '...',
        'x-api-version': '1.0.0',
      },
      irn: cancelRequest.irn.substring(0, 20) + '...',
    });

    const response = await fetch(
      `${baseUrl}/gst/compliance/e-invoice/tax-payer/invoice/${cancelRequest.irn}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': eInvoiceAccessToken, // NO 'Bearer' prefix
          'x-api-key': credentials.apiKey,
          'x-api-version': '1.0.0', // MUST be 1.0.0, not 1.0
        },
        body: JSON.stringify({
          CnlRsn: cancelRequest.cancelReason,
          CnlRem: cancelRequest.cancelRemark,
        }),
      }
    );

    console.log('🔵 E-Invoice Cancellation Response Status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.errorCode || 'CANCELLATION_FAILED',
          message: data.message || 'Failed to cancel IRN',
          details: data.errors || data.details,
        },
      };
    }

    return {
      success: true,
      data: {
        Irn: data.Irn || data.irn,
        CancelDate: data.CancelDate || data.cancelDate,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Check if IRN can be cancelled (within 24 hours)
 */
export function canCancelIRN(ackDate: string): boolean {
  const ackTime = new Date(ackDate);
  const now = new Date();
  const hoursSinceAck = (now.getTime() - ackTime.getTime()) / (1000 * 60 * 60);

  return hoursSinceAck < 24;
}

/**
 * Get remaining time to cancel IRN (in hours)
 */
export function getRemainingCancellationTime(ackDate: string): number {
  const ackTime = new Date(ackDate);
  const now = new Date();
  const hoursSinceAck = (now.getTime() - ackTime.getTime()) / (1000 * 60 * 60);

  return Math.max(0, 24 - hoursSinceAck);
}

/**
 * Generate PDF for an e-invoice
 * Uses Sandbox access token (platform token, not e-invoice token)
 */
export async function generateEInvoicePDF(
  credentials: SandboxCredentials,
  sandboxAccessToken: string, // Platform token
  irn: string,
  signedInvoice: string,
  signedQRCode: string
): Promise<SandboxAPIResponse<{ pdfBase64: string; fileName: string }>> {
  const baseUrl = getBaseUrl(credentials.environment);

  try {
    const response = await fetch(`${baseUrl}/gst/compliance/e-invoice/pdf/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': sandboxAccessToken, // NO 'Bearer' prefix
        'x-api-key': credentials.apiKey,
        'x-api-version': '1.0.0',
      },
      body: JSON.stringify({
        '@entity': 'in.co.sandbox.gst.compliance.e-invoice.pdf.request',
        signed_qr_code: signedQRCode,
        irn: irn,
        signed_invoice: signedInvoice,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data.errorCode || 'PDF_GENERATION_FAILED',
          message: data.message || 'Failed to generate PDF',
          httpStatus: response.status,
        },
      };
    }

    return {
      success: true,
      data: {
        pdfBase64: data.pdf_base64,
        fileName: data.file_name,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
