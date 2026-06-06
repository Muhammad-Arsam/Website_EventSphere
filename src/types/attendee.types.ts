export interface AttendeeTicket {
  ticketId: string;
  ticketReference: string;
  orderReference: string;
  eventName: string;
  eventDate: string;
  venue: string;
  tierName: string;
  assignedName: string;
  assignedCnic: string;
  assignedPhone: string;
  qrCodeHash: string;
  checkedIn: boolean;
}

export type AttendeeTicketsResponse = AttendeeTicket[];

export interface AttendeeOrder {
  orderId: string;
  orderReference: string;
  eventName: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export type AttendeeOrdersResponse = AttendeeOrder[];

export interface AttendeeEvent {
  title: string;
  organization: string;
  category: string;
  image: string;
  slug: string;
  start: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export type AttendeeEventsResponse = AttendeeEvent[];

export interface TransferTicketRequest {
  newName: string;
  newEmail: string;
  newCnic: string;
  newPhone: string;
}