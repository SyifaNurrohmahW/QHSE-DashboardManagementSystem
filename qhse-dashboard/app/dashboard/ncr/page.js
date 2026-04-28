"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  FileSpreadsheet,
  FolderKanban,
  Plus,
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

const VESSELS = [
  "MV Adaro Pioneer",
  "MV South Borneo",
  "MV Energi Nusantara",
  "MV Adaro Maritim",
];

const DEPARTMENTS = [
  "Marine Operation",
  "Deck Crew",
  "Engine Team",
  "QHSE",
  "Port Operation",
];

const SOURCES = ["Internal Audit", "Client Finding", "Inspection", "Incident Investigation"];
const FINDING_TYPES = ["Document", "Operational", "Equipment", "Competency", "Housekeeping"];
const SEVERITIES = ["Minor", "Major", "Critical"];
const STATUSES = ["Open", "In Review", "Action Ongoing", "Verified", "Closed"];

const INITIAL_NCRS = [
  {
    id: "NCR-2026-013",
    title: "Checklist pre-departure belum ditandatangani lengkap",
    vessel: "MV Adaro Pioneer",
    department: "Marine Operation",
    area: "Bridge",
    source: "Internal Audit",
    findingType: "Document",
    severity: "Major",
    status: "In Review",
    owner: "Chief Officer",
    issuedDate: "2026-04-24",
    targetDate: "2026-05-01",
    verification: "Menunggu verifikasi Superintendent",
    actionPlan: "Review form checklist, sosialisasi ke officer, dan lakukan pengecekan silang sebelum sailing.",
  },
  {
    id: "NCR-2026-012",
    title: "Guard pelindung pompa transfer tidak terpasang sesuai standar",
    vessel: "MV South Borneo",
    department: "Engine Team",
    area: "Pump Room",
    source: "Inspection",
    findingType: "Equipment",
    severity: "Critical",
    status: "Action Ongoing",
    owner: "2nd Engineer",
    issuedDate: "2026-04-22",
    targetDate: "2026-04-30",
    verification: "Temporary barricade sudah terpasang",
    actionPlan: "Pasang guard permanen, lakukan toolbox meeting, dan update preventive maintenance note.",
  },
  {
    id: "NCR-2026-011",
    title: "Briefing lifting operation tidak terdokumentasi",
    vessel: "MV Energi Nusantara",
    department: "Deck Crew",
    area: "Main Deck",
    source: "Client Finding",
    findingType: "Operational",
    severity: "Major",
    status: "Open",
    owner: "Deck Foreman",
    issuedDate: "2026-04-21",
    targetDate: "2026-04-29",
    verification: "Belum ada bukti perbaikan",
    actionPlan: "Susun template briefing sheet dan wajibkan lampiran foto aktivitas briefing.",
  },
  {
    id: "NCR-2026-010",
    title: "Area chemical locker belum memiliki label segregasi baru",
    vessel: "MV Adaro Maritim",
    department: "QHSE",
    area: "Chemical Locker",
    source: "Incident Investigation",
    findingType: "Housekeeping",
    severity: "Minor",
    status: "Verified",
    owner: "Safety Officer",
    issuedDate: "2026-04-18",
    targetDate: "2026-04-25",
    verification: "Sudah diverifikasi saat spot check",
    actionPlan: "Pasang label segregasi, update map storage, dan briefing ulang personel.",
  },
];

const RECENT_ACTIVITY = [
  {
    title: "Superintendent meminta eviden tambahan untuk NCR-2026-013",
    desc: "Perlu lampiran checklist yang sudah direvisi",
    time: "09:10",
    icon: FolderKanban,
    iconClass: "bg-[#eef4ff] text-[#376ad6]",
  },
  {
    title: "Action plan NCR-2026-012 diperbarui oleh 2nd Engineer",
    desc: "Status tetap Action Ongoing",
    time: "08:40",
    icon: ShieldAlert,
    iconClass: "bg-[#fff3e8] text-[#c87c2f]",
  },
  {
    title: "NCR-2026-010 lolos verifikasi lapangan",
    desc: "Tinggal menunggu penutupan final",
    time: "Kemarin",
    icon: BadgeCheck,
    iconClass: "bg-[#edf9f1] text-[#1f9b58]",
  },
];

const STATUS_STYLES = {
  Open: "bg-[#fff4e5] text-[#b26a00]",
  "In Review": "bg-[#eef4ff] text-[#2f63ce]",
  "Action Ongoing": "bg-[#fff0f0] text-[#c64c4c]",
  Verified: "bg-[#edf9f1] text-[#1f9b58]",
  Closed: "bg-[#eef2f5] text-[#55616d]",
};

const SEVERITY_STYLES = {
  Minor: "bg-[#f4f5f7] text-[#55616d]",
  Major: "bg-[#fff1e7] text-[#bb6b17]",
  Critical: "bg-[#fff0f0] text-[#c53030]",
};

const EMPTY_FORM = {
  id: "",
  title: "",
  vessel: "",
  department: "",
  area: "",
  source: "",
  findingType: "",
  severity: "",
  status: "",
  owner: "",
  issuedDate: "",
  targetDate: "",
  verification: "",
  actionPlan: "",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("id-ID", {
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

function generateId(items) {
  const next = items.reduce((max, item) => {
    const current = Number(item.id.split("-")[2] || 0);
    return Math.max(max, current);
  }, 0);
  return `NCR-2026-${String(next + 1).padStart(3, "0")}`;
}

function statusProgress(status) {
  const order = {
    Open: 20,
    "In Review": 40,
    "Action Ongoing": 65,
    Verified: 85,
    Closed: 100,
  };
  return order[status] || 0;
}

function Pill({ label, map }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        map[label] || "bg-[#edf1f4] text-[#55616d]"
      }`}
    >
      {label}
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

function ProgressTrack({ status }) {
  return (
    <div className="w-full">
      <div className="h-2 overflow-hidden rounded-full bg-[#edf1f4]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#cf5a61] via-[#df8d52] to-[#2c9b68]"
          style={{ width: `${statusProgress(status)}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-[#8b96a1]">
        <span>Open</span>
        <span>Verified</span>
      </div>
    </div>
  );
}

function NcrModal({ isOpen, onClose, onSave, initialData, nextId, isEdit }) {
  const [form, setForm] = useState(initialData ? initialData : { ...EMPTY_FORM, id: nextId, status: "Open" });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const inputClass = (name) =>
    `w-full rounded-[12px] border bg-white px-3 py-2.5 text-[13px] text-[#273240] outline-none transition focus:border-[#c84f58] focus:ring-2 focus:ring-[#f7d8db] ${
      errors[name] ? "border-[#c53030]" : "border-[#dfe5ea]"
    }`;

  const updateField = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: false }));
  };

  function handleSubmit() {
    const requiredFields = [
      "title",
      "vessel",
      "department",
      "source",
      "severity",
      "status",
      "owner",
      "issuedDate",
      "targetDate",
      "actionPlan",
    ];

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
      id: form.id || nextId,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[760px] overflow-hidden rounded-[24px] border border-[#e3e8ed] bg-white shadow-[0_28px_60px_rgba(15,23,42,0.24)]">
        <div className="border-b border-[#edf1f4] bg-[linear-gradient(135deg,#fff6f2_0%,#ffffff_45%,#f5f8fb_100%)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b8434d]">
                <ClipboardList size={14} />
                NCR Form
              </div>
              <h2 className="mt-3 text-[22px] font-bold text-[#1f2b38]">
                {isEdit ? "Update Non-Conformity Report" : "Create Non-Conformity Report"}
              </h2>
              <p className="mt-1 text-[13px] text-[#6f7c89]">
                Form sudah aktif untuk input dummy, jadi flow create dan edit bisa langsung dicoba.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6e7b87] shadow-sm hover:bg-[#f4f7f9]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <FormField label="NCR Number">
            <input className={`${inputClass("id")} bg-[#f5f7fa] text-[#8b96a1]`} value={form.id || nextId} readOnly />
          </FormField>

          <FormField label="Status" required error={errors.status}>
            <select className={inputClass("status")} value={form.status} onChange={updateField("status")}>
              <option value="">Pilih status</option>
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Finding Title" required error={errors.title}>
              <input
                className={inputClass("title")}
                value={form.title}
                onChange={updateField("title")}
                placeholder="Contoh: Form inspeksi belum ditutup oleh PIC"
              />
            </FormField>
          </div>

          <FormField label="Vessel" required error={errors.vessel}>
            <select className={inputClass("vessel")} value={form.vessel} onChange={updateField("vessel")}>
              <option value="">Pilih vessel</option>
              {VESSELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Department" required error={errors.department}>
            <select className={inputClass("department")} value={form.department} onChange={updateField("department")}>
              <option value="">Pilih department</option>
              {DEPARTMENTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Area / Location">
            <input
              className={inputClass("area")}
              value={form.area}
              onChange={updateField("area")}
              placeholder="Bridge, Main Deck, Pump Room"
            />
          </FormField>

          <FormField label="Source" required error={errors.source}>
            <select className={inputClass("source")} value={form.source} onChange={updateField("source")}>
              <option value="">Pilih source</option>
              {SOURCES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Finding Type">
            <select className={inputClass("findingType")} value={form.findingType} onChange={updateField("findingType")}>
              <option value="">Pilih tipe temuan</option>
              {FINDING_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Severity" required error={errors.severity}>
            <select className={inputClass("severity")} value={form.severity} onChange={updateField("severity")}>
              <option value="">Pilih severity</option>
              {SEVERITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Owner / PIC" required error={errors.owner}>
            <input
              className={inputClass("owner")}
              value={form.owner}
              onChange={updateField("owner")}
              placeholder="Nama PIC atau jabatan"
            />
          </FormField>

          <FormField label="Issued Date" required error={errors.issuedDate}>
            <input type="date" className={inputClass("issuedDate")} value={form.issuedDate} onChange={updateField("issuedDate")} />
          </FormField>

          <FormField label="Target Close Date" required error={errors.targetDate}>
            <input type="date" className={inputClass("targetDate")} value={form.targetDate} onChange={updateField("targetDate")} />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Immediate Verification">
              <input
                className={inputClass("verification")}
                value={form.verification}
                onChange={updateField("verification")}
                placeholder="Status bukti, review, atau catatan verifikasi"
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField label="Corrective Action Plan" required error={errors.actionPlan}>
              <textarea
                rows={4}
                className={`${inputClass("actionPlan")} resize-none`}
                value={form.actionPlan}
                onChange={updateField("actionPlan")}
                placeholder="Tuliskan corrective action plan yang akan dijalankan"
              />
            </FormField>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#edf1f4] bg-[#fbfcfd] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#7a8793]">
            Simpan akan langsung memperbarui tabel NCR di halaman ini sebagai data dummy.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-[12px] bg-[#eef2f5] px-4 py-2.5 text-[13px] font-semibold text-[#5a6672] hover:bg-[#e6ebef]"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-[12px] bg-[#b9434d] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#a63c45]"
            >
              {isEdit ? "Update NCR" : "Simpan NCR"}
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
    { label: "NCR Number", value: item.id },
    { label: "Vessel", value: item.vessel },
    { label: "Department", value: item.department },
    { label: "Area", value: item.area || "-" },
    { label: "Source", value: item.source },
    { label: "Finding Type", value: item.findingType || "-" },
    { label: "Owner", value: item.owner },
    { label: "Issued Date", value: formatDate(item.issuedDate) },
    { label: "Target Close", value: formatDate(item.targetDate) },
    { label: "Age", value: `${diffDays(item.issuedDate)} hari` },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-4 sm:py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-[680px] flex-col overflow-hidden rounded-[24px] border border-[#e3e8ed] bg-white shadow-[0_28px_60px_rgba(15,23,42,0.24)] sm:max-h-[calc(100vh-3rem)]">
        <div className="flex items-start justify-between border-b border-[#edf1f4] px-6 py-5">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#b8434d]">
              Detail NCR
            </p>
            <h2 className="mt-2 text-[22px] font-bold text-[#1f2b38]">{item.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6e7b87] hover:bg-[#e8edf2]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <Pill label={item.severity} map={SEVERITY_STYLES} />
            <Pill label={item.status} map={STATUS_STYLES} />
          </div>

          <ProgressTrack status={item.status} />

          <div className="grid gap-3 md:grid-cols-2">
            {details.map((row) => (
              <div key={row.label} className="rounded-[14px] border border-[#edf1f4] bg-[#fafbfd] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                  {row.label}
                </p>
                <p className="mt-1 text-[14px] font-medium text-[#263240]">{row.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[16px] border border-[#edf1f4] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
              Corrective Action Plan
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#4f5b67]">{item.actionPlan}</p>
          </div>

          <div className="rounded-[16px] border border-[#edf1f4] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
              Verification Note
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#4f5b67]">{item.verification || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ itemId, isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-[380px] rounded-[22px] border border-[#e3e8ed] bg-white p-6 text-center shadow-[0_28px_60px_rgba(15,23,42,0.24)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0f0] text-[#c53030]">
          <Trash2 size={22} />
        </div>
        <h3 className="mt-4 text-[18px] font-bold text-[#1f2b38]">Hapus NCR ini?</h3>
        <p className="mt-2 text-[13px] leading-6 text-[#6e7b87]">
          Data dummy <span className="font-semibold text-[#25313f]">{itemId}</span> akan dihapus dari register halaman ini.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-[12px] bg-[#eef2f5] px-4 py-2.5 text-[13px] font-semibold text-[#5a6672] hover:bg-[#e6ebef]"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="rounded-[12px] bg-[#c53030] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#af2a2a]"
          >
            Ya, hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NcrPage() {
  const [ncrs, setNcrs] = useState(INITIAL_NCRS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filteredNcrs = useMemo(() => {
    return ncrs.filter((item) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        !keyword ||
        item.id.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword) ||
        item.vessel.toLowerCase().includes(keyword) ||
        item.owner.toLowerCase().includes(keyword);

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ncrs, search, statusFilter]);

  const stats = useMemo(() => {
    const openItems = ncrs.filter((item) => item.status !== "Closed" && item.status !== "Verified").length;
    const overdueItems = ncrs.filter((item) => new Date(item.targetDate) < new Date() && item.status !== "Closed").length;
    const criticalItems = ncrs.filter((item) => item.severity === "Critical").length;
    const verifiedItems = ncrs.filter((item) => item.status === "Verified" || item.status === "Closed").length;

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
        note: "Target date sudah terlewati",
        icon: CalendarDays,
        tone: "bg-[#fff7e8] text-[#c98431]",
      },
      {
        title: "Critical Finding",
        value: String(criticalItems).padStart(2, "0"),
        note: "Butuh close follow-up",
        icon: ShieldAlert,
        tone: "bg-[#eef4ff] text-[#376ad6]",
      },
      {
        title: "Verified / Closed",
        value: String(verifiedItems).padStart(2, "0"),
        note: "Bukti sudah lolos review",
        icon: CheckCircle2,
        tone: "bg-[#edf9f1] text-[#1f9b58]",
      },
    ];
  }, [ncrs]);

  const nextId = useMemo(() => generateId(ncrs), [ncrs]);

  const focusItems = useMemo(() => {
    return [...ncrs]
      .sort((left, right) => {
        const severityOrder = { Critical: 0, Major: 1, Minor: 2 };
        return severityOrder[left.severity] - severityOrder[right.severity];
      })
      .slice(0, 3);
  }, [ncrs]);

  const attachmentContexts = useMemo(() => {
    return ncrs.slice(0, 4).map((item) => ({
      moduleName: "NCR",
      recordId: item.id,
      uploadedBy: item.owner,
    }));
  }, [ncrs]);

  const attachmentSeed = useMemo(() => {
    return ncrs.slice(0, 3).map((item, index) => ({
      id: `ATT-${String(index + 1).padStart(3, "0")}`,
      fileName: `evidence-${item.id.toLowerCase()}.pdf`,
      originalFileName: `${item.id.toLowerCase()}-supporting-document.pdf`,
      moduleName: "NCR",
      recordId: item.id,
      uploadedBy: item.owner,
      uploadedAt: `${item.issuedDate}T09:00:00.000Z`,
      sizeLabel: `${1 + index}.2 MB`,
      mimeType: "application/pdf",
      previewUrl: null,
    }));
  }, [ncrs]);

  function handleCreate() {
    setEditItem(null);
    setIsModalOpen(true);
  }

  function handleEdit(item) {
    setEditItem(item);
    setIsModalOpen(true);
  }

  function handleSave(item) {
    if (editItem) {
      setNcrs((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
    } else {
      setNcrs((current) => [item, ...current]);
    }
    setIsModalOpen(false);
    setEditItem(null);
  }

  function handleDelete() {
    setNcrs((current) => current.filter((item) => item.id !== deleteId));
    setDeleteId(null);
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
                Pantau status temuan, progress perbaikan, dan aktivitas terbaru terkait non-conformity report di seluruh armada kapal.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={handleCreate}
                 className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-semibold text-emerald-700"
              >
                <Plus size={16} />
                Tambah Data
              </button>
              <button className="inline-flex items-center gap-2 rounded-[14px] border border-white/20 px-4 py-3 text-[13px] font-semibold text-white/92">
                <FileText size={16} />
                Export Laporan
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[22px] border border-white/12 bg-black/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[12px] text-white/72">
                <span>Completion Snapshot</span>
                <ChevronRight size={15} />
              </div>
              <p className="mt-3 text-[34px] font-bold leading-none">
                {Math.round((ncrs.filter((item) => item.status === "Verified" || item.status === "Closed").length / ncrs.length) * 100)}%
              </p>
              <p className="mt-2 text-[12px] text-white/78">NCR yang sudah masuk tahap verifikasi atau close</p>
            </div>

            <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[12px] text-white/72">
                <span>Next Priority</span>
                <ArrowRight size={15} />
              </div>
              <p className="mt-3 text-[16px] font-semibold leading-6">
                {focusItems[0]?.id || "-"}: {focusItems[0]?.owner || "-"}
              </p>
              <p className="mt-2 text-[12px] text-white/78">
                Fokus ke severity tinggi dan target date terdekat
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

      <section className="grid gap-4 xl:grid-cols-[1.75fr_1fr]">
        <Card className="overflow-hidden border-[#edf1f4]">
          <CardContent className="p-0">
            <div className="border-b border-[#edf1f4] px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#1f2b38]">NCR Register</h2>
                  <p className="mt-1 text-[12px] text-[#7c8793]">
                    Fokus di pencarian cepat, status tracking, dan ownership per temuan.
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <div className="relative w-full lg:w-[280px]">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari nomor, title, vessel, owner"
                      className="w-full rounded-[12px] border border-[#dfe5ea] bg-white py-2.5 pl-10 pr-3 text-[13px] text-[#273240] outline-none focus:border-[#c84f58] focus:ring-2 focus:ring-[#f7d8db]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["All", ...STATUSES].map((item) => (
                      <button
                        key={item}
                        onClick={() => setStatusFilter(item)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                          statusFilter === item
                            ? "bg-[#b9434d] text-white"
                            : "bg-[#f4f7f9] text-[#66727e] hover:bg-[#eaedf1]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#fafbfc]">
                    {["NCR", "Finding", "Vessel", "Severity", "Status", "Owner", "Target", "Progress", "Action"].map((head) => (
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
                  {filteredNcrs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-14 text-center text-[13px] text-[#8b96a1]">
                        Tidak ada data yang cocok dengan filter saat ini.
                      </td>
                    </tr>
                  ) : (
                    filteredNcrs.map((item) => (
                      <tr key={item.id} className="border-b border-[#f0f3f5] align-top transition hover:bg-[#fcfcfd]">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-[#283341]">{item.id}</p>
                          <p className="mt-1 text-[11px] text-[#8b96a1]">{item.source}</p>
                        </td>
                        <td className="max-w-[270px] px-3 py-3">
                          <p className="font-medium leading-5 text-[#243041]">{item.title}</p>
                          <p className="mt-1 text-[11px] text-[#7c8793]">
                            {item.department} {item.area ? `• ${item.area}` : ""}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-[#51606d]">{item.vessel}</td>
                        <td className="px-3 py-3">
                          <Pill label={item.severity} map={SEVERITY_STYLES} />
                        </td>
                        <td className="px-3 py-3">
                          <Pill label={item.status} map={STATUS_STYLES} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2 text-[#51606d]">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6b7784]">
                              <UserRound size={14} />
                            </span>
                            <span>{item.owner}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-[#51606d]">
                          <p>{formatDate(item.targetDate)}</p>
                          <p className="mt-1 text-[11px] text-[#8b96a1]">{diffDays(item.issuedDate)} hari berjalan</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-[150px]">
                            <ProgressTrack status={item.status} />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => setDetailItem(item)}
                              className="inline-flex items-center gap-1 rounded-[9px] bg-[#f4f7f9] px-2.5 py-1.5 text-[11px] font-semibold text-[#4f5b67] hover:bg-[#e8edf2]"
                            >
                              <Eye size={13} />
                              Detail
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-1 rounded-[9px] bg-[#eef4ff] px-2.5 py-1.5 text-[11px] font-semibold text-[#376ad6] hover:bg-[#e0eaff]"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                            <button
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
                  <p className="mt-1 text-[12px] text-[#7c8793]">Tiga NCR paling perlu didorong.</p>
                </div>
                <div className="rounded-full bg-[#fff1f1] px-3 py-1 text-[11px] font-semibold text-[#b8434d]">
                  Focus
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {focusItems.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-[#edf1f4] bg-[#fafbfd] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[12px] font-semibold text-[#b8434d]">{item.id}</p>
                        <p className="mt-1 text-[14px] font-semibold leading-5 text-[#243041]">{item.title}</p>
                      </div>
                      <Pill label={item.severity} map={SEVERITY_STYLES} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[12px] text-[#6f7c89]">
                      <span>{item.owner}</span>
                      <span>{formatDate(item.targetDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#edf1f4]">
            <CardContent className="p-5">
              <h2 className="text-[17px] font-semibold text-[#1f2b38]">Recent Activity</h2>
              <div className="mt-4 space-y-4">
                {RECENT_ACTIVITY.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={`${item.title}-${item.time}`} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${item.iconClass}`}>
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold leading-5 text-[#2a3644]">{item.title}</p>
                        <p className="mt-1 text-[12px] leading-5 text-[#7c8793]">{item.desc}</p>
                      </div>
                      <span className="whitespace-nowrap text-[11px] font-medium text-[#8b96a1]">{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <AttachmentModulePanel
        title="Attachment untuk NCR"
        description="Panel ini tidak dipakai untuk upload. User upload file lewat halaman Attachment, lalu hasilnya otomatis tampil di sini kalau `record id` dan `module name` cocok."
        contexts={attachmentContexts}
        seedAttachments={attachmentSeed}
      />

      {isModalOpen ? (
        <NcrModal
          key={editItem?.id || nextId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditItem(null);
          }}
          onSave={handleSave}
          initialData={editItem}
          nextId={nextId}
          isEdit={!!editItem}
        />
      ) : null}

      <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />

      <ConfirmModal
        itemId={deleteId}
        isOpen={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
