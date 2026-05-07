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