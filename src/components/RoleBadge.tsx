"use client";

import { Role } from "@/types";
import { Badge } from "./ui/badge";

const roleConfig: Record<Role, { color: string; label: string }> = {
  evaluator: { color: "bg-indigo-500 text-white", label: "Evaluator" },
  proposal_maker: {
    color: "bg-purple-500 text-white",
    label: "Proposal Maker",
  },
  sales: { color: "bg-green-500 text-white", label: "Sales" },
  admin: { color: "bg-red-500 text-white", label: "Admin" },
};

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const config = roleConfig[role];
  return (
    <Badge className={`${config.color} font-semibold text-xs px-2 py-1`}>
      {config.label}
    </Badge>
  );
};
