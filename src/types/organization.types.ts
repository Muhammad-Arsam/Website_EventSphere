export interface Organization {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  pendingBalance: number;
  status: string;
  planId: string;
  subscriptionStatus: string;
  subscriptionEndDate: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
}

export interface CreateOrganizationData {
  name: string;
  email: string;
  image: File;
}

export interface UpdateOrganizationData {
  name?: string;
  email?: string;
  image?: File;
}

// --- WALLET TYPES ---

export interface WalletTransaction {
  transactionId: string;
  amount: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

export interface OrganizationWallet {
  availableBalance: number;
  recentTransactions: WalletTransaction[];
}