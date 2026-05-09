"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "./dashboardSidebar";
import DashboardTopbar from "./dashboardTopbar";
import { getCurrentSession } from "@/lib/services/authService";

export default function DashboardShell({ children }) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    async function protectDashboard() {
      try {
        const session = await getCurrentSession();

        if (!session) {
          router.replace("/login");
          return;
        }

        setCheckingSession(false);
      } catch {
        router.replace("/login");
      }
    }

    protectDashboard();
  }, [router]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f8] text-sm font-medium text-[#425466]">
        Memeriksa sesi login...
      </div>
    );
  }

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
