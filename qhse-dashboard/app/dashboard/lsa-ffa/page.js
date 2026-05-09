"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Eye,
  Filter,
  Flame,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getKapalOptions } from "@/lib/services/kapalService";
import {
  createLsaFfa,
  deleteLsaFfa,
  getLsaFfaList,
  LSA_FFA_EQUIPMENT_OPTIONS,
  LSA_FFA_STATUS_OPTIONS,
  updateLsaFfa,
} from "@/lib/services/lsaFfaService";

const BULAN_OPTIONS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const EQUIPMENT_DESCRIPTIONS = {
  "PMK II": "Pemadam Kebakaran",
  "EPIRB REG TEST BASARNAS": "Emergency Position Indicating Radio Beacon",
  "SERT HRU LIFERAFT": "Hydrostatic Release Unit Liferaft",
  "Co2 System": "Fixed CO2 Fire Suppression System",
  SCBA: "Self-Contained Breathing Apparatus",
  EEBD: "Emergency Escape Breathing Device",
  "Gas Detector": "Gas Detection System",
  "HRU EPIRB": "Hydrostatic Release Unit EPIRB",
};

const STATUS_STYLE = {
  sudah: "bg-[#edf9f1] text-[#166534]",
  belum: "bg-[#fff4e5] text-[#b26a00]",
  expired: "bg-[#fff0f0] text-[#c53030]",
  perlu_perbaikan: "bg-[#faf5ff] text-[#6b21a8]",
  proses: "bg-[#eff6ff] text-[#1d4ed8]",
  nil: "bg-[#f4f5f7] text-[#55616d]",
};

const EQUIP_ICON = {
  "PMK II": Flame,
  "EPIRB REG TEST BASARNAS": Zap,
  "SERT HRU LIFERAFT": Activity,
  "Co2 System": ClipboardCheck,
  SCBA: ShieldOff,
  EEBD: ShieldOff,
  "Gas Detector": AlertTriangle,
  "HRU EPIRB": Shield,
};

const EMPTY_FORM = {
  kapal_id: "",
  jenisEquipment: "",
  qty: "",
  lastInspectionDate: "",
  nextInspectionDate: "",
  bulanExpired: "",
  alertDays: "",
  status: "",
  keterangan: "",
};

function fmtDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function alertLabel(days) {
  if (days === null || days === undefined || days === "") return null;
  const numericDays = Number(days);
  if (Number.isNaN(numericDays)) return null;
  if (numericDays < 0) return { text: `${Math.abs(numericDays)}h lewat`, cls: "bg-[#fff0f0] text-[#c53030]" };
  if (numericDays <= 30) return { text: `${numericDays}h lagi`, cls: "bg-[#fff7e8] text-[#b26a00]" };
  if (numericDays <= 90) return { text: `${numericDays}h lagi`, cls: "bg-[#fffbeb] text-[#92740a]" };
  return { text: `${numericDays}h lagi`, cls: "bg-[#f0fdf4] text-[#166534]" };
}

function isOverdue(item) {
  return item.alertDays !== "" && item.alertDays !== null && Number(item.alertDays) < 0;
}

function needsAlert(item) {
  return item.alertDays !== "" && item.alertDays !== null && Number(item.alertDays) <= 30;
}

function Pill({ item }) {
  const label = item.statusLabel || LSA_FFA_STATUS_OPTIONS.find((option) => option.value === item.status)?.label || item.status || "-";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[item.status] || "bg-[#f4f5f7] text-[#55616d]"}`}>
      {label}
    </span>
  );
}

function AlertBadge({ days }) {
  const info = alertLabel(days);
  if (!info) return <span className="text-[11px] text-[#9aa4ae]">-</span>;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${info.cls}`}>{info.text}</span>;
}

function FormField({ label, req, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7a87]">
        {label} {req ? <span className="text-[#c53030]">*</span> : null}
      </label>
      {children}
      {error ? <span className="text-[10px] text-[#c53030]">Wajib diisi</span> : null}
    </div>
  );
}

function FormModal({ isOpen, onClose, onSave, initialData, isEdit, kapalOptions, isSaving }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: false }));
  };

  const inputCls = (key) =>
    `w-full rounded-[10px] border px-3 py-2 text-[13px] text-[#1f2b38] bg-white outline-none transition focus:border-[#1a6b4e] focus:ring-2 focus:ring-[#d1fae5] ${
      errors[key] ? "border-[#c53030]" : "border-[#dde4ea]"
    }`;

  function handleSave() {
    const required = ["kapal_id", "jenisEquipment", "status"];
    const nextErrors = {};
    required.forEach((key) => {
      if (!String(form[key] || "").trim()) nextErrors[key] = true;
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave(form);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="w-full max-w-[640px] overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <div className="border-b border-[#edf2f7] bg-gradient-to-r from-[#f0fdf8] to-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#166534]">
                <Shield size={13} />
                LSA &amp; FFA
              </div>
              <h2 className="mt-3 text-[20px] font-bold text-[#0f2b1f]">
                {isEdit ? "Edit Data Equipment" : "Tambah Data Equipment"}
              </h2>
              <p className="mt-1 text-[12px] text-[#6b7a87]">
                Data equipment akan disimpan langsung ke Supabase.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#6b7a87] shadow-sm hover:bg-[#f4f7f9] disabled:opacity-60"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-6 py-5">
          <FormField label="Kapal" req error={errors.kapal_id}>
            <select className={inputCls("kapal_id")} value={form.kapal_id || ""} onChange={set("kapal_id")}>
              <option value="">-- Pilih Kapal --</option>
              {kapalOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Status" req error={errors.status}>
            <select className={inputCls("status")} value={form.status} onChange={set("status")}>
              <option value="">-- Pilih Status --</option>
              {LSA_FFA_STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="col-span-2">
            <FormField label="Jenis Equipment" req error={errors.jenisEquipment}>
              <select className={inputCls("jenisEquipment")} value={form.jenisEquipment} onChange={set("jenisEquipment")}>
                <option value="">-- Pilih Equipment --</option>
                {LSA_FFA_EQUIPMENT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label} - {EQUIPMENT_DESCRIPTIONS[item.label] || "Equipment"}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Qty / Jumlah" error={errors.qty}>
            <input className={inputCls("qty")} value={form.qty} onChange={set("qty")} placeholder="Contoh: 8 atau 2 cyl" />
          </FormField>

          <FormField label="Bulan Expired" error={errors.bulanExpired}>
            <select className={inputCls("bulanExpired")} value={form.bulanExpired || ""} onChange={set("bulanExpired")}>
              <option value="">-- Pilih Bulan --</option>
              {BULAN_OPTIONS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Last Inspection Date" error={errors.lastInspectionDate}>
            <input
              type="date"
              className={inputCls("lastInspectionDate")}
              value={form.lastInspectionDate || ""}
              onChange={set("lastInspectionDate")}
            />
          </FormField>

          <FormField label="Next Inspection Date" error={errors.nextInspectionDate}>
            <input
              type="date"
              className={inputCls("nextInspectionDate")}
              value={form.nextInspectionDate || ""}
              onChange={set("nextInspectionDate")}
            />
          </FormField>

          <FormField label="Alert Days" error={errors.alertDays}>
            <input
              type="number"
              className={inputCls("alertDays")}
              value={form.alertDays ?? ""}
              onChange={set("alertDays")}
              placeholder="Isi negatif jika sudah lewat"
            />
          </FormField>

          <div className="col-span-2">
            <FormField label="Keterangan" error={errors.keterangan}>
              <textarea
                rows={3}
                className={`${inputCls("keterangan")} resize-y`}
                value={form.keterangan}
                onChange={set("keterangan")}
                placeholder="Catatan tambahan, kondisi khusus, dsb."
              />
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#edf2f7] bg-[#fafbfd] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-[10px] bg-[#eef2f5] px-4 py-2 text-[12px] font-semibold text-[#5a6672] hover:bg-[#e4ebf0] disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-[10px] bg-[#15803d] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#126c33] disabled:opacity-70"
          >
            {isSaving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Data"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose }) {
  if (!item) return null;
  const Icon = EQUIP_ICON[item.jenisEquipment] || Shield;
  const alert = alertLabel(item.alertDays);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[540px] overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <div className="border-b border-[#edf2f7] bg-gradient-to-r from-[#f0fdf8] to-white px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcfce7] text-[#166534]">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#166534]">{item.id}</p>
                <h3 className="mt-0.5 text-[16px] font-bold text-[#0f2b1f]">{item.jenisEquipment}</h3>
              </div>
            </div>
            <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6b7a87]">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <Pill item={item} />
            {alert ? <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium ${alert.cls}`}>{alert.text}</span> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Kapal", value: item.kapal },
              { label: "Qty", value: item.qty || "-" },
              { label: "Bulan Expired", value: item.bulanExpired || "-" },
              { label: "Alert Days", value: item.alertDays !== "" && item.alertDays !== null ? `${item.alertDays} hari` : "-" },
              { label: "Last Inspection", value: fmtDate(item.lastInspectionDate) },
              { label: "Next Inspection", value: fmtDate(item.nextInspectionDate) },
            ].map((row) => (
              <div key={row.label} className="rounded-[12px] border border-[#edf2f7] bg-[#fafbfd] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b96a1]">{row.label}</p>
                <p className="mt-1 text-[14px] font-medium text-[#1f2b38]">{row.value}</p>
              </div>
            ))}
          </div>

          {EQUIPMENT_DESCRIPTIONS[item.jenisEquipment] ? (
            <div className="rounded-[12px] border border-[#edf2f7] bg-[#fafbfd] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b96a1]">Deskripsi Equipment</p>
              <p className="mt-1 text-[13px] text-[#4f5b67]">{EQUIPMENT_DESCRIPTIONS[item.jenisEquipment]}</p>
            </div>
          ) : null}

          {item.keterangan ? (
            <div className="rounded-[12px] border border-[#edf2f7] bg-[#fafbfd] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b96a1]">Keterangan</p>
              <p className="mt-1 text-[13px] text-[#4f5b67]">{item.keterangan}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ id, isOpen, onCancel, onConfirm, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3">
      <div className="w-full max-w-[360px] rounded-[18px] border border-[#e2e8f0] bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-[#c53030]">
          <Trash2 size={20} />
        </div>
        <p className="text-[15px] font-bold text-[#1f2b38]">Hapus data equipment?</p>
        <p className="mt-2 text-[12px] text-[#6b7a87]">
          Data <span className="font-semibold text-[#1f2b38]">{id}</span> akan dihapus dari Supabase.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-[10px] bg-[#eef2f5] px-4 py-2 text-[12px] font-semibold text-[#5a6672] disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-[10px] bg-[#c53030] px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-70"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LsaFfaPage() {
  const [data, setData] = useState([]);
  const [kapalOptions, setKapalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [equipFilter, setEquipFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [alertFilter, setAlertFilter] = useState("Semua");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getLsaFfaList()
      .then((result) => {
        if (!isMounted) return;
        setData(result);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal mengambil data LSA & FFA.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    getKapalOptions()
      .then((result) => {
        if (!isMounted) return;
        setKapalOptions(result);
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal mengambil data kapal.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = data.length;
    const vessels = new Set(data.map((item) => item.kapal).filter(Boolean)).size;
    const sudah = data.filter((item) => item.status === "sudah").length;
    const perluPerbaikan = data.filter((item) => ["belum", "perlu_perbaikan", "proses"].includes(item.status)).length;
    const expired = data.filter((item) => item.status === "expired" || isOverdue(item)).length;
    const needAlert = data.filter(needsAlert).length;
    return { total, vessels, sudah, perluPerbaikan, expired, needAlert };
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const keyword = search.toLowerCase();
      const matchSearch =
        !keyword ||
        String(item.kapal).toLowerCase().includes(keyword) ||
        String(item.jenisEquipment).toLowerCase().includes(keyword) ||
        String(item.id).toLowerCase().includes(keyword);

      const matchEquip = equipFilter === "Semua" || item.jenisEquipment === equipFilter;
      const matchStatus = statusFilter === "Semua" || item.status === statusFilter;
      const matchAlert =
        alertFilter === "Semua"
          ? true
          : alertFilter === "Lewat"
            ? isOverdue(item)
            : alertFilter === "<=30 Hari"
              ? item.alertDays !== "" && item.alertDays !== null && Number(item.alertDays) >= 0 && Number(item.alertDays) <= 30
              : alertFilter === ">30 Hari"
                ? item.alertDays !== "" && item.alertDays !== null && Number(item.alertDays) > 30
                : true;

      return matchSearch && matchEquip && matchStatus && matchAlert;
    });
  }, [data, search, equipFilter, statusFilter, alertFilter]);

  const alertItems = useMemo(() => {
    return [...data]
      .filter(needsAlert)
      .sort((left, right) => Number(left.alertDays || 0) - Number(right.alertDays || 0))
      .slice(0, 6);
  }, [data]);

  const vesselSummary = useMemo(() => {
    const summary = new Map();
    data.forEach((item) => {
      const vessel = item.kapal || "-";
      const current = summary.get(vessel) || { vessel, total: 0, overdue: 0 };
      current.total += 1;
      if (isOverdue(item)) current.overdue += 1;
      summary.set(vessel, current);
    });
    return [...summary.values()];
  }, [data]);

  function openCreate() {
    setEditItem(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditItem({
      ...item,
      jenisEquipment: item.jenisEquipmentValue || item.jenisEquipment,
      lastInspectionDate: toDateInput(item.lastInspectionDate),
      nextInspectionDate: toDateInput(item.nextInspectionDate),
    });
    setModalOpen(true);
  }

  async function handleSave(item) {
    try {
      setIsSaving(true);
      setErrorMessage("");

      if (editItem) {
        const updated = await updateLsaFfa(editItem.id, item);
        setData((current) => current.map((entry) => (entry.id === editItem.id ? updated : entry)));
      } else {
        const created = await createLsaFfa(item);
        setData((current) => [created, ...current]);
      }

      setModalOpen(false);
      setEditItem(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyimpan data LSA & FFA.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setErrorMessage("");
      await deleteLsaFfa(deleteId);
      setData((current) => current.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menghapus data LSA & FFA.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[20px] bg-gradient-to-r from-[#0f4d2f] via-[#166534] to-[#15803d] text-white shadow-[0_16px_36px_rgba(21,128,61,0.25)]">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
              <Shield size={13} />
              LSA &amp; FFA Management
            </div>
            <h1 className="mt-3 text-[22px] font-bold leading-snug">
              Life-Saving Appliances &amp; Fire Fighting Apparatus
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-white/82">
              Monitor status inspeksi, masa berlaku, dan alert equipment keselamatan jiwa berdasarkan data Supabase.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#15803d]"
            >
              <Plus size={15} />
              Tambah Data
            </button>
          </div>
        </div>

        <div className="grid border-t border-white/10 bg-white/10 sm:grid-cols-4">
          {[
            { label: "Total Kapal", value: stats.vessels, note: "unit dalam armada" },
            { label: "Total Equipment", value: stats.total, note: "record terdaftar" },
            { label: "Alert <= 30 Hari", value: stats.needAlert, note: "segera dijadwalkan" },
            { label: "Overdue / Expired", value: stats.expired, note: "perlu perhatian" },
          ].map((item) => (
            <div key={item.label} className="border-r border-white/10 px-5 py-4 last:border-r-0">
              <p className="text-[11px] text-white/72">{item.label}</p>
              <p className="mt-1.5 text-[24px] font-bold leading-none">{item.value}</p>
              <p className="mt-1 text-[11px] text-white/72">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Sudah Inspeksi", value: stats.sudah, note: "Status terverifikasi", icon: BadgeCheck, bg: "bg-[#edf9f1]", color: "text-[#15803d]" },
          { title: "Perlu Perhatian", value: stats.perluPerbaikan, note: "Belum / Perlu Perbaikan", icon: AlertTriangle, bg: "bg-[#fff7e8]", color: "text-[#b26a00]" },
          { title: "Overdue", value: stats.expired, note: "Next date sudah terlewati", icon: ShieldOff, bg: "bg-[#fff0f0]", color: "text-[#c53030]" },
          { title: "Alert <= 30 Hari", value: stats.needAlert, note: "Segera jadwalkan inspeksi", icon: ArrowUpRight, bg: "bg-[#eff6ff]", color: "text-[#1d4ed8]" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-[#536070]">{item.title}</p>
                    <p className="mt-2 text-[26px] font-bold leading-none text-[#1f2b38]">{String(item.value).padStart(2, "0")}</p>
                    <p className="mt-2 text-[11px] text-[#7c8793]">{item.note}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {errorMessage ? (
        <div className="rounded-[16px] border border-[#ffd7d7] bg-[#fff7f7] px-4 py-3 text-[13px] font-medium text-[#b42318]">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.75fr_1fr]">
        <Card className="overflow-hidden border-[#edf2f7]">
          <CardContent className="p-0">
            <div className="border-b border-[#edf2f7] px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#1f2b38]">Register LSA &amp; FFA</h2>
                  <p className="mt-1 text-[12px] text-[#7c8793]">
                    Menampilkan {filtered.length} dari {data.length} record
                  </p>
                </div>
                <div className="relative w-full lg:w-[260px]">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari kapal, equipment, ID..."
                    className="w-full rounded-[10px] border border-[#dde4ea] bg-white py-2 pl-9 pr-3 text-[12px] outline-none focus:border-[#15803d] focus:ring-2 focus:ring-[#d1fae5]"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="relative">
                  <select
                    value={equipFilter}
                    onChange={(event) => setEquipFilter(event.target.value)}
                    className="appearance-none rounded-full border border-[#dde4ea] bg-white py-1.5 pl-3 pr-7 text-[11px] font-medium text-[#536070] focus:outline-none"
                  >
                    <option>Semua</option>
                    {LSA_FFA_EQUIPMENT_OPTIONS.map((item) => (
                      <option key={item.value} value={item.label}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[{ label: "Semua", value: "Semua" }, ...LSA_FFA_STATUS_OPTIONS].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setStatusFilter(item.value)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                        statusFilter === item.value ? "bg-[#15803d] text-white" : "bg-[#f4f7f9] text-[#6b7a87] hover:bg-[#e8edf2]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {["Semua", "Lewat", "<=30 Hari", ">30 Hari"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setAlertFilter(item)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                        alertFilter === item ? "bg-[#1d4ed8] text-white" : "bg-[#eff6ff] text-[#3b64c8] hover:bg-[#dbeafe]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {(search || equipFilter !== "Semua" || statusFilter !== "Semua" || alertFilter !== "Semua") ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setEquipFilter("Semua");
                      setStatusFilter("Semua");
                      setAlertFilter("Semua");
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-[#fff0f0] px-3 py-1 text-[11px] font-semibold text-[#c53030]"
                  >
                    <RotateCcw size={11} />
                    Reset
                  </button>
                ) : null}
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="sticky top-0 z-10 bg-[#f8fafb]">
                    {["ID", "Kapal", "Equipment", "Qty", "Last Inspeksi", "Next Inspeksi", "Bulan Exp", "Alert", "Status", "Aksi"].map((header) => (
                      <th key={header} className="whitespace-nowrap border-b border-[#edf2f7] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#8b96a1]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-14 text-center text-[13px] text-[#8b96a1]">
                        Memuat data LSA & FFA...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-14 text-center text-[13px] text-[#8b96a1]">
                        Tidak ada data yang cocok
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => {
                      const Icon = EQUIP_ICON[item.jenisEquipment] || Shield;
                      return (
                        <tr key={item.id} className={`border-b border-[#f0f4f7] transition hover:bg-[#fafcfb] ${isOverdue(item) ? "bg-[#fffafa]" : ""}`}>
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#536070]">{item.id}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-medium text-[#243041]">{item.kapal}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <Icon size={13} className="flex-shrink-0 text-[#15803d]" />
                              <span className="text-[#243041]">{item.jenisEquipment}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-[#536070]">{item.qty || "-"}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#8b96a1]">{fmtDate(item.lastInspectionDate)}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#8b96a1]">{fmtDate(item.nextInspectionDate)}</td>
                          <td className="px-3 py-3 text-center">
                            {item.bulanExpired ? (
                              <span className="rounded-full bg-[#f0fdf8] px-2 py-0.5 text-[10px] font-semibold text-[#15803d]">{item.bulanExpired}</span>
                            ) : (
                              <span className="text-[#c4cdd6]">-</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3"><AlertBadge days={item.alertDays} /></td>
                          <td className="whitespace-nowrap px-3 py-3"><Pill item={item} /></td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <div className="flex gap-1">
                              <button type="button" onClick={() => setDetailItem(item)} className="inline-flex items-center gap-1 rounded-[7px] bg-[#f4f7f9] px-2 py-1 text-[10px] font-medium text-[#536070] hover:bg-[#e8edf2]">
                                <Eye size={11} /> Detail
                              </button>
                              <button type="button" onClick={() => openEdit(item)} className="inline-flex items-center gap-1 rounded-[7px] bg-[#eff6ff] px-2 py-1 text-[10px] font-medium text-[#1d4ed8] hover:bg-[#dbeafe]">
                                <Pencil size={11} /> Edit
                              </button>
                              <button type="button" onClick={() => setDeleteId(item.id)} className="inline-flex items-center gap-1 rounded-[7px] bg-[#fff0f0] px-2 py-1 text-[10px] font-medium text-[#c53030] hover:bg-[#fee2e2]">
                                <Trash2 size={11} /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-[#edf2f7]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#1f2b38]">Alert &amp; Overdue</h2>
                  <p className="mt-0.5 text-[11px] text-[#7c8793]">Equipment dengan masa inspeksi kritis</p>
                </div>
                <span className="rounded-full bg-[#fff0f0] px-3 py-1 text-[11px] font-semibold text-[#c53030]">
                  {alertItems.length} item
                </span>
              </div>
              <div className="mt-4 space-y-2 overflow-y-auto" style={{ maxHeight: 280 }}>
                {alertItems.length === 0 ? (
                  <div className="py-8 text-center text-[12px] text-[#8b96a1]">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-[#15803d]" />
                    Semua equipment dalam kondisi baik
                  </div>
                ) : (
                  alertItems.map((item) => {
                    const Icon = EQUIP_ICON[item.jenisEquipment] || Shield;
                    return (
                      <div key={item.id} className={`flex items-start gap-3 rounded-[12px] border p-3 ${isOverdue(item) ? "border-[#fecaca] bg-[#fffafa]" : "border-[#fde68a] bg-[#fffdf0]"}`}>
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isOverdue(item) ? "bg-[#fee2e2] text-[#c53030]" : "bg-[#fef3c7] text-[#b26a00]"}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-[#1f2b38]">{item.kapal}</p>
                          <p className="mt-0.5 text-[11px] leading-snug text-[#536070]">{item.jenisEquipment}</p>
                          <p className="mt-1 text-[10px] text-[#7c8793]">Next: {fmtDate(item.nextInspectionDate)}</p>
                        </div>
                        <AlertBadge days={item.alertDays} />
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#edf2f7]">
            <CardContent className="p-5">
              <h2 className="text-[15px] font-semibold text-[#1f2b38]">Ringkasan per Kapal</h2>
              <p className="mt-0.5 text-[11px] text-[#7c8793]">Jumlah equipment terdaftar per unit</p>
              <div className="mt-4 space-y-2 overflow-y-auto" style={{ maxHeight: 240 }}>
                {vesselSummary.length ? (
                  vesselSummary.map((item) => (
                    <div key={item.vessel} className="flex items-center justify-between rounded-[10px] border border-[#edf2f7] bg-[#fafbfd] px-3 py-2.5">
                      <div>
                        <p className="text-[12px] font-semibold text-[#243041]">{item.vessel}</p>
                        <p className="text-[10px] text-[#8b96a1]">{item.total} equipment</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.overdue > 0 ? (
                          <span className="rounded-full bg-[#fff0f0] px-2 py-0.5 text-[10px] font-semibold text-[#c53030]">
                            {item.overdue} overdue
                          </span>
                        ) : null}
                        <Filter size={12} className="text-[#c4cdd6]" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-[#8b96a1]">Belum ada ringkasan kapal.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <FormModal
        key={editItem?.id || modalOpen}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSave={handleSave}
        initialData={editItem || EMPTY_FORM}
        isEdit={!!editItem}
        kapalOptions={kapalOptions}
        isSaving={isSaving}
      />
      <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      <ConfirmModal id={deleteId} isOpen={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={handleDelete} isDeleting={isDeleting} />
    </div>
  );
}
