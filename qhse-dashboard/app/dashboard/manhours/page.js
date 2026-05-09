"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Eye,
  Pencil,
  Plus,
  Ship,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const MONTH_OPTIONS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const AREA_OPTIONS = ["Lower", "Upper", "Shore"];
const SHORE_CATEGORIES = ["MBP BJM", "ISS", "Other"];

const VESSEL_OPTIONS = [
  { name: "PB Borneo 01", type: "PB", standardCrew: 9 },
  { name: "PB Borneo 02", type: "PB", standardCrew: 9 },
  { name: "TUG Maritim 01", type: "TUG", standardCrew: 11 },
  { name: "FOTB Anugerah", type: "FOTB", standardCrew: 4 },
  { name: "SPB Pioneer", type: "SPB", standardCrew: 15 },
];

const FLEET_INITIAL_DATA = [
  {
    id: "MH-2026-001",
    vessel: "PB Borneo 01",
    year: 2026,
    month: "Januari",
    area: "Lower",
    vesselType: "PB",
    standardCrew: 9,
    days: 31,
    manhours: 7031,
    description: "Operasi rutin area lower river.",
  },
  {
    id: "MH-2026-002",
    vessel: "TUG Maritim 01",
    year: 2026,
    month: "Februari",
    area: "Upper",
    vesselType: "TUG",
    standardCrew: 11,
    days: 28,
    manhours: 7762,
    description: "Assist towing selama peak operation.",
  },
  {
    id: "MH-2026-003",
    vessel: "SPB Pioneer",
    year: 2026,
    month: "Maret",
    area: "Shore",
    vesselType: "SPB",
    standardCrew: 15,
    days: 31,
    manhours: 11718,
    description: "Standby dan support fuel distribution.",
  },
];

const SHORE_INITIAL_DATA = [
  {
    id: "MP-2026-001",
    year: 2026,
    month: "Januari",
    category: "MBP BJM",
    peopleCount: 18,
    description: "Personel office dan operational support.",
  },
  {
    id: "MP-2026-002",
    year: 2026,
    month: "Februari",
    category: "ISS",
    peopleCount: 12,
    description: "Petugas outsourcing untuk site support.",
  },
  {
    id: "MP-2026-003",
    year: 2026,
    month: "Maret",
    category: "Other",
    peopleCount: 5,
    description: "Tenaga temporary project support.",
  },
];

const EMPTY_FLEET_FORM = {
  id: "",
  vessel: "",
  year: new Date().getFullYear(),
  month: MONTH_OPTIONS[new Date().getMonth()],
  area: "",
  description: "",
};

const EMPTY_SHORE_FORM = {
  id: "",
  year: new Date().getFullYear(),
  month: MONTH_OPTIONS[new Date().getMonth()],
  category: "",
  peopleCount: "",
  description: "",
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function getDaysInMonth(monthName, year) {
  const monthIndex = MONTH_OPTIONS.indexOf(monthName);
  if (monthIndex < 0 || !year) return 0;
  return new Date(Number(year), monthIndex + 1, 0).getDate();
}

function generateRunningId(items, prefix, year) {
  const yearItems = items.filter((item) => String(item.id).startsWith(`${prefix}-${year}-`));
  const nextNumber = yearItems.length + 1;
  return `${prefix}-${year}-${String(nextNumber).padStart(3, "0")}`;
}

function calculateFleetValues(vesselName, month, year) {
  const vessel = VESSEL_OPTIONS.find((item) => item.name === vesselName);
  const standardCrew = vessel?.standardCrew || 0;
  const vesselType = vessel?.type || "-";
  const days = getDaysInMonth(month, year);
  const manhours = Math.round(standardCrew * 24 * days * 1.05);

  return {
    vesselType,
    standardCrew,
    days,
    manhours,
  };
}

function FormField({ label, req, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7a87]">
        {label} {req && <span className="text-red-600">*</span>}
      </label>
      {children}
      {error ? <span className="text-[10px] text-red-600">Wajib diisi</span> : null}
    </div>
  );
}

function StatCard({ title, value, note, icon: Icon, tone }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium text-[#52606d]">{title}</p>
            <p className="mt-2 text-[26px] font-bold leading-none text-[#173126]">{value}</p>
            <p className="mt-2 text-[12px] text-[#7b8894]">{note}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
            <Icon size={22} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SegmentedButton({ activeTab, onChange }) {
  const tabs = [
    { id: "fleet", label: "Fleet Manhours" },
    { id: "shore", label: "Shore / ISS Manpower" },
  ];

  return (
    <div className="inline-flex rounded-[14px] border border-[#dbe5dd] bg-[#f6faf7] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-[10px] px-4 py-2 text-[13px] font-semibold transition ${
            activeTab === tab.id
              ? "bg-emerald-600 text-white shadow-[0_8px_20px_rgba(16,185,129,0.24)]"
              : "text-[#4e5d69] hover:text-emerald-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function FleetFormModal({ isOpen, onClose, onSave, initialData, nextId, isEdit }) {
  const [form, setForm] = useState(initialData || { ...EMPTY_FLEET_FORM, id: nextId });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const inputClass = (field) =>
    `w-full rounded-[10px] border px-3 py-2.5 text-[13px] text-[#1f2b38] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
      errors[field] ? "border-red-500" : "border-[#dbe3e9]"
    }`;

  const preview = calculateFleetValues(form.vessel, form.month, form.year);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  }

  function handleSave() {
    const requiredFields = ["vessel", "year", "month", "area"];
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!String(form[field] ?? "").trim()) nextErrors[field] = true;
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      ...form,
      id: form.id || nextId,
      year: Number(form.year),
      ...preview,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[720px] overflow-hidden rounded-[22px] border border-[#dfe8e1] bg-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
        <div className="border-b border-[#edf2ef] bg-gradient-to-r from-[#effcf4] via-white to-[#f8fffb] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                <Ship size={13} />
                Fleet Manhours
              </div>
              <h2 className="mt-3 text-[21px] font-bold text-[#153428]">
                {isEdit ? "Edit Fleet Manhours" : "Tambah Fleet Manhours"}
              </h2>
              <p className="mt-1 text-[12px] text-[#6d7b87]">
                Standard crew, days, dan manhours ditampilkan sebagai simulasi auto calculation UI.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6d7b87] shadow-sm hover:bg-[#f4f7f5]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <FormField label="No Manhours">
            <input readOnly value={form.id || nextId} className={`${inputClass("id")} bg-[#f7faf8] text-[#8a97a2]`} />
          </FormField>

          <FormField label="Kapal" req error={errors.vessel}>
            <select
              className={inputClass("vessel")}
              value={form.vessel}
              onChange={(event) => updateField("vessel", event.target.value)}
            >
              <option value="">-- Pilih Kapal --</option>
              {VESSEL_OPTIONS.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} ({item.type})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tahun" req error={errors.year}>
            <input
              type="number"
              min="2020"
              className={inputClass("year")}
              value={form.year}
              onChange={(event) => updateField("year", event.target.value)}
            />
          </FormField>

          <FormField label="Bulan" req error={errors.month}>
            <select
              className={inputClass("month")}
              value={form.month}
              onChange={(event) => updateField("month", event.target.value)}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Area Operasi" req error={errors.area}>
            <select
              className={inputClass("area")}
              value={form.area}
              onChange={(event) => updateField("area", event.target.value)}
            >
              <option value="">-- Pilih Area --</option>
              {AREA_OPTIONS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </FormField>

          <div className="rounded-[16px] border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Auto Calculation Preview
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-[#385347]">
              <div>
                <p className="text-[#6a7b72]">Tipe Kapal</p>
                <p className="mt-1 font-semibold text-[#153428]">{preview.vesselType}</p>
              </div>
              <div>
                <p className="text-[#6a7b72]">Standard Crew</p>
                <p className="mt-1 font-semibold text-[#153428]">{preview.standardCrew || 0}</p>
              </div>
              <div>
                <p className="text-[#6a7b72]">Days</p>
                <p className="mt-1 font-semibold text-[#153428]">{preview.days || 0}</p>
              </div>
              <div>
                <p className="text-[#6a7b72]">Manhours</p>
                <p className="mt-1 font-semibold text-[#153428]">{formatNumber(preview.manhours)}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <FormField label="Keterangan">
              <textarea
                rows={4}
                className={`${inputClass("description")} resize-y`}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Tambahkan catatan operasional atau kondisi khusus."
              />
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#edf2ef] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-[10px] border border-[#d9e2e7] px-4 py-2.5 text-[13px] font-semibold text-[#566472] hover:bg-[#f8fafb]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="rounded-[10px] bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function ShoreFormModal({ isOpen, onClose, onSave, initialData, nextId, isEdit }) {
  const [form, setForm] = useState(initialData || { ...EMPTY_SHORE_FORM, id: nextId });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const inputClass = (field) =>
    `w-full rounded-[10px] border px-3 py-2.5 text-[13px] text-[#1f2b38] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
      errors[field] ? "border-red-500" : "border-[#dbe3e9]"
    }`;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  }

  function handleSave() {
    const requiredFields = ["year", "month", "category", "peopleCount"];
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!String(form[field] ?? "").trim()) nextErrors[field] = true;
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      ...form,
      id: form.id || nextId,
      year: Number(form.year),
      peopleCount: Number(form.peopleCount),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[680px] overflow-hidden rounded-[22px] border border-[#dfe8e1] bg-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
        <div className="border-b border-[#edf2ef] bg-gradient-to-r from-[#effcf4] via-white to-[#f8fffb] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                <Users size={13} />
                Shore / ISS Manpower
              </div>
              <h2 className="mt-3 text-[21px] font-bold text-[#153428]">
                {isEdit ? "Edit Shore / ISS Manpower" : "Tambah Shore / ISS Manpower"}
              </h2>
              <p className="mt-1 text-[12px] text-[#6d7b87]">
                Input manpower shore dan outsourcing per periode.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6d7b87] shadow-sm hover:bg-[#f4f7f5]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <FormField label="No Record">
            <input readOnly value={form.id || nextId} className={`${inputClass("id")} bg-[#f7faf8] text-[#8a97a2]`} />
          </FormField>

          <FormField label="Tahun" req error={errors.year}>
            <input
              type="number"
              min="2020"
              className={inputClass("year")}
              value={form.year}
              onChange={(event) => updateField("year", event.target.value)}
            />
          </FormField>

          <FormField label="Bulan" req error={errors.month}>
            <select
              className={inputClass("month")}
              value={form.month}
              onChange={(event) => updateField("month", event.target.value)}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Kategori" req error={errors.category}>
            <select
              className={inputClass("category")}
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            >
              <option value="">-- Pilih Kategori --</option>
              {SHORE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Jumlah Orang" req error={errors.peopleCount}>
            <input
              type="number"
              min="0"
              className={inputClass("peopleCount")}
              value={form.peopleCount}
              onChange={(event) => updateField("peopleCount", event.target.value)}
            />
          </FormField>

          <div className="rounded-[16px] border border-[#e7eef1] bg-[#f8fbfc] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7a87]">
              Summary
            </p>
            <p className="mt-2 text-[22px] font-bold leading-none text-[#153428]">
              {formatNumber(form.peopleCount || 0)}
            </p>
            <p className="mt-2 text-[12px] text-[#72808c]">Jumlah manpower untuk record periode ini.</p>
          </div>

          <div className="md:col-span-2">
            <FormField label="Keterangan">
              <textarea
                rows={4}
                className={`${inputClass("description")} resize-y`}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Tambahkan catatan kebutuhan manpower."
              />
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#edf2ef] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-[10px] border border-[#d9e2e7] px-4 py-2.5 text-[13px] font-semibold text-[#566472] hover:bg-[#f8fafb]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="rounded-[10px] bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, type, onClose }) {
  if (!item) return null;

  const rows =
    type === "fleet"
      ? [
          ["No Manhours", item.id],
          ["Kapal", item.vessel],
          ["Tahun", item.year],
          ["Bulan", item.month],
          ["Area", item.area],
          ["Tipe Kapal", item.vesselType],
          ["Standard Crew", item.standardCrew],
          ["Days", item.days],
          ["Manhours", formatNumber(item.manhours)],
          ["Keterangan", item.description || "-"],
        ]
      : [
          ["No Record", item.id],
          ["Tahun", item.year],
          ["Bulan", item.month],
          ["Kategori", item.category],
          ["Jumlah Orang", formatNumber(item.peopleCount)],
          ["Keterangan", item.description || "-"],
        ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[560px] overflow-hidden rounded-[22px] border border-[#dfe8e1] bg-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
        <div className="border-b border-[#edf2ef] bg-gradient-to-r from-[#effcf4] to-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Detail Record
              </p>
              <h2 className="mt-2 text-[21px] font-bold text-[#153428]">
                {type === "fleet" ? "Fleet Manhours" : "Shore / ISS Manpower"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6d7b87] shadow-sm hover:bg-[#f4f7f5]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3 px-6 py-5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-5 border-b border-[#f0f3f5] pb-3">
              <p className="text-[12px] font-medium text-[#6b7a87]">{label}</p>
              <p className="max-w-[58%] text-right text-[13px] font-semibold text-[#243041]">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-[#edf2ef] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-[10px] bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ open, title, targetId, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-[420px] rounded-[22px] border border-[#dfe8e1] bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
        <h3 className="text-[20px] font-bold text-[#153428]">Hapus Data</h3>
        <p className="mt-2 text-[13px] leading-6 text-[#667581]">
          {title} dengan ID <span className="font-semibold text-[#243041]">{targetId}</span> akan dihapus dari local state.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-[10px] border border-[#d9e2e7] px-4 py-2.5 text-[13px] font-semibold text-[#566472] hover:bg-[#f8fafb]"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="rounded-[10px] bg-red-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManhoursPage() {
  const [activeTab, setActiveTab] = useState("fleet");
  const [fleetData, setFleetData] = useState(FLEET_INITIAL_DATA);
  const [shoreData, setShoreData] = useState(SHORE_INITIAL_DATA);
  const [fleetModalOpen, setFleetModalOpen] = useState(false);
  const [shoreModalOpen, setShoreModalOpen] = useState(false);
  const [editingFleet, setEditingFleet] = useState(null);
  const [editingShore, setEditingShore] = useState(null);
  const [detailState, setDetailState] = useState(null);
  const [deleteState, setDeleteState] = useState(null);

  const totalManhours = useMemo(
    () => fleetData.reduce((sum, item) => sum + Number(item.manhours || 0), 0),
    [fleetData]
  );
  const totalFleetManpower = useMemo(
    () => fleetData.reduce((sum, item) => sum + Number(item.standardCrew || 0), 0),
    [fleetData]
  );
  const totalShoreManpower = useMemo(
    () => shoreData.reduce((sum, item) => sum + Number(item.peopleCount || 0), 0),
    [shoreData]
  );
  const totalAllManpower = totalFleetManpower + totalShoreManpower;

  const nextFleetId = useMemo(
    () => generateRunningId(fleetData, "MH", new Date().getFullYear()),
    [fleetData]
  );
  const nextShoreId = useMemo(
    () => generateRunningId(shoreData, "MP", new Date().getFullYear()),
    [shoreData]
  );

  function openCreateFleet() {
    setEditingFleet(null);
    setFleetModalOpen(true);
  }

  function openCreateShore() {
    setEditingShore(null);
    setShoreModalOpen(true);
  }

  function handleSaveFleet(data) {
    if (editingFleet) {
      setFleetData((prev) => prev.map((item) => (item.id === data.id ? data : item)));
    } else {
      setFleetData((prev) => [data, ...prev]);
    }

    setFleetModalOpen(false);
    setEditingFleet(null);
  }

  function handleSaveShore(data) {
    if (editingShore) {
      setShoreData((prev) => prev.map((item) => (item.id === data.id ? data : item)));
    } else {
      setShoreData((prev) => [data, ...prev]);
    }

    setShoreModalOpen(false);
    setEditingShore(null);
  }

  function handleDelete() {
    if (!deleteState) return;

    if (deleteState.type === "fleet") {
      setFleetData((prev) => prev.filter((item) => item.id !== deleteState.item.id));
    } else {
      setShoreData((prev) => prev.filter((item) => item.id !== deleteState.item.id));
    }

    setDeleteState(null);
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[24px] bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 text-white shadow-[0_18px_38px_rgba(16,185,129,0.22)]">
        <div className="flex flex-col gap-5 px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
              <BarChart3 size={14} />
              Manhours Management
            </div>
            <h1 className="mt-3 text-[24px] font-bold leading-tight">
              Fleet Manhours & Shore / ISS Manpower
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] text-white/85">
              Monitoring data manhours armada dan manpower shore dalam satu halaman dengan ringkasan operasional QHSE.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={openCreateFleet}
              className="inline-flex items-center gap-2 rounded-[12px] bg-white px-4 py-2.5 text-[13px] font-semibold text-emerald-700"
            >
              <Plus size={16} />
              Tambah Fleet Manhours
            </button>
            <button
              onClick={openCreateShore}
              className="inline-flex items-center gap-2 rounded-[12px] border border-white/20 px-4 py-2.5 text-[13px] font-semibold text-white"
            >
              <Plus size={16} />
              Tambah Shore Manpower
            </button>
          </div>
        </div>

        <div className="grid gap-px border-t border-white/10 bg-white/10 md:grid-cols-4">
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/72">Periode Dashboard</p>
            <div className="mt-2 flex items-center gap-2">
              <CalendarDays size={18} />
              <span className="text-[20px] font-bold">{new Date().getFullYear()}</span>
            </div>
          </div>
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/72">Fleet Record</p>
            <p className="mt-2 text-[22px] font-bold">{fleetData.length}</p>
          </div>
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/72">Shore Record</p>
            <p className="mt-2 text-[22px] font-bold">{shoreData.length}</p>
          </div>
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/72">Total Manhours</p>
            <p className="mt-2 text-[22px] font-bold">{formatNumber(totalManhours)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Manhours"
          value={formatNumber(totalManhours)}
          note="Akumulasi manhours dari seluruh fleet."
          icon={BarChart3}
          tone="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          title="Total Manpower Fleet"
          value={formatNumber(totalFleetManpower)}
          note="Akumulasi standard crew dari fleet."
          icon={Ship}
          tone="bg-[#ecfdf5] text-emerald-700"
        />
        <StatCard
          title="Total Manpower Shore"
          value={formatNumber(totalShoreManpower)}
          note="Akumulasi manpower shore / ISS."
          icon={Users}
          tone="bg-[#f0fdf4] text-emerald-700"
        />
        <StatCard
          title="Total Manpower All"
          value={formatNumber(totalAllManpower)}
          note="Kombinasi manpower fleet dan shore."
          icon={Users}
          tone="bg-[#e8fff2] text-emerald-700"
        />
      </section>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-[#edf2ef] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-[#243041]">Manhours Register</h2>
              <p className="mt-1 text-[12px] text-[#7a8692]">
                Kelola data fleet manhours dan shore manpower dalam local state.
              </p>
            </div>
            <SegmentedButton activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {activeTab === "fleet" ? (
            <div>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#243041]">Fleet Manhours</h3>
                  <p className="mt-1 text-[12px] text-[#7a8692]">
                    Manhours dihitung otomatis berdasarkan tipe kapal dan jumlah hari dalam bulan.
                  </p>
                </div>
                <button
                  onClick={openCreateFleet}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-emerald-600 px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus size={15} />
                  Tambah Fleet Manhours
                </button>
              </div>

              <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 520 }}>
                {fleetData.length === 0 ? (
                  <div className="px-5 py-12 text-center text-[13px] text-[#98a4ae]">
                    Belum ada data fleet manhours.
                  </div>
                ) : (
                  <table className="min-w-[1180px] w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="sticky top-0 z-10 bg-[#f8fbf9]">
                        {[
                          "No",
                          "Kapal",
                          "Tahun",
                          "Bulan",
                          "Area",
                          "Tipe Kapal",
                          "Standard Crew",
                          "Days",
                          "Manhours",
                          "Keterangan",
                          "Aksi",
                        ].map((head) => (
                          <th
                            key={head}
                            className="whitespace-nowrap border-b border-[#edf2ef] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#82909c]"
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fleetData.map((item) => (
                        <tr key={item.id} className="border-b border-[#f0f3f5] hover:bg-[#fbfdfc]">
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4c5b67]">{item.id}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#243041]">{item.vessel}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.year}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.month}</td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              {item.area}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.vesselType}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.standardCrew}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.days}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-emerald-700">
                            {formatNumber(item.manhours)}
                          </td>
                          <td className="max-w-[260px] px-3 py-3 text-[#667581]">
                            <p className="line-clamp-2">{item.description || "-"}</p>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => setDetailState({ type: "fleet", item })}
                                className="inline-flex items-center gap-1 rounded-[8px] bg-[#f3f4f6] px-2.5 py-1.5 text-[10px] font-semibold text-[#374151] hover:bg-[#e5e7eb]"
                              >
                                <Eye size={12} />
                                Detail
                              </button>
                              <button
                                onClick={() => {
                                  setEditingFleet(item);
                                  setFleetModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 rounded-[8px] bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                <Pencil size={12} />
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteState({ type: "fleet", item })}
                                className="inline-flex items-center gap-1 rounded-[8px] bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-100"
                              >
                                <Trash2 size={12} />
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
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#243041]">Shore / ISS Manpower</h3>
                  <p className="mt-1 text-[12px] text-[#7a8692]">
                    Monitoring manpower shore, ISS, dan kategori lainnya per bulan.
                  </p>
                </div>
                <button
                  onClick={openCreateShore}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-emerald-600 px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus size={15} />
                  Tambah Shore Manpower
                </button>
              </div>

              <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 520 }}>
                {shoreData.length === 0 ? (
                  <div className="px-5 py-12 text-center text-[13px] text-[#98a4ae]">
                    Belum ada data shore manpower.
                  </div>
                ) : (
                  <table className="min-w-[920px] w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="sticky top-0 z-10 bg-[#f8fbf9]">
                        {["No", "Tahun", "Bulan", "Kategori", "Jumlah Orang", "Keterangan", "Aksi"].map((head) => (
                          <th
                            key={head}
                            className="whitespace-nowrap border-b border-[#edf2ef] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#82909c]"
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shoreData.map((item) => (
                        <tr key={item.id} className="border-b border-[#f0f3f5] hover:bg-[#fbfdfc]">
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#4c5b67]">{item.id}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.year}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.month}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#243041]">{item.category}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-emerald-700">
                            {formatNumber(item.peopleCount)}
                          </td>
                          <td className="max-w-[280px] px-3 py-3 text-[#667581]">
                            <p className="line-clamp-2">{item.description || "-"}</p>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => setDetailState({ type: "shore", item })}
                                className="inline-flex items-center gap-1 rounded-[8px] bg-[#f3f4f6] px-2.5 py-1.5 text-[10px] font-semibold text-[#374151] hover:bg-[#e5e7eb]"
                              >
                                <Eye size={12} />
                                Detail
                              </button>
                              <button
                                onClick={() => {
                                  setEditingShore(item);
                                  setShoreModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 rounded-[8px] bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                <Pencil size={12} />
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteState({ type: "shore", item })}
                                className="inline-flex items-center gap-1 rounded-[8px] bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-100"
                              >
                                <Trash2 size={12} />
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
            </div>
          )}
        </CardContent>
      </Card>

      {fleetModalOpen ? (
        <FleetFormModal
          key={editingFleet?.id || nextFleetId}
          isOpen={fleetModalOpen}
          onClose={() => {
            setFleetModalOpen(false);
            setEditingFleet(null);
          }}
          onSave={handleSaveFleet}
          initialData={editingFleet}
          nextId={nextFleetId}
          isEdit={!!editingFleet}
        />
      ) : null}

      {shoreModalOpen ? (
        <ShoreFormModal
          key={editingShore?.id || nextShoreId}
          isOpen={shoreModalOpen}
          onClose={() => {
            setShoreModalOpen(false);
            setEditingShore(null);
          }}
          onSave={handleSaveShore}
          initialData={editingShore}
          nextId={nextShoreId}
          isEdit={!!editingShore}
        />
      ) : null}

      <DetailModal
        item={detailState?.item || null}
        type={detailState?.type}
        onClose={() => setDetailState(null)}
      />

      <DeleteModal
        open={!!deleteState}
        title={deleteState?.type === "fleet" ? "Fleet manhours" : "Shore manpower"}
        targetId={deleteState?.item?.id}
        onCancel={() => setDeleteState(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
