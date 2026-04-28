"use client";

import { Mail, MapPin, Phone } from "lucide-react";

const INFO_ITEMS = [
  {
    key: "email",
    label: "Email Address",
    empty: "Belum diatur",
    icon: Mail,
  },
  {
    key: "no_hp",
    label: "Phone Number",
    empty: "Belum diatur",
    icon: Phone,
  },
  {
    key: "alamat",
    label: "Lokasi / Alamat",
    empty: "Belum diatur",
    icon: MapPin,
  },
];

function DetailInformasi({ profile }) {
  return (
    <div className="rounded-[22px] border border-[#dfe9e3] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
            Detail Informasi
          </p>
          <h2 className="mt-2 text-[18px] font-semibold text-[#1f2b38]">
            Informasi Kontak
          </h2>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          Primary
        </div>
      </div>

      <div className="space-y-4">
        {INFO_ITEMS.map(({ key, label, empty, icon: Icon }) => (
          <div
            key={key}
            className="flex items-start gap-4 rounded-[18px] border border-[#edf1f4] bg-[#fafdfb] px-4 py-4"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                {label}
              </p>
              <p className="mt-1 text-[14px] font-medium text-[#243041]">
                {profile?.[key] || empty}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DetailInformasi;
