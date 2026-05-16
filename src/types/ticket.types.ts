export interface TicketTier {
  id: string;
  eventId: string;
  tierName: string;
  price: number;
  totalCapacity: number;
  quantitySold: number;
  createdBy?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

export interface TicketTierPayload {
  tierName: string;
  price: number;
  totalCapacity: number;
}