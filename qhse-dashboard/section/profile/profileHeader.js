"use client";

import { CalendarDays, Edit, Mail, ShieldCheck } from "lucide-react";

function ProfileHeader({ profile, onEditClick }) {
  const profileInitial = profile?.nama?.charAt(0).toUpperCase() || "A";
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "1 Jan 2025";
  const emailLabel = profile?.email || "Email belum diatur";

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 text-white shadow-[0_16px_36px_rgba(16,185,129,0.18)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.2),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(5,46,22,0.18),_transparent_30%)]" />
      <div className="absolute -top-20 right-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-lime-200/20 blur-3xl" />

      <div className="relative grid gap-6 px-5 py-6 lg:grid-cols-[1.6fr_0.8fr] lg:px-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
          <div className="relative mx-auto md:mx-0">
            <div className="absolute inset-0 rounded-full bg-white/20 blur-md" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/30 bg-white/15 text-4xl font-bold text-white backdrop-blur-sm md:h-28 md:w-28 md:text-5xl">
              {profileInitial}
            </div>
          </div>

          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
              <ShieldCheck size={14} />
              Profile Center
            </div>

            <h1 className="mt-4 text-[28px] font-bold leading-tight md:text-[34px]">
              {profile?.nama || "Admin QHSE Dashboard"}
            </h1>
            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-white/82">
              Kelola identitas akun, informasi kontak, dan preferensi keamanan dengan tampilan yang selaras dengan dashboard utama.
            </p>

            <div className="mt-4 flex flex-col gap-3 text-sm text-white/90 md:flex-row md:flex-wrap md:items-center">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <Mail size={16} className="text-emerald-100" />
                <span className="truncate">{emailLabel}</span>
              </div>
              <div className="hidden h-1 w-1 rounded-full bg-white/40 md:block" />
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <CalendarDays size={16} className="text-emerald-100" />
                <span>Bergabung {joinDate}</span>
              </div>
              <div className="hidden h-1 w-1 rounded-full bg-white/40 md:block" />
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <ShieldCheck size={16} className="text-emerald-100" />
                <span>Akun aktif dan terlindungi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <button
            onClick={onEditClick}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-white px-4 py-3 text-[13px] font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            <Edit size={15} />
            Edit Profil
          </button>

          <div className="rounded-[18px] border border-white/12 bg-black/10 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Status Akun
            </p>
            <p className="mt-2 text-[22px] font-bold">Aktif</p>
            <p className="mt-1 text-[12px] text-white/75">
              Data profile siap dipakai untuk demo flow edit dan pengaturan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
