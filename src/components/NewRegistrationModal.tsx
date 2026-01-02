"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { supabaseRegisterConsumer } from "@/lib/supabase/api";
import { toast } from "sonner";
import { LoadingSpinner } from "./LoadingSpinner";
import { Consumer } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

// Generate mock bill files
const generateBillFiles = (consumerNumber: string) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((month) => ({
    fileName: `${consumerNumber}_${month}_2024.pdf`,
    month,
    year: 2024,
    downloadUrl: `blob:mock/${consumerNumber}_${month}_2024.pdf`,
  }));
};

export const NewRegistrationModal: React.FC<Props> = ({ open, onClose }) => {
  const { currentAgent } = useAuth();
  const { refreshConsumers } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    consumerNumber: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.consumerNumber)
      newErrors.consumerNumber = "Consumer number is required";
    else if (!/^\d{12}$/.test(formData.consumerNumber))
      newErrors.consumerNumber = "Must be 12 digits";

    if (!formData.name || formData.name.trim().length < 2)
      newErrors.name = "Valid name required";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Valid email required";
    if (!formData.phone || !/^\+91 \d{5} \d{5}$/.test(formData.phone))
      newErrors.phone = "Phone format: +91 XXXXX XXXXX";
    if (!formData.address || formData.address.trim().length < 10)
      newErrors.address = "Complete address required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate bill download process
      toast.info("Downloading consumer bills...");

      // Create consumer data
      const consumerData: Omit<
        Consumer,
        "id" | "registeredAt" | "lastUpdated" | "auditLog"
      > = {
        ...formData,
        registeredBy: currentAgent!.id,
        status: "Evaluation Pending",
        billFiles: generateBillFiles(formData.consumerNumber),
        billDetailsExcel: `${formData.consumerNumber}_bill_details.xlsx`,
        workList: [],
        notes: [
          {
            id: `N${Date.now()}`,
            text: "Consumer registered, bills downloaded and parsed successfully",
            createdBy: currentAgent!.id,
            createdByName: currentAgent!.name,
            createdAt: new Date().toISOString(),
            action: "Registration",
          },
        ],
      };

      await supabaseRegisterConsumer(consumerData);
      await refreshConsumers();

      toast.success(`Consumer ${formData.name} registered successfully!`);

      // Reset form
      setFormData({
        consumerNumber: "",
        name: "",
        email: "",
        phone: "",
        address: "",
      });
      onClose();
    } catch (error) {
      toast.error("Failed to register consumer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto max-w-2xl h-3/4 flex-start flex flex-col">
        <DialogHeader className="h-fit">
          <DialogTitle className="text-2xl font-bold">
            Consumer Registration
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 py-4 flex-1 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="consumerNumber">Consumer Number *</Label>
                <Input
                  id="consumerNumber"
                  value={formData.consumerNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consumerNumber: e.target.value,
                    })
                  }
                  placeholder="12-digit consumer number"
                  maxLength={12}
                />
                {errors.consumerNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.consumerNumber}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Consumer full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+91 98765 43210"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  })
                }
                placeholder="Complete address with pincode"
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-border">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>What happens next:</strong>
              </p>
              <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1 mt-2">
                <li>System will download 12 months of bills</li>
                <li>Bills will be parsed automatically</li>
                <li>Consumer will be assigned to Evaluator</li>
                <li>Status will be set to &quot;Evaluation Pending&quot;</li>
              </ol>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={16} className="mr-2" />
                  Registering...
                </>
              ) : (
                "Register Consumer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
