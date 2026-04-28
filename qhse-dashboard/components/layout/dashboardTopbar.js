import { Bell, CalendarDays, ChevronDown, Menu, User } from "lucide-react";

export default function DashboardTopbar({
  isDesktopSidebarOpen,
  onDesktopMenuClick,
  onMobileMenuClick,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#eceff1] bg-white">
      <div className="flex h-[62px] items-center justify-between px-4 sm:px-5 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMobileMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#425466] lg:hidden"
            aria-label="Buka sidebar"
          >
            <Menu size={22} />
          </button>
          <button
            type="button"
            onClick={onDesktopMenuClick}
            className="hidden h-10 w-10 items-center justify-center rounded-md text-[#425466] transition hover:bg-[#f1f4f6] lg:inline-flex"
            aria-label={
              isDesktopSidebarOpen ? "Tutup sidebar" : "Buka sidebar"
            }
          >
            <Menu size={24} />
          </button>
          <h2 className="text-[18px] font-semibold text-[#243041]">Dashboard</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-md border border-[#e8ecef] px-3 py-2 text-[12px] text-[#5e6b78] md:flex">
            <CalendarDays size={14} className="text-[#7a8794]" />
            <span>20 Mei 2024 - 26 Mei 2024</span>
            <ChevronDown size={14} className="text-[#93a1af]" />
          </div>

          <div className="relative">
            <button className="inline-flex h-9 w-9 items-center justify-center text-[#2f3e4d]">
              <Bell size={18} />
            </button>
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#ea4335]" />
          </div>

          <div className="flex items-center gap-2 rounded-full pl-1 pr-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2f4] text-[#4d5a66]">
              <User size={18} />
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold leading-none text-[#243041]">
                John Doe
              </p>
              <p className="mt-1 text-[11px] text-[#7f8b96]">Super Administrator</p>
            </div>
            <ChevronDown size={14} className="hidden text-[#94a0aa] sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
