// Core type definitions for MSEDCL Bills Processor

export type Role = "evaluator" | "proposal_maker" | "sales" | "admin";

export type ConsumerStatus =
  | "Evaluation Pending"
  | "Evaluation Done"
  | "Re-Evaluation Pending"
  | "Re-Evaluation Done"
  | "Proposal Pending"
  | "Proposal Done"
  | "Re-Proposal Pending"
  | "Re-Proposal Done"
  | "Forward Proposal"
  | "Sales Decision"
  | "Follow-up Pending"
  | "Follow-up Decision"
  | "Paid"
  | "Inactive"
  | "Next Month Prospect"
  | "sales_forward_pending"
  | "sales_forward_rejected"
  | "sales_reply"
  | "sales_followup_pending"
  | "sales_followup_rejected";

export interface Agent {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface BillFile {
  fileName: string;
  month: string;
  year: number;
  downloadUrl: string; // simulated
}

export interface WorkListItem {
  id: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  completedAt?: string;
}

export interface Note {
  id: string;
  text: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  action?: string;
}

export interface Payment {
  serviceFee: number;
  paymentType: "full" | "installment";
  installmentPlan?: {
    numberOfInstallments: number;
    amountPerInstallment: number;
  };
  transactionId?: string;
  transactionDate?: string;
  receiptUrl?: string;
  paidBy?: string;
  paidAt?: string;
}

export interface Consumer {
  id: string;
  consumerNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registeredAt: string;
  registeredBy: string;
  status: ConsumerStatus;
  billFiles: BillFile[];
  billDetailsExcel: string;
  evaluationSheet?: string;
  evaluationUploadedBy?: string;
  evaluationUploadedAt?: string;
  proposalSheet?: string;
  proposalUploadedBy?: string;
  proposalUploadedAt?: string;
  workList: WorkListItem[];
  notes: Note[];
  payment?: Payment;
  assignedTo?: string;
  lastUpdated: string;
  auditLog: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details?: string;
}

export interface Session {
  agent: Agent;
  loginTime: string;
}
