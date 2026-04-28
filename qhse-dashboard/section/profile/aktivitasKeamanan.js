"use client";

import { useEffect, useState } from "react";
import { Clock3, KeyRound, ShieldCheck } from "lucide-react";

function formatDateTime(value) {
  if (!value) return "Belum ada data";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(value) {
  if (!value) return "Belum pernah diperbarui";

  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} hari lalu`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} bulan lalu`;
}

function AktivitasKeamanan({ profile }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-[22px] border border-[#dfe9e3] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <ShieldCheck size={18} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
            Aktivitas Keamanan
          </p>
          <h2 className="mt-1 text-[18px] font-semibold text-[#1f2b38]">
            Riwayat & Proteksi
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[18px] border border-[#edf1f4] bg-[#fafdfb] px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef8f1] text-emerald-700">
              <Clock3 size={17} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#243041]">Login Terakhir</p>
              <p className="mt-1 text-[12px] text-[#5f6b76]">{formatDateTime(profile?.last_login)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border border-[#edf1f4] bg-[#fafdfb] px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef8f1] text-emerald-700">
                <KeyRound size={17} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#243041]">Password Diubah</p>
                <p className="mt-1 text-[12px] text-[#5f6b76]">{timeAgo(profile?.password_updated_at)}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
              Terpantau
            </span>
          </div>
        </div>

        <div className="rounded-[18px] border border-emerald-100 bg-gradient-to-r from-emerald-50 to-lime-50 px-4 py-4">
          <p className="text-[12px] font-semibold text-emerald-800">Status keamanan akun</p>
          <p className="mt-1 text-[12px] leading-5 text-emerald-700/90">
            Aktivitas penting akun ditampilkan ringkas di sini supaya konsisten dengan gaya kartu monitoring pada dashboard utama.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AktivitasKeamanan;
