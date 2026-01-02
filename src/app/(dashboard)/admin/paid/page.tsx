"use client";

import React, { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Consumer } from "@/types";
import { Download, FileText, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  supabaseDownloadFile,
  supabaseExportToExcel,
} from "@/lib/supabase/api";

export const dynamic = "force-dynamic";

export default function PaidConsumers() {
  const { consumers } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(
    null
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("consumer");

  const paidConsumers = useMemo(() => {
    return consumers.filter((c) => c.status === "Paid");
  }, [consumers]);

  const filtered = useMemo(() => {
    if (!searchTerm) return paidConsumers;

    return paidConsumers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.consumerNumber.includes(searchTerm) ||
        c.payment?.transactionId
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [paidConsumers, searchTerm]);

  const totalRevenue = useMemo(() => {
    return paidConsumers.reduce(
      (sum, c) => sum + (c.payment?.serviceFee || 0),
      0
    );
  }, [paidConsumers]);

  const handleExport = async () => {
    try {
      const exportData = filtered.map((c) => ({
        "Consumer Number": c.consumerNumber,
        Name: c.name,
        Phone: c.phone,
        Email: c.email,
        "Service Fee": c.payment?.serviceFee || 0,
        "Payment Type": c.payment?.paymentType || "",
        "Transaction ID": c.payment?.transactionId || "",
        "Transaction Date": c.payment?.transactionDate || "",
        "Paid At": c.payment?.paidAt || "",
      }));

      const blob = await supabaseExportToExcel(exportData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `paid_consumers_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleViewDetails = (consumer: Consumer) => {
    setSelectedConsumer(consumer);
    setDetailsDialogOpen(true);
    setActiveTab("consumer");
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold mb-2">Paid Consumers</h1>
        <p className="text-muted-foreground">
          View and manage paid consumer records
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {paidConsumers.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ₹{totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Fee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ₹
              {paidConsumers.length > 0
                ? Math.round(
                    totalRevenue / paidConsumers.length
                  ).toLocaleString()
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Paid Consumer Records</CardTitle>
            <div className="flex gap-3 items-center">
              <div className="relative w-80">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  placeholder="Search by name, number, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleExport}
                variant="outline"
                className="gap-2"
              >
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table view */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b sticky top-0">
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold uppercase">
                      Consumer
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase">
                      Phone
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase">
                      Service Fee
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase">
                      Payment Type
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase">
                      Transaction ID
                    </th>
                    <th className="text-left p-3 text-xs font-semibold uppercase">
                      Paid Date
                    </th>
                    <th className="text-right p-3 text-xs font-semibold uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((consumer, index) => (
                    <tr
                      key={consumer.id}
                      className={
                        index % 2 === 0 ? "bg-background" : "bg-muted/30"
                      }
                    >
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-sm">
                            {consumer.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {consumer.consumerNumber}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{consumer.phone}</td>
                      <td className="p-3">
                        <div className="font-medium">
                          ₹{consumer.payment?.serviceFee.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-3 text-sm capitalize">
                        {consumer.payment?.paymentType}
                      </td>
                      <td className="p-3 text-sm font-mono">
                        {consumer.payment?.transactionId}
                      </td>
                      <td className="p-3 text-sm">
                        {consumer.payment?.paidAt
                          ? new Date(
                              consumer.payment.paidAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(consumer)}
                            className="gap-1"
                          >
                            <Eye size={14} />
                            <span className="hidden xl:inline">Details</span>
                          </Button>
                          {consumer.payment?.receiptUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await supabaseDownloadFile(
                                    consumer.payment!.receiptUrl!
                                  );
                                  toast.success("Receipt downloaded");
                                } catch (error) {
                                  toast.error("Failed to download");
                                }
                              }}
                              className="gap-1"
                            >
                              <Download size={14} />
                              <span className="hidden xl:inline">Receipt</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No paid consumers found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedConsumer && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Consumer Details - {selectedConsumer.name}
              </DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="consumer">Consumer Info</TabsTrigger>
                <TabsTrigger value="payment">Payment Details</TabsTrigger>
                <TabsTrigger value="service">Service Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="consumer" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Consumer Number
                    </Label>
                    <div className="font-medium">
                      {selectedConsumer.consumerNumber}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Name
                    </Label>
                    <div className="font-medium">{selectedConsumer.name}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Phone
                    </Label>
                    <div className="font-medium">{selectedConsumer.phone}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Email
                    </Label>
                    <div className="font-medium">{selectedConsumer.email}</div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Address
                    </Label>
                    <div className="font-medium">
                      {selectedConsumer.address}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Status
                    </Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedConsumer.status} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Registered
                    </Label>
                    <div className="font-medium">
                      {new Date(
                        selectedConsumer.registeredAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Service Fee
                    </Label>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{selectedConsumer.payment?.serviceFee.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Payment Type
                    </Label>
                    <div className="font-medium capitalize">
                      {selectedConsumer.payment?.paymentType}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Transaction ID
                    </Label>
                    <div className="font-mono">
                      {selectedConsumer.payment?.transactionId}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Transaction Date
                    </Label>
                    <div className="font-medium">
                      {selectedConsumer.payment?.transactionDate
                        ? new Date(
                            selectedConsumer.payment.transactionDate
                          ).toLocaleDateString()
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Paid At
                    </Label>
                    <div className="font-medium">
                      {selectedConsumer.payment?.paidAt
                        ? new Date(
                            selectedConsumer.payment.paidAt
                          ).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Paid By
                    </Label>
                    <div className="font-medium">
                      {selectedConsumer.payment?.paidBy || "-"}
                    </div>
                  </div>
                  {selectedConsumer.payment?.installmentPlan && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Installments
                        </Label>
                        <div className="font-medium">
                          {
                            selectedConsumer.payment.installmentPlan
                              .numberOfInstallments
                          }
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Amount per Installment
                        </Label>
                        <div className="font-medium">
                          ₹
                          {selectedConsumer.payment.installmentPlan.amountPerInstallment.toLocaleString()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="service" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Work List ({selectedConsumer.workList.length} items)
                    </Label>
                    {selectedConsumer.workList.length > 0 ? (
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-2 text-xs font-semibold">
                                Description
                              </th>
                              <th className="text-left p-2 text-xs font-semibold">
                                Category
                              </th>
                              <th className="text-left p-2 text-xs font-semibold">
                                Priority
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedConsumer.workList.map((item, index) => (
                              <tr
                                key={item.id}
                                className={
                                  index % 2 === 0
                                    ? "bg-background"
                                    : "bg-muted/30"
                                }
                              >
                                <td className="p-2 text-sm">
                                  {item.description}
                                </td>
                                <td className="p-2 text-sm">{item.category}</td>
                                <td className="p-2">
                                  <span
                                    className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                                      item.priority === "high"
                                        ? "bg-red-500/10 text-red-500"
                                        : item.priority === "medium"
                                        ? "bg-yellow-500/10 text-yellow-500"
                                        : "bg-green-500/10 text-green-500"
                                    }`}
                                  >
                                    {item.priority}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        No work items
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Documents
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedConsumer.evaluationSheet && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText size={14} />
                          Evaluation Sheet
                        </Button>
                      )}
                      {selectedConsumer.proposalSheet && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText size={14} />
                          Proposal
                        </Button>
                      )}
                      {selectedConsumer.payment?.receiptUrl && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText size={14} />
                          Payment Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                <Label className="text-xs text-muted-foreground">
                  Notes & Activity
                </Label>
                {selectedConsumer.notes.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedConsumer.notes.map((note) => (
                      <div
                        key={note.id}
                        className="border-l-4 border-primary pl-3 py-2 bg-muted/30"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <span className="text-sm font-semibold">
                              {note.createdByName}
                            </span>
                            {note.action && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                {note.action}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {note.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No activity history
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
