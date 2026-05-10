"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Eye,
  FileDown,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Shield,
  TimerReset,
  Trash2,
  X,
} from "lucide-react";
import AttachmentModulePanel from "@/components/dashboard/attachment-module-panel";
import { Card, CardContent } from "@/components/ui/card";
import { getKapalOptions } from "@/lib/services/kapalService";
import {
  createSecurityRecord,
  deleteSecurityRecord,
  getSecurityRecords,
  updateSecurityRecord,
} from "@/lib/services/securityService";

const MONTH_OPTIONS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "On Progress", value: "on_progress" },
  { label: "Closed", value: "closed" },
];

const STATUS_STYLE = {
  open: "bg-[#fff4e5] text-[#b26a00]",
  on_progress: "bg-[#eef4ff] text-[#376ad6]",
  closed: "bg-[#edf9f1] text-[#1f9b58]",
};

const STATUS_LABEL = {
  open: "Open",
  on_progress: "On Progress",
  closed: "Closed",
};

const EMPTY_FORM = {
  id: "",
  kapal_id: "",
  kapal: "",
  tahun: "",
  bulan: "",
  noUrut: "",
  tanggal: "",
  deskripsi: "",
  keterangan: "",
  status: "open",
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Pill({ label }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLE[label] || "bg-[#edf1f4] text-[#55616d]"}`}>
      {STATUS_LABEL[label] || label || "-"}
    </span>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
        {label} {required ? <span className="text-[#c53030]">*</span> : null}
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

  const inputClass = (name) =>
    `w-full rounded-[12px] border bg-white px-3 py-2.5 text-[13px] text-[#273240] outline-none transition focus:border-[#15803d] focus:ring-2 focus:ring-[#d1fae5] ${
      errors[name] ? "border-[#c53030]" : "border-[#dfe5ea]"
    }`;

  const updateField = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: false }));
  };

  const updateKapal = (event) => {
    const kapalId = event.target.value;
    const selected = kapalOptions.find((item) => String(item.value) === kapalId);
    setForm((current) => ({
      ...current,
      kapal_id: kapalId,
      kapal: selected?.nama_kapal || "",
    }));
    setErrors((current) => ({ ...current, kapal_id: false }));
  };

  function handleSubmit() {
    const requiredFields = ["kapal_id", "tahun", "bulan", "noUrut", "tanggal", "deskripsi", "status"];
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!String(form[field] || "").trim()) nextErrors[field] = true;
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      ...form,
      tahun: Number(form.tahun),
      noUrut: Number(form.noUrut),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="w-full max-w-[720px] overflow-hidden rounded-[24px] border border-[#e3e8ed] bg-white shadow-[0_28px_60px_rgba(15,23,42,0.24)]">
        <div className="border-b border-[#edf1f4] bg-[linear-gradient(135deg,#f2fbf5_0%,#ffffff_45%,#f7fbf8_100%)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#edf9f1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1f9b58]">
                <Shield size={14} />
                Security Record
              </div>
              <h2 className="mt-3 text-[22px] font-bold text-[#1f2b38]">{isEdit ? "Edit Security Record" : "Tambah Security Record"}</h2>
              <p className="mt-1 text-[13px] text-[#6f7c89]">Data akan disimpan ke Database</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6e7b87] shadow-sm hover:bg-[#f4f7f9] disabled:opacity-60"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <FormField label="Kapal" required error={errors.kapal_id}>
            <select className={inputClass("kapal_id")} value={form.kapal_id || ""} onChange={updateKapal}>
              <option value="">Pilih kapal</option>
              {kapalOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tahun" required error={errors.tahun}>
            <input type="number" className={inputClass("tahun")} value={form.tahun} onChange={updateField("tahun")} placeholder="Contoh: 2026" />
          </FormField>

          <FormField label="Bulan" required error={errors.bulan}>
            <select className={inputClass("bulan")} value={form.bulan} onChange={updateField("bulan")}>
              <option value="">Pilih bulan</option>
              {MONTH_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="No Urut" required error={errors.noUrut}>
            <input type="number" min="1" className={inputClass("noUrut")} value={form.noUrut} onChange={updateField("noUrut")} placeholder="Contoh: 1" />
          </FormField>

          <FormField label="Tanggal" required error={errors.tanggal}>
            <input type="date" className={inputClass("tanggal")} value={form.tanggal} onChange={updateField("tanggal")} />
          </FormField>

          <FormField label="Status" required error={errors.status}>
            <select className={inputClass("status")} value={form.status} onChange={updateField("status")}>
              <option value="">Pilih status</option>
              {STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Deskripsi" required error={errors.deskripsi}>
              <textarea
                rows={4}
                className={`${inputClass("deskripsi")} resize-none`}
                value={form.deskripsi}
                onChange={updateField("deskripsi")}
                placeholder="Tuliskan deskripsi temuan / catatan security record"
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField label="Keterangan">
              <input
                className={inputClass("keterangan")}
                value={form.keterangan}
                onChange={updateField("keterangan")}
                placeholder="Catatan tambahan atau tindak lanjut"
              />
            </FormField>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#edf1f4] bg-[#fbfcfd] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#7a8793]">Simpan akan langsung memperbarui data di daftar security record.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-[12px] bg-[#eef2f5] px-4 py-2.5 text-[13px] font-semibold text-[#5a6672] hover:bg-[#e6ebef] disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-[12px] bg-[#15803d] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#126c33] disabled:opacity-70"
            >
              {isSaving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Record"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose }) {
  if (!item) return null;

  const details = [
    { label: "ID Record", value: item.id },
    { label: "Kapal", value: item.kapal },
    { label: "Tahun", value: item.tahun },
    { label: "Bulan", value: item.bulan },
    { label: "No Urut", value: item.noUrut },
    { label: "Tanggal", value: formatDate(item.tanggal) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-4 sm:py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-[680px] flex-col overflow-hidden rounded-[24px] border border-[#e3e8ed] bg-white shadow-[0_28px_60px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between border-b border-[#edf1f4] px-6 py-5">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1f9b58]">Detail Security Record</p>
            <h2 className="mt-2 text-[22px] font-bold text-[#1f2b38]">{item.kapal}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6e7b87] hover:bg-[#e8edf2]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <Pill label={item.status} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {details.map((row) => (
              <div key={row.label} className="rounded-[14px] border border-[#edf1f4] bg-[#fafbfd] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">{row.label}</p>
                <p className="mt-1 text-[14px] font-medium text-[#263240]">{row.value || "-"}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[16px] border border-[#edf1f4] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">Deskripsi</p>
            <p className="mt-2 text-[14px] leading-6 text-[#4f5b67]">{item.deskripsi || "-"}</p>
          </div>

          <div className="rounded-[16px] border border-[#edf1f4] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">Keterangan</p>
            <p className="mt-2 text-[14px] leading-6 text-[#4f5b67]">{item.keterangan || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ itemId, isOpen, onCancel, onConfirm, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div className="w-full max-w-[380px] rounded-[22px] border border-[#e3e8ed] bg-white p-6 text-center shadow-[0_28px_60px_rgba(15,23,42,0.24)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0f0] text-[#c53030]">
          <Trash2 size={22} />
        </div>
        <h3 className="mt-4 text-[18px] font-bold text-[#1f2b38]">Hapus record ini?</h3>
        <p className="mt-2 text-[13px] leading-6 text-[#6e7b87]">
          Data <span className="font-semibold text-[#25313f]">{itemId}</span> akan dihapus dari Supabase.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-[12px] bg-[#eef2f5] px-4 py-2.5 text-[13px] font-semibold text-[#5a6672] hover:bg-[#e6ebef] disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-[12px] bg-[#c53030] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#af2a2a] disabled:opacity-70"
          >
            {isDeleting ? "Menghapus..." : "Ya, hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const [data, setData] = useState([]);
  const [kapalOptions, setKapalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [kapalFilter, setKapalFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [bulanFilter, setBulanFilter] = useState("Semua");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getSecurityRecords()
      .then((result) => {
        if (!isMounted) return;
        setData(result);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal mengambil security record.");
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

  const kapalFilterOptions = useMemo(() => [...new Set(data.map((item) => item.kapal).filter(Boolean))], [data]);

  const stats = useMemo(() => {
    const total = data.length;
    const totalKapal = new Set(data.map((item) => item.kapal).filter(Boolean)).size;
    const open = data.filter((item) => item.status === "open").length;
    const progress = data.filter((item) => item.status === "on_progress").length;
    const closed = data.filter((item) => item.status === "closed").length;

    return { total, totalKapal, open, progress, closed };
  }, [data]);

  const monthlySummary = useMemo(() => {
    return MONTH_OPTIONS.map((month) => {
      const items = data.filter((item) => item.bulan === month);
      return {
        month,
        total: items.length,
        open: items.filter((item) => item.status === "open").length,
        progress: items.filter((item) => item.status === "on_progress").length,
        closed: items.filter((item) => item.status === "closed").length,
      };
    }).filter((item) => item.total > 0);
  }, [data]);

  const vesselSummary = useMemo(() => {
    return kapalFilterOptions.map((vessel) => {
      const items = data.filter((item) => item.kapal === vessel);
      return {
        vessel,
        total: items.length,
        open: items.filter((item) => item.status === "open").length,
        progress: items.filter((item) => item.status === "on_progress").length,
        closed: items.filter((item) => item.status === "closed").length,
      };
    });
  }, [data, kapalFilterOptions]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const keyword = search.toLowerCase();
      const matchSearch =
        !keyword ||
        String(item.id).toLowerCase().includes(keyword) ||
        String(item.kapal).toLowerCase().includes(keyword) ||
        String(item.tahun).includes(keyword) ||
        String(item.deskripsi).toLowerCase().includes(keyword) ||
        String(item.noUrut).includes(keyword);

      const matchKapal = kapalFilter === "Semua" || item.kapal === kapalFilter;
      const matchStatus = statusFilter === "Semua" || item.status === statusFilter;
      const matchBulan = bulanFilter === "Semua" || item.bulan === bulanFilter;

      return matchSearch && matchKapal && matchStatus && matchBulan;
    });
  }, [data, search, kapalFilter, statusFilter, bulanFilter]);

  const focusItems = useMemo(() => {
    return [...data]
      .filter((item) => item.status !== "closed")
      .sort((left, right) => new Date(right.tanggal) - new Date(left.tanggal))
      .slice(0, 5);
  }, [data]);

  const attachmentContexts = useMemo(() => {
    return data.map((item) => ({
      moduleName: "security_record",
      recordId: String(item.id),
      uploadedBy: item.kapal,
    }));
  }, [data]);

  async function handleSave(item) {
    try {
      setIsSaving(true);
      setErrorMessage("");
      if (editItem) {
        const updated = await updateSecurityRecord(editItem.id, item);
        setData((current) => current.map((entry) => (entry.id === editItem.id ? updated : entry)));
      } else {
        const created = await createSecurityRecord(item);
        setData((current) => [created, ...current]);
      }
      setModalOpen(false);
      setEditItem(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyimpan security record.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setErrorMessage("");
      await deleteSecurityRecord(deleteId);
      setData((current) => current.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menghapus security record.");
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
              Security Record
            </div>
            <h1 className="mt-3 text-[22px] font-bold leading-snug">Security Record Register</h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-white/82">
              Monitor catatan keamanan per kapal berdasarkan data dari Supabase.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setEditItem(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#15803d]"
            >
              <Plus size={15} />
              Tambah Data
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-[10px] border border-white/25 px-4 py-2.5 text-[13px] font-semibold text-white">
              <FileDown size={15} />
              Export
            </button>
          </div>
        </div>

        <div className="grid border-t border-white/10 bg-white/10 sm:grid-cols-4">
          {[
            { label: "Total Kapal", value: stats.totalKapal, note: "kapal dengan record" },
            { label: "Total Record", value: stats.total, note: "data security terdaftar" },
            { label: "Open", value: stats.open, note: "butuh tindak lanjut awal" },
            { label: "Closed", value: stats.closed, note: "record sudah selesai" },
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
          { title: "Open Record", value: stats.open, note: "Perlu follow up awal", icon: AlertTriangle, bg: "bg-[#fff7e8]", color: "text-[#b26a00]" },
          { title: "On Progress", value: stats.progress, note: "Sedang ditindaklanjuti", icon: TimerReset, bg: "bg-[#eef4ff]", color: "text-[#376ad6]" },
          { title: "Closed Record", value: stats.closed, note: "Sudah selesai", icon: BadgeCheck, bg: "bg-[#edf9f1]", color: "text-[#15803d]" },
          { title: "Total Kapal", value: stats.totalKapal, note: "Memiliki security record", icon: CalendarDays, bg: "bg-[#f2f4f7]", color: "text-[#55616d]" },
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

      <section>
        <h2 className="mb-3 text-[15px] font-semibold text-[#243041]">Ringkasan per Bulan</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {monthlySummary.length ? (
            monthlySummary.map((item) => (
              <Card key={item.month} className="border-[#edf2f7]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#f0fdf8] text-[#15803d]">
                      <ClipboardList size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#1f2b38]">{item.month}</p>
                      <p className="mt-0.5 text-[11px] text-[#8b96a1] leading-snug">{item.total} record terinput di bulan ini</p>
                      <div className="mt-2 flex items-center gap-3 text-[11px]">
                        <span className="text-[#b26a00]">{item.open} open</span>
                        <span className="text-[#376ad6]">{item.progress} progress</span>
                        <span className="text-[#15803d]">{item.closed} closed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-[12px] text-[#8b96a1]">Belum ada data bulanan.</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.75fr_1fr]">
        <Card className="overflow-hidden border-[#edf2f7]">
          <CardContent className="p-0">
            <div className="border-b border-[#edf2f7] px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#1f2b38]">Register Security Record</h2>
                  <p className="mt-1 text-[12px] text-[#7c8793]">Menampilkan {filtered.length} dari {data.length} record</p>
                </div>

                <div className="relative w-full lg:w-[280px]">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari kapal, tahun, no urut, deskripsi..."
                    className="w-full rounded-[10px] border border-[#dde4ea] bg-white py-2 pl-9 pr-3 text-[12px] outline-none focus:border-[#15803d] focus:ring-2 focus:ring-[#d1fae5]"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="relative">
                  <select
                    value={kapalFilter}
                    onChange={(event) => setKapalFilter(event.target.value)}
                    className="appearance-none rounded-full border border-[#dde4ea] bg-white py-1.5 pl-3 pr-7 text-[11px] font-medium text-[#536070] focus:outline-none"
                  >
                    <option>Semua</option>
                    {kapalFilterOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                </div>

                <div className="relative">
                  <select
                    value={bulanFilter}
                    onChange={(event) => setBulanFilter(event.target.value)}
                    className="appearance-none rounded-full border border-[#dde4ea] bg-white py-1.5 pl-3 pr-7 text-[11px] font-medium text-[#536070] focus:outline-none"
                  >
                    <option>Semua</option>
                    {MONTH_OPTIONS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[{ label: "Semua", value: "Semua" }, ...STATUS_OPTIONS].map((item) => (
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

                {(search || kapalFilter !== "Semua" || statusFilter !== "Semua" || bulanFilter !== "Semua") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setKapalFilter("Semua");
                      setStatusFilter("Semua");
                      setBulanFilter("Semua");
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-[#fff0f0] px-3 py-1 text-[11px] font-semibold text-[#c53030]"
                  >
                    <RotateCcw size={11} />
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 460 }}>
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="sticky top-0 z-10 bg-[#f8fafb]">
                    {["ID", "No Urut", "Kapal", "Tanggal", "Tahun", "Bulan", "Deskripsi", "Keterangan", "Status", "Aksi"].map((head) => (
                      <th key={head} className="whitespace-nowrap border-b border-[#edf2f7] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#8b96a1]">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-14 text-center text-[13px] text-[#8b96a1]">Memuat security record...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-14 text-center text-[13px] text-[#8b96a1]">Tidak ada data yang cocok</td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="border-b border-[#f0f4f7] transition hover:bg-[#fafcfb]">
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#536070]">{item.id}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#536070]">{item.noUrut}</td>
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-[#243041]">{item.kapal || "-"}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#8b96a1]">{formatDate(item.tanggal)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#536070]">{item.tahun}</td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span className="rounded-full bg-[#f0fdf8] px-2 py-0.5 text-[10px] font-semibold text-[#15803d]">{item.bulan}</span>
                        </td>
                        <td className="max-w-[280px] px-3 py-3 text-[#243041]">
                          <p className="line-clamp-2 leading-5">{item.deskripsi}</p>
                        </td>
                        <td className="max-w-[220px] px-3 py-3 text-[#6f7c89]">
                          <p className="line-clamp-2 leading-5">{item.keterangan || "-"}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <Pill label={item.status} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <div className="flex gap-1">
                            <button type="button" onClick={() => setDetailItem(item)} className="inline-flex items-center gap-1 rounded-[7px] bg-[#f4f7f9] px-2 py-1 text-[10px] font-medium text-[#536070] hover:bg-[#e8edf2]">
                              <Eye size={11} /> Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditItem(item);
                                setModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-[7px] bg-[#eff6ff] px-2 py-1 text-[10px] font-medium text-[#1d4ed8] hover:bg-[#dbeafe]"
                            >
                              <Pencil size={11} /> Edit
                            </button>
                            <button type="button" onClick={() => setDeleteId(item.id)} className="inline-flex items-center gap-1 rounded-[7px] bg-[#fff0f0] px-2 py-1 text-[10px] font-medium text-[#c53030] hover:bg-[#fee2e2]">
                              <Trash2 size={11} /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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
                  <h2 className="text-[15px] font-semibold text-[#1f2b38]">Follow Up Aktif</h2>
                  <p className="mt-0.5 text-[11px] text-[#7c8793]">Record yang masih open atau on progress</p>
                </div>
                <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-[11px] font-semibold text-[#b26a00]">{focusItems.length} item</span>
              </div>
              <div className="mt-4 space-y-2 overflow-y-auto" style={{ maxHeight: 280 }}>
                {focusItems.length === 0 ? (
                  <div className="py-8 text-center text-[12px] text-[#8b96a1]">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-[#15803d]" />
                    Semua record sudah closed
                  </div>
                ) : (
                  focusItems.map((item) => (
                    <div key={item.id} className="rounded-[12px] border border-[#edf2f7] bg-[#fafbfd] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[#1f2b38]">{item.kapal}</p>
                          <p className="mt-0.5 text-[11px] text-[#536070] leading-snug">{item.deskripsi}</p>
                          <p className="mt-1 text-[10px] text-[#7c8793]">{item.bulan} {item.tahun} - {formatDate(item.tanggal)}</p>
                        </div>
                        <Pill label={item.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#edf2f7]">
            <CardContent className="p-5">
              <h2 className="text-[15px] font-semibold text-[#1f2b38]">Ringkasan per Kapal</h2>
              <p className="mt-0.5 text-[11px] text-[#7c8793]">Jumlah record berdasarkan kapal dan status</p>
              <div className="mt-4 space-y-2 overflow-y-auto" style={{ maxHeight: 260 }}>
                {vesselSummary.length ? (
                  vesselSummary.map((item) => (
                    <div key={item.vessel} className="rounded-[10px] border border-[#edf2f7] bg-[#fafbfd] px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[12px] font-semibold text-[#243041]">{item.vessel}</p>
                          <p className="text-[10px] text-[#8b96a1]">{item.total} record</p>
                        </div>
                        <Filter size={12} className="text-[#c4cdd6]" />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-medium">
                        <span className="rounded-full bg-[#fff7e8] px-2 py-0.5 text-[#b26a00]">{item.open} open</span>
                        <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#376ad6]">{item.progress} progress</span>
                        <span className="rounded-full bg-[#edf9f1] px-2 py-0.5 text-[#15803d]">{item.closed} closed</span>
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

      <AttachmentModulePanel
        title="Attachment Security Record"
        description="File dari halaman Attachment akan tampil jika record id dan module name cocok."
        contexts={attachmentContexts}
      />

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

      <ConfirmModal
        itemId={deleteId}
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
