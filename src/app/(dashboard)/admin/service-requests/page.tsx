"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Info, MoreHorizontal, CheckCircle } from "lucide-react";
import { ConsumerDetailsModal } from "@/components/ConsumerDetailsModal";
import { toast } from "sonner";

// Mock service request data
interface ServiceRequest {
  id: string;
  consumerName: string;
  consumerNumber: string;
  email: string;
  phone: string;
  service: string;
  requestedAt: string;
  status: "requested" | "completed";
}

const mockServiceRequests: ServiceRequest[] = [
  {
    id: "SR001",
    consumerName: "Ramesh Patil",
    consumerNumber: "100123456789",
    email: "ramesh.patil@email.com",
    phone: "+91 98765 00001",
    service: "Bill Analysis",
    requestedAt: "2024-11-15T10:30:00Z",
    status: "completed",
  },
  {
    id: "SR002",
    consumerName: "Sunita Joshi",
    consumerNumber: "100123456790",
    email: "sunita.joshi@email.com",
    phone: "+91 98765 00002",
    service: "Consultation",
    requestedAt: "2024-11-16T14:20:00Z",
    status: "requested",
  },
  {
    id: "SR003",
    consumerName: "Kavita Kulkarni",
    consumerNumber: "100123456792",
    email: "kavita.k@email.com",
    phone: "+91 98765 00004",
    service: "Bill Analysis",
    requestedAt: "2024-11-17T09:15:00Z",
    status: "requested",
  },
  {
    id: "SR004",
    consumerName: "Anil Mehta",
    consumerNumber: "100123456791",
    email: "anil.mehta@email.com",
    phone: "+91 98765 00003",
    service: "Follow-up Call",
    requestedAt: "2024-11-18T11:45:00Z",
    status: "requested",
  },
];

export const dynamic = "force-dynamic";

export default function ServiceRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredRequests = mockServiceRequests.filter((request) => {
    const matchesSearch =
      request.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.consumerNumber.includes(searchTerm) ||
      request.service.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleMarkCompleted = (requestId: string) => {
    toast.success("Service request marked as completed");
    console.log("Marking request as completed:", requestId);
  };

  const handleShowDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-yellow-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Service Requests</h1>
        <p className="text-muted-foreground">
          Manage and track all service requests from the consumer portal
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockServiceRequests.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Requested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {
                mockServiceRequests.filter((r) => r.status === "requested")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                mockServiceRequests.filter((r) => r.status === "completed")
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Search by name, number, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "requested" ? "default" : "outline"}
            onClick={() => setStatusFilter("requested")}
            size="sm"
          >
            Requested
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            onClick={() => setStatusFilter("completed")}
            size="sm"
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Request ID</TableHead>
                <TableHead>Consumer Name</TableHead>
                <TableHead>Consumer Number</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No service requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => handleShowDetails(request)}
                      >
                        <Info className="text-primary" size={18} />
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {request.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.consumerName}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {request.consumerNumber}
                    </TableCell>
                    <TableCell>{request.service}</TableCell>
                    <TableCell>
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(
                          request.status
                        )} capitalize`}
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={request.status === "completed"}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleMarkCompleted(request.id)}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark Completed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Consumer Details Modal */}
      {selectedRequest && (
        <ConsumerDetailsModal
          consumer={{
            id: selectedRequest.id,
            consumerNumber: selectedRequest.consumerNumber,
            name: selectedRequest.consumerName,
            email: selectedRequest.email,
            phone: selectedRequest.phone,
            address: "",
            registeredAt: selectedRequest.requestedAt,
            registeredBy: "system",
            status: "Evaluation Pending",
            billFiles: [],
            billDetailsExcel: "",
            workList: [],
            notes: [],
            lastUpdated: selectedRequest.requestedAt,
            auditLog: [],
          }}
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}
