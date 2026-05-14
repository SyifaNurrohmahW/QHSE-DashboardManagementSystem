"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  LifeBuoy,
  Search,
  Ship,
  Trash,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { deleteLsaFfa, getLsaFfaList } from "@/lib/services/lsaFfaService";

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

function normalizeStatus(status) {
  if (!status) return "";

  const value = String(status).toLowerCase();

  const labels = {
    sudah: "Sudah",
    belum: "Belum",
    expired: "Expired",
    perlu_perbaikan: "Perlu Perbaikan",
    nil: "NIL",
    proses: "Proses",
  };

  return labels[value] || status;
}

function getAlertStatus(item) {
  const status = String(item.status || "").toLowerCase();

  if (status === "nil") {
    return {
      label: "NIL",
      tone: "bg-slate-100 text-slate-600",
      row: "bg-white",
      icon: Clock3,
    };
  }

  if (status === "expired") {
    return {
      label: "Expired",
      tone: "bg-red-50 text-red-700",
      row: "bg-red-50/40",
      icon: AlertTriangle,
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
  const Icon = alert.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${alert.tone}`}
    >
      <Icon size={12} />
      {alert.label}
    </span>
  );
}

function DetailModal({ data, onClose }) {
  if (!data) return null;

  const remainingDays = dateDiffInDays(data.nextInspectionDate);

  const rows = [
    ["Kapal", data.kapal || "-"],
    ["Kode Kapal", data.kodeKapal || "-"],
    ["Jenis Equipment", data.jenisEquipment || "-"],
    ["Qty", data.qty || "-"],
    ["Last Inspection", formatDate(data.lastInspectionDate)],
    ["Next Inspection", formatDate(data.nextInspectionDate)],
    ["Bulan Expired", data.bulanExpired || "-"],
    ["Alert Days", `${data.alertDays || 0} hari`],
    ["Sisa Hari", remainingDays === null ? "-" : `${remainingDays} hari`],
    ["Status Input", normalizeStatus(data.status)],
    ["Keterangan", data.keterangan || "-"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[680px] rounded-[16px] border border-[#e5eaee] bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[#edf1f4] px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-[#1f2b38]">
              Detail Equipment Alert
            </p>
            <p className="mt-0.5 text-[11px] text-[#8a95a2]">
              {data.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6b7a87] hover:bg-[#eaeff3]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="grid max-h-[70vh] gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="rounded-[12px] border border-[#edf1f4] bg-[#fafbfc] px-4 py-3"
            >
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

function DeleteModal({ data, isDeleting, onCancel, onConfirm }) {
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-[420px] rounded-[18px] border border-[#e5eaee] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.24)]">
        <h3 className="text-[20px] font-bold text-[#1f2b38]">Hapus Equipment</h3>
        <p className="mt-2 text-[13px] leading-6 text-[#667581]">
          Data <span className="font-semibold text-[#243041]">{data.jenisEquipment || data.id}</span> dari kapal{" "}
          <span className="font-semibold text-[#243041]">{data.kapal || "-"}</span> akan dihapus dari Supabase.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-[10px] border border-[#d9e2e7] px-4 py-2.5 text-[13px] font-semibold text-[#566472] hover:bg-[#f8fafb] disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-[10px] bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-red-700 disabled:opacity-70"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentExpiryAlertPage() {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [detailData, setDetailData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    getLsaFfaList()
      .then((data) => {
        if (!isMounted) return;
        setEquipment(data);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal mengambil data equipment.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDeleteEquipment() {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      setErrorMessage("");
      await deleteLsaFfa(deleteTarget.id);
      setEquipment((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDetailData((current) => (current?.id === deleteTarget.id ? null : current));
      setDeleteTarget(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menghapus data equipment.");
    } finally {
      setIsDeleting(false);
    }
  }

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
        !keyword ||
        String(item.kapal || "").toLowerCase().includes(keyword) ||
        String(item.kodeKapal || "").toLowerCase().includes(keyword) ||
        String(item.jenisEquipment || "").toLowerCase().includes(keyword) ||
        String(item.status || "").toLowerCase().includes(keyword) ||
        String(item.keterangan || "").toLowerCase().includes(keyword);

      const matchStatus =
        filterStatus === "all" ||
        String(item.alertLabel || "").toLowerCase() === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [computedEquipment, search, filterStatus]);

  const totalEquipment = computedEquipment.length;
  const expiredCount = computedEquipment.filter(
    (item) => item.alertLabel === "Expired"
  ).length;
  const warningCount = computedEquipment.filter(
    (item) => item.alertLabel === "Warning"
  ).length;
  const safeCount = computedEquipment.filter(
    (item) => item.alertLabel === "Aman"
  ).length;
  const nilCount = computedEquipment.filter(
    (item) => item.alertLabel === "NIL"
  ).length;

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
      note: `${nilCount} equipment NIL`,
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
            <p className="mt-1 text-[12px] text-white/75">
              Default warning period
            </p>
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
            <p className="mt-1 text-[12px] text-white/75">
              Expired + Warning
            </p>
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
                    <p className="text-[14px] font-medium text-[#44505e]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-[24px] font-bold leading-none text-[#1f2b38]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[12px] text-[#73808d]">
                      {item.note}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${item.tone}`}
                  >
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
                Daftar equipment berdasarkan next inspection date dari modul LSA & FFA.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a1]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari kapal/equipment..."
                  className="w-full rounded-[10px] border border-[#dde3e8] bg-white py-2 pl-9 pr-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-[240px]"
                />
              </div>

              <div className="relative">
                <Filter
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a1]"
                />
                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
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
            {loading ? (
              <div className="py-12 text-center text-[13px] text-[#9aa4ae]">
                Memuat data equipment dari LSA & FFA...
              </div>
            ) : errorMessage ? (
              <div className="py-12 text-center text-[13px] text-red-600">
                {errorMessage}
              </div>
            ) : filteredEquipment.length === 0 ? (
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
                      "STATUS INPUT",
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
                          {item.qty || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                          {formatDate(item.lastInspectionDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-[#243041]">
                          {formatDate(item.nextInspectionDate)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4a5568]">
                          {item.remainingDays === null
                            ? "-"
                            : `${item.remainingDays} hari`}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                          {normalizeStatus(item.status)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <AlertBadge item={item} />
                        </td>
                        <td className="max-w-[220px] px-3 py-3 text-[#6b7280]">
                          <p className="line-clamp-2">
                            {item.keterangan || "-"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => setDetailData(item)}
                              className="inline-flex items-center gap-1 rounded-[6px] bg-[#f3f4f6] px-2 py-1 text-[10px] font-medium text-[#374151] hover:bg-[#e5e7eb]"
                            >
                              <Eye size={11} />
                              Detail
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="inline-flex items-center gap-1 rounded-[6px] bg-[#fee2e2] px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-[#fecaca]"
                            >
                              <Trash size={11} />
                              Hapus
                            </button>
                          </div>
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
      <DeleteModal
        data={deleteTarget}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteEquipment}
      />
    </div>
  );
}
