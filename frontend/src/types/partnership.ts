export type PartnershipStatus = "pending" | "reviewed" | "approved" | "rejected";

export interface PartnershipRequest {
  id: number;
  full_name: string;
  company_name: string;
  phone: string;
  email: string;
  message: string;
  status: PartnershipStatus;
  created_at: string;
}

export const PARTNERSHIP_STATUS_LABELS: Record<PartnershipStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  approved: "Approved",
  rejected: "Rejected",
};

export interface PartnershipRequestPayload {
  full_name: string;
  company_name?: string;
  phone: string;
  email?: string;
  message?: string;
}
