"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CalendarDays, ChevronDown, LogOut, Menu, User } from "lucide-react";
import Swal from "sweetalert2";
import {
  getCurrentUser,
  getCurrentUserRole,
  logoutUser,
} from "@/lib/services/authService";

function formatRole(role) {
  if (!role) {
    return "User";
  }

  const labels = {
    superadmin: "Super Administrator",
    admin: "Administrator",
    viewer: "Viewer",
  };

  return labels[role] || role;
}

function getDisplayName(user) {
  const metadata = user?.user_metadata || {};

  return (
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    user?.email?.split("@")[0] ||
    "User"
  );
}

export default function DashboardTopbar({
  isDesktopSidebarOpen,
  onDesktopMenuClick,
  onMobileMenuClick,
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState("");

  useEffect(() => {
    async function loadLoggedInUser() {
      try {
        const [user, role] = await Promise.all([
          getCurrentUser(),
          getCurrentUserRole(),
        ]);

        setCurrentUser(user);
        setCurrentRole(role);
      } catch {
        setCurrentUser(null);
        setCurrentRole("");
      }
    }

    loadLoggedInUser();
  }, []);

  const displayName = useMemo(() => getDisplayName(currentUser), [currentUser]);
  const userInitial = displayName.charAt(0).toUpperCase();

  async function handleLogout() {
    const result = await Swal.fire({
      title: "Anda yakin untuk keluar?",
      text: "Sesi login akan diakhiri dan Anda akan kembali ke halaman login.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await logoutUser();

      await Swal.fire({
        title: "Berhasil keluar",
        text: "Anda akan diarahkan ke halaman login.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      router.replace("/login");
    } catch (error) {
      Swal.fire({
        title: "Gagal keluar",
        text: error.message || "Terjadi kendala saat mengakhiri sesi login.",
        icon: "error",
        confirmButtonColor: "#0f766e",
      });
    }
  }

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

          <div className="flex items-center gap-2 rounded-full pl-1 pr-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2f4] text-[#4d5a66]">
              {userInitial ? (
                <span className="text-[13px] font-semibold">{userInitial}</span>
              ) : (
                <User size={18} />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold leading-none text-[#243041]">
                {displayName}
              </p>
              <p className="mt-1 text-[11px] text-[#7f8b96]">
                {formatRole(currentRole)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#64748b] transition hover:bg-[#fee2e2] hover:text-[#dc2626]"
              aria-label="Keluar"
              title="Keluar"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
