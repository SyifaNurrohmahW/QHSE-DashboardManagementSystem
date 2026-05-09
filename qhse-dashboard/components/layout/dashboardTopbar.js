"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, CalendarDays, ChevronDown, Clock3, LogOut, Menu, User } from "lucide-react";
import Swal from "sweetalert2";
import {
  getCurrentUser,
  getCurrentUserRole,
  logoutUser,
} from "@/lib/services/authService";
import { getLsaFfaList } from "@/lib/services/lsaFfaService";

function dateDiffInDays(date) {
  if (!date) return null;

  const today = new Date();
  const target = new Date(date);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function getEquipmentAlert(item) {
  const status = String(item.status || "").toLowerCase();

  if (status === "nil") {
    return null;
  }

  if (status === "expired") {
    return { label: "Expired", severity: 0 };
  }

  const remainingDays = dateDiffInDays(item.nextInspectionDate);

  if (remainingDays === null) {
    return null;
  }

  if (remainingDays < 0) {
    return { label: "Expired", severity: 0, remainingDays };
  }

  if (remainingDays <= Number(item.alertDays || 60)) {
    return { label: "Warning", severity: 1, remainingDays };
  }

  return null;
}

function formatRemainingDays(days) {
  if (days === null || days === undefined) return "-";
  if (days < 0) return `${Math.abs(days)} hari lewat`;
  return `${days} hari lagi`;
}

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
  const [equipmentAlerts, setEquipmentAlerts] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    getLsaFfaList()
      .then((items) => {
        if (!isMounted) return;

        const alerts = items
          .map((item) => {
            const alert = getEquipmentAlert(item);
            if (!alert) return null;

            return {
              ...item,
              alertLabel: alert.label,
              alertSeverity: alert.severity,
              remainingDays: alert.remainingDays ?? dateDiffInDays(item.nextInspectionDate),
            };
          })
          .filter(Boolean)
          .sort((left, right) => {
            if (left.alertSeverity !== right.alertSeverity) {
              return left.alertSeverity - right.alertSeverity;
            }

            return Number(left.remainingDays ?? 9999) - Number(right.remainingDays ?? 9999);
          });

        setEquipmentAlerts(alerts);
      })
      .catch(() => {
        if (!isMounted) return;
        setEquipmentAlerts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = useMemo(() => getDisplayName(currentUser), [currentUser]);
  const userInitial = displayName.charAt(0).toUpperCase();
  const notificationCount = equipmentAlerts.length;
  const expiredCount = equipmentAlerts.filter((item) => item.alertLabel === "Expired").length;
  const warningCount = equipmentAlerts.filter((item) => item.alertLabel === "Warning").length;

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
            <button
              type="button"
              onClick={() => setIsNotificationOpen((current) => !current)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#2f3e4d] transition hover:bg-[#f1f5f3]"
              aria-label="Notifikasi equipment"
            >
              <Bell size={18} />
            </button>
            {notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#ea4335] px-1 text-[10px] font-bold leading-none text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}

            {isNotificationOpen ? (
              <div className="absolute right-0 top-11 z-50 w-[340px] overflow-hidden rounded-[18px] border border-[#e3e8ed] bg-white shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
                <div className="border-b border-[#edf1f4] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-bold text-[#1f2b38]">Equipment Alert</p>
                      <p className="mt-0.5 text-[11px] text-[#7c8793]">
                        {expiredCount} expired, {warningCount} warning
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationOpen(false);
                        router.push("/dashboard/equipment");
                      }}
                      className="rounded-full bg-[#edf9f1] px-3 py-1 text-[11px] font-semibold text-[#15803d]"
                    >
                      Lihat semua
                    </button>
                  </div>
                </div>

                <div className="max-h-[320px] overflow-y-auto p-2">
                  {notificationCount === 0 ? (
                    <div className="px-4 py-8 text-center text-[12px] text-[#8b96a1]">
                      Tidak ada equipment expired atau warning.
                    </div>
                  ) : (
                    equipmentAlerts.slice(0, 6).map((item) => {
                      const isExpired = item.alertLabel === "Expired";
                      const Icon = isExpired ? AlertTriangle : Clock3;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setIsNotificationOpen(false);
                            router.push("/dashboard/equipment");
                          }}
                          className="flex w-full items-start gap-3 rounded-[14px] px-3 py-3 text-left transition hover:bg-[#f8fafb]"
                        >
                          <span className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${isExpired ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                            <Icon size={16} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-semibold text-[#243041]">
                              {item.jenisEquipment || "-"}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-[#667481]">
                              {item.kapal || "-"} - {formatRemainingDays(item.remainingDays)}
                            </span>
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isExpired ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                            {item.alertLabel}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
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
