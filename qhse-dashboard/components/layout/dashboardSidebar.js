"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ShieldCheck, UserCircle2, X } from "lucide-react";
import { dashboardMenuSections } from "@/lib/menu";

export default function DashboardSidebar({
  isDesktopSidebarOpen,
  isMobileSidebarOpen,
  onMobileClose,
}) {
  const pathname = usePathname();
  const currentRole = "superadmin";

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-[#091e1a]/45 transition-opacity duration-300 lg:hidden ${
          isMobileSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onMobileClose}
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[264px] flex-col bg-[#0a5b4d] text-white transition-all duration-300 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDesktopSidebarOpen ? "lg:w-[264px]" : "lg:w-[88px]"} lg:translate-x-0`}
      >
        <div
          className={`border-b border-white/10 px-6 pb-5 pt-5 ${
            isDesktopSidebarOpen ? "lg:px-6" : "lg:px-4"
          }`}
        >
          <div
            className={`flex items-center gap-3 ${
              isDesktopSidebarOpen ? "lg:justify-start" : "lg:justify-center"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/18 bg-white/10">
              <ShieldCheck size={24} strokeWidth={2.3} />
            </div>
            <div className={`min-w-0 ${isDesktopSidebarOpen ? "lg:block" : "lg:hidden"}`}>
              <h1 className="text-[20px] font-bold leading-none tracking-tight">QHSE</h1>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/75">
                Management System
              </p>
            </div>
            <button
              type="button"
              onClick={onMobileClose}
              className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
              aria-label="Tutup sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav
          className={`flex-1 space-y-5 overflow-y-auto px-4 py-5 ${
            isDesktopSidebarOpen ? "lg:px-4" : "lg:px-3"
          }`}
        >
          {dashboardMenuSections.map((section) => {
            const items = section.items.filter((item) =>
              item.roles.includes(currentRole)
            );

            if (!items.length) {
              return null;
            }

            return (
              <div key={section.title || "primary"} className="space-y-1.5">
                {section.title ? (
                  <p
                    className={`px-4 pb-1 text-[12px] font-medium text-white/58 ${
                      isDesktopSidebarOpen ? "lg:block" : "lg:hidden"
                    }`}
                  >
                    {section.title}
                  </p>
                ) : null}

                {items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!isDesktopSidebarOpen ? item.title : undefined}
                      onClick={onMobileClose}
                      className={`flex items-center rounded-[8px] py-2.5 text-[14px] font-medium transition ${
                        isDesktopSidebarOpen
                          ? "gap-3 px-4 lg:justify-start lg:px-4"
                          : "gap-3 px-4 lg:justify-center lg:px-3"
                      } ${
                        active
                          ? "bg-[#1ea35d] text-white shadow-[0_10px_22px_rgba(0,0,0,0.12)]"
                          : "text-white/92 hover:bg-white/8"
                      }`}
                    >
                      <Icon size={18} strokeWidth={2} className="shrink-0" />
                      <span
                        className={`min-w-0 flex-1 truncate ${
                          isDesktopSidebarOpen ? "lg:block" : "lg:hidden"
                        }`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div
          className={`border-t border-white/10 px-4 py-5 ${
            isDesktopSidebarOpen ? "lg:px-4" : "lg:px-3"
          }`}
        >
          <div
            className={`flex items-center rounded-xl gap-3 px-2 py-2 ${
              isDesktopSidebarOpen ? "lg:justify-start" : "lg:justify-center"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/18 text-white">
              <UserCircle2 size={22} />
            </div>
            <div className={`min-w-0 flex-1 ${isDesktopSidebarOpen ? "lg:block" : "lg:hidden"}`}>
              <p className="text-[14px] font-semibold">John Doe</p>
              <p className="text-[12px] text-white/70">Super Administrator</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-white/70 ${isDesktopSidebarOpen ? "lg:block" : "lg:hidden"}`}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
