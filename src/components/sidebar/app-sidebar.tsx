"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Home,
    LogOut,
    Package2,
    PieChart,
    ShoppingBag,
    Sparkles,
} from "lucide-react";
import { Logo } from "@/components/sidebar/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/sidebar/nav-main";
import { NotificationsPopover } from "@/components/sidebar/nav-notifications";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const sampleNotifications = [
    {
        id: "1",
        avatar: "/avatars/01.png",
        fallback: "OM",
        text: "New order received.",
        time: "10m ago",
    },
    {
        id: "2",
        avatar: "/avatars/02.png",
        fallback: "JL",
        text: "Server upgrade completed.",
        time: "1h ago",
    },
    {
        id: "3",
        avatar: "/avatars/03.png",
        fallback: "HH",
        text: "New user signed up.",
        time: "2h ago",
    },
];

const dashboardRoutes: Route[] = [
    {
        id: "dashboard",
        title: "Dashboard",
        icon: <Home className="size-4" />,
        link: "/admin",
    },
    {
        id: "consumers",
        title: "Consumers",
        icon: <Package2 className="size-4" />,
        link: "/admin/consumers",
    },
    {
        id: "employees",
        title: "Employees",
        icon: <PieChart className="size-4" />,
        link: "/admin/employees",
    },
    {
        id: "paid-consumers",
        title: "Paid Consumers",
        icon: <Sparkles className="size-4" />,
        link: "/admin/paid",
        subs: [
            {
                title: "Service Requests",
                link: "/admin/service-requests",
                icon: <ShoppingBag className="size-4" />,
            },
        ],
    },
];

export function DashboardSidebar() {
    const { state } = useSidebar();
    const router = useRouter();
    const { currentAgent, logout } = useAuth();
    const isCollapsed = state === "collapsed";

    if (!currentAgent) return null;

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader
                className={cn(
                    "flex md:pt-3.5",
                    isCollapsed
                        ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
                        : "flex-row items-center justify-between",
                )}
            >
                <a href="#" className="flex items-center gap-2">
                    <Logo className="h-8 w-8" />
                    {!isCollapsed && (
                        <span className="font-semibold text-black dark:text-white">
                            Intellect
                        </span>
                    )}
                </a>

                <motion.div
                    key={isCollapsed ? "header-collapsed" : "header-expanded"}
                    className={cn(
                        "flex items-center gap-2",
                        isCollapsed
                            ? "flex-row md:flex-col-reverse"
                            : "flex-row",
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <NotificationsPopover notifications={sampleNotifications} />
                    <SidebarTrigger />
                </motion.div>
            </SidebarHeader>
            <SidebarContent className="gap-4 px-2 py-4">
                <DashboardNavigation routes={dashboardRoutes} />
            </SidebarContent>
            <SidebarFooter className="px-2 flex-row">
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                        {currentAgent.name}
                    </span>
                    <span className="truncate text-xs">
                        {currentAgent.role}
                    </span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                    <LogOut className="h-4 w-4" onClick={handleLogout} />
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
