"use client";

import { startTransition, useEffect, useState } from "react";
import { BellRing } from "lucide-react";

const STORAGE_KEY = "qhse_notif_prefs";
const NOTIFICATION_ITEMS = [
  {
    key: "approvalNcr",
    title: "Approval NCR",
    desc: "Notifikasi saat ada temuan baru yang butuh review atau approval.",
  },
  {
    key: "targetClose",
    title: "Reminder Target Close",
    desc: "Ingatkan saat target close date sudah dekat atau melewati batas.",
  },
  {
    key: "securityUpdate",
    title: "Pembaruan Keamanan",
    desc: "Notifikasi perubahan password, login baru, atau update akses akun.",
  },
];

function PreferensiNotif() {
  const [toggles, setToggles] = useState({
    approvalNcr: true,
    targetClose: true,
    securityUpdate: false,
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem(STORAGE_KEY);
    if (savedPrefs) {
      startTransition(() => {
        setToggles(JSON.parse(savedPrefs));
      });
    }
  }, []);

  const handleToggle = (key) => {
    setToggles((prev) => {
      const nextState = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      return nextState;
    });
  };

  return (
    <div className="rounded-[22px] border border-[#dfe9e3] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <BellRing size={18} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
            Preferensi Notifikasi
          </p>
          <h2 className="mt-1 text-[18px] font-semibold text-[#1f2b38]">
            Kanal Pengingat
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {NOTIFICATION_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 rounded-[18px] border border-[#edf1f4] bg-[#fafdfb] px-4 py-4"
          >
            <div>
              <p className="text-[14px] font-semibold text-[#243041]">{item.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-[#6d7883]">{item.desc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={toggles[item.key]}
                onChange={() => handleToggle(item.key)}
              />
              <div className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-emerald-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PreferensiNotif;
