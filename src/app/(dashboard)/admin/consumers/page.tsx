"use client";

import React, { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { NewRegistrationModal } from "@/components/NewRegistrationModal";
import { ConsumerDetailsModal } from "@/components/ConsumerDetailsModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Consumer, ConsumerStatus } from "@/types";
import {
  Plus,
  Search,
  Download,
  FileDown,
  Info,
  MoreHorizontal,
  Ban,
  Send,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  supabaseDownloadZip,
  supabaseExportToExcel,
  supabaseDownloadFile,
  supabaseUpdateConsumer,
} from "@/lib/supabase/api";

export const dynamic = "force-dynamic";

export default function ConsumerManagement() {
  const { consumers, refreshConsumers } = useData();
  const { currentAgent } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConsumerStatus | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredAndSortedConsumers = useMemo(() => {
    let filtered = [...consumers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.consumerNumber.includes(searchTerm) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison =
            new Date(a.registeredAt).getTime() -
            new Date(b.registeredAt).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [consumers, searchTerm, statusFilter, sortBy, sortOrder]);

  const paginatedConsumers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedConsumers.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedConsumers, currentPage]);

  const totalPages = Math.ceil(
    filteredAndSortedConsumers.length / itemsPerPage
  );

  const handleDownloadBills = async (consumer: Consumer) => {
    try {
      const blob = await supabaseDownloadZip(
        consumer.billFiles.map((b) => b.fileName)
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${consumer.consumerNumber}_bills.zip`;
      a.click();
      toast.success("Bills downloaded successfully");
    } catch (error) {
      toast.error("Failed to download bills");
    }
  };

  const handleDownloadData = async (consumer: Consumer) => {
    try {
      const blob = await supabaseDownloadFile(consumer.billDetailsExcel);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${consumer.consumerNumber}_data.xlsx`;
      a.click();
      toast.success("Data downloaded successfully");
    } catch (error) {
      toast.error("Failed to download data");
    }
  };

  const handleDownloadEvaluation = async (consumer: Consumer) => {
    if (!consumer.evaluationSheet) {
      toast.info("Evaluation not available");
      return;
    }
    try {
      const blob = await supabaseDownloadFile(consumer.evaluationSheet);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${consumer.consumerNumber}_evaluation.xlsx`;
      a.click();
      toast.success("Evaluation downloaded successfully");
    } catch (error) {
      toast.error("Failed to download evaluation");
    }
  };

  const handleDownloadProposal = async (consumer: Consumer) => {
    if (!consumer.proposalSheet) {
      toast.info("Proposal not available");
      return;
    }
    try {
      const blob = await supabaseDownloadFile(consumer.proposalSheet);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${consumer.consumerNumber}_proposal.xlsx`;
      a.click();
      toast.success("Proposal downloaded successfully");
    } catch (error) {
      toast.error("Failed to download proposal");
    }
  };

  const handleToggleActive = async (consumer: Consumer) => {
    try {
      const newStatus: ConsumerStatus =
        consumer.status === "Inactive" ? "Evaluation Pending" : "Inactive";
      await supabaseUpdateConsumer(consumer.id, {
        status: newStatus,
        notes: [
          ...consumer.notes,
          {
            id: `N${Date.now()}`,
            text: `Consumer marked as ${newStatus}`,
            createdBy: currentAgent!.id,
            createdByName: currentAgent!.name,
            createdAt: new Date().toISOString(),
            action:
              newStatus === "Inactive" ? "Marked Inactive" : "Marked Active",
          },
        ],
      });
      await refreshConsumers();
      toast.success(`Consumer marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleNextMonthProspect = async (consumer: Consumer) => {
    try {
      await supabaseUpdateConsumer(consumer.id, {
        status: "Next Month Prospect",
        notes: [
          ...consumer.notes,
          {
            id: `N${Date.now()}`,
            text: "Consumer moved to Next Month Prospect",
            createdBy: currentAgent!.id,
            createdByName: currentAgent!.name,
            createdAt: new Date().toISOString(),
            action: "Next Month Prospect",
          },
        ],
      });
      await refreshConsumers();
      toast.success("Consumer moved to Next Month Prospect");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleExportToExcel = async () => {
    try {
      toast.info("Preparing Excel file...");
      const exportData = filteredAndSortedConsumers.map((c) => ({
        ConsumerNumber: c.consumerNumber,
        Name: c.name,
        Email: c.email,
        Phone: c.phone,
        Status: c.status,
        RegisteredAt: new Date(c.registeredAt).toLocaleDateString(),
      }));
      const blob = await supabaseExportToExcel(exportData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "consumers_export.csv";
      a.click();
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Consumer Management</h1>
          <p className="text-gray-600">
            Comprehensive consumer database and operations
          </p>
        </div>
        <Button
          onClick={() => setRegistrationModalOpen(true)}
          className="gap-2"
        >
          <Plus size={18} />
          New Registration
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search by name, consumer number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v: any) => setStatusFilter(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Evaluation Pending">
                  Evaluation Pending
                </SelectItem>
                <SelectItem value="Evaluation Done">Evaluation Done</SelectItem>
                <SelectItem value="Admin Approval">Admin Approval</SelectItem>
                <SelectItem value="Proposal WIP">Proposal WIP</SelectItem>
                <SelectItem value="Proposal Ready">Proposal Ready</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Payment Enabled">Payment Enabled</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
            <div className="text-sm text-gray-600">
              Showing {paginatedConsumers.length} of{" "}
              {filteredAndSortedConsumers.length} consumers
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              className="gap-2"
            >
              <FileDown size={16} />
              Export to Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Consumer Name</TableHead>
                  <TableHead>Consumer Number</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>User Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedConsumers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No consumers found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedConsumers.map((consumer) => (
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
                      <TableCell className="font-semibold">
                        {consumer.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {consumer.consumerNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {consumer.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {consumer.phone}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={consumer.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                            >
                              <MoreHorizontal size={16} />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 z-50 bg-background"
                          >
                            <DropdownMenuItem
                              onClick={() => handleDownloadBills(consumer)}
                              className="gap-2 cursor-pointer"
                            >
                              <Download size={16} />
                              Bills
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadData(consumer)}
                              className="gap-2 cursor-pointer"
                            >
                              <Download size={16} />
                              Data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadEvaluation(consumer)}
                              className="gap-2 cursor-pointer"
                              disabled={!consumer.evaluationSheet}
                            >
                              <Download size={16} />
                              Evaluation
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadProposal(consumer)}
                              className="gap-2 cursor-pointer"
                              disabled={!consumer.proposalSheet}
                            >
                              <Download size={16} />
                              Proposal
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(consumer)}
                              className="gap-2 cursor-pointer"
                            >
                              {consumer.status === "Inactive" ? (
                                <>
                                  <CheckCircle size={16} />
                                  Mark as Active
                                </>
                              ) : (
                                <>
                                  <Ban size={16} />
                                  Mark as Inactive
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleNextMonthProspect(consumer)}
                              className="gap-2 cursor-pointer"
                            >
                              <Send size={16} />
                              Next Month Prospect
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <NewRegistrationModal
        open={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
      />

      <ConsumerDetailsModal
        consumer={selectedConsumer}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </div>
  );
}
