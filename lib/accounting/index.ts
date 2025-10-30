/**
 * Accounting Module - Public API
 * Phase 7 Week 2 - Core Accounting Engine
 *
 * This module provides core accounting functions for:
 * - Double-entry bookkeeping
 * - Ledger management
 * - GST calculation
 */

// Export all types
export type {
  JournalEntry,
  JournalEntryLine,
  DoubleEntryValidation,
  LedgerAccount,
  LedgerBalance,
  GSTCalculation,
  PartnerType,
  TransactionType,
} from './types';

// Export core functions
export {
  createJournalEntry,
  validateDoubleEntry,
} from './core';

// Export ledger functions
export {
  getOrCreateLedger,
  calculateLedgerBalance,
} from './ledger';

// Export GST functions
export {
  calculateGST,
  getGSTRate,
} from './gst';
