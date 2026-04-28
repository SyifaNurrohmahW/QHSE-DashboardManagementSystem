"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  FileWarning,
  FileText,
  Plus,
  ShieldAlert,
  Siren,
  UserRound,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import AttachmentModulePanel from "@/components/dashboard/attachment-module-panel";
import { Card, CardContent } from "@/components/ui/card";

// ─── Data Awal ───────────────────────────────────────────────────────────────

const TUGBOATS = [
  "MV Adaro Pioneer",
  "MV South Borneo",
  "MV Energi Nusantara",
  "MV Adaro Maritim",
];

const BARGES = [
  "BG Borneo 01",
  "BG Kalimantan 02",
  "BG Nusantara 03",
  "BG Adaro 04",
];

const CATEGORIES = [
  "Terpeleset / Tersandung",
  "Peralatan",
  "Lifting",
  "Kebakaran / Tumpahan",
  "Near Miss",
  "Lainnya",
];

const LEVELS = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "On Progress", "Closed"];

const INITIAL_INCIDENTS = [
  {
    id: "INC-2026-041",
    ref: "",
    tugboat: "MV Adaro Pioneer",
    barge: "BG Borneo 01",
    start: "2026-04-25T08:00",
    end: "",
    duration: 4,
    coord: "-3.45, 117.89",
    level: "High",
    category: "Terpeleset / Tersandung",
    location: "Main Deck",
    resp: "Chief Officer",
    owner: "Marine Safety",
    desc: "Crew terpeleset di deck basah saat persiapan mooring",
    status: "Open",
  },
  {
    id: "INC-2026-038",
    ref: "CLT-007",
    tugboat: "MV South Borneo",
    barge: "BG Kalimantan 02",
    start: "2026-04-24T16:30",
    end: "",
    duration: 0,
    coord: "",
    level: "Medium",
    category: "Near Miss",
    location: "Cargo Hold",
    resp: "Rizky Pratama",
    owner: "Deck Crew",
    desc: "Near miss saat aktivitas lifting di cargo hold",
    status: "On Progress",
  },
  {
    id: "INC-2026-035",
    ref: "",
    tugboat: "MV Energi Nusantara",
    barge: "BG Nusantara 03",
    start: "2026-04-23T11:00",
    end: "2026-04-23T14:00",
    duration: 3,
    coord: "",
    level: "Low",
    category: "Peralatan",
    location: "Engine Room",
    resp: "Fajar Hidayat",
    owner: "Engine Team",
    desc: "Cedera ringan pada tangan saat pengecekan peralatan",
    status: "Closed",
  },
  {
    id: "INC-2026-031",
    ref: "CLT-003",
    tugboat: "MV Adaro Maritim",
    barge: "BG Adaro 04",
    start: "2026-04-22T09:40",
    end: "",
    duration: 8,
    coord: "-3.12, 117.55",
    level: "High",
    category: "Kebakaran / Tumpahan",
    location: "Pump Station",
    resp: "Andi Saputra",
    owner: "Safety Team",
    desc: "Tumpahan oli ditemukan di area transfer point",
    status: "On Progress",
  },
];

const TIMELINE = [
  {
    title: "Laporan awal dikirim",
    desc: "INC-2026-041 dibuat oleh Chief Officer",
    time: "08:15",
    icon: FileWarning,
    iconClass: "bg-[#fff1f1] text-[#df5b5b]",
  },
  {
    title: "Supervisor menunjuk investigator",
    desc: "Ditugaskan ke tim Marine Safety",
    time: "08:42",
    icon: UserRound,
    iconClass: "bg-[#eef6ff] text-[#4a87d9]",
  },
  {
    title: "Tindakan segera dicatat",
    desc: "Area deck diisolasi dan dibersihkan",
    time: "09:05",
    icon: ShieldAlert,
    iconClass: "bg-[#fff7e8] text-[#d89a2b]",
  },
  {
    title: "Review tindakan perbaikan",
    desc: "Menunggu persetujuan HSE",
    time: "09:30",
    icon: Clock3,
    iconClass: "bg-[#edf9f1] text-[#22a35e]",
  },
];

const BREAKDOWN_COLORS = {
  "Terpeleset / Tersandung": "#df5b5b",
  Peralatan: "#4a87d9",
  Lifting: "#d89a2b",
  "Kebakaran / Tumpahan": "#805ad5",
  "Near Miss": "#22a35e",
  Lainnya: "#73808d",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + " " + dt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function genId(incidents) {
  const nums = incidents.map((i) => parseInt(i.id.split("-")[2]));
  const max = nums.length ? Math.max(...nums) : 40;
  return "INC-2026-" + String(max + 1).padStart(3, "0");
}

// ─── Badge Pill ───────────────────────────────────────────────────────────────

const LEVEL_STYLES = {
  Low: "bg-[#edf9f1] text-[#166534]",
  Medium: "bg-[#fffbeb] text-[#b45309]",
  High: "bg-[#fff0f0] text-[#c53030]",
  Critical: "bg-[#fff0f0] text-[#7f1d1d]",
};

const STATUS_STYLES = {
  Open: "bg-[#fffbeb] text-[#b45309]",
  "On Progress": "bg-[#eff6ff] text-[#1d4ed8]",
  Closed: "bg-[#edf9f1] text-[#166534]",
};

function Pill({ label, styleMap }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
        styleMap[label] || "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}

function FormField({ label, req, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wide text-[#6b7a87]">
        {label} {req && <span className="text-[#c53030]">*</span>}
      </label>
      {children}
      {error ? <span className="text-[10px] text-[#c53030]">Wajib diisi</span> : null}
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ incidents }) {
  const counts = useMemo(() => {
    const c = {};
    incidents.forEach((i) => {
      c[i.category] = (c[i.category] || 0) + 1;
    });
    return c;
  }, [incidents]);

  const total = incidents.length || 1;
  const items = Object.entries(counts).map(([label, val]) => ({
    label,
    val,
    color: BREAKDOWN_COLORS[label] || "#73808d",
  }));

  const tau = 2 * Math.PI;
  const cx = 60, cy = 60, r = 44, sw = 20;
  let offset = 0;

  const paths = items.map((b) => {
    const angle = (b.val / total) * tau;
    const x1 = cx + r * Math.sin(offset);
    const y1 = cy - r * Math.cos(offset);
    const x2 = cx + r * Math.sin(offset + angle);
    const y2 = cy - r * Math.cos(offset + angle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r},0,${large},1,${x2.toFixed(2)},${y2.toFixed(2)} Z`;
    offset += angle;
    return <path key={b.label} d={d} fill={b.color} opacity={0.88} />;
  });

  return (
    <div className="flex items-center gap-5 mt-4">
      <svg width={120} height={120} viewBox="0 0 120 120" className="flex-shrink-0">
        {paths}
        <circle cx={cx} cy={cy} r={r - sw} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill="#7b8793" fontFamily="inherit">
          Bulan Ini
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={22} fontWeight="500" fill="#283341" fontFamily="inherit">
          {incidents.length}
        </text>
      </svg>
      <div className="flex flex-col gap-2 text-[11px] text-[#5a6672]">
        {items.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
            <span className="flex-1">{b.label}</span>
            <span className="font-medium text-[#2e3948] ml-2">{b.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  id: "",
  ref: "",
  tugboat: "",
  barge: "",
  start: "",
  end: "",
  duration: "",
  coord: "",
  level: "",
  category: "",
  location: "",
  resp: "",
  owner: "",
  desc: "",
  status: "",
};

function FormModal({ isOpen, onClose, onSave, initialData, isEdit, nextId }) {
  const [form, setForm] = useState(initialData || { ...EMPTY_FORM, id: nextId });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const required = ["tugboat", "barge", "start", "level", "category", "location", "status", "desc"];

  function handleSave() {
    const errs = {};
    required.forEach((k) => {
      if (!form[k]?.toString().trim()) errs[k] = true;
    });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, id: form.id || nextId });
  }

  if (!isOpen) return null;

  const inputCls = (id) =>
    `rounded-[8px] border px-3 py-1.5 text-[12px] bg-white font-sans w-full focus:outline-none focus:ring-1 focus:ring-[#b93743] ${
      errors[id] ? "border-[#c53030]" : "border-[#dde3e8]"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-6 px-3"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[14px] w-full max-w-[640px] border border-[#e5eaee] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#edf1f4]">
          <div>
            <p className="text-[15px] font-semibold text-[#1f2b38]">
              {isEdit ? "Edit Laporan Insiden" : "Buat Laporan Insiden"}
            </p>
            <p className="text-[11px] text-[#8a95a2] mt-0.5">
              {isEdit ? `Mengubah data ${form.id}` : "Isi formulir laporan insiden baru"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f7f9] flex items-center justify-center text-[#6b7a87] hover:bg-[#eaeff3]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          {/* No Insiden */}
          <FormField label="No. Insiden" error={errors.id}>
            <input className={`${inputCls("id")} bg-[#f8f9fb] text-[#8a95a2]`} value={form.id || nextId} readOnly />
          </FormField>

          {/* No Referensi Client */}
          <FormField label="No. Referensi Client (opsional)" error={errors.ref}>
            <input className={inputCls("ref")} value={form.ref} onChange={set("ref")} placeholder="Contoh: CLT-001" />
          </FormField>

          {/* Tugboat */}
          <FormField label="Tugboat" req error={errors.tugboat}>
            <select className={inputCls("tugboat")} value={form.tugboat} onChange={set("tugboat")}>
              <option value="">-- Pilih Kapal --</option>
              {TUGBOATS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </FormField>

          {/* Barge */}
          <FormField label="Barge" req error={errors.barge}>
            <select className={inputCls("barge")} value={form.barge} onChange={set("barge")}>
              <option value="">-- Pilih Kapal --</option>
              {BARGES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </FormField>

          {/* Tanggal Mulai */}
          <FormField label="Tanggal Mulai" req error={errors.start}>
            <input type="datetime-local" className={inputCls("start")} value={form.start} onChange={set("start")} />
          </FormField>

          {/* Tanggal Selesai */}
          <FormField label="Tanggal Selesai" error={errors.end}>
            <input type="datetime-local" className={inputCls("end")} value={form.end} onChange={set("end")} />
          </FormField>

          {/* Durasi Downtime */}
          <FormField label="Durasi Downtime (jam)" error={errors.duration}>
            <input type="number" min={0} className={inputCls("duration")} value={form.duration} onChange={set("duration")} placeholder="0" />
          </FormField>

          {/* Koordinat */}
          <FormField label="Koordinat" error={errors.coord}>
            <input className={inputCls("coord")} value={form.coord} onChange={set("coord")} placeholder="-3.4567, 117.8910" />
          </FormField>

          {/* Level */}
          <FormField label="Level" req error={errors.level}>
            <select className={inputCls("level")} value={form.level} onChange={set("level")}>
              <option value="">-- Pilih Level --</option>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </FormField>

          {/* Kategori Insiden */}
          <FormField label="Kategori Insiden" req error={errors.category}>
            <select className={inputCls("category")} value={form.category} onChange={set("category")}>
              <option value="">-- Pilih Kategori --</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </FormField>

          {/* Lokasi */}
          <FormField label="Lokasi" req error={errors.location}>
            <input className={inputCls("location")} value={form.location} onChange={set("location")} placeholder="Contoh: Main Deck" />
          </FormField>

          {/* Responsibility */}
          <FormField label="Responsibility" error={errors.resp}>
            <input className={inputCls("resp")} value={form.resp} onChange={set("resp")} placeholder="Nama / Tim" />
          </FormField>

          {/* Owner Group */}
          <FormField label="Owner Group" error={errors.owner}>
            <input className={inputCls("owner")} value={form.owner} onChange={set("owner")} placeholder="Contoh: Marine Safety" />
          </FormField>

          {/* Status */}
          <FormField label="Status" req error={errors.status}>
            <select className={inputCls("status")} value={form.status} onChange={set("status")}>
              <option value="">-- Pilih Status --</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>

          {/* Deskripsi */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#6b7a87] tracking-wide uppercase">
              Deskripsi <span className="text-[#c53030]">*</span>
            </label>
            <textarea
              rows={3}
              className={`${inputCls("desc")} resize-y`}
              value={form.desc}
              onChange={set("desc")}
              placeholder="Jelaskan kronologi dan detail insiden..."
            />
            {errors.desc && <span className="text-[10px] text-[#c53030]">Wajib diisi</span>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[#edf1f4]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[8px] text-[12px] font-medium text-[#5c6a77] bg-[#f4f7f9] hover:bg-[#eaeff3]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-[8px] text-[12px] font-semibold text-white bg-[#b93743] hover:bg-[#a02e38]"
          >
            {isEdit ? "Simpan Perubahan" : "Simpan Laporan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmModal({ isOpen, incidentId, onCancel, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-[14px] w-full max-w-[360px] p-6 text-center border border-[#e5eaee] shadow-lg">
        <div className="w-12 h-12 bg-[#fff0f0] rounded-full flex items-center justify-center mx-auto mb-3">
          <Trash2 size={20} className="text-[#c53030]" />
        </div>
        <p className="text-[15px] font-semibold text-[#1f2b38] mb-1">Hapus Laporan Insiden?</p>
        <p className="text-[12px] text-[#7a8692] mb-5">
          Laporan <span className="font-semibold text-[#1f2b38]">{incidentId}</span> akan dihapus secara permanen dan tidak dapat dikembalikan.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-[8px] text-[12px] font-medium text-[#5c6a77] bg-[#f4f7f9] hover:bg-[#eaeff3]"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-[8px] text-[12px] font-semibold text-white bg-[#c53030] hover:bg-[#a82828]"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ incident, onClose }) {
  if (!incident) return null;

  const detailRows = [
    { label: "No. Insiden", value: incident.id },
    { label: "Referensi Client", value: incident.ref || "-" },
    { label: "Tugboat", value: incident.tugboat || "-" },
    { label: "Barge", value: incident.barge || "-" },
    { label: "Tanggal Mulai", value: fmtDate(incident.start) },
    { label: "Tanggal Selesai", value: fmtDate(incident.end) },
    { label: "Durasi Downtime", value: incident.duration ? `${incident.duration} jam` : "-" },
    { label: "Koordinat", value: incident.coord || "-" },
    { label: "Kategori", value: incident.category || "-" },
    { label: "Lokasi", value: incident.location || "-" },
    { label: "PIC", value: incident.resp || "-" },
    { label: "Owner Group", value: incident.owner || "-" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-6"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[680px] overflow-hidden rounded-[16px] border border-[#e5eaee] bg-white shadow-lg">
        <div className="flex items-start justify-between border-b border-[#edf1f4] px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-[#1f2b38]">Detail Laporan Insiden</p>
            <p className="mt-0.5 text-[11px] text-[#8a95a2]">{incident.id}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6b7a87] hover:bg-[#eaeff3]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {detailRows.map((row) => (
              <div key={row.label} className="rounded-[10px] border border-[#edf1f4] bg-[#fafbfc] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                  {row.label}
                </p>
                <p className="mt-1 text-[13px] font-medium text-[#243041]">{row.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[12px] border border-[#edf1f4] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
              Deskripsi Insiden
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#4b5866]">{incident.desc || "-"}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Pill label={incident.level} styleMap={LEVEL_STYLES} />
            <Pill label={incident.status} styleMap={STATUS_STYLES} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Utama ────────────────────────────────────────────────────────────

export default function IncidentPage() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalInsiden = incidents.length;
  const aktifInsiden = incidents.filter((i) => i.status === "On Progress").length;
  const selesaiInsiden = incidents.filter((i) => i.status === "Closed").length;
  const nearMiss = incidents.filter((i) => i.category === "Near Miss").length;

  const incidentStats = [
    {
      title: "Total Insiden",
      value: String(totalInsiden).padStart(2, "0"),
      note: "+4 laporan minggu ini",
      icon: AlertTriangle,
      tone: "bg-[#fff1f1] text-[#df5b5b]",
    },
    {
      title: "Investigasi Aktif",
      value: String(aktifInsiden).padStart(2, "0"),
      note: "2 perlu review supervisor",
      icon: ShieldAlert,
      tone: "bg-[#fff7e8] text-[#d89a2b]",
    },
    {
      title: "Kasus Selesai",
      value: String(selesaiInsiden).padStart(2, "0"),
      note: "75% tingkat penyelesaian",
      icon: CheckCircle2,
      tone: "bg-[#edf9f1] text-[#22a35e]",
    },
    {
      title: "Near Miss",
      value: String(nearMiss).padStart(2, "0"),
      note: "Terbanyak dari area mesin",
      icon: Siren,
      tone: "bg-[#eef6ff] text-[#4a87d9]",
    },
  ];

   const attachmentContexts = useMemo(() => {
      return incidents.slice(0, 4).map((item) => ({
        moduleName: "incident",
        recordId: item.id,
        uploadedBy: item.owner,
      }));
    }, [incidents]);
  
    const attachmentSeed = useMemo(() => {
      return incidents.slice(0, 3).map((item, index) => ({
        id: `ATT-${String(index + 1).padStart(3, "0")}`,
        fileName: `evidence-${item.id.toLowerCase()}.pdf`,
        originalFileName: `${item.id.toLowerCase()}-supporting-document.pdf`,
        moduleName: "incident",
        recordId: item.id,
        uploadedBy: item.owner,
        uploadedAt: `${item.issuedDate}T09:00:00.000Z`,
        sizeLabel: `${1 + index}.2 MB`,
        mimeType: "application/pdf",
        previewUrl: null,
      }));
    }, [incidents]);
  

  function openCreate() {
    setEditData(null);
    setModalOpen(true);
  }

  function openEdit(inc) {
    setEditData(inc);
    setModalOpen(true);
  }

  function handleSave(data) {
    if (editData) {
      setIncidents((prev) => prev.map((i) => (i.id === data.id ? data : i)));
    } else {
      setIncidents((prev) => [data, ...prev]);
    }
    setModalOpen(false);
    setEditData(null);
  }

  function handleDelete() {
    setIncidents((prev) => prev.filter((i) => i.id !== deleteTarget));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      {/* ── Hero Banner ── */}
      <section className="overflow-hidden rounded-[20px] bg-gradient-to-r from-[#8f1f2d] via-[#b93743] to-[#d85c5f] text-white shadow-[0_16px_36px_rgba(127,34,44,0.18)]">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/85">
              <AlertTriangle size={14} />
              Ringkasan Incident Report
            </div>
            <h1 className="mt-3 text-[22px] font-bold leading-tight">
              Monitoring laporan insiden, investigasi, dan tindak perbaikan.
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] text-white/82">
              Kelola daftar insiden, ringkasan insiden, dan aktivitas tindak lanjut secara terpusat.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#9a2534]"
            >
              <Plus size={16} />
              Buat Laporan
            </button>
            <button className="inline-flex items-center gap-2 rounded-[10px] border border-white/25 px-4 py-2.5 text-[13px] font-semibold text-white">
            <FileText size={16} /> 
            Export Laporan
            </button>
          </div>
        </div>

        <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
          <div className="bg-black/10 px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-white/70">Rasio Kasus Terbuka</p>
              <ArrowUpRight size={16} className="text-white/80" />
            </div>
            <p className="mt-2 text-[24px] font-bold leading-none">25%</p>
            <p className="mt-1 text-[12px] text-white/75">Lebih baik dari bulan lalu</p>
          </div>
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Rata-rata Waktu Selesai</p>
            <div className="mt-2 flex items-center gap-2">
              <Clock3 size={18} className="text-[#ffd9a0]" />
              <span className="text-[20px] font-bold">3,4 Hari</span>
            </div>
            <p className="mt-1 text-[12px] text-white/75">Dari laporan sampai selesai</p>
          </div>
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Area Paling Rawan</p>
            <div className="mt-2 flex items-center gap-2">
              <Siren size={18} className="text-[#ffd9a0]" />
              <span className="text-[15px] font-semibold">Main Deck</span>
            </div>
            <p className="mt-1 text-[12px] text-white/75">8 kasus dilaporkan bulan ini</p>
          </div>
        </div>
      </section>

      {/* ── Stat Cards ── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {incidentStats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium text-[#44505e]">{item.title}</p>
                    <p className="mt-2 text-[24px] font-bold leading-none text-[#1f2b38]">{item.value}</p>
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

      {/* ── Main Content ── */}
      <section className="grid items-start gap-4 xl:grid-cols-[1.7fr_1fr]">
        {/* Tabel Register Insiden */}
        <Card className="self-start overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-[#edf1f4] px-5 py-4">
              <div>
                <h2 className="text-[16px] font-semibold text-[#243041]">Daftar Insiden</h2>
                <p className="mt-1 text-[12px] text-[#7a8692]">
                  Daftar laporan insiden aktif dan selesai
                </p>
              </div>
              <div className="rounded-full bg-[#f4f7f9] px-3 py-1 text-[12px] font-medium text-[#5c6a77]">
                {incidents.length} laporan
              </div>
            </div>

            {/* Scroll wrapper */}
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 380 }}>
              {incidents.length === 0 ? (
                <div className="py-12 text-center text-[13px] text-[#9aa4ae]">
                  Belum ada laporan insiden
                </div>
              ) : (
                <table className="min-w-[940px] w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="sticky top-0 bg-[#f8fafb] z-10">
                      {["NO. INSIDEN", "DESKRIPSI / LOKASI", "KAPAL", "LEVEL", "STATUS", "PIC", "WAKTU LAPOR", "AKSI"].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap border-b border-[#edf1f4] px-2.5 py-2 text-left text-[9px] font-semibold tracking-wider text-[#8b96a1]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#f0f3f5] hover:bg-[#fafbfc] transition-colors"
                      >
                        <td className="whitespace-nowrap px-2.5 py-2.5 font-medium text-[#5c6a77]">{item.id}</td>
                        <td className="max-w-[190px] px-2.5 py-2.5">
                          <p className="line-clamp-2 text-[11px] font-medium leading-snug text-[#243041]">
                            {item.desc}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#8b96a1]">{item.location}</p>
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-2.5 text-[#4a5568]">{item.tugboat}</td>
                        <td className="whitespace-nowrap px-2.5 py-2.5">
                          <Pill label={item.level} styleMap={LEVEL_STYLES} />
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-2.5">
                          <Pill label={item.status} styleMap={STATUS_STYLES} />
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-2.5 text-[#4a5568]">{item.resp || "-"}</td>
                        <td className="whitespace-nowrap px-2.5 py-2.5 text-[10px] text-[#8b96a1]">{fmtDate(item.start)}</td>
                        <td className="whitespace-nowrap px-2.5 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => setDetailData(item)}
                              className="inline-flex items-center gap-1 rounded-[6px] bg-[#f3f4f6] px-2 py-1 text-[10px] font-medium text-[#374151] hover:bg-[#e5e7eb]"
                            >
                              <Eye size={11} />
                              Detail
                            </button>
                            <button
                              onClick={() => openEdit(item)}
                              className="inline-flex items-center gap-1 rounded-[6px] bg-[#eff6ff] px-2 py-1 text-[10px] font-medium text-[#1d4ed8] hover:bg-[#dbeafe]"
                            >
                              <Pencil size={11} />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item.id)}
                              className="inline-flex items-center gap-1 rounded-[6px] bg-[#fff0f0] px-2 py-1 text-[10px] font-medium text-[#c53030] hover:bg-[#fecaca]"
                            >
                              <Trash2 size={11} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kolom Kanan */}
        <div className="grid content-start gap-4 self-start">
          {/* Donut */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-[16px] font-semibold text-[#243041]">Ringkasan Insiden</h2>
              <DonutChart incidents={incidents} />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-[16px] font-semibold text-[#243041]">Aktivitas Terbaru</h2>
              <div className="mt-4 space-y-3 overflow-y-auto" style={{ maxHeight: 200 }}>
                {TIMELINE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={`${item.title}-${item.time}`} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${item.iconClass}`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[#293544]">{item.title}</p>
                        <p className="mt-0.5 text-[12px] text-[#71808d]">{item.desc}</p>
                      </div>
                      <span className="whitespace-nowrap text-[11px] font-medium text-[#8a95a0]">
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

        {/* ── Attachment ── */}
      <AttachmentModulePanel
                title="Attachment Incident"
                description="Panel ini tidak dipakai untuk upload. User upload file lewat halaman Attachment, lalu hasilnya otomatis tampil di sini kalau `record id` dan `module name` cocok."
                contexts={attachmentContexts}
                seedAttachments={attachmentSeed}
              />

      {/* ── Modals ── */}
      {modalOpen ? (
        <FormModal
          key={editData?.id || genId(incidents)}
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditData(null); }}
          onSave={handleSave}
          initialData={editData}
          isEdit={!!editData}
          nextId={genId(incidents)}
        />
      ) : null}

      <ConfirmModal
        isOpen={!!deleteTarget}
        incidentId={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <DetailModal incident={detailData} onClose={() => setDetailData(null)} />

        
        
    </div>
  );
}
