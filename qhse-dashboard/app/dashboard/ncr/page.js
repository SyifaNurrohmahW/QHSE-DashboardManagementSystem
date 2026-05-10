"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  UserRound,
  X,
  Pencil,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AttachmentModulePanel from "@/components/dashboard/attachment-module-panel";
import { getKapalOptions } from "@/lib/services/kapalService";
import {
  closeNcr,
  createNcr,
  deleteNcr,
  getNcrList,
  reopenNcr,
  updateNcr,
} from "@/lib/services/ncrService";

const STATUS_NCR_OPTIONS = ["Sec A", "Sec B", "Sec C"];
const RECORD_STATUS_OPTIONS = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
];

const STATUS_NCR_STYLES = {
  "Sec A": "bg-[#fff4e5] text-[#b26a00]",
  "Sec B": "bg-[#eef4ff] text-[#2f63ce]",
  "Sec C": "bg-[#fff0f0] text-[#c64c4c]",
};

const RECORD_STATUS_STYLES = {
  open: "bg-[#fff4e5] text-[#b26a00]",
  closed: "bg-[#edf9f1] text-[#1f9b58]",
};

const RECORD_STATUS_LABELS = {
  open: "Open",
  closed: "Closed",
};

const EMPTY_FORM = {
  ncrNo: "",
  kapal_id: "",
  tanggalRelease: "",
  section: "",
  statusNcr: "",
  temuan: "",
  akarMasalah: "",
  correctiveAction: "",
  preventiveAction: "",
  dueDate: "",
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

function diffDays(fromDate) {
  if (!fromDate) return 0;
  const start = new Date(fromDate);
  const today = new Date();
  const ms = today.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round(ms / 86400000));
}

function isOverdue(item) {
  if (!item.dueDate || item.status === "closed") return false;
  return new Date(item.dueDate) < new Date();
}

function statusProgress(item) {
  if (item.status === "closed") return 100;

  const order = {
    "Sec A": 25,
    "Sec B": 55,
    "Sec C": 75,
  };

  return order[item.statusNcr] || 15;
}

function toDateInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function Pill({ label, map }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        map[label] || "bg-[#edf1f4] text-[#55616d]"
      }`}
    >
      {label || "-"}
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

function ProgressTrack({ item }) {
  return (
    <div className="w-full">
      <div className="h-2 overflow-hidden rounded-full bg-[#edf1f4]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#cf5a61] via-[#df8d52] to-[#2c9b68]"
          style={{ width: `${statusProgress(item)}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-[#8b96a1]">
        <span>Open</span>
        <span>Closed</span>
      </div>
    </div>
  );
}

function NcrModal({ isOpen, onClose, onSave, initialData, isEdit, kapalOptions, isSaving }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const inputClass = (name) =>
    `w-full rounded-[12px] border bg-white px-3 py-2.5 text-[13px] text-[#273240] outline-none transition focus:border-[#15803d] focus:ring-2 focus:ring-[#d1fae5] ${
      errors[name] ? "border-[#c53030]" : "border-[#dfe5ea]"
    }`;

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: false }));
  };

  function handleSubmit() {
    const requiredFields = [
      "ncrNo",
      "kapal_id",
      "tanggalRelease",
      "section",
      "statusNcr",
      "temuan",
      "correctiveAction",
      "dueDate",
      "status",
    ];

    const nextErrors = {};
    requiredFields.forEach((field) => {
      if (!String(form[field] || "").trim()) nextErrors[field] = true;
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
      <div className="w-full max-w-[760px] overflow-hidden rounded-[24px] border border-[#e3e8ed] bg-white shadow-[0_28px_60px_rgba(15,23,42,0.24)]">
        <div className="border-b border-[#edf1f4] bg-[linear-gradient(135deg,#f2fbf5_0%,#ffffff_45%,#f5f8fb_100%)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#edf9f1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#15803d]">
                <ClipboardList size={14} />
                NCR Form
              </div>
              <h2 className="mt-3 text-[22px] font-bold text-[#1f2b38]">
                {isEdit ? "Update Non-Conformity Report" : "Create Non-Conformity Report"}
              </h2>
              <p className="mt-1 text-[13px] text-[#6f7c89]">
                Data akan disimpan langsung ke Database.
              </p>
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
          <FormField label="NCR Number" required error={errors.ncrNo}>
            <input
              className={inputClass("ncrNo")}
              value={form.ncrNo}
              onChange={updateField("ncrNo")}
              placeholder="Contoh: NCR-2026-001"
            />
          </FormField>

          <FormField label="Kapal" required error={errors.kapal_id}>
            <select className={inputClass("kapal_id")} value={form.kapal_id || ""} onChange={updateField("kapal_id")}>
              <option value="">Pilih kapal</option>
              {kapalOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tanggal Release" required error={errors.tanggalRelease}>
            <input
              type="date"
              className={inputClass("tanggalRelease")}
              value={form.tanggalRelease}
              onChange={updateField("tanggalRelease")}
            />
          </FormField>

          <FormField label="Due Date" required error={errors.dueDate}>
            <input
              type="date"
              className={inputClass("dueDate")}
              value={form.dueDate}
              onChange={updateField("dueDate")}
            />
          </FormField>

          <FormField label="Section" required error={errors.section}>
            <input
              className={inputClass("section")}
              value={form.section}
              onChange={updateField("section")}
              placeholder="Contoh: OPS, Technical, QHSE"
            />
          </FormField>

          <FormField label="Status NCR" required error={errors.statusNcr}>
            <select className={inputClass("statusNcr")} value={form.statusNcr} onChange={updateField("statusNcr")}>
              <option value="">Pilih status NCR</option>
              {STATUS_NCR_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Status Record" required error={errors.status}>
            <select className={inputClass("status")} value={form.status} onChange={updateField("status")}>
              {RECORD_STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Temuan" required error={errors.temuan}>
              <textarea
                rows={3}
                className={`${inputClass("temuan")} resize-none`}
                value={form.temuan}
                onChange={updateField("temuan")}
                placeholder="Tuliskan temuan NCR"
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField label="Akar Masalah">
              <textarea
                rows={3}
                className={`${inputClass("akarMasalah")} resize-none`}
                value={form.akarMasalah}
                onChange={updateField("akarMasalah")}
                placeholder="Tuliskan akar masalah"
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField label="Corrective Action" required error={errors.correctiveAction}>
              <textarea
                rows={3}
                className={`${inputClass("correctiveAction")} resize-none`}
                value={form.correctiveAction}
                onChange={updateField("correctiveAction")}
                placeholder="Tindakan korektif"
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField label="Preventive Action">
              <textarea
                rows={3}
                className={`${inputClass("preventiveAction")} resize-none`}
                value={form.preventiveAction}
                onChange={updateField("preventiveAction")}
                placeholder="Tindakan pencegahan"
              />
            </FormField>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#edf1f4] bg-[#fbfcfd] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#7a8793]">
            Simpan akan langsung memperbarui data NCR dari Database.
          </p>
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
              {isSaving ? "Menyimpan..." : isEdit ? "Update NCR" : "Simpan NCR"}
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
    { label: "NCR Number", value: item.ncrNo },
    { label: "Kapal", value: item.kapal },
    { label: "Section", value: item.section },
    { label: "Tanggal Release", value: formatDate(item.tanggalRelease) },
    { label: "Due Date", value: formatDate(item.dueDate) },
    { label: "Age", value: `${diffDays(item.tanggalRelease)} hari` },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-4 sm:py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-[720px] flex-col overflow-hidden rounded-[24px] border border-[#e3e8ed] bg-white shadow-[0_28px_60px_rgba(15,23,42,0.24)] sm:max-h-[calc(100vh-3rem)]">
        <div className="flex items-start justify-between border-b border-[#edf1f4] px-6 py-5">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#15803d]">
              Detail NCR
            </p>
            <h2 className="mt-2 text-[22px] font-bold text-[#1f2b38]">{item.ncrNo}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6e7b87] hover:bg-[#e8edf2]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <Pill label={item.statusNcr} map={STATUS_NCR_STYLES} />
            <Pill label={RECORD_STATUS_LABELS[item.status] || item.status} map={RECORD_STATUS_STYLES} />
          </div>

          <ProgressTrack item={item} />

          <div className="grid gap-3 md:grid-cols-2">
            {details.map((row) => (
              <div key={row.label} className="rounded-[14px] border border-[#edf1f4] bg-[#fafbfd] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                  {row.label}
                </p>
                <p className="mt-1 text-[14px] font-medium text-[#263240]">{row.value || "-"}</p>
              </div>
            ))}
          </div>

          {[
            ["Temuan", item.temuan],
            ["Akar Masalah", item.akarMasalah],
            ["Corrective Action", item.correctiveAction],
            ["Preventive Action", item.preventiveAction],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[16px] border border-[#edf1f4] bg-white px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                {label}
              </p>
              <p className="mt-2 text-[14px] leading-6 text-[#4f5b67]">{value || "-"}</p>
            </div>
          ))}
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
        <h3 className="mt-4 text-[18px] font-bold text-[#1f2b38]">Hapus NCR ini?</h3>
        <p className="mt-2 text-[13px] leading-6 text-[#6e7b87]">
          Data <span className="font-semibold text-[#25313f]">{itemId}</span> akan dihapus dari Database.
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

export default function NcrPage() {
  const [ncrs, setNcrs] = useState([]);
  const [kapalOptions, setKapalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getNcrList()
      .then((result) => {
        if (!isMounted) return;
        setNcrs(result);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal mengambil data NCR.");
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

  const filteredNcrs = useMemo(() => {
    return ncrs.filter((item) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        !keyword ||
        String(item.ncrNo).toLowerCase().includes(keyword) ||
        String(item.temuan).toLowerCase().includes(keyword) ||
        String(item.kapal).toLowerCase().includes(keyword) ||
        String(item.section).toLowerCase().includes(keyword) ||
        String(item.statusNcr).toLowerCase().includes(keyword);

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ncrs, search, statusFilter]);

  const stats = useMemo(() => {
    const openItems = ncrs.filter((item) => item.status !== "closed").length;
    const overdueItems = ncrs.filter(isOverdue).length;
    const secCItems = ncrs.filter((item) => item.statusNcr === "Sec C").length;
    const closedItems = ncrs.filter((item) => item.status === "closed").length;

    return [
      {
        title: "Open NCR",
        value: String(openItems).padStart(2, "0"),
        note: "Perlu review dan corrective action",
        icon: AlertTriangle,
        tone: "bg-[#fff1f1] text-[#cf5a61]",
      },
      {
        title: "Overdue",
        value: String(overdueItems).padStart(2, "0"),
        note: "Due date sudah terlewati",
        icon: CalendarDays,
        tone: "bg-[#fff7e8] text-[#c98431]",
      },
      {
        title: "Sec C",
        value: String(secCItems).padStart(2, "0"),
        note: "Butuh close follow-up",
        icon: ShieldAlert,
        tone: "bg-[#eef4ff] text-[#376ad6]",
      },
      {
        title: "Closed",
        value: String(closedItems).padStart(2, "0"),
        note: "NCR sudah ditutup",
        icon: CheckCircle2,
        tone: "bg-[#edf9f1] text-[#1f9b58]",
      },
    ];
  }, [ncrs]);

  const completion = ncrs.length
    ? Math.round((ncrs.filter((item) => item.status === "closed").length / ncrs.length) * 100)
    : 0;

  const focusItems = useMemo(() => {
    return [...ncrs]
      .filter((item) => item.status !== "closed")
      .sort((left, right) => {
        const statusOrder = { "Sec C": 0, "Sec B": 1, "Sec A": 2 };
        const leftStatus = statusOrder[left.statusNcr] ?? 3;
        const rightStatus = statusOrder[right.statusNcr] ?? 3;
        if (leftStatus !== rightStatus) return leftStatus - rightStatus;
        return new Date(left.dueDate || "9999-12-31") - new Date(right.dueDate || "9999-12-31");
      })
      .slice(0, 3);
  }, [ncrs]);

  const vesselSummary = useMemo(() => {
    const summary = new Map();

    ncrs.forEach((item) => {
      const vessel = item.kapal || "-";
      const current = summary.get(vessel) || { vessel, total: 0, open: 0, closed: 0 };
      current.total += 1;
      if (item.status === "closed") current.closed += 1;
      else current.open += 1;
      summary.set(vessel, current);
    });

    return [...summary.values()];
  }, [ncrs]);

  const attachmentContexts = useMemo(() => {
    return ncrs.map((item) => ({
      moduleName: "ncr",
      recordId: String(item.id),
      uploadedBy: item.kapal,
    }));
  }, [ncrs]);

  function handleCreate() {
    setEditItem(null);
    setIsModalOpen(true);
  }

  function handleEdit(item) {
    setEditItem({
      ...item,
      tanggalRelease: toDateInput(item.tanggalRelease),
      dueDate: toDateInput(item.dueDate),
    });
    setIsModalOpen(true);
  }

  async function handleSave(item) {
    try {
      setIsSaving(true);
      setErrorMessage("");

      if (editItem) {
        const updated = await updateNcr(editItem.id, item);
        setNcrs((current) => current.map((entry) => (entry.id === editItem.id ? updated : entry)));
      } else {
        const created = await createNcr(item);
        setNcrs((current) => [created, ...current]);
      }

      setIsModalOpen(false);
      setEditItem(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyimpan NCR.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setErrorMessage("");
      await deleteNcr(deleteId);
      setNcrs((current) => current.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menghapus NCR.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleStatus(item) {
    try {
      setIsStatusUpdating(true);
      setErrorMessage("");
      const updated = item.status === "closed" ? await reopenNcr(item.id) : await closeNcr(item.id);
      setNcrs((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
    } catch (error) {
      setErrorMessage(error.message || "Gagal mengubah status NCR.");
    } finally {
      setIsStatusUpdating(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 text-white shadow-[0_16px_36px_rgba(16,185,129,0.18)]">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.5fr_0.9fr] lg:px-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
              <FileSpreadsheet size={14} />
              NCR Command Center
            </div>
            <h1 className="mt-4 max-w-3xl text-[28px] font-bold leading-tight">
              NCR Register Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-white/82">
              Pantau status temuan, progress perbaikan, dan due date non-conformity report dari Database.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-semibold text-emerald-700"
              >
                <Plus size={16} />
                Tambah Data
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[22px] border border-white/12 bg-black/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[12px] text-white/72">
                <span>Completion Snapshot</span>
                <BadgeCheck size={15} />
              </div>
              <p className="mt-3 text-[34px] font-bold leading-none">{completion}%</p>
              <p className="mt-2 text-[12px] text-white/78">NCR yang sudah closed</p>
            </div>

            <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[12px] text-white/72">
                <span>Next Priority</span>
                <FileText size={15} />
              </div>
              <p className="mt-3 text-[16px] font-semibold leading-6">
                {focusItems[0]?.ncrNo || "-"}
              </p>
              <p className="mt-2 text-[12px] text-white/78">
                Fokus ke status tertinggi dan due date terdekat
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="overflow-hidden border-[#edf1f4]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-[#53606d]">{item.title}</p>
                    <p className="mt-2 text-[28px] font-bold leading-none text-[#1f2b38]">{item.value}</p>
                    <p className="mt-2 text-[12px] leading-5 text-[#7c8793]">{item.note}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                    <Icon size={21} />
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
        <Card className="overflow-hidden border-[#edf1f4]">
          <CardContent className="p-0">
            <div className="border-b border-[#edf1f4] px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#1f2b38]">NCR Register</h2>
                  <p className="mt-1 text-[12px] text-[#7c8793]">
                    Menampilkan {filteredNcrs.length} dari {ncrs.length} data NCR.
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <div className="relative w-full lg:w-[280px]">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari NCR, kapal, section, temuan"
                      className="w-full rounded-[12px] border border-[#dfe5ea] bg-white py-2.5 pl-10 pr-3 text-[13px] text-[#273240] outline-none focus:border-[#15803d] focus:ring-2 focus:ring-[#d1fae5]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[{ label: "All", value: "All" }, ...RECORD_STATUS_OPTIONS].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setStatusFilter(item.value)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                          statusFilter === item.value
                            ? "bg-[#15803d] text-white"
                            : "bg-[#f4f7f9] text-[#66727e] hover:bg-[#eaedf1]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    {(search || statusFilter !== "All") ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("All");
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-[#fff0f0] px-3 py-1.5 text-[11px] font-semibold text-[#c53030]"
                      >
                        <RotateCcw size={11} />
                        Reset
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#fafbfc]">
                    {["NCR", "Temuan", "Kapal", "Section", "Status NCR", "Status", "Due Date", "Progress", "Action"].map((head) => (
                      <th
                        key={head}
                        className="border-b border-[#edf1f4] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-14 text-center text-[13px] text-[#8b96a1]">
                        Memuat data NCR...
                      </td>
                    </tr>
                  ) : filteredNcrs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-14 text-center text-[13px] text-[#8b96a1]">
                        Tidak ada data NCR yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredNcrs.map((item) => (
                      <tr key={item.id} className="border-b border-[#f0f3f5] align-top transition hover:bg-[#fcfcfd]">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-[#283341]">{item.ncrNo || item.id}</p>
                          <p className="mt-1 text-[11px] text-[#8b96a1]">{formatDate(item.tanggalRelease)}</p>
                        </td>
                        <td className="max-w-[270px] px-3 py-3">
                          <p className="line-clamp-2 font-medium leading-5 text-[#243041]">{item.temuan || "-"}</p>
                          <p className="mt-1 line-clamp-1 text-[11px] text-[#7c8793]">
                            {item.correctiveAction || "-"}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-[#51606d]">{item.kapal}</td>
                        <td className="px-3 py-3 text-[#51606d]">{item.section || "-"}</td>
                        <td className="px-3 py-3">
                          <Pill label={item.statusNcr} map={STATUS_NCR_STYLES} />
                        </td>
                        <td className="px-3 py-3">
                          <Pill label={RECORD_STATUS_LABELS[item.status] || item.status} map={RECORD_STATUS_STYLES} />
                        </td>
                        <td className="px-3 py-3 text-[#51606d]">
                          <p>{formatDate(item.dueDate)}</p>
                          <p className={`mt-1 text-[11px] ${isOverdue(item) ? "text-[#c53030]" : "text-[#8b96a1]"}`}>
                            {isOverdue(item) ? "Overdue" : `${diffDays(item.tanggalRelease)} hari berjalan`}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-[150px]">
                            <ProgressTrack item={item} />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetailItem(item)}
                              className="inline-flex items-center gap-1 rounded-[9px] bg-[#f4f7f9] px-2.5 py-1.5 text-[11px] font-semibold text-[#4f5b67] hover:bg-[#e8edf2]"
                            >
                              <Eye size={13} />
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-1 rounded-[9px] bg-[#eef4ff] px-2.5 py-1.5 text-[11px] font-semibold text-[#376ad6] hover:bg-[#e0eaff]"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              disabled={isStatusUpdating}
                              className="inline-flex items-center gap-1 rounded-[9px] bg-[#edf9f1] px-2.5 py-1.5 text-[11px] font-semibold text-[#15803d] hover:bg-[#dff3e7] disabled:opacity-60"
                            >
                              <CheckCircle2 size={13} />
                              {item.status === "closed" ? "Reopen" : "Close"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(item.id)}
                              className="inline-flex items-center gap-1 rounded-[9px] bg-[#fff0f0] px-2.5 py-1.5 text-[11px] font-semibold text-[#c53030] hover:bg-[#ffe1e1]"
                            >
                              <Trash2 size={13} />
                              Hapus
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

        <div className="grid content-start gap-4">
          <Card className="border-[#edf1f4]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-semibold text-[#1f2b38]">Priority Queue</h2>
                  <p className="mt-1 text-[12px] text-[#7c8793]">NCR open paling perlu didorong.</p>
                </div>
                <div className="rounded-full bg-[#fff1f1] px-3 py-1 text-[11px] font-semibold text-[#b8434d]">
                  {focusItems.length} item
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {focusItems.length ? (
                  focusItems.map((item) => (
                    <div key={item.id} className="rounded-[18px] border border-[#edf1f4] bg-[#fafbfd] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-[#15803d]">{item.ncrNo || item.id}</p>
                          <p className="mt-1 line-clamp-2 text-[14px] font-semibold leading-5 text-[#243041]">{item.temuan || "-"}</p>
                        </div>
                        <Pill label={item.statusNcr} map={STATUS_NCR_STYLES} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[12px] text-[#6f7c89]">
                        <span>{item.kapal}</span>
                        <span>{formatDate(item.dueDate)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-[12px] text-[#8b96a1]">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-[#15803d]" />
                    Tidak ada NCR open.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#edf1f4]">
            <CardContent className="p-5">
              <h2 className="text-[17px] font-semibold text-[#1f2b38]">Ringkasan per Kapal</h2>
              <div className="mt-4 space-y-3">
                {vesselSummary.length ? (
                  vesselSummary.map((item) => (
                    <div key={item.vessel} className="rounded-[16px] border border-[#edf1f4] bg-[#fafbfd] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-[#243041]">{item.vessel}</p>
                          <p className="mt-1 text-[11px] text-[#8b96a1]">{item.total} NCR terdaftar</p>
                        </div>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6b7784]">
                          <UserRound size={14} />
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold">
                        <span className="rounded-full bg-[#fff4e5] px-2 py-0.5 text-[#b26a00]">{item.open} open</span>
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
        title="Attachment untuk NCR"
        description="File dari halaman Attachment akan tampil jika record id dan module name cocok."
        contexts={attachmentContexts}
      />

      <NcrModal
        key={editItem?.id || isModalOpen}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
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
