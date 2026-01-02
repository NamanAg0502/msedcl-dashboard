"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description: string;
    showActions?: boolean;
    onNewConsumer?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    showActions = true,
    onNewConsumer,
}) => {
    const { currentAgent } = useAuth();

    const canRegister =
        currentAgent?.role === "admin" || currentAgent?.role === "sales";

    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col tracking-tighter">
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            {showActions && (
                <div className="flex gap-2">
                    {canRegister && onNewConsumer && (
                        <Button onClick={onNewConsumer} className="gap-2">
                            <Plus size={18} />
                            New Consumer
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
