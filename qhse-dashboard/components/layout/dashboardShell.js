"use client";

import { useState } from "react";
import DashboardSidebar from "./dashboardSidebar";
import DashboardTopbar from "./dashboardTopbar";

export default function DashboardShell({ children }) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <DashboardSidebar
        isDesktopSidebarOpen={isDesktopSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main
        className={`min-h-screen transition-[margin] duration-300 ${
          isDesktopSidebarOpen ? "lg:ml-[264px]" : "lg:ml-[88px]"
        }`}
      >
        <DashboardTopbar
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          onDesktopMenuClick={() =>
            setIsDesktopSidebarOpen((current) => !current)
          }
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        <div className="px-4 py-5 sm:px-5 lg:px-6">{children}</div>
      </main>
    </div>
  );
}
