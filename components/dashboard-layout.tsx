"use client";

import { DashboardSidebar, MobileSidebarToggle } from "@/components/dashboard-sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFDFB" }}>
      <DashboardSidebar />
      <MobileSidebarToggle />

      <div className="lg:pl-64">
        <main className="py-10 pt-20 lg:pt-10">{children}</main>
      </div>
    </div>
  );
}
