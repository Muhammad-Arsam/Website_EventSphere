export interface DiscountCode {
  id: string;
  eventId: string;
  code: string;
  discountValue: number;
  maxUses: number;
  timesUsed: number;
  status: 'ACTIVE' | 'INACTIVE';
  validUntil: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
}

export interface AddDiscountRequest {
  code: string;
  discountValue: number;
  maxUses: number;
  validUntil: string; // ISO datetime string e.g. "2026-06-01T10:47:12.642Z"
}

export interface UpdateDiscountRequest {
  code: string;
  discountValue: number;
  maxUses: number;
  validUntil: string;
}