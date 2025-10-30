/**
 * GST calculation functions
 * Phase 7 Week 2 - Core Accounting Engine
 */

import { createClient } from '@/lib/supabase/server';
import type { GSTCalculation } from './types';

/**
 * Calculates GST breakdown based on customer/supplier state
 *
 * For intra-state (same state): CGST + SGST (9% + 9% = 18%)
 * For inter-state (different state): IGST (18%)
 *
 * @param amount - The taxable amount (before GST)
 * @param customer_state - Customer/supplier's state code (e.g., 'MH' for Maharashtra)
 * @param company_state - Company's state code
 * @param gst_rate - GST rate percentage (default: 18)
 * @returns GST breakdown with CGST, SGST, IGST and totals
 *
 * @example
 * ```typescript
 * // Intra-state transaction (same state)
 * const gst1 = calculateGST(10000, 'MH', 'MH', 18);
 * // Returns: { cgst: 900, sgst: 900, igst: 0, total_gst: 1800, total_amount: 11800 }
 *
 * // Inter-state transaction (different states)
 * const gst2 = calculateGST(10000, 'GJ', 'MH', 18);
 * // Returns: { cgst: 0, sgst: 0, igst: 1800, total_gst: 1800, total_amount: 11800 }
 * ```
 */
export function calculateGST(
  amount: number,
  customer_state: string,
  company_state: string,
  gst_rate: number = 18
): GSTCalculation {
  // Determine if transaction is intra-state or inter-state
  const is_intra_state = customer_state === company_state;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (is_intra_state) {
    // Same state: CGST + SGST (each is half of total GST rate)
    const half_rate = gst_rate / 2;
    cgst = Math.round((amount * half_rate) / 100);
    sgst = Math.round((amount * half_rate) / 100);
  } else {
    // Different state: IGST only
    igst = Math.round((amount * gst_rate) / 100);
  }

  const total_gst = cgst + sgst + igst;
  const total_amount = amount + total_gst;

  return {
    cgst,
    sgst,
    igst,
    total_gst,
    total_amount,
  };
}

/**
 * Gets the default GST rate from company settings
 *
 * @param company_id - The company ID
 * @returns The default GST rate (defaults to 18% if not configured)
 *
 * @example
 * ```typescript
 * const rate = await getGSTRate('company-123');
 * // Returns: 18
 * ```
 */
export async function getGSTRate(company_id: string): Promise<number> {
  const supabase = await createClient();

  const { data: gst_settings } = await supabase
    .from('gst_settings')
    .select('default_gst_rate')
    .eq('company_id', company_id)
    .maybeSingle();

  // Return configured rate or default to 18%
  return gst_settings?.default_gst_rate || 18;
}
