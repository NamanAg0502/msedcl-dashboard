"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Consumer } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Label } from "./ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  consumer: Consumer | null;
}

export const ConsumerDetailsModal: React.FC<Props> = ({
  open,
  onClose,
  consumer,
}) => {
  if (!consumer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl!">
        <DialogHeader>
          <DialogTitle>Consumer Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 w-full">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Consumer Number</Label>
              <p className="text-lg font-semibold">{consumer.consumerNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <StatusBadge status={consumer.status} />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Full Name</Label>
            <p className="text-lg font-semibold">{consumer.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{consumer.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone</Label>
              <p className="font-medium">{consumer.phone}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Address</Label>
            <p className="font-medium">{consumer.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Registered At</Label>
              <p className="font-medium">
                {new Date(consumer.registeredAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Updated</Label>
              <p className="font-medium">
                {new Date(consumer.lastUpdated).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {consumer.payment && (
            <div className="border border-green-500 rounded-lg p-4 bg-green-50 dark:bg-green-950">
              <Label className="text-green-700 dark:text-green-300 font-semibold">
                Payment Information
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Service Fee
                  </Label>
                  <p className="font-semibold">
                    ₹{consumer.payment.serviceFee.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Payment Type
                  </Label>
                  <p className="font-semibold capitalize">
                    {consumer.payment.paymentType}
                  </p>
                </div>
                {consumer.payment.transactionId && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Transaction ID
                    </Label>
                    <p className="font-mono text-sm">
                      {consumer.payment.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {consumer.workList.length > 0 && (
            <div>
              <Label className="text-muted-foreground">
                Work Items ({consumer.workList.length})
              </Label>
              <div className="mt-2 space-y-2">
                {consumer.workList.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="text-sm border-l-2 border-primary pl-3"
                  >
                    <p className="font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.category}
                    </p>
                  </div>
                ))}
                {consumer.workList.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    + {consumer.workList.length - 3} more items
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
