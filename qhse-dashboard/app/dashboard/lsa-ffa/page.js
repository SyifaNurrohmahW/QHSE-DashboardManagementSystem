"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Eye,
  FileDown,
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

// ─── Konstanta ────────────────────────────────────────────────────────────────

const VESSELS = [
  "MBP 121","MBP 122","MBP 123","MBP 125","MBP 126","MBP 128",
  "MBP 129","MBP 130","MBP 131","MBP 132","MBP 133","MBP 135",
  "MBP 136","MBP 138","MBP 139","MBP 140","MBP 141","MBP 142",
  "MBP 143","MBP 145","MBP 146","MBP 148","MBP 160","MBP 161",
  "MBP 162","MBP 3215",
];

const EQUIPMENT_TYPES = [
  "PMK",
  "ILR",
  "EPIRB REG & TEST BASARNAS",
  "SERT HRU LIFERAFT",
  "Co2 System",
  "SCBA/EEBD",
];

const EQUIPMENT_DESCRIPTIONS = {
  "PMK": "Pemadam Kebakaran",
  "ILR": "Inflatable Life Raft",
  "EPIRB REG & TEST BASARNAS": "Emergency Position Indicating Radio Beacon",
  "SERT HRU LIFERAFT": "Hydrostatic Release Unit – Liferaft",
  "Co2 System": "Fixed CO₂ Fire Suppression System",
  "SCBA/EEBD": "Self-Contained Breathing Apparatus / Emergency Escape Breathing Device",
};

const BULAN_OPTIONS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const STATUS_OPTIONS = ["Sudah","Belum","Expired","Perlu Perbaikan","Proses","NIL"];

// ─── Data Seed dari Excel LSA & FFA ──────────────────────────────────────────

const INITIAL_DATA = [
  { id:"LSA-001", kapal:"MBP 121", equipment:"PMK", qty:8, lastDate:"2025-06-12", nextDate:"2026-06-11", bulanExp:"JUN", alertDays:68, status:"Sudah", keterangan:"" },
  { id:"LSA-002", kapal:"MBP 121", equipment:"ILR", qty:2, lastDate:"2025-06-12", nextDate:"2026-06-11", bulanExp:"JUN", alertDays:68, status:"Sudah", keterangan:"" },
  { id:"LSA-003", kapal:"MBP 121", equipment:"EPIRB REG & TEST BASARNAS", qty:1, lastDate:"2025-10-15", nextDate:"2026-10-16", bulanExp:"OCT", alertDays:195, status:"Sudah", keterangan:"" },
  { id:"LSA-004", kapal:"MBP 121", equipment:"SERT HRU LIFERAFT", qty:2, lastDate:"2025-06-12", nextDate:"2026-06-11", bulanExp:null, alertDays:68, status:"Sudah", keterangan:"" },
  { id:"LSA-005", kapal:"MBP 122", equipment:"PMK", qty:15, lastDate:"2025-09-18", nextDate:"2026-09-17", bulanExp:"SEP", alertDays:166, status:"Sudah", keterangan:"" },

];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function genId(items) {
  const nums = items.map((i) => parseInt(i.id.split("-")[1] || 0));
  return `LSA-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
}

function alertLabel(days) {
  if (days === null || days === undefined) return null;
  if (days < 0) return { text: `${Math.abs(days)}h lewat`, cls: "bg-[#fff0f0] text-[#c53030]" };
  if (days <= 30) return { text: `${days}h lagi`, cls: "bg-[#fff7e8] text-[#b26a00]" };
  if (days <= 90) return { text: `${days}h lagi`, cls: "bg-[#fffbeb] text-[#92740a]" };
  return { text: `${days}h lagi`, cls: "bg-[#f0fdf4] text-[#166534]" };
}

function getQtyValue(item) {
  const parsed = Number.parseInt(String(item?.qty ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getMonthIndex(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.getMonth();
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  Sudah:           "bg-[#edf9f1] text-[#166534]",
  Belum:           "bg-[#fff4e5] text-[#b26a00]",
  Expired:         "bg-[#fff0f0] text-[#c53030]",
  "Perlu Perbaikan":"bg-[#faf5ff] text-[#6b21a8]",
  Proses:          "bg-[#eff6ff] text-[#1d4ed8]",
  NIL:             "bg-[#f4f5f7] text-[#55616d]",
};

// Equipment icon map
const EQUIP_ICON = {
  "PMK": Flame,
  "ILR": Shield,
  "EPIRB REG & TEST BASARNAS": Zap,
  "SERT HRU LIFERAFT": Activity,
  "Co2 System": ClipboardCheck,
  "SCBA/EEBD": ShieldOff,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Pill({ label }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[label] || "bg-[#f4f5f7] text-[#55616d]"}`}>
      {label}
    </span>
  );
}

function AlertBadge({ days }) {
  const info = alertLabel(days);
  if (!info) return <span className="text-[11px] text-[#9aa4ae]">-</span>;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${info.cls}`}>
      {info.text}
    </span>
  );
}

function EquipmentWorkbookPanel({ item }) {
  const totalSegments = item.sudahService + item.belumService + item.memasukiService || 1;
  const segments = [
    { key: "memasuki", label: "Memasuki service", value: item.memasukiService, color: "#f59e0b" },
    { key: "belum", label: "Belum service", value: item.belumService, color: "#f97316" },
    { key: "sudah", label: "Sudah service", value: item.sudahService, color: "#4c76c9" },
  ];
  const maxMonthly = Math.max(1, ...item.monthlyCounts);

  let cumulative = 0;
  const donutSegments = segments
    .filter((segment) => segment.value > 0)
    .map((segment) => {
      const dash = (segment.value / totalSegments) * 100;
      const current = cumulative;
      cumulative += dash;
      return { ...segment, dash, offset: 25 - current };
    });

  return (
    <Card className="overflow-hidden border-[#d6a300] bg-[#ffc20f] shadow-[0_14px_28px_rgba(173,114,0,0.18)]">
      <CardContent className="p-2.5">
        <div className="rounded-[16px] border border-[#9d7b00] bg-[#ffbf00]">
          <div className="border-b border-[#9d7b00] px-3 py-1.5 text-center">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#3b2a00]">
              {item.equipment}
            </h3>
          </div>

          <div className="grid gap-2 border-b border-[#9d7b00] p-2 lg:grid-cols-[1.05fr_1.4fr]">
            <div className="space-y-1">
              {[
                { label: "Sudah service", value: item.sudahService },
                { label: "Belum service", value: item.belumService },
                { label: "Memasuki service", value: item.memasukiService },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.7fr_56px] items-center border border-[#9d7b00] bg-[#ffc928] text-[10px] font-semibold uppercase text-[#2e2200]"
                >
                  <span className="border-r border-[#9d7b00] px-2 py-1">{row.label}</span>
                  <span className="px-2 py-1 text-center">{row.value}</span>
                </div>
              ))}

              <div className="border border-[#9d7b00] bg-[#ffc928]">
                <div className="border-b border-[#9d7b00] px-2 py-1 text-center text-[10px] font-bold uppercase text-[#2e2200]">
                  Progress
                </div>
                <div className="grid grid-cols-2 text-[10px] font-semibold uppercase text-[#2e2200]">
                  <div className="border-r border-[#9d7b00] px-2 py-1.5 text-center">
                    Dijadwalkan
                    <div className="mt-1 text-[12px] font-bold">{item.scheduled}</div>
                  </div>
                  <div className="px-2 py-1.5 text-center">
                    Belum jadwal
                    <div className="mt-1 text-[12px] font-bold">{item.unscheduled}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-[160px] flex-col justify-between border border-[#9d7b00] bg-[#ffc928] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6a5200]">
                    Equipment Overview
                  </p>
                  <p className="mt-1 text-[22px] font-bold leading-none text-[#2e2200]">
                    {item.totalUnits}
                  </p>
                  <p className="mt-1 text-[11px] text-[#6a5200]">unit tercatat</p>
                </div>
                <div className="rounded-full border border-[#9d7b00] bg-white/25 px-2.5 py-1 text-[10px] font-bold uppercase text-[#2e2200]">
                  {item.completion}%
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="space-y-2 text-[10px] uppercase text-[#5d4700]">
                  {segments.map((segment) => (
                    <div key={segment.key} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-white/70"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="font-semibold">{segment.label}</span>
                    </div>
                  ))}
                </div>

                <div className="relative flex h-[112px] w-[112px] items-center justify-center">
                  <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
                    <circle cx="21" cy="21" r="15.915" fill="none" stroke="#fff3c1" strokeWidth="5" />
                    {donutSegments.length === 0 ? (
                      <circle cx="21" cy="21" r="15.915" fill="none" stroke="#d1d5db" strokeWidth="5" />
                    ) : (
                      donutSegments.map((segment) => (
                        <circle
                          key={segment.key}
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="none"
                          stroke={segment.color}
                          strokeWidth="5"
                          strokeDasharray={`${segment.dash} ${100 - segment.dash}`}
                          strokeDashoffset={segment.offset}
                        />
                      ))
                    )}
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-[10px] font-semibold uppercase text-[#6a5200]">On time</p>
                    <p className="mt-1 text-[20px] font-bold leading-none text-[#2e2200]">
                      {item.sudahService}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="grid h-[132px] grid-cols-12 items-end gap-2 border border-[#9d7b00] bg-[#ffc928] px-2.5 pb-2 pt-4">
              {item.monthlyCounts.map((count, index) => {
                const height = count > 0 ? Math.max(10, (count / maxMonthly) * 88) : 4;
                return (
                  <div key={`${item.equipment}-${BULAN_OPTIONS[index]}`} className="flex h-full flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-semibold text-[#6a5200]">{count}</span>
                    <div
                      className="w-full rounded-t-[4px] bg-[#4c76c9]"
                      style={{ height: `${height}px` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-1 grid grid-cols-12 gap-2 px-2.5 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5d4700]">
              {BULAN_OPTIONS.map((month) => (
                <span key={`${item.equipment}-${month}-label`}>{month}</span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FormField({ label, req, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7a87]">
        {label} {req && <span className="text-[#c53030]">*</span>}
      </label>
      {children}
      {error && <span className="text-[10px] text-[#c53030]">Wajib diisi</span>}
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  id: "", kapal: "", equipment: "", qty: "", lastDate: "",
  nextDate: "", bulanExp: "", alertDays: "", status: "", keterangan: "",
};

function FormModal({ isOpen, onClose, onSave, initialData, nextId, isEdit }) {
  const [form, setForm] = useState(initialData || { ...EMPTY_FORM, id: nextId });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: false }));
  };

  const inputCls = (k) =>
    `w-full rounded-[10px] border px-3 py-2 text-[13px] text-[#1f2b38] bg-white outline-none transition focus:border-[#1a6b4e] focus:ring-2 focus:ring-[#d1fae5] ${
      errors[k] ? "border-[#c53030]" : "border-[#dde4ea]"
    }`;

  function handleSave() {
    const req = ["kapal", "equipment", "status"];
    const errs = {};
    req.forEach((k) => { if (!String(form[k] || "").trim()) errs[k] = true; });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, id: form.id || nextId });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[640px] overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        {/* Header */}
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
                {isEdit ? `Mengubah record ${form.id}` : "Isi data equipment LSA / FFA untuk armada"}
              </p>
            </div>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-[#6b7a87] hover:bg-[#f4f7f9]">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-2 gap-3 px-6 py-5">
          <FormField label="ID Record" error={errors.id}>
            <input className={`${inputCls("id")} bg-[#f8fafc] text-[#8a95a2]`} value={form.id || nextId} readOnly />
          </FormField>

          <FormField label="Kapal" req error={errors.kapal}>
            <select className={inputCls("kapal")} value={form.kapal} onChange={set("kapal")}>
              <option value="">-- Pilih Kapal --</option>
              {VESSELS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </FormField>

          <div className="col-span-2">
            <FormField label="Jenis Equipment" req error={errors.equipment}>
              <select className={inputCls("equipment")} value={form.equipment} onChange={set("equipment")}>
                <option value="">-- Pilih Equipment --</option>
                {EQUIPMENT_TYPES.map((e) => (
                  <option key={e} value={e}>{e} — {EQUIPMENT_DESCRIPTIONS[e]}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Qty / Jumlah" error={errors.qty}>
            <input className={inputCls("qty")} value={form.qty} onChange={set("qty")} placeholder="Contoh: 8 atau 2 cyl" />
          </FormField>

          <FormField label="Bulan Expired" error={errors.bulanExp}>
            <select className={inputCls("bulanExp")} value={form.bulanExp || ""} onChange={set("bulanExp")}>
              <option value="">-- Pilih Bulan --</option>
              {BULAN_OPTIONS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </FormField>

          <FormField label="Last Inspection Date" error={errors.lastDate}>
            <input type="date" className={inputCls("lastDate")} value={form.lastDate || ""} onChange={set("lastDate")} />
          </FormField>

          <FormField label="Next Inspection Date" error={errors.nextDate}>
            <input type="date" className={inputCls("nextDate")} value={form.nextDate || ""} onChange={set("nextDate")} />
          </FormField>

          <FormField label="Alert Days (hari sisa)" error={errors.alertDays}>
            <input type="number" className={inputCls("alertDays")} value={form.alertDays ?? ""} onChange={set("alertDays")} placeholder="Isi negatif jika sudah lewat" />
          </FormField>

          <FormField label="Status" req error={errors.status}>
            <select className={inputCls("status")} value={form.status} onChange={set("status")}>
              <option value="">-- Pilih Status --</option>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>

          <div className="col-span-2">
            <FormField label="Keterangan" error={errors.keterangan}>
              <textarea rows={3} className={`${inputCls("keterangan")} resize-y`} value={form.keterangan} onChange={set("keterangan")} placeholder="Catatan tambahan, kondisi khusus, dsb." />
            </FormField>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[#edf2f7] bg-[#fafbfd] px-6 py-4">
          <button onClick={onClose} className="rounded-[10px] bg-[#eef2f5] px-4 py-2 text-[12px] font-semibold text-[#5a6672] hover:bg-[#e4ebf0]">Batal</button>
          <button onClick={handleSave} className="rounded-[10px] bg-[#15803d] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#126c33]">
            {isEdit ? "Simpan Perubahan" : "Tambah Data"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ item, onClose }) {
  if (!item) return null;
  const Icon = EQUIP_ICON[item.equipment] || Shield;
  const alert = alertLabel(item.alertDays);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[540px] overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <div className="border-b border-[#edf2f7] bg-gradient-to-r from-[#f0fdf8] to-white px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcfce7] text-[#166534]">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#166534]">{item.id}</p>
                <h3 className="mt-0.5 text-[16px] font-bold text-[#0f2b1f]">{item.equipment}</h3>
              </div>
            </div>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6b7a87]">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <Pill label={item.status} />
            {alert && <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-medium ${alert.cls}`}>{alert.text}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Kapal", value: item.kapal },
              { label: "Qty", value: item.qty || "-" },
              { label: "Bulan Expired", value: item.bulanExp || "-" },
              { label: "Alert Days", value: item.alertDays !== null ? `${item.alertDays} hari` : "-" },
              { label: "Last Inspection", value: fmtDate(item.lastDate) },
              { label: "Next Inspection", value: fmtDate(item.nextDate) },
            ].map((row) => (
              <div key={row.label} className="rounded-[12px] border border-[#edf2f7] bg-[#fafbfd] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b96a1]">{row.label}</p>
                <p className="mt-1 text-[14px] font-medium text-[#1f2b38]">{row.value}</p>
              </div>
            ))}
          </div>

          {EQUIPMENT_DESCRIPTIONS[item.equipment] && (
            <div className="rounded-[12px] border border-[#edf2f7] bg-[#fafbfd] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b96a1]">Deskripsi Equipment</p>
              <p className="mt-1 text-[13px] text-[#4f5b67]">{EQUIPMENT_DESCRIPTIONS[item.equipment]}</p>
            </div>
          )}

          {item.keterangan && (
            <div className="rounded-[12px] border border-[#edf2f7] bg-[#fafbfd] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b96a1]">Keterangan</p>
              <p className="mt-1 text-[13px] text-[#4f5b67]">{item.keterangan}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────

function ConfirmModal({ id, isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="w-full max-w-[360px] rounded-[18px] border border-[#e2e8f0] bg-white p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0]">
          <Trash2 size={20} className="text-[#c53030]" />
        </div>
        <h3 className="mt-4 text-[16px] font-bold text-[#1f2b38]">Hapus Record?</h3>
        <p className="mt-2 text-[12px] text-[#6b7a87]">
          Data <span className="font-semibold text-[#1f2b38]">{id}</span> akan dihapus secara permanen.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={onCancel} className="rounded-[10px] bg-[#eef2f5] px-4 py-2 text-[12px] font-semibold text-[#5a6672]">Batal</button>
          <button onClick={onConfirm} className="rounded-[10px] bg-[#c53030] px-4 py-2 text-[12px] font-semibold text-white">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LsaFfaPage() {
  const [data, setData] = useState(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [equipFilter, setEquipFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [alertFilter, setAlertFilter] = useState("Semua");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = data.length;
    const sudah = data.filter((d) => d.status === "Sudah").length;
    const expired = data.filter((d) => d.alertDays !== null && d.alertDays < 0).length;
    const needAlert = data.filter((d) => d.alertDays !== null && d.alertDays >= 0 && d.alertDays <= 30).length;
    const perluPerbaikan = data.filter((d) => d.status === "Perlu Perbaikan" || d.status === "Belum").length;
    const vessels = new Set(data.map((d) => d.kapal)).size;

    return { total, sudah, expired, needAlert, perluPerbaikan, vessels };
  }, [data]);

  // ── Equipment summary (per type) ──────────────────────────────────────────
  const equipmentWorkbook = useMemo(() => {
    return EQUIPMENT_TYPES.map((equipment) => {
      const items = data.filter((d) => d.equipment === equipment);
      const totalUnits = items.reduce((sum, item) => sum + getQtyValue(item), 0);
      const sudahService = items
        .filter((item) => item.status === "Sudah")
        .reduce((sum, item) => sum + getQtyValue(item), 0);
      const memasukiService = items
        .filter((item) => item.alertDays !== null && item.alertDays >= 0 && item.alertDays <= 90)
        .reduce((sum, item) => sum + getQtyValue(item), 0);
      const overdueUnits = items
        .filter((item) => item.alertDays !== null && item.alertDays < 0)
        .reduce((sum, item) => sum + getQtyValue(item), 0);
      const belumService = Math.max(totalUnits - sudahService, overdueUnits);
      const scheduled = items.filter((item) => item.nextDate).length;
      const unscheduled = Math.max(items.length - scheduled, 0);
      const monthlyCounts = BULAN_OPTIONS.map((_, monthIndex) =>
        items.reduce((sum, item) => {
          const nextMonth = getMonthIndex(item.nextDate);
          if (nextMonth === monthIndex) {
            return sum + getQtyValue(item);
          }
          return sum;
        }, 0)
      );

      return {
        equipment,
        totalUnits,
        sudahService,
        belumService,
        memasukiService,
        scheduled,
        unscheduled,
        monthlyCounts,
        completion: totalUnits > 0 ? Math.round((sudahService / totalUnits) * 100) : 0,
      };
    });
  }, [data]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return data.filter((d) => {
      const kw = search.toLowerCase();
      const matchSearch = !kw || d.kapal.toLowerCase().includes(kw) || d.equipment.toLowerCase().includes(kw) || d.id.toLowerCase().includes(kw);
      const matchEquip = equipFilter === "Semua" || d.equipment === equipFilter;
      const matchStatus = statusFilter === "Semua" || d.status === statusFilter;
      const matchAlert =
        alertFilter === "Semua" ? true
        : alertFilter === "Lewat" ? (d.alertDays !== null && d.alertDays < 0)
        : alertFilter === "≤30 Hari" ? (d.alertDays !== null && d.alertDays >= 0 && d.alertDays <= 30)
        : alertFilter === ">30 Hari" ? (d.alertDays !== null && d.alertDays > 30)
        : true;
      return matchSearch && matchEquip && matchStatus && matchAlert;
    });
  }, [data, search, equipFilter, statusFilter, alertFilter]);

  // ── Alerts list (overdue / soon) ──────────────────────────────────────────
  const alertItems = useMemo(() => {
    return [...data]
      .filter((d) => d.alertDays !== null && d.alertDays <= 30)
      .sort((a, b) => (a.alertDays ?? 0) - (b.alertDays ?? 0))
      .slice(0, 6);
  }, [data]);

  const nextId = useMemo(() => genId(data), [data]);

  function handleSave(item) {
    if (editItem) {
      setData((prev) => prev.map((d) => (d.id === item.id ? item : d)));
    } else {
      setData((prev) => [item, ...prev]);
    }
    setModalOpen(false);
    setEditItem(null);
  }

  function handleDelete() {
    setData((prev) => prev.filter((d) => d.id !== deleteId));
    setDeleteId(null);
  }

  return (
    <div className="space-y-5">
      {/* ── Hero Banner ── */}
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
              Monitor status inspeksi, masa berlaku, dan alert equipment keselamatan jiwa di seluruh armada kapal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#15803d]">
              <Plus size={15} />
              Tambah Data
            </button>
            <button className="inline-flex items-center gap-2 rounded-[10px] border border-white/25 px-4 py-2.5 text-[13px] font-semibold text-white">
              <FileDown size={15} />
              Export
            </button>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="grid border-t border-white/10 bg-white/10 sm:grid-cols-4">
          {[
            { label: "Total Kapal", value: stats.vessels, note: "unit dalam armada" },
            { label: "Total Equipment", value: stats.total, note: "record terdaftar" },
            { label: "Alert ≤ 30 Hari", value: stats.needAlert, note: "segera dijadwalkan" },
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

      {/* ── Stat Cards ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Sudah Inspeksi", value: stats.sudah, note: "Status terverifikasi", icon: BadgeCheck, bg: "bg-[#edf9f1]", color: "text-[#15803d]" },
          { title: "Perlu Perhatian", value: stats.perluPerbaikan, note: "Belum / Perlu Perbaikan", icon: AlertTriangle, bg: "bg-[#fff7e8]", color: "text-[#b26a00]" },
          { title: "Overdue", value: stats.expired, note: "Next date sudah terlewati", icon: ShieldOff, bg: "bg-[#fff0f0]", color: "text-[#c53030]" },
          { title: "Alert ≤ 30 Hari", value: stats.needAlert, note: "Segera jadwalkan inspeksi", icon: ArrowUpRight, bg: "bg-[#eff6ff]", color: "text-[#1d4ed8]" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-[#536070]">{s.title}</p>
                    <p className="mt-2 text-[26px] font-bold leading-none text-[#1f2b38]">{String(s.value).padStart(2, "0")}</p>
                    <p className="mt-2 text-[11px] text-[#7c8793]">{s.note}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg} ${s.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* ── Equipment Summary per Type ── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-[16px] font-semibold text-[#243041]">Section per Equipment</h2>
          <p className="mt-1 text-[12px] text-[#7c8793]">
            Tiap equipment sekarang punya section sendiri dengan komposisi seperti workbook client dan grafik balok bulanan per equipment.
          </p>
        </div>
        <div className="space-y-4">
          {equipmentWorkbook.map((item) => (
            <EquipmentWorkbookPanel key={item.equipment} item={item} />
          ))}
        </div>
      </section>

      {/* ── Main Content: Table + Alert Panel ── */}
      <section className="grid gap-4 xl:grid-cols-[1.75fr_1fr]">
        {/* Table */}
        <Card className="overflow-hidden border-[#edf2f7]">
          <CardContent className="p-0">
            {/* Table header */}
            <div className="border-b border-[#edf2f7] px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#1f2b38]">Register LSA &amp; FFA</h2>
                  <p className="mt-1 text-[12px] text-[#7c8793]">
                    Menampilkan {filtered.length} dari {data.length} record
                  </p>
                </div>
                {/* Search */}
                <div className="relative w-full lg:w-[260px]">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari kapal, equipment, ID…"
                    className="w-full rounded-[10px] border border-[#dde4ea] bg-white py-2 pl-9 pr-3 text-[12px] outline-none focus:border-[#15803d] focus:ring-2 focus:ring-[#d1fae5]"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="mt-3 flex flex-wrap gap-2">
                {/* Equipment filter */}
                <div className="relative">
                  <select
                    value={equipFilter}
                    onChange={(e) => setEquipFilter(e.target.value)}
                    className="appearance-none rounded-full border border-[#dde4ea] bg-white py-1.5 pl-3 pr-7 text-[11px] font-medium text-[#536070] focus:outline-none"
                  >
                    <option>Semua</option>
                    {EQUIPMENT_TYPES.map((e) => <option key={e}>{e}</option>)}
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                </div>

                {/* Status filter */}
                <div className="flex flex-wrap gap-1.5">
                  {["Semua", ...STATUS_OPTIONS].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                        statusFilter === s ? "bg-[#15803d] text-white" : "bg-[#f4f7f9] text-[#6b7a87] hover:bg-[#e8edf2]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Alert filter */}
                <div className="flex flex-wrap gap-1.5">
                  {["Semua", "Lewat", "≤30 Hari", ">30 Hari"].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlertFilter(a)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                        alertFilter === a ? "bg-[#1d4ed8] text-white" : "bg-[#eff6ff] text-[#3b64c8] hover:bg-[#dbeafe]"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>

                {/* Reset */}
                {(search || equipFilter !== "Semua" || statusFilter !== "Semua" || alertFilter !== "Semua") && (
                  <button
                    onClick={() => { setSearch(""); setEquipFilter("Semua"); setStatusFilter("Semua"); setAlertFilter("Semua"); }}
                    className="inline-flex items-center gap-1 rounded-full bg-[#fff0f0] px-3 py-1 text-[11px] font-semibold text-[#c53030]"
                  >
                    <RotateCcw size={11} />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable table */}
            <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="sticky top-0 bg-[#f8fafb] z-10">
                    {["ID", "Kapal", "Equipment", "Qty", "Last Inspeksi", "Next Inspeksi", "Bulan Exp", "Alert", "Status", "Aksi"].map((h) => (
                      <th key={h} className="border-b border-[#edf2f7] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#8b96a1] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-14 text-center text-[13px] text-[#8b96a1]">
                        Tidak ada data yang cocok
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => {
                      const Icon = EQUIP_ICON[item.equipment] || Shield;
                      const isOverdue = item.alertDays !== null && item.alertDays < 0;
                      return (
                        <tr key={item.id} className={`border-b border-[#f0f4f7] transition hover:bg-[#fafcfb] ${isOverdue ? "bg-[#fffafa]" : ""}`}>
                          <td className="px-3 py-3 font-semibold text-[#536070] whitespace-nowrap">{item.id}</td>
                          <td className="px-3 py-3 font-medium text-[#243041] whitespace-nowrap">{item.kapal}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <Icon size={13} className="text-[#15803d] flex-shrink-0" />
                              <span className="text-[#243041]">{item.equipment}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-[#536070]">{item.qty ?? "-"}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-[#8b96a1]">{fmtDate(item.lastDate)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-[#8b96a1]">{fmtDate(item.nextDate)}</td>
                          <td className="px-3 py-3 text-center">
                            {item.bulanExp ? (
                              <span className="rounded-full bg-[#f0fdf8] px-2 py-0.5 text-[10px] font-semibold text-[#15803d]">{item.bulanExp}</span>
                            ) : <span className="text-[#c4cdd6]">-</span>}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap"><AlertBadge days={item.alertDays} /></td>
                          <td className="px-3 py-3 whitespace-nowrap"><Pill label={item.status} /></td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex gap-1">
                              <button onClick={() => setDetailItem(item)} className="inline-flex items-center gap-1 rounded-[7px] bg-[#f4f7f9] px-2 py-1 text-[10px] font-medium text-[#536070] hover:bg-[#e8edf2]">
                                <Eye size={11} /> Detail
                              </button>
                              <button onClick={() => { setEditItem(item); setModalOpen(true); }} className="inline-flex items-center gap-1 rounded-[7px] bg-[#eff6ff] px-2 py-1 text-[10px] font-medium text-[#1d4ed8] hover:bg-[#dbeafe]">
                                <Pencil size={11} /> Edit
                              </button>
                              <button onClick={() => setDeleteId(item.id)} className="inline-flex items-center gap-1 rounded-[7px] bg-[#fff0f0] px-2 py-1 text-[10px] font-medium text-[#c53030] hover:bg-[#fee2e2]">
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

        {/* Right Panel */}
        <div className="flex flex-col gap-4">
          {/* Alert panel */}
          <Card className="border-[#edf2f7]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#1f2b38]">⚠ Alert &amp; Overdue</h2>
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
                    const Icon = EQUIP_ICON[item.equipment] || Shield;
                    const isOverdue = item.alertDays < 0;
                    return (
                      <div key={item.id} className={`flex items-start gap-3 rounded-[12px] border p-3 ${isOverdue ? "border-[#fecaca] bg-[#fffafa]" : "border-[#fde68a] bg-[#fffdf0]"}`}>
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isOverdue ? "bg-[#fee2e2] text-[#c53030]" : "bg-[#fef3c7] text-[#b26a00]"}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-[#1f2b38]">{item.kapal}</p>
                          <p className="mt-0.5 text-[11px] text-[#536070] leading-snug">{item.equipment}</p>
                          <p className="mt-1 text-[10px] text-[#7c8793]">Next: {fmtDate(item.nextDate)}</p>
                        </div>
                        <AlertBadge days={item.alertDays} />
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vessel summary */}
          <Card className="border-[#edf2f7]">
            <CardContent className="p-5">
              <h2 className="text-[15px] font-semibold text-[#1f2b38]">Ringkasan per Kapal</h2>
              <p className="mt-0.5 text-[11px] text-[#7c8793]">Jumlah equipment terdaftar per unit</p>
              <div className="mt-4 space-y-2 overflow-y-auto" style={{ maxHeight: 240 }}>
                {VESSELS.filter((v) => data.some((d) => d.kapal === v)).map((vessel) => {
                  const items = data.filter((d) => d.kapal === vessel);
                  const overdue = items.filter((d) => d.alertDays !== null && d.alertDays < 0).length;
                  return (
                    <div key={vessel} className="flex items-center justify-between rounded-[10px] border border-[#edf2f7] bg-[#fafbfd] px-3 py-2.5">
                      <div>
                        <p className="text-[12px] font-semibold text-[#243041]">{vessel}</p>
                        <p className="text-[10px] text-[#8b96a1]">{items.length} equipment</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {overdue > 0 && (
                          <span className="rounded-full bg-[#fff0f0] px-2 py-0.5 text-[10px] font-semibold text-[#c53030]">
                            {overdue} overdue
                          </span>
                        )}
                        <Filter size={12} className="text-[#c4cdd6]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Modals ── */}
      <FormModal
        key={editItem?.id || "new"}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSave={handleSave}
        initialData={editItem}
        nextId={nextId}
        isEdit={!!editItem}
      />
      <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      <ConfirmModal id={deleteId} isOpen={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
