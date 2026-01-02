"use client";

import { ConsumerStatus } from "@/types";
import { Badge } from "./ui/badge";

const statusConfig: Record<
  ConsumerStatus,
  {
    bgColor: string;
    textColor: string;
    borderColor: string;
    label: string;
    dotColor: string;
  }
> = {
  "Evaluation Pending": {
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    textColor: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
    label: "Evaluation Pending",
  },
  "Evaluation Done": {
    bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    textColor: "text-indigo-700 dark:text-indigo-400",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    dotColor: "bg-indigo-500",
    label: "Evaluation Done",
  },
  "Re-Evaluation Pending": {
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    textColor: "text-orange-700 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
    dotColor: "bg-orange-500",
    label: "Re-Evaluation Pending",
  },
  "Re-Evaluation Done": {
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    textColor: "text-orange-800 dark:text-orange-300",
    borderColor: "border-orange-300 dark:border-orange-700",
    dotColor: "bg-orange-600",
    label: "Re-Evaluation Done",
  },
  "Proposal Pending": {
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-400",
    label: "Proposal Pending",
  },
  "Proposal Done": {
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    textColor: "text-blue-800 dark:text-blue-300",
    borderColor: "border-blue-300 dark:border-blue-700",
    dotColor: "bg-blue-500",
    label: "Proposal Done",
  },
  "Re-Proposal Pending": {
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    textColor: "text-orange-700 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
    dotColor: "bg-orange-500",
    label: "Re-Proposal Pending",
  },
  "Re-Proposal Done": {
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    textColor: "text-orange-800 dark:text-orange-300",
    borderColor: "border-orange-300 dark:border-orange-700",
    dotColor: "bg-orange-600",
    label: "Re-Proposal Done",
  },
  "Forward Proposal": {
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    textColor: "text-purple-700 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    dotColor: "bg-purple-500",
    label: "Forward Proposal",
  },
  "Sales Decision": {
    bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    textColor: "text-indigo-700 dark:text-indigo-400",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    dotColor: "bg-indigo-500",
    label: "Sales Decision",
  },
  "Follow-up Pending": {
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    textColor: "text-purple-700 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    dotColor: "bg-purple-500",
    label: "Follow-up Pending",
  },
  "Follow-up Decision": {
    bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    textColor: "text-indigo-700 dark:text-indigo-400",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    dotColor: "bg-indigo-500",
    label: "Follow-up Decision",
  },
  Paid: {
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    textColor: "text-emerald-700 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
    label: "Paid",
  },
  Inactive: {
    bgColor: "bg-red-50 dark:bg-red-950/50",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
    label: "Inactive",
  },
  "Next Month Prospect": {
    bgColor: "bg-slate-50 dark:bg-slate-950/50",
    textColor: "text-slate-700 dark:text-slate-400",
    borderColor: "border-slate-200 dark:border-slate-800",
    dotColor: "bg-slate-500",
    label: "Next Month Prospect",
  },
  sales_forward_pending: {
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    textColor: "text-purple-700 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    dotColor: "bg-purple-500",
    label: "Forward Pending",
  },
  sales_forward_rejected: {
    bgColor: "bg-red-50 dark:bg-red-950/50",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
    label: "Forward Rejected",
  },
  sales_reply: {
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500",
    label: "Sales Reply",
  },
  sales_followup_pending: {
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    textColor: "text-purple-700 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    dotColor: "bg-purple-500",
    label: "Follow-up Pending",
  },
  sales_followup_rejected: {
    bgColor: "bg-red-50 dark:bg-red-950/50",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
    label: "Follow-up Rejected",
  },
};

export const StatusBadge: React.FC<{ status: ConsumerStatus }> = ({
  status,
}) => {
  const config = statusConfig[status];

  // Fallback for undefined statuses
  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
        <div className="w-2 h-2 rounded-full bg-slate-400" />
        <span className="text-xs font-medium text-slate-700 dark:text-slate-400">
          {status}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.borderColor} ${config.bgColor}`}
    >
      <div
        className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}
      />
      <span
        className={`text-xs font-medium whitespace-nowrap ${config.textColor}`}
      >
        {config.label}
      </span>
    </div>
  );
};
