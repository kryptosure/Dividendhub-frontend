import { insight as dbsQ3 } from './dbs-q3-2026-dividend-impact';
import { insight as sgxLot } from './sgx-lot-change-cost-analysis';
import { insight as withholdingTax } from './us-withholding-tax-visual-guide';

// Sort newest first
export const insights = [dbsQ3, sgxLot, withholdingTax].sort(
  (a, b) => new Date(b.date) - new Date(a.date)
);