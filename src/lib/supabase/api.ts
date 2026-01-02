// Supabase API service layer
// This replaces the mockBackend functions with real Supabase calls

'use client';

import { createClient } from "./client";
import {
  Agent,
  Consumer,
  Session,
  ConsumerStatus,
  BillFile,
  WorkListItem,
  Note,
  Payment,
  AuditEntry,
} from "@/types";

// Lazy initialization to avoid build-time errors
let supabaseInstance: ReturnType<typeof createClient> | null = null;

const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
};

// Helper to generate IDs
const generateId = (prefix: string, length: number = 3): string => {
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}${String(random).padStart(length, "0")}`;
};

// ==================== AUTH FUNCTIONS ====================

export const supabaseLogin = async (
  username: string,
  password: string
): Promise<Session> => {
  // For now, we'll use a simple approach where we check the agent table
  // In production, you'd want to use Supabase Auth with proper password hashing
  const supabase = getSupabase();

  const { data: agent, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", username)
    .eq("active", true)
    .single();

  if (error || !agent) {
    throw new Error("Invalid credentials or inactive account");
  }

  // Simple password check (in production, use proper hashing)
  // For now, we'll store plain passwords in password_hash for migration
  if (agent.password_hash !== password) {
    throw new Error("Invalid credentials");
  }

  // Update last login
  await getSupabase()
    .from("agents")
    .update({ last_login: new Date().toISOString() })
    .eq("id", agent.id);

  const session: Session = {
    agent: {
      id: agent.id,
      name: agent.name,
      email: agent.email,
      password: agent.password_hash, // Keep for compatibility
      role: agent.role as Agent["role"],
      phone: agent.phone || "",
      active: agent.active,
      createdAt: agent.created_at,
      lastLogin: agent.last_login || undefined,
    },
    loginTime: new Date().toISOString(),
  };

  // Store session in localStorage (client-side only)
  if (typeof window !== 'undefined') {
    localStorage.setItem("msedcl_session", JSON.stringify(session));
  }

  return session;
};

export const supabaseLogout = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("msedcl_session");
  }
};

export const supabaseGetSession = (): Session | null => {
  if (typeof window === 'undefined') return null;
  
  const sessionData = localStorage.getItem("msedcl_session");
  return sessionData ? JSON.parse(sessionData) : null;
};

// ==================== AGENT FUNCTIONS ====================

export const supabaseFetchAgents = async (): Promise<Agent[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching agents:", error);
    throw new Error(`Failed to fetch agents: ${error.message || JSON.stringify(error)}`);
  }

  if (!data) {
    throw new Error("No data returned from agents query");
  }

  return data.map((agent) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email,
    password: agent.password_hash,
    role: agent.role as Agent["role"],
    phone: agent.phone || "",
    active: agent.active,
    createdAt: agent.created_at,
    lastLogin: agent.last_login || undefined,
  }));
};

export const supabaseCreateAgent = async (
  agentData: Omit<Agent, "createdAt">
): Promise<Agent> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("agents")
    .insert({
      id: agentData.id,
      name: agentData.name,
      email: agentData.email,
      password_hash: agentData.password, // In production, hash this
      role: agentData.role,
      phone: agentData.phone,
      active: agentData.active,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password_hash,
    role: data.role as Agent["role"],
    phone: data.phone || "",
    active: data.active,
    createdAt: data.created_at,
    lastLogin: data.last_login || undefined,
  };
};

export const supabaseUpdateAgent = async (
  agentId: string,
  updates: Partial<Agent>
): Promise<Agent> => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.email) updateData.email = updates.email;
  if (updates.password) updateData.password_hash = updates.password;
  if (updates.role) updateData.role = updates.role;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.active !== undefined) updateData.active = updates.active;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("agents")
    .update(updateData)
    .eq("id", agentId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password_hash,
    role: data.role as Agent["role"],
    phone: data.phone || "",
    active: data.active,
    createdAt: data.created_at,
    lastLogin: data.last_login || undefined,
  };
};

export const supabaseDeleteAgent = async (agentId: string): Promise<void> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("agents").delete().eq("id", agentId);

  if (error) throw error;
};

// ==================== CONSUMER FUNCTIONS ====================

export const supabaseFetchConsumers = async (): Promise<Consumer[]> => {
  // Fetch consumers with related data
  const supabase = getSupabase();
  const { data: consumers, error: consumersError } = await supabase
    .from("consumer_accounts")
    .select("*")
    .order("last_updated", { ascending: false });

  if (consumersError) {
    console.error("Error fetching consumers:", consumersError);
    throw new Error(`Failed to fetch consumers: ${consumersError.message || JSON.stringify(consumersError)}`);
  }

  if (!consumers) {
    return [];
  }

  // Fetch related data for each consumer
  const consumersWithData = await Promise.all(
    consumers.map(async (consumer) => {
      const [billFiles, workList, notes, payment, auditLog] = await Promise.all(
        [
          supabaseFetchBillFiles(consumer.id),
          supabaseFetchWorkList(consumer.id),
          supabaseFetchNotes(consumer.id),
          supabaseFetchPayment(consumer.id),
          supabaseFetchAuditLog(consumer.id),
        ]
      );

      return {
        id: consumer.id,
        consumerNumber: consumer.consumer_number,
        name: consumer.name,
        email: consumer.email || "",
        phone: consumer.phone || "",
        address: consumer.address || "",
        registeredAt: consumer.registered_at,
        registeredBy: consumer.registered_by || "",
        status: consumer.status as ConsumerStatus,
        billFiles,
        billDetailsExcel: consumer.bill_details_excel || "",
        evaluationSheet: consumer.evaluation_sheet || undefined,
        evaluationUploadedBy: consumer.evaluation_uploaded_by || undefined,
        evaluationUploadedAt: consumer.evaluation_uploaded_at || undefined,
        proposalSheet: consumer.proposal_sheet || undefined,
        proposalUploadedBy: consumer.proposal_uploaded_by || undefined,
        proposalUploadedAt: consumer.proposal_uploaded_at || undefined,
        workList,
        notes,
        payment,
        assignedTo: consumer.assigned_to || undefined,
        lastUpdated: consumer.last_updated,
        auditLog,
      };
    })
  );

  return consumersWithData;
};

export const supabaseRegisterConsumer = async (
  consumerData: Omit<
    Consumer,
    "id" | "registeredAt" | "lastUpdated" | "auditLog"
  >
): Promise<Consumer> => {
  const supabase = getSupabase();
  const consumerId = generateId("C", 3);

  // Insert consumer
  const { data: consumer, error: consumerError } = await supabase
    .from("consumer_accounts")
    .insert({
      id: consumerId,
      consumer_number: consumerData.consumerNumber,
      name: consumerData.name,
      email: consumerData.email,
      phone: consumerData.phone,
      address: consumerData.address,
      registered_by: consumerData.registeredBy,
      status: consumerData.status,
      bill_details_excel: consumerData.billDetailsExcel,
      assigned_to: consumerData.assignedTo,
    })
    .select()
    .single();

  if (consumerError) throw consumerError;

  // Insert bill files
  if (consumerData.billFiles.length > 0) {
    const billFilesData = consumerData.billFiles.map((bf) => ({
      consumer_account_id: consumerId,
      file_name: bf.fileName,
      month: bf.month,
      year: bf.year,
      storage_url: bf.downloadUrl,
    }));

    await supabase.from("bill_files").insert(billFilesData);
  }

  // Insert work list items
  if (consumerData.workList.length > 0) {
    const workListData = consumerData.workList.map((wl) => ({
      id: wl.id,
      consumer_account_id: consumerId,
      description: wl.description,
      category: wl.category,
      priority: wl.priority,
      completed_at: wl.completedAt,
    }));

    await supabase.from("work_list_items").insert(workListData);
  }

  // Insert notes
  if (consumerData.notes.length > 0) {
    const notesData = consumerData.notes.map((note) => ({
      id: note.id,
      consumer_account_id: consumerId,
      text: note.text,
      created_by: note.createdBy,
      created_by_name: note.createdByName,
      action: note.action,
    }));

    await supabase.from("notes").insert(notesData);
  }

  // Create audit log entry
  const auditId = generateId("A");
  await supabase.from("audit_logs").insert({
    id: auditId,
    consumer_account_id: consumerId,
    action: "Consumer Registered",
    performed_by: consumerData.registeredBy,
    performed_by_name: "System",
  });

  // Fetch the complete consumer
  return supabaseFetchConsumer(consumerId);
};

export const supabaseFetchConsumer = async (
  consumerId: string
): Promise<Consumer> => {
  const supabase = getSupabase();
  const { data: consumer, error } = await supabase
    .from("consumer_accounts")
    .select("*")
    .eq("id", consumerId)
    .single();

  if (error) throw error;

  const [billFiles, workList, notes, payment, auditLog] = await Promise.all([
    supabaseFetchBillFiles(consumerId),
    supabaseFetchWorkList(consumerId),
    supabaseFetchNotes(consumerId),
    supabaseFetchPayment(consumerId),
    supabaseFetchAuditLog(consumerId),
  ]);

  return {
    id: consumer.id,
    consumerNumber: consumer.consumer_number,
    name: consumer.name,
    email: consumer.email || "",
    phone: consumer.phone || "",
    address: consumer.address || "",
    registeredAt: consumer.registered_at,
    registeredBy: consumer.registered_by || "",
    status: consumer.status as ConsumerStatus,
    billFiles,
    billDetailsExcel: consumer.bill_details_excel || "",
    evaluationSheet: consumer.evaluation_sheet || undefined,
    evaluationUploadedBy: consumer.evaluation_uploaded_by || undefined,
    evaluationUploadedAt: consumer.evaluation_uploaded_at || undefined,
    proposalSheet: consumer.proposal_sheet || undefined,
    proposalUploadedBy: consumer.proposal_uploaded_by || undefined,
    proposalUploadedAt: consumer.proposal_uploaded_at || undefined,
    workList,
    notes,
    payment,
    assignedTo: consumer.assigned_to || undefined,
    lastUpdated: consumer.last_updated,
    auditLog,
  };
};

export const supabaseUpdateConsumer = async (
  consumerId: string,
  updates: Partial<Consumer>
): Promise<Consumer> => {
  const supabase = getSupabase();
  const updateData: any = {};
  if (updates.consumerNumber)
    updateData.consumer_number = updates.consumerNumber;
  if (updates.name) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.status) updateData.status = updates.status;
  if (updates.billDetailsExcel !== undefined)
    updateData.bill_details_excel = updates.billDetailsExcel;
  if (updates.evaluationSheet !== undefined)
    updateData.evaluation_sheet = updates.evaluationSheet;
  if (updates.evaluationUploadedBy !== undefined)
    updateData.evaluation_uploaded_by = updates.evaluationUploadedBy;
  if (updates.evaluationUploadedAt !== undefined)
    updateData.evaluation_uploaded_at = updates.evaluationUploadedAt;
  if (updates.proposalSheet !== undefined)
    updateData.proposal_sheet = updates.proposalSheet;
  if (updates.proposalUploadedBy !== undefined)
    updateData.proposal_uploaded_by = updates.proposalUploadedBy;
  if (updates.proposalUploadedAt !== undefined)
    updateData.proposal_uploaded_at = updates.proposalUploadedAt;
  if (updates.assignedTo !== undefined)
    updateData.assigned_to = updates.assignedTo;

  const { error } = await supabase
    .from("consumer_accounts")
    .update(updateData)
    .eq("id", consumerId);

  if (error) throw error;

  // Update related data if provided
  if (updates.billFiles) {
    // Delete existing and insert new
    await supabase.from("bill_files").delete().eq("consumer_account_id", consumerId);
    if (updates.billFiles.length > 0) {
      const billFilesData = updates.billFiles.map((bf) => ({
        consumer_account_id: consumerId,
        file_name: bf.fileName,
        month: bf.month,
        year: bf.year,
        storage_url: bf.downloadUrl,
      }));
      await supabase.from("bill_files").insert(billFilesData);
    }
  }

  if (updates.workList) {
    await supabase
      .from("work_list_items")
      .delete()
      .eq("consumer_account_id", consumerId);
    if (updates.workList.length > 0) {
      const workListData = updates.workList.map((wl) => ({
        id: wl.id,
        consumer_account_id: consumerId,
        description: wl.description,
        category: wl.category,
        priority: wl.priority,
        completed_at: wl.completedAt,
      }));
      await supabase.from("work_list_items").insert(workListData);
    }
  }

  if (updates.notes) {
    await supabase.from("notes").delete().eq("consumer_account_id", consumerId);
    if (updates.notes.length > 0) {
      const notesData = updates.notes.map((note) => ({
        id: note.id,
        consumer_account_id: consumerId,
        text: note.text,
        created_by: note.createdBy,
        created_by_name: note.createdByName,
        action: note.action,
      }));
      await supabase.from("notes").insert(notesData);
    }
  }

  if (updates.payment) {
    // Delete existing payment
    await supabase
      .from("consumer_payments")
      .delete()
      .eq("consumer_account_id", consumerId);

    if (updates.payment.transactionId) {
      // Insert new payment
      await supabase.from("consumer_payments").insert({
        consumer_account_id: consumerId,
        service_fee: updates.payment.serviceFee,
        payment_type: updates.payment.paymentType,
        number_of_installments:
          updates.payment.installmentPlan?.numberOfInstallments,
        amount_per_installment:
          updates.payment.installmentPlan?.amountPerInstallment,
        transaction_id: updates.payment.transactionId,
        transaction_date: updates.payment.transactionDate,
        receipt_url: updates.payment.receiptUrl,
        paid_by: updates.payment.paidBy,
        paid_at: updates.payment.paidAt,
      });
    }
  }

  return supabaseFetchConsumer(consumerId);
};

// ==================== HELPER FUNCTIONS ====================

const supabaseFetchBillFiles = async (
  consumerId: string
): Promise<BillFile[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bill_files")
    .select("*")
    .eq("consumer_account_id", consumerId)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) throw error;

  return data.map((bf) => ({
    fileName: bf.file_name,
    month: bf.month,
    year: bf.year,
    downloadUrl: bf.storage_url || "",
  }));
};

const supabaseFetchWorkList = async (
  consumerId: string
): Promise<WorkListItem[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("work_list_items")
    .select("*")
    .eq("consumer_account_id", consumerId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((wl) => ({
    id: wl.id,
    description: wl.description,
    category: wl.category,
    priority: wl.priority as WorkListItem["priority"],
    completedAt: wl.completed_at || undefined,
  }));
};

const supabaseFetchNotes = async (consumerId: string): Promise<Note[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("consumer_account_id", consumerId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((note) => ({
    id: note.id,
    text: note.text,
    createdBy: note.created_by,
    createdByName: note.created_by_name,
    createdAt: note.created_at,
    action: note.action || undefined,
  }));
};

const supabaseFetchPayment = async (
  consumerId: string
): Promise<Payment | undefined> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("consumer_payments")
    .select("*")
    .eq("consumer_account_id", consumerId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return undefined; // No rows returned
    throw error;
  }

  return {
    serviceFee: data.service_fee,
    paymentType: data.payment_type as Payment["paymentType"],
    installmentPlan: data.number_of_installments
      ? {
          numberOfInstallments: data.number_of_installments,
          amountPerInstallment: data.amount_per_installment,
        }
      : undefined,
    transactionId: data.transaction_id || undefined,
    transactionDate: data.transaction_date || undefined,
    receiptUrl: data.receipt_url || undefined,
    paidBy: data.paid_by || undefined,
    paidAt: data.paid_at || undefined,
  };
};

const supabaseFetchAuditLog = async (
  consumerId: string
): Promise<AuditEntry[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("consumer_account_id", consumerId)
    .order("timestamp", { ascending: false });

  if (error) throw error;

  return data.map((entry) => ({
    id: entry.id,
    action: entry.action,
    performedBy: entry.performed_by,
    performedByName: entry.performed_by_name,
    timestamp: entry.timestamp,
    details: entry.details || undefined,
  }));
};

// ==================== FILE OPERATIONS ====================

export const supabaseUploadFile = async (
  file: File,
  path?: string
): Promise<string> => {
  const supabase = getSupabase();
  // Generate path if not provided
  const filePath = path || `${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from("files")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("files").getPublicUrl(data.path);

  return publicUrl;
};

export const supabaseDownloadFile = async (
  urlOrPath: string
): Promise<Blob> => {
  const supabase = getSupabase();
  // If it's a full URL, fetch directly
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    const response = await fetch(urlOrPath);
    if (!response.ok) throw new Error("Failed to download file");
    return response.blob();
  }

  // Otherwise, treat as storage path and get signed URL
  const { data, error } = await supabase.storage
    .from("files")
    .download(urlOrPath);

  if (error) throw error;
  return data;
};

// Placeholder functions for compatibility
export const supabaseDownloadZip = async (
  fileNames: string[]
): Promise<Blob> => {
  // Implementation would create a zip from multiple files
  throw new Error("Not implemented yet");
};

export const supabaseExportToExcel = async (data: any[]): Promise<Blob> => {
  // Implementation would export to Excel
  throw new Error("Not implemented yet");
};
