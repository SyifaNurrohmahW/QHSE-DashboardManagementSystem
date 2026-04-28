"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  LifeBuoy,
  Search,
  Ship,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const INITIAL_EQUIPMENT = [
  {
    id: "EQ-001",
    kapal: "MV Adaro Pioneer",
    jenisEquipment: "EPIRB",
    qty: "1 Unit",
    lastInspectionDate: "2025-01-01",
    nextInspectionDate: "2026-05-20",
    alertDays: 60,
    status: "Sudah",
    keterangan: "Valid dan siap digunakan",
  },
  {
    id: "EQ-002",
    kapal: "MV South Borneo",
    jenisEquipment: "Liferaft",
    qty: "2 Unit",
    lastInspectionDate: "2025-02-12",
    nextInspectionDate: "2026-04-30",
    alertDays: 60,
    status: "Sudah",
    keterangan: "Akan segera jatuh tempo inspeksi",
  },
  {
    id: "EQ-003",
    kapal: "MV Energi Nusantara",
    jenisEquipment: "CO2 System",
    qty: "1 Set",
    lastInspectionDate: "2024-12-10",
    nextInspectionDate: "2026-03-15",
    alertDays: 60,
    status: "Expired",
    keterangan: "Perlu tindakan segera",
  },
  {
    id: "EQ-004",
    kapal: "MV Adaro Maritim",
    jenisEquipment: "SCBA / EEBD",
    qty: "4 Unit",
    lastInspectionDate: "",
    nextInspectionDate: "",
    alertDays: 60,
    status: "NIL",
    keterangan: "Tidak tersedia di kapal ini",
  },
];

function dateDiffInDays(date) {
  if (!date) return null;
  const today = new Date();
  const target = new Date(date);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getAlertStatus(item) {
  if (item.status === "NIL") {
    return {
      label: "NIL",
      tone: "bg-slate-100 text-slate-600",
      row: "bg-white",
      icon: Clock3,
    };
  }

  const remainingDays = dateDiffInDays(item.nextInspectionDate);

  if (remainingDays === null) {
    return {
      label: "Unknown",
      tone: "bg-slate-100 text-slate-600",
      row: "bg-white",
      icon: Clock3,
    };
  }

  if (remainingDays < 0) {
    return {
      label: "Expired",
      tone: "bg-red-50 text-red-700",
      row: "bg-red-50/40",
      icon: AlertTriangle,
    };
  }

  if (remainingDays <= Number(item.alertDays || 60)) {
    return {
      label: "Warning",
      tone: "bg-amber-50 text-amber-700",
      row: "bg-amber-50/40",
      icon: Clock3,
    };
  }

  return {
    label: "Aman",
    tone: "bg-emerald-50 text-emerald-700",
    row: "bg-white",
    icon: CheckCircle2,
  };
}

function AlertBadge({ item }) {
  const alert = getAlertStatus(item);

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${alert.tone}`}>
      <alert.icon size={12} />
      {alert.label}
    </span>
  );
}

function DetailModal({ data, onClose }) {
  if (!data) return null;

  const remainingDays = dateDiffInDays(data.nextInspectionDate);
  const rows = [
    ["Kapal", data.kapal],
    ["Jenis Equipment", data.jenisEquipment],
    ["Qty", data.qty],
    ["Last Inspection", formatDate(data.lastInspectionDate)],
    ["Next Inspection", formatDate(data.nextInspectionDate)],
    ["Alert Days", `${data.alertDays || 0} hari`],
    ["Sisa Hari", remainingDays === null ? "-" : `${remainingDays} hari`],
    ["Status Input", data.status],
    ["Keterangan", data.keterangan || "-"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[620px] rounded-[16px] border border-[#e5eaee] bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[#edf1f4] px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-[#1f2b38]">
              Detail Equipment Alert
            </p>
            <p className="mt-0.5 text-[11px] text-[#8a95a2]">{data.id}</p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6b7a87] hover:bg-[#eaeff3]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-[12px] border border-[#edf1f4] bg-[#fafbfc] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                {label}
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#243041]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EquipmentExpiryAlertPage() {
  const [equipment] = useState(INITIAL_EQUIPMENT);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detailData, setDetailData] = useState(null);

  const computedEquipment = useMemo(() => {
    return equipment.map((item) => {
      const remainingDays = dateDiffInDays(item.nextInspectionDate);
      const alert = getAlertStatus(item);

      return {
        ...item,
        remainingDays,
        alertLabel: alert.label,
      };
    });
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    return computedEquipment.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.kapal.toLowerCase().includes(keyword) ||
        item.jenisEquipment.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword);

      const matchStatus =
        filterStatus === "all" || item.alertLabel.toLowerCase() === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [computedEquipment, search, filterStatus]);

  const totalEquipment = computedEquipment.length;
  const expiredCount = computedEquipment.filter((i) => i.alertLabel === "Expired").length;
  const warningCount = computedEquipment.filter((i) => i.alertLabel === "Warning").length;
  const safeCount = computedEquipment.filter((i) => i.alertLabel === "Aman").length;

  const nearestEquipment = computedEquipment
    .filter((item) => item.remainingDays !== null)
    .sort((a, b) => a.remainingDays - b.remainingDays)[0];

  const stats = [
    {
      title: "Total Equipment",
      value: String(totalEquipment).padStart(2, "0"),
      note: "Data dari LSA & FFA",
      icon: LifeBuoy,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Expired",
      value: String(expiredCount).padStart(2, "0"),
      note: "Butuh tindakan segera",
      icon: AlertTriangle,
      tone: "bg-red-50 text-red-700",
    },
    {
      title: "Warning",
      value: String(warningCount).padStart(2, "0"),
      note: "Mendekati jatuh tempo",
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      title: "Aman",
      value: String(safeCount).padStart(2, "0"),
      note: "Masih valid",
      icon: CheckCircle2,
      tone: "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 text-white shadow-[0_16px_36px_rgba(16,185,129,0.18)]">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/85">
              <LifeBuoy size={14} />
              Equipment Expiry Alert
            </div>

            <h1 className="mt-3 text-[22px] font-bold leading-tight">
              Monitoring equipment LSA & FFA yang mendekati expired.
            </h1>

            <p className="mt-2 max-w-2xl text-[13px] text-white/82">
              Sistem membaca data inspeksi dari modul LSA & FFA untuk menampilkan equipment yang aman,
              warning, expired, atau NIL.
            </p>
          </div>

          <div className="rounded-[16px] bg-white/12 px-5 py-4">
            <p className="text-[12px] text-white/70">Jatuh tempo terdekat</p>
            <p className="mt-1 text-[18px] font-bold">
              {nearestEquipment?.jenisEquipment || "-"}
            </p>
            <p className="mt-1 text-[12px] text-white/80">
              {nearestEquipment
                ? `${nearestEquipment.kapal} • ${nearestEquipment.remainingDays} hari`
                : "Belum ada data"}
            </p>
          </div>
        </div>

        <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Alert Rule</p>
            <p className="mt-2 text-[20px] font-bold">≤ 60 Hari</p>
            <p className="mt-1 text-[12px] text-white/75">Default warning period</p>
          </div>

          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Source Data</p>
            <div className="mt-2 flex items-center gap-2">
              <Ship size={18} className="text-white" />
              <span className="text-[20px] font-bold">LSA & FFA</span>
            </div>
          </div>

          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Critical Item</p>
            <p className="mt-2 text-[24px] font-bold leading-none">
              {expiredCount + warningCount}
            </p>
            <p className="mt-1 text-[12px] text-white/75">Expired + Warning</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium text-[#44505e]">{item.title}</p>
                    <p className="mt-2 text-[24px] font-bold leading-none text-[#1f2b38]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[12px] text-[#73808d]">{item.note}</p>
                  </div>

                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.tone}`}>
                    <Icon size={22} strokeWidth={2.1} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-[#edf1f4] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-[#243041]">
                Equipment Alert Register
              </h2>
              <p className="mt-1 text-[12px] text-[#7a8692]">
                Daftar equipment berdasarkan next inspection date.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kapal/equipment..."
                  className="w-full rounded-[10px] border border-[#dde3e8] bg-white py-2 pl-9 pr-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-[240px]"
                />
              </div>

              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-[10px] border border-[#dde3e8] bg-white py-2 pl-9 pr-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-[180px]"
                >
                  <option value="all">Semua Status</option>
                  <option value="expired">Expired</option>
                  <option value="warning">Warning</option>
                  <option value="aman">Aman</option>
                  <option value="nil">NIL</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 430 }}>
            {filteredEquipment.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#9aa4ae]">
                Tidak ada data equipment.
              </div>
            ) : (
              <table className="min-w-[980px] w-full border-collapse text-[11px]">
                <thead>
                  <tr className="sticky top-0 z-10 bg-[#f8fafb]">
                    {[
                      "KAPAL",
                      "EQUIPMENT",
                      "QTY",
                      "LAST INSPECTION",
                      "NEXT INSPECTION",
                      "SISA HARI",
                      "ALERT",
                      "KETERANGAN",
                      "AKSI",
                    ].map((head) => (
                      <th
                        key={head}
                        className="whitespace-nowrap border-b border-[#edf1f4] px-3 py-2 text-left text-[9px] font-semibold tracking-wider text-[#8b96a1]"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredEquipment.map((item) => {
                    const alert = getAlertStatus(item);

                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-[#f0f3f5] transition-colors hover:bg-[#fafbfc] ${alert.row}`}
                      >
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#243041]">
                          {item.kapal}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                          {item.jenisEquipment}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                          {item.qty}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                          {formatDate(item.lastInspectionDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-[#243041]">
                          {formatDate(item.nextInspectionDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4a5568]">
                          {item.remainingDays === null ? "-" : `${item.remainingDays} hari`}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <AlertBadge item={item} />
                        </td>
                        <td className="max-w-[220px] px-3 py-3 text-[#6b7280]">
                          <p className="line-clamp-2">{item.keterangan || "-"}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <button
                            onClick={() => setDetailData(item)}
                            className="inline-flex items-center gap-1 rounded-[6px] bg-[#f3f4f6] px-2 py-1 text-[10px] font-medium text-[#374151] hover:bg-[#e5e7eb]"
                          >
                            <Eye size={11} />
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      <DetailModal data={detailData} onClose={() => setDetailData(null)} />
    </div>
  );
}