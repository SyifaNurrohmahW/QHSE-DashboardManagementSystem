"use client";

import { startTransition, useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import {
  DEFAULT_NOTIFICATION_PREFS,
  readNotificationPrefs,
  writeNotificationPrefs,
} from "@/lib/notificationPreferences";

const NOTIFICATION_ITEMS = [
  {
    key: "equipmentExpiry",
    title: "Equipment Expiry Alert",
    desc: "Tampilkan notifikasi equipment LSA & FFA yang expired atau mendekati jatuh tempo.",
  },
  {
    key: "approvalNcr",
    title: "Approval NCR",
    desc: "Siapkan kanal untuk notifikasi temuan NCR yang butuh review atau approval.",
  },
  {
    key: "securityUpdate",
    title: "Pembaruan Keamanan",
    desc: "Siapkan kanal untuk notifikasi perubahan password, login baru, atau update akses akun.",
  },
];

function PreferensiNotif() {
  const [toggles, setToggles] = useState(DEFAULT_NOTIFICATION_PREFS);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    startTransition(() => {
      setToggles(readNotificationPrefs());
    });
  }, []);

  const handleToggle = (key) => {
    setToggles((prev) => {
      const nextState = { ...prev, [key]: !prev[key] };
      writeNotificationPrefs(nextState);
      setSavedMessage("Preferensi notifikasi tersimpan.");
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
                checked={Boolean(toggles[item.key])}
                onChange={() => handleToggle(item.key)}
              />
              <div className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-emerald-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
        ))}
      </div>

      {savedMessage ? (
        <p className="mt-4 rounded-[12px] bg-emerald-50 px-3 py-2 text-[12px] font-medium text-emerald-700">
          {savedMessage}
        </p>
      ) : null}
    </div>
  );
}

export default PreferensiNotif;
