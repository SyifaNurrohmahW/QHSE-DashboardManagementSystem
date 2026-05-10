"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Plus,
  ShieldAlert,
  Siren,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import AttachmentModulePanel from "@/components/dashboard/attachment-module-panel";
import { Card, CardContent } from "@/components/ui/card";
import {
  createIncident,
  deleteIncident,
  getIncidentList,
  updateIncident,
} from "@/lib/services/incidentService";
import { getKapalOptions } from "@/lib/services/kapalService";
import {
  INCIDENT_CATEGORY_OPTIONS,
  INCIDENT_LEVEL_OPTIONS,
  INCIDENT_STATUS_OPTIONS,
  PIC_OPTIONS,
  RCA_OPTIONS,
} from "@/constants/incidentOptions";

const TIPE_CARTER = ["FC", "TC", "Owner"];

const EMPTY_FORM = {
  id: "",
  ref: "",
  tugboat_id: "",
  barge_id: "",
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
  status: "open",
};

const LEVEL_STYLES = {
  Low: "bg-[#edf9f1] text-[#166534]",
  Medium: "bg-[#fffbeb] text-[#b45309]",
  High: "bg-[#fff0f0] text-[#c53030]",
  Critical: "bg-[#fff0f0] text-[#7f1d1d]",
};

const STATUS_STYLES = {
  open: "bg-[#fffbeb] text-[#b45309]",
  on_progress: "bg-[#eff6ff] text-[#1d4ed8]",
  closed: "bg-[#edf9f1] text-[#166534]",
  overdue: "bg-[#fff0f0] text-[#c53030]",
};

const BREAKDOWN_COLORS = {
  Tubrukan: "#df5b5b",
  Kandas: "#4a87d9",
  "Properti Dismiss": "#d89a2b",
  "Injury Person": "#805ad5",
  Fatality: "#22a35e",
  Lainnya: "#73808d",
};

function statusLabel(value) {
  return INCIDENT_STATUS_OPTIONS.find((item) => item.value === value)?.label || value || "-";
}

function fmtDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} ${date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
}

function toDateTimeInput(value) {
  if (!value) return "";
  return value.length >= 16 ? value.slice(0, 16) : value;
}

function genId(incidents) {
  const year = new Date().getFullYear();
  const nums = incidents
    .map((item) => Number(String(item.id || "").split("-").at(-1)))
    .filter((num) => Number.isFinite(num));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `INC-${year}-${String(next).padStart(3, "0")}`;
}

function Pill({ label, styleMap, display }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
        styleMap[label] || "bg-gray-100 text-gray-600"
      }`}
    >
      {display || label || "-"}
    </span>
  );
}

function FormField({ label, req, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wide text-[#6b7a87]">
        {label} {req ? <span className="text-[#c53030]">*</span> : null}
      </label>
      {children}
      {error ? <span className="text-[10px] text-[#c53030]">Wajib diisi</span> : null}
    </div>
  );
}

function DonutChart({ incidents }) {
  const items = useMemo(() => {
    const counts = {};
    incidents.forEach((item) => {
      const key = item.category || "Lainnya";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts).map(([label, val]) => ({
      label,
      val,
      color: BREAKDOWN_COLORS[label] || "#73808d",
    }));
  }, [incidents]);

  const total = incidents.length || 1;
  const tau = 2 * Math.PI;
  const cx = 60;
  const cy = 60;
  const r = 44;
  const sw = 20;
  let offset = 0;

  const paths = items.map((item) => {
    const angle = (item.val / total) * tau;
    const x1 = cx + r * Math.sin(offset);
    const y1 = cy - r * Math.cos(offset);
    const x2 = cx + r * Math.sin(offset + angle);
    const y2 = cy - r * Math.cos(offset + angle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r},0,${large},1,${x2.toFixed(2)},${y2.toFixed(2)} Z`;
    offset += angle;
    return <path key={item.label} d={d} fill={item.color} opacity={0.88} />;
  });

  return (
    <div className="mt-4 flex items-center gap-5">
      <svg width={120} height={120} viewBox="0 0 120 120" className="flex-shrink-0">
        {paths}
        <circle cx={cx} cy={cy} r={r - sw} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill="#7b8793" fontFamily="inherit">
          Total
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={22} fontWeight="500" fill="#283341" fontFamily="inherit">
          {incidents.length}
        </text>
      </svg>
      <div className="flex flex-col gap-2 text-[11px] text-[#5a6672]">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="flex-1">{item.label}</span>
              <span className="ml-2 font-medium text-[#2e3948]">{item.val}</span>
            </div>
          ))
        ) : (
          <p className="text-[12px] text-[#8a95a2]">Belum ada data kategori.</p>
        )}
      </div>
    </div>
  );
}

function FormModal({ isOpen, onClose, onSave, initialData, isEdit, nextId, isSaving, kapalOptions }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...initialData,
    id: initialData?.id || nextId,
    start: toDateTimeInput(initialData?.start),
    end: toDateTimeInput(initialData?.end),
  }));
  const [errors, setErrors] = useState({});

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const setKapal = (idKey, nameKey) => (event) => {
    const selectedId = event.target.value;
    const selectedKapal = kapalOptions.find((item) => String(item.value) === selectedId);

    setForm((current) => ({
      ...current,
      [idKey]: selectedId,
      [nameKey]: selectedKapal?.nama_kapal || "",
    }));
  };

  const required = ["id", "tugboat_id", "barge_id", "start", "level", "category", "location", "status", "desc"];

  function handleSave() {
    const nextErrors = {};
    required.forEach((key) => {
      if (!form[key]?.toString().trim()) nextErrors[key] = true;
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSave(form);
  }

  if (!isOpen) return null;

  const inputCls = (id) =>
    `w-full rounded-[8px] border bg-white px-3 py-1.5 font-sans text-[12px] focus:outline-none focus:ring-1 focus:ring-[#b93743] ${
      errors[id] ? "border-[#c53030]" : "border-[#dde3e8]"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="w-full max-w-[640px] rounded-[14px] border border-[#e5eaee] bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[#edf1f4] px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-[#1f2b38]">
              {isEdit ? "Edit Laporan Insiden" : "Buat Laporan Insiden"}
            </p>
            <p className="mt-0.5 text-[11px] text-[#8a95a2]">
              {isEdit ? `Mengubah data ${form.id}` : "Isi formulir laporan insiden baru"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6b7a87] hover:bg-[#eaeff3] disabled:opacity-60"
          >
            <X size={15} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          <FormField label="No. Insiden" req error={errors.id}>
            <input
              className={`${inputCls("id")} cursor-not-allowed bg-[#f8f9fb] text-[#8a95a2]`}
              value={form.id}
              readOnly
            />
          </FormField>

          <FormField label="Tipe Carter">
            <select className={inputCls("ref")} value={form.ref} onChange={set("ref")}>
              <option value="">Pilih tipe carter</option>
              {TIPE_CARTER.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tugboat" req error={errors.tugboat_id}>
            <select className={inputCls("tugboat_id")} value={form.tugboat_id || ""} onChange={setKapal("tugboat_id", "tugboat")}>
              <option value="">Pilih tugboat</option>
              {kapalOptions.map((item) => (
                <option key={`tugboat-${item.value}`} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Barge" req error={errors.barge_id}>
            <select className={inputCls("barge_id")} value={form.barge_id || ""} onChange={setKapal("barge_id", "barge")}>
              <option value="">Pilih barge</option>
              {kapalOptions.map((item) => (
                <option key={`barge-${item.value}`} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tanggal Mulai" req error={errors.start}>
            <input type="datetime-local" className={inputCls("start")} value={form.start} onChange={set("start")} />
          </FormField>

          <FormField label="Tanggal Selesai">
            <input type="datetime-local" className={inputCls("end")} value={form.end} onChange={set("end")} />
          </FormField>

          <FormField label="Durasi Downtime (jam)">
            <input type="number" min={0} className={inputCls("duration")} value={form.duration} onChange={set("duration")} placeholder="0" />
          </FormField>

          <FormField label="Koordinat">
            <input className={inputCls("coord")} value={form.coord} onChange={set("coord")} placeholder="-3.4567, 117.8910" />
          </FormField>

          <FormField label="Level" req error={errors.level}>
            <select className={inputCls("level")} value={form.level} onChange={set("level")}>
              <option value="">Pilih level</option>
              {INCIDENT_LEVEL_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Kategori Insiden" req error={errors.category}>
            <select className={inputCls("category")} value={form.category} onChange={set("category")}>
              <option value="">Pilih kategori</option>
              {INCIDENT_CATEGORY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Lokasi" req error={errors.location}>
            <input className={inputCls("location")} value={form.location} onChange={set("location")} placeholder="Contoh: Main Deck" />
          </FormField>

          <FormField label="Responsibility / PIC">
            <select className={inputCls("resp")} value={form.resp} onChange={set("resp")}>
              <option value="">Pilih PIC</option>
              {PIC_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="RCA">
            <select className={inputCls("owner")} value={form.owner} onChange={set("owner")}>
              <option value="">Pilih RCA</option>
              {RCA_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Status" req error={errors.status}>
            <select className={inputCls("status")} value={form.status} onChange={set("status")}>
              <option value="">Pilih status</option>
              {INCIDENT_STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-[#6b7a87]">
              Deskripsi <span className="text-[#c53030]">*</span>
            </label>
            <textarea
              rows={3}
              className={`${inputCls("desc")} resize-y`}
              value={form.desc}
              onChange={set("desc")}
              placeholder="Jelaskan kronologi dan detail insiden..."
            />
            {errors.desc ? <span className="text-[10px] text-[#c53030]">Wajib diisi</span> : null}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#edf1f4] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-[8px] bg-[#f4f7f9] px-4 py-2 text-[12px] font-medium text-[#5c6a77] hover:bg-[#eaeff3] disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-[8px] bg-[#b93743] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#a02e38] disabled:opacity-70"
          >
            {isSaving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Laporan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, incidentId, onCancel, onConfirm, isDeleting }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div className="w-full max-w-[360px] rounded-[14px] border border-[#e5eaee] bg-white p-6 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0]">
          <Trash2 size={20} className="text-[#c53030]" />
        </div>
        <p className="mb-1 text-[15px] font-semibold text-[#1f2b38]">Hapus Laporan Insiden?</p>
        <p className="mb-5 text-[12px] text-[#7a8692]">
          Laporan <span className="font-semibold text-[#1f2b38]">{incidentId}</span> akan dihapus permanen.
        </p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-[8px] bg-[#f4f7f9] px-5 py-2 text-[12px] font-medium text-[#5c6a77] hover:bg-[#eaeff3] disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-[8px] bg-[#c53030] px-5 py-2 text-[12px] font-semibold text-white hover:bg-[#a82828] disabled:opacity-70"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
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
    { label: "Tipe Carter", value: incident.ref || "-" },
    { label: "Tugboat", value: incident.tugboat || "-" },
    { label: "Barge", value: incident.barge || "-" },
    { label: "Tanggal Mulai", value: fmtDate(incident.start) },
    { label: "Tanggal Selesai", value: fmtDate(incident.end) },
    { label: "Durasi Downtime", value: incident.duration ? `${incident.duration} jam` : "-" },
    { label: "Koordinat", value: incident.coord || "-" },
    { label: "Kategori", value: incident.category || "-" },
    { label: "Lokasi", value: incident.location || "-" },
    { label: "PIC", value: incident.resp || "-" },
    { label: "RCA", value: incident.owner || "-" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[680px] overflow-hidden rounded-[16px] border border-[#e5eaee] bg-white shadow-lg">
        <div className="flex items-start justify-between border-b border-[#edf1f4] px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-[#1f2b38]">Detail Laporan Insiden</p>
            <p className="mt-0.5 text-[11px] text-[#8a95a2]">{incident.id}</p>
          </div>
          <button
            type="button"
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">{row.label}</p>
                <p className="mt-1 text-[13px] font-medium text-[#243041]">{row.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[12px] border border-[#edf1f4] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">Deskripsi Insiden</p>
            <p className="mt-2 text-[13px] leading-6 text-[#4b5866]">{incident.desc || "-"}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Pill label={incident.level} styleMap={LEVEL_STYLES} />
            <Pill label={incident.status} display={statusLabel(incident.status)} styleMap={STATUS_STYLES} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IncidentPage() {
  const [incidents, setIncidents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [kapalOptions, setKapalOptions] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadIncidents() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const data = await getIncidentList();
        if (isMounted) setIncidents(data);
      } catch (error) {
        if (isMounted) setErrorMessage(error.message || "Gagal memuat data insiden.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadIncidents();

    getKapalOptions()
      .then((data) => {
        if (isMounted) setKapalOptions(data);
      })
      .catch((error) => {
        if (isMounted) setErrorMessage(error.message || "Gagal memuat data kapal.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalInsiden = incidents.length;
  const aktifInsiden = incidents.filter((item) => item.status === "open" || item.status === "on_progress").length;
  const selesaiInsiden = incidents.filter((item) => item.status === "closed").length;
  const nearMiss = incidents.filter((item) => item.category?.toLowerCase().includes("near miss")).length;
  const openRatio = totalInsiden ? Math.round((aktifInsiden / totalInsiden) * 100) : 0;
  const completionRate = totalInsiden ? Math.round((selesaiInsiden / totalInsiden) * 100) : 0;
  const totalDowntime = incidents.reduce((sum, item) => sum + Number(item.duration || 0), 0);

  const mostCommonLocation = useMemo(() => {
    const counts = {};
    incidents.forEach((item) => {
      if (item.location) counts[item.location] = (counts[item.location] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || null;
  }, [incidents]);

  const latestActivities = useMemo(() => {
    return incidents
      .slice()
      .sort((a, b) => new Date(b.start || 0) - new Date(a.start || 0))
      .slice(0, 5);
  }, [incidents]);

  const incidentStats = [
    {
      title: "Total Insiden",
      value: String(totalInsiden).padStart(2, "0"),
      note: "Data tersimpan di Supabase",
      icon: AlertTriangle,
      tone: "bg-[#fff1f1] text-[#df5b5b]",
    },
    {
      title: "Investigasi Aktif",
      value: String(aktifInsiden).padStart(2, "0"),
      note: "Status open dan on progress",
      icon: ShieldAlert,
      tone: "bg-[#fff7e8] text-[#d89a2b]",
    },
    {
      title: "Kasus Selesai",
      value: String(selesaiInsiden).padStart(2, "0"),
      note: `${completionRate}% tingkat penyelesaian`,
      icon: CheckCircle2,
      tone: "bg-[#edf9f1] text-[#22a35e]",
    },
    {
      title: "Near Miss",
      value: String(nearMiss).padStart(2, "0"),
      note: "Kategori mengandung near miss",
      icon: Siren,
      tone: "bg-[#eef6ff] text-[#4a87d9]",
    },
  ];

  const attachmentContexts = useMemo(() => {
    return incidents.map((item) => ({
      moduleName: "incident",
      recordId: item.id,
      recordIds: [item.id, item.dbId].filter(Boolean).map(String),
      uploadedBy: item.owner,
    }));
  }, [incidents]);

  function openCreate() {
    setEditData(null);
    setModalOpen(true);
  }

  function openEdit(incident) {
    setEditData(incident);
    setModalOpen(true);
  }

  async function handleSave(data) {
    try {
      setIsSaving(true);
      setErrorMessage("");
      if (editData) {
        const updated = await updateIncident(editData.id, data);
        setIncidents((current) => current.map((item) => (item.id === editData.id ? updated : item)));
      } else {
        const created = await createIncident(data);
        setIncidents((current) => [created, ...current]);
      }
      setModalOpen(false);
      setEditData(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyimpan data insiden.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setErrorMessage("");
      await deleteIncident(deleteTarget);
      setIncidents((current) => current.filter((item) => item.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menghapus data insiden.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[20px] bg-gradient-to-r from-[#8f1f2d] via-[#b93743] to-[#d85c5f] text-white shadow-[0_16px_36px_rgba(127,34,44,0.18)]">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/85">
              <AlertTriangle size={14} />
              Ringkasan Incident Report
            </div>
            <h1 className="mt-3 text-[22px] font-bold leading-tight">Monitoring laporan insiden, investigasi, dan tindak perbaikan.</h1>
            <p className="mt-2 max-w-2xl text-[13px] text-white/82">
              Kelola daftar insiden, ringkasan insiden, dan aktivitas tindak lanjut berdasarkan data Supabase.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#9a2534]"
            >
              <Plus size={16} />
              Buat Laporan
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-[10px] border border-white/25 px-4 py-2.5 text-[13px] font-semibold text-white">
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
            <p className="mt-2 text-[24px] font-bold leading-none">{openRatio}%</p>
            <p className="mt-1 text-[12px] text-white/75">Dari total laporan yang tercatat</p>
          </div>
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Total Downtime</p>
            <div className="mt-2 flex items-center gap-2">
              <Clock3 size={18} className="text-[#ffd9a0]" />
              <span className="text-[20px] font-bold">{totalDowntime} Jam</span>
            </div>
            <p className="mt-1 text-[12px] text-white/75">Akumulasi durasi downtime insiden</p>
          </div>
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Area Paling Rawan</p>
            <div className="mt-2 flex items-center gap-2">
              <Siren size={18} className="text-[#ffd9a0]" />
              <span className="text-[15px] font-semibold">{mostCommonLocation?.[0] || "-"}</span>
            </div>
            <p className="mt-1 text-[12px] text-white/75">{mostCommonLocation ? `${mostCommonLocation[1]} kasus tercatat` : "Belum ada data"}</p>
          </div>
        </div>
      </section>

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

      {errorMessage ? (
        <div className="rounded-[16px] border border-[#ffd7d7] bg-[#fff7f7] px-4 py-3 text-[13px] font-medium text-[#b42318]">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid items-start gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card className="self-start overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-[#edf1f4] px-5 py-4">
              <div>
                <h2 className="text-[16px] font-semibold text-[#243041]">Daftar Insiden</h2>
                <p className="mt-1 text-[12px] text-[#7a8692]">Daftar laporan insiden dari Supabase</p>
              </div>
              <div className="rounded-full bg-[#f4f7f9] px-3 py-1 text-[12px] font-medium text-[#5c6a77]">
                {incidents.length} laporan
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 380 }}>
              <table className="min-w-[940px] w-full border-collapse text-[11px]">
                <thead>
                  <tr className="sticky top-0 z-10 bg-[#f8fafb]">
                    {["NO. INSIDEN", "DESKRIPSI / LOKASI", "KAPAL", "LEVEL", "STATUS", "PIC", "WAKTU LAPOR", "AKSI"].map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap border-b border-[#edf1f4] px-2.5 py-2 text-left text-[9px] font-semibold tracking-wider text-[#8b96a1]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-[12px] text-[#7a8692]">
                        Memuat data insiden...
                      </td>
                    </tr>
                  ) : incidents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-[12px] text-[#7a8692]">
                        Belum ada laporan insiden.
                      </td>
                    </tr>
                  ) : (
                    incidents.map((item) => (
                      <tr key={item.id} className="border-b border-[#f0f3f5] transition-colors hover:bg-[#fafbfc]">
                        <td className="whitespace-nowrap px-2.5 py-2.5 font-medium text-[#5c6a77]">{item.id}</td>
                        <td className="max-w-[190px] px-2.5 py-2.5">
                          <p className="line-clamp-2 text-[11px] font-medium leading-snug text-[#243041]">{item.desc || "-"}</p>
                          <p className="mt-0.5 text-[10px] text-[#8b96a1]">{item.location || "-"}</p>
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-2.5 text-[#4a5568]">{item.tugboat || "-"}</td>
                        <td className="whitespace-nowrap px-2.5 py-2.5">
                          <Pill label={item.level} styleMap={LEVEL_STYLES} />
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-2.5">
                          <Pill label={item.status} display={statusLabel(item.status)} styleMap={STATUS_STYLES} />
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-2.5 text-[#4a5568]">{item.resp || "-"}</td>
                        <td className="whitespace-nowrap px-2.5 py-2.5 text-[10px] text-[#8b96a1]">{fmtDate(item.start)}</td>
                        <td className="whitespace-nowrap px-2.5 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => setDetailData(item)}
                              className="inline-flex items-center gap-1 rounded-[6px] bg-[#f3f4f6] px-2 py-1 text-[10px] font-medium text-[#374151] hover:bg-[#e5e7eb]"
                            >
                              <Eye size={11} />
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="inline-flex items-center gap-1 rounded-[6px] bg-[#eff6ff] px-2 py-1 text-[10px] font-medium text-[#1d4ed8] hover:bg-[#dbeafe]"
                            >
                              <Pencil size={11} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item.id)}
                              className="inline-flex items-center gap-1 rounded-[6px] bg-[#fff0f0] px-2 py-1 text-[10px] font-medium text-[#c53030] hover:bg-[#fecaca]"
                            >
                              <Trash2 size={11} />
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

        <div className="grid content-start gap-4 self-start">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-[16px] font-semibold text-[#243041]">Ringkasan Insiden</h2>
              <DonutChart incidents={incidents} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-[16px] font-semibold text-[#243041]">Aktivitas Terbaru</h2>
              <div className="mt-4 space-y-3 overflow-y-auto" style={{ maxHeight: 200 }}>
                {latestActivities.length ? (
                  latestActivities.map((item) => (
                    <div key={`${item.id}-${item.start}`} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-[#df5b5b]">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[#293544]">{item.id}</p>
                        <p className="mt-0.5 line-clamp-2 text-[12px] text-[#71808d]">{item.desc || item.category || "-"}</p>
                      </div>
                      <span className="whitespace-nowrap text-[11px] font-medium text-[#8a95a0]">{fmtDate(item.start)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-[#8a95a2]">Belum ada aktivitas.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <AttachmentModulePanel
        title="Attachment Incident"
        description="File dari halaman Attachment akan tampil jika record id dan module name cocok."
        contexts={attachmentContexts}
      />

      {modalOpen ? (
        <FormModal
          key={editData?.id || genId(incidents)}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditData(null);
          }}
          onSave={handleSave}
          initialData={editData}
          isEdit={!!editData}
          nextId={genId(incidents)}
          isSaving={isSaving}
          kapalOptions={kapalOptions}
        />
      ) : null}

      <ConfirmModal
        isOpen={!!deleteTarget}
        incidentId={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      <DetailModal incident={detailData} onClose={() => setDetailData(null)} />
    </div>
  );
}
