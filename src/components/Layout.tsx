"use client";

import { SidebarInset } from "./ui/sidebar";
import { DashboardSidebar } from "./sidebar/app-sidebar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="relative flex h-screen w-full">
                <DashboardSidebar />
                <SidebarInset className="flex flex-col p-6">
                    {children}
                </SidebarInset>
            </div>
        </div>
    );
};

export default Layout;
