"use client";

import React, { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Consumer, ConsumerStatus } from "@/types";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Send,
  Ban,
  MoreHorizontal,
  Download,
  Info,
  MessageSquare,
  ClipboardList,
  DollarSign,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  supabaseUpdateConsumer,
  supabaseDownloadZip,
  supabaseDownloadFile,
} from "@/lib/supabase/api";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";
import { ConsumerDetailsModal } from "@/components/ConsumerDetailsModal";
import { CommentsModal } from "@/components/CommentsModal";
import { WorkListModal } from "@/components/WorkListModal";
import { NewRegistrationModal } from "@/components/NewRegistrationModal";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const { consumers, refreshConsumers } = useData();
  const { currentAgent } = useAuth();

  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(
    null
  );
  const [actionType, setActionType] = useState<
    | "send_proposal"
    | "re_evaluation"
    | "enable_payment"
    | "forward_proposal"
    | "re_proposal"
    | "mark_paid"
    | "take_followup"
    | "mark_inactive"
    | "next_month"
    | null
  >(null);
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [workListModalOpen, setWorkListModalOpen] = useState(false);
  const [newRegistrationModalOpen, setNewRegistrationModalOpen] =
    useState(false);

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"full" | "installment">(
    "full"
  );
  const [installments, setInstallments] = useState("");

  // Mark paid dialog
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  const tabs = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "paid", label: "Paid" },
    { value: "evaluation", label: "Evaluation" },
    { value: "proposal", label: "Proposal" },
    { value: "sales", label: "Sales" },
  ];

  // Filtered consumers
  const filteredConsumers = useMemo(() => {
    let filtered = consumers;

    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter(
        (c) => !["Paid", "Inactive", "Next Month Prospect"].includes(c.status)
      );
    } else if (activeTab === "paid") {
      filtered = filtered.filter((c) => c.status === "Paid");
    } else if (activeTab === "evaluation") {
      filtered = filtered.filter((c) =>
        [
          "Evaluation Pending",
          "Evaluation Done",
          "Re-Evaluation Pending",
          "Re-Evaluation Done",
        ].includes(c.status)
      );
    } else if (activeTab === "proposal") {
      filtered = filtered.filter((c) =>
        [
          "Proposal Pending",
          "Proposal Done",
          "Re-Proposal Pending",
          "Re-Proposal Done",
        ].includes(c.status)
      );
    } else if (activeTab === "sales") {
      filtered = filtered.filter((c) =>
        [
          "Forward Proposal",
          "Sales Decision",
          "Follow-up Pending",
          "Follow-up Decision",
          "sales_forward_pending",
          "sales_forward_rejected",
          "sales_reply",
          "sales_followup_pending",
          "sales_followup_rejected",
        ].includes(c.status)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.consumerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.phone.includes(searchTerm)
      );
    }

    // Sort by last updated (most recent first)
    return filtered.sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }, [consumers, activeTab, searchTerm]);

  const handleAction = (consumer: Consumer, type: typeof actionType) => {
    setSelectedConsumer(consumer);
    setActionType(type);

    if (type === "enable_payment") {
      setPaymentDialogOpen(true);
    } else if (type === "mark_paid") {
      setMarkPaidDialogOpen(true);
    } else {
      setActionDialogOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedConsumer || !actionType) return;

    try {
      let newStatus: ConsumerStatus | undefined;
      let actionLabel = "";

      switch (actionType) {
        case "send_proposal":
          newStatus = "Proposal Pending";
          actionLabel = "Sent for Proposal";
          break;
        case "re_evaluation":
          newStatus = "Re-Evaluation Pending";
          actionLabel = "Sent for Re-Evaluation";
          break;
        case "forward_proposal":
          newStatus = "Forward Proposal";
          actionLabel = "Forwarded Proposal to Sales";
          break;
        case "re_proposal":
          newStatus = "Re-Proposal Pending";
          actionLabel = "Sent for Re-Proposal";
          break;
        case "take_followup":
          newStatus = "Follow-up Pending";
          actionLabel = "Taken for Follow-up";
          break;
        case "mark_inactive":
          newStatus = "Inactive";
          actionLabel = "Marked as Inactive";
          break;
        case "next_month":
          newStatus = "Next Month Prospect";
          actionLabel = "Moved to Next Month Prospect";
          break;
      }

      if (newStatus) {
        await supabaseUpdateConsumer(selectedConsumer.id, {
          status: newStatus,
          notes: [
            ...selectedConsumer.notes,
            {
              id: `N${Date.now()}`,
              text: note || actionLabel,
              createdBy: currentAgent!.id,
              createdByName: currentAgent!.name,
              createdAt: new Date().toISOString(),
              action: actionLabel,
            },
          ],
        });

        toast.success(actionLabel);
      }

      await refreshConsumers();
      setActionDialogOpen(false);
      setNote("");
      setSelectedConsumer(null);
      setActionType(null);
    } catch (error) {
      toast.error("Failed to perform action");
    }
  };

  const handleEnablePayment = async () => {
    if (!selectedConsumer || !paymentAmount) {
      toast.error("Please enter payment amount");
      return;
    }

    try {
      const payment = {
        serviceFee: parseFloat(paymentAmount),
        paymentType,
        ...(paymentType === "installment" && installments
          ? {
              installmentPlan: {
                numberOfInstallments: parseInt(installments),
                amountPerInstallment:
                  parseFloat(paymentAmount) / parseInt(installments),
              },
            }
          : {}),
      };

      await supabaseUpdateConsumer(selectedConsumer.id, {
        payment,
        notes: [
          ...selectedConsumer.notes,
          {
            id: `N${Date.now()}`,
            text: `Payment enabled: ₹${paymentAmount} (${paymentType})`,
            createdBy: currentAgent!.id,
            createdByName: currentAgent!.name,
            createdAt: new Date().toISOString(),
            action: "Payment Enabled",
          },
        ],
      });

      toast.success("Payment enabled successfully");

      await refreshConsumers();
      setPaymentDialogOpen(false);
      setPaymentAmount("");
      setPaymentType("full");
      setInstallments("");
      setSelectedConsumer(null);
    } catch (error) {
      toast.error("Failed to enable payment");
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedConsumer || !transactionId || !transactionDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await supabaseUpdateConsumer(selectedConsumer.id, {
        status: "Paid",
        payment: {
          ...selectedConsumer.payment!,
          transactionId,
          transactionDate,
          paidBy: currentAgent!.id,
          paidAt: new Date().toISOString(),
        },
        notes: [
          ...selectedConsumer.notes,
          {
            id: `N${Date.now()}`,
            text: `Payment received - Transaction ID: ${transactionId}`,
            createdBy: currentAgent!.id,
            createdByName: currentAgent!.name,
            createdAt: new Date().toISOString(),
            action: "Marked as Paid",
          },
        ],
      });

      toast.success("Consumer marked as paid");

      await refreshConsumers();
      setMarkPaidDialogOpen(false);
      setTransactionId("");
      setTransactionDate("");
      setSelectedConsumer(null);
    } catch (error) {
      toast.error("Failed to mark as paid");
    }
  };

  const handleAddComment = async (comment: string) => {
    if (!selectedConsumer) return;

    try {
      await supabaseUpdateConsumer(selectedConsumer.id, {
        notes: [
          ...selectedConsumer.notes,
          {
            id: `N${Date.now()}`,
            text: comment,
            createdBy: currentAgent!.id,
            createdByName: currentAgent!.name,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      await refreshConsumers();
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleSaveWorkList = async (workList: Consumer["workList"]) => {
    if (!selectedConsumer) return;

    try {
      await supabaseUpdateConsumer(selectedConsumer.id, { workList });
      await refreshConsumers();
      toast.success("Work list updated successfully");
    } catch (error) {
      toast.error("Failed to update work list");
    }
  };

  // Download handlers
  const handleDownloadBills = async (consumer: Consumer) => {
    try {
      const billFileNames = consumer.billFiles.map((f) => f.fileName);
      const blob = await supabaseDownloadZip(billFileNames);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${consumer.consumerNumber}_bills.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Bills downloaded successfully");
    } catch (error) {
      toast.error("Failed to download bills");
    }
  };

  const handleDownloadEvaluation = async (consumer: Consumer) => {
    try {
      const blob = await supabaseDownloadFile(
        consumer.evaluationSheet || "evaluation.xlsx"
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${consumer.consumerNumber}_evaluation.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Evaluation downloaded successfully");
    } catch (error) {
      toast.error("Failed to download evaluation");
    }
  };

  const handleDownloadProposal = async (consumer: Consumer) => {
    try {
      const blob = await supabaseDownloadFile(
        consumer.proposalSheet || "proposal.xlsx"
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${consumer.consumerNumber}_proposal.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Proposal downloaded successfully");
    } catch (error) {
      toast.error("Failed to download proposal");
    }
  };

  // Action renderer based on status groups
  const renderActions = (consumer: Consumer) => {
    const isEvaluationApprovalPending = [
      "Evaluation Done",
      "Re-Evaluation Done",
    ].includes(consumer.status);
    const isProposalApprovalPending = [
      "Proposal Done",
      "Re-Proposal Done",
    ].includes(consumer.status);
    const isSalesRejectedOrReply = [
      "sales_forward_rejected",
      "sales_followup_rejected",
      "sales_reply",
    ].includes(consumer.status);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1">
            <MoreHorizontal size={16} />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 z-50 bg-background">
          {/* Status-specific actions */}
          {isEvaluationApprovalPending && (
            <>
              <DropdownMenuItem
                onClick={() => handleAction(consumer, "send_proposal")}
                className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700"
              >
                <Send size={16} />
                Send for Proposal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction(consumer, "re_evaluation")}
                className="gap-2 cursor-pointer"
              >
                <XCircle size={16} />
                Re-evaluation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {isProposalApprovalPending && (
            <>
              <DropdownMenuItem
                onClick={() => handleAction(consumer, "enable_payment")}
                className="gap-2 cursor-pointer"
              >
                <DollarSign size={16} />
                Enable Payment
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction(consumer, "forward_proposal")}
                className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700"
              >
                <Send size={16} />
                Forward Proposal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction(consumer, "re_proposal")}
                className="gap-2 cursor-pointer"
              >
                <XCircle size={16} />
                Re-proposal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction(consumer, "re_evaluation")}
                className="gap-2 cursor-pointer"
              >
                <XCircle size={16} />
                Re-evaluation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {isSalesRejectedOrReply && (
            <>
              <DropdownMenuItem
                onClick={() => handleAction(consumer, "mark_paid")}
                className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700"
              >
                <CheckCircle size={16} />
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction(consumer, "take_followup")}
                className="gap-2 cursor-pointer"
              >
                <Send size={16} />
                Take Follow-up
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction(consumer, "re_proposal")}
                className="gap-2 cursor-pointer"
              >
                <XCircle size={16} />
                Re-proposal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction(consumer, "re_evaluation")}
                className="gap-2 cursor-pointer"
              >
                <XCircle size={16} />
                Re-evaluation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Common actions for all */}
          <DropdownMenuItem
            onClick={() => handleAction(consumer, "mark_inactive")}
            className="gap-2 cursor-pointer"
          >
            <Ban size={16} />
            Mark as Inactive
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleAction(consumer, "next_month")}
            className="gap-2 cursor-pointer"
          >
            <Send size={16} />
            Next Month Prospect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  console.log(consumers);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Admin Dashboard"
          description="Manage consumer lifecycle, approve evaluations and proposals"
        />
        <Button
          onClick={() => setNewRegistrationModalOpen(true)}
          className="gap-2"
        >
          <UserPlus size={16} />
          New Consumer
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by name, consumer number, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Reg. Date</TableHead>
                    <TableHead>Consumer Number</TableHead>
                    <TableHead>Bills</TableHead>
                    <TableHead>Evaluation</TableHead>
                    <TableHead>Work List</TableHead>
                    <TableHead>Proposal</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsumers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No consumers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConsumers.map((consumer) => (
                      <TableRow key={consumer.id}>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedConsumer(consumer);
                              setDetailsModalOpen(true);
                            }}
                            className="h-9 w-9 p-0"
                          >
                            <Info size={18} className="text-primary" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {new Date(consumer.registeredAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {consumer.consumerNumber}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadBills(consumer)}
                            className="gap-1"
                          >
                            <Download size={14} />
                            Download
                          </Button>
                        </TableCell>
                        <TableCell>
                          {consumer.evaluationSheet ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadEvaluation(consumer)}
                              className="gap-1"
                            >
                              <Download size={14} />
                              Download
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedConsumer(consumer);
                              setWorkListModalOpen(true);
                            }}
                            className="gap-1"
                          >
                            <ClipboardList size={14} />
                            View ({consumer.workList.length})
                          </Button>
                        </TableCell>
                        <TableCell>
                          {consumer.proposalSheet ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadProposal(consumer)}
                              className="gap-1"
                            >
                              <Download size={14} />
                              Download
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {consumer.payment ? (
                            <div className="text-sm">
                              <div className="font-medium">
                                ₹{consumer.payment.serviceFee}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {consumer.payment.paymentType}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Not set
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedConsumer(consumer);
                              setCommentsModalOpen(true);
                            }}
                            className="gap-1"
                          >
                            <MessageSquare size={14} />
                            {consumer.notes.length}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={consumer.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {renderActions(consumer)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "send_proposal"
                ? "Send for Proposal"
                : actionType === "re_evaluation"
                ? "Send for Re-Evaluation"
                : actionType === "forward_proposal"
                ? "Forward Proposal to Sales"
                : actionType === "re_proposal"
                ? "Send for Re-Proposal"
                : actionType === "take_followup"
                ? "Take for Follow-up"
                : actionType === "mark_inactive"
                ? "Mark as Inactive"
                : actionType === "next_month"
                ? "Move to Next Month Prospect"
                : "Confirm Action"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Notes (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes..."
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAction}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Service Fee Amount *</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Payment Type</Label>
              <select
                value={paymentType}
                onChange={(e) =>
                  setPaymentType(e.target.value as "full" | "installment")
                }
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                <option value="full">Full Payment</option>
                <option value="installment">Installment</option>
              </select>
            </div>
            {paymentType === "installment" && (
              <div>
                <Label>Number of Installments</Label>
                <Input
                  type="number"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  placeholder="Enter number of installments"
                  className="mt-2"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEnablePayment}>Enable Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={markPaidDialogOpen} onOpenChange={setMarkPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Transaction ID *</Label>
              <Input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Transaction Date *</Label>
              <Input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMarkPaidDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaid}>Mark as Paid</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <ConsumerDetailsModal
        consumer={selectedConsumer}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />

      <CommentsModal
        consumer={selectedConsumer}
        open={commentsModalOpen}
        onClose={() => setCommentsModalOpen(false)}
        onAddComment={handleAddComment}
      />

      <WorkListModal
        workList={selectedConsumer?.workList || []}
        open={workListModalOpen}
        onOpenChange={setWorkListModalOpen}
        onSave={handleSaveWorkList}
        readOnly={true}
      />

      <NewRegistrationModal
        open={newRegistrationModalOpen}
        onClose={() => setNewRegistrationModalOpen(false)}
      />
    </div>
  );
}
