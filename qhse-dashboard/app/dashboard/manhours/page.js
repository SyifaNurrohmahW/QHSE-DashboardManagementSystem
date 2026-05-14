"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  MANHOURS_AREA_OPTIONS,
  MANHOURS_MONTH_OPTIONS,
  MANHOURS_TIPE_KAPAL_OPTIONS,
  createManhours,
  deleteManhours,
  getManhoursList,
  updateManhours,
} from "@/lib/services/manhoursService";
import {
  MANPOWER_CATEGORY_OPTIONS,
  MANPOWER_MONTH_OPTIONS,
  createManpower,
  deleteManpower,
  getManpowerList,
  updateManpower,
} from "@/lib/services/manpowerService";
import { getKapalOptions } from "@/lib/services/kapalService";

const MONTH_OPTIONS = MANHOURS_MONTH_OPTIONS.map((item) => item.label);
const AREA_OPTIONS = MANHOURS_AREA_OPTIONS;
const SHORE_CATEGORIES = MANPOWER_CATEGORY_OPTIONS.map((item) => item.label);

const EMPTY_FLEET_FORM = {
  id: null,
  kapal_id: "",
  tahun: new Date().getFullYear(),
  bulan: MONTH_OPTIONS[new Date().getMonth()],
  area: "",
  tipeKapal: "",
  avgNoOfCrews: "",
  standardCrew: "",
  allowancePercent: 5,
  manhours: "",
  keterangan: "",
};

const EMPTY_SHORE_FORM = {
  id: null,
  tahun: new Date().getFullYear(),
  bulan: MONTH_OPTIONS[new Date().getMonth()],
  kategori: "",
  jumlahOrang: "",
  keterangan: "",
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function getDaysInMonth(monthName, year) {
  const monthIndex = MONTH_OPTIONS.indexOf(monthName);
  if (monthIndex < 0 || !year) return 0;
  return new Date(Number(year), monthIndex + 1, 0).getDate();
}

function calculateFleetValues(form) {
  const crew = Number(form.avgNoOfCrews || form.standardCrew || 0);
  const allowance = Number(form.allowancePercent || 0);
  const days = getDaysInMonth(form.bulan, form.tahun);
  const manhours = Math.round(crew * 24 * days * (1 + allowance / 100));

  return {
    days,
    manhours,
  };
}

function matchOptionValue(options, value) {
  const option = options.find(
    (item) =>
      item.value === value ||
      item.label === value ||
      String(item.value).toLowerCase() === String(value || "").toLowerCase()
  );

  return option?.value || value || "";
}

function toFleetForm(item) {
  if (!item) return EMPTY_FLEET_FORM;

  return {
    id: item.id,
    kapal_id: item.kapal_id || "",
    tahun: item.tahun || new Date().getFullYear(),
    bulan: item.bulan || MONTH_OPTIONS[new Date().getMonth()],
    area: matchOptionValue(AREA_OPTIONS, item.areaValue || item.area || ""),
    tipeKapal: item.tipeKapalValue || item.tipeKapal || "",
    avgNoOfCrews: item.avgNoOfCrews ?? "",
    standardCrew: item.standardCrew ?? "",
    allowancePercent: item.allowancePercent ?? 5,
    manhours: item.manhours ?? "",
    keterangan: item.keterangan || "",
  };
}

function toShoreForm(item) {
  if (!item) return EMPTY_SHORE_FORM;

  return {
    id: item.id,
    tahun: item.tahun || new Date().getFullYear(),
    bulan: item.bulan || MONTH_OPTIONS[new Date().getMonth()],
    kategori: item.kategori || "",
    jumlahOrang: item.jumlahOrang ?? "",
    keterangan: item.keterangan || "",
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

function FleetFormModal({ isOpen, onClose, onSave, initialData, isEdit, kapalOptions, isSaving }) {
  const [form, setForm] = useState(toFleetForm(initialData));
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const inputClass = (field) =>
    `w-full rounded-[10px] border px-3 py-2.5 text-[13px] text-[#1f2b38] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
      errors[field] ? "border-red-500" : "border-[#dbe3e9]"
    }`;

  const selectedKapal = kapalOptions.find((item) => item.value === form.kapal_id);
  const preview = calculateFleetValues(form);

  function updateField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "kapal_id") {
        const kapal = kapalOptions.find((item) => item.value === value);
        next.tipeKapal = kapal?.tipe_kapal || next.tipeKapal;
        next.area = matchOptionValue(AREA_OPTIONS, kapal?.area || next.area);
      }

      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: false }));
  }

  function handleSave() {
    const requiredFields = ["kapal_id", "tahun", "bulan", "area", "tipeKapal", "avgNoOfCrews"];
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
      tahun: Number(form.tahun),
      avgNoOfCrews: Number(form.avgNoOfCrews),
      standardCrew: form.standardCrew === "" ? null : Number(form.standardCrew),
      allowancePercent: form.allowancePercent === "" ? null : Number(form.allowancePercent),
      daysInMonth: Number(preview.days),
      manhours: Number(form.manhours || preview.manhours),
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
                Data akan disimpan langsung ke Supabase.
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
         
          <FormField label="Kapal" req error={errors.kapal_id}>
            <select
              className={inputClass("kapal_id")}
              value={form.kapal_id}
              onChange={(event) => updateField("kapal_id", event.target.value)}
            >
              <option value="">-- Pilih Kapal --</option>
              {kapalOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tahun" req error={errors.tahun}>
            <input
              type="number"
              min="2020"
              className={inputClass("tahun")}
              value={form.tahun}
              onChange={(event) => updateField("tahun", event.target.value)}
            />
          </FormField>

          <FormField label="Bulan" req error={errors.bulan}>
            <select
              className={inputClass("bulan")}
              value={form.bulan}
              onChange={(event) => updateField("bulan", event.target.value)}
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
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tipe Kapal" req error={errors.tipeKapal}>
            <select
              className={inputClass("tipeKapal")}
              value={form.tipeKapal}
              onChange={(event) => updateField("tipeKapal", event.target.value)}
            >
              <option value="">-- Pilih Tipe --</option>
              {MANHOURS_TIPE_KAPAL_OPTIONS.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Avg No of Crews" req error={errors.avgNoOfCrews}>
            <input
              type="number"
              min="0"
              className={inputClass("avgNoOfCrews")}
              value={form.avgNoOfCrews}
              onChange={(event) => updateField("avgNoOfCrews", event.target.value)}
            />
          </FormField>

          <FormField label="Standard Crew">
            <input
              type="number"
              min="0"
              className={inputClass("standardCrew")}
              value={form.standardCrew}
              onChange={(event) => updateField("standardCrew", event.target.value)}
            />
          </FormField>

          <FormField label="Allowance %">
            <input
              type="number"
              min="0"
              className={inputClass("allowancePercent")}
              value={form.allowancePercent}
              onChange={(event) => updateField("allowancePercent", event.target.value)}
            />
          </FormField>

          <div className="rounded-[16px] border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Auto Calculation Preview
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-[#385347]">
              <div>
                <p className="text-[#6a7b72]">Tipe Kapal</p>
                <p className="mt-1 font-semibold text-[#153428]">{form.tipeKapal || selectedKapal?.tipe_kapal || "-"}</p>
              </div>
              <div>
                <p className="text-[#6a7b72]">Avg Crew</p>
                <p className="mt-1 font-semibold text-[#153428]">{form.avgNoOfCrews || 0}</p>
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
                className={`${inputClass("keterangan")} resize-y`}
                value={form.keterangan}
                onChange={(event) => updateField("keterangan", event.target.value)}
                placeholder="Tambahkan catatan operasional atau kondisi khusus."
              />
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#edf2ef] px-6 py-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-[10px] border border-[#d9e2e7] px-4 py-2.5 text-[13px] font-semibold text-[#566472] hover:bg-[#f8fafb]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-[10px] bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShoreFormModal({ isOpen, onClose, onSave, initialData, isEdit, isSaving }) {
  const [form, setForm] = useState(toShoreForm(initialData));
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
    const requiredFields = ["tahun", "bulan", "kategori", "jumlahOrang"];
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
      tahun: Number(form.tahun),
      jumlahOrang: Number(form.jumlahOrang),
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
        

          <FormField label="Tahun" req error={errors.tahun}>
            <input
              type="number"
              min="2020"
              className={inputClass("tahun")}
              value={form.tahun}
              onChange={(event) => updateField("tahun", event.target.value)}
            />
          </FormField>

          <FormField label="Bulan" req error={errors.bulan}>
            <select
              className={inputClass("bulan")}
              value={form.bulan}
              onChange={(event) => updateField("bulan", event.target.value)}
            >
              {MANPOWER_MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.label}>
                  {month.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Kategori" req error={errors.kategori}>
            <select
              className={inputClass("kategori")}
              value={form.kategori}
              onChange={(event) => updateField("kategori", event.target.value)}
            >
              <option value="">-- Pilih Kategori --</option>
              {MANPOWER_CATEGORY_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
              </option>
              ))}
            </select>
          </FormField>

          <FormField label="Jumlah Orang" req error={errors.jumlahOrang}>
            <input
              type="number"
              min="0"
              className={inputClass("jumlahOrang")}
              value={form.jumlahOrang}
              onChange={(event) => updateField("jumlahOrang", event.target.value)}
            />
          </FormField>

          <div className="rounded-[16px] border border-[#e7eef1] bg-[#f8fbfc] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7a87]">
              Summary
            </p>
            <p className="mt-2 text-[22px] font-bold leading-none text-[#153428]">
              {formatNumber(form.jumlahOrang || 0)}
            </p>
            <p className="mt-2 text-[12px] text-[#72808c]">Jumlah manpower untuk record periode ini.</p>
          </div>

          <div className="md:col-span-2">
            <FormField label="Keterangan">
              <textarea
                rows={4}
                className={`${inputClass("keterangan")} resize-y`}
                value={form.keterangan}
                onChange={(event) => updateField("keterangan", event.target.value)}
                placeholder="Tambahkan catatan kebutuhan manpower."
              />
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#edf2ef] px-6 py-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-[10px] border border-[#d9e2e7] px-4 py-2.5 text-[13px] font-semibold text-[#566472] hover:bg-[#f8fafb]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-[10px] bg-emerald-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
          >
            {isSaving ? "Menyimpan..." : "Simpan"}
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
          ["Kapal", item.kapal],
          ["Tahun", item.tahun],
          ["Bulan", item.bulan],
          ["Area", item.area],
          ["Tipe Kapal", item.tipeKapal],
          ["Avg No of Crews", item.avgNoOfCrews],
          ["Standard Crew", item.standardCrew],
          ["Allowance %", item.allowancePercent],
          ["Days", item.daysInMonth],
          ["Manhours", formatNumber(item.manhours)],
          ["Keterangan", item.keterangan || "-"],
        ]
      : [
          ["No Record", item.id],
          ["Tahun", item.tahun],
          ["Bulan", item.bulan],
          ["Kategori", item.kategori],
          ["Jumlah Orang", formatNumber(item.jumlahOrang)],
          ["Keterangan", item.keterangan || "-"],
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

function DeleteModal({ open, title, targetId, onCancel, onConfirm, isDeleting }) {
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
          {title} dengan ID <span className="font-semibold text-[#243041]">{targetId}</span> akan dihapus dari Supabase.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-[10px] border border-[#d9e2e7] px-4 py-2.5 text-[13px] font-semibold text-[#566472] hover:bg-[#f8fafb]"
          >
            Batal
          </button>
          <button
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

export default function ManhoursPage() {
  const [activeTab, setActiveTab] = useState("fleet");
  const [fleetData, setFleetData] = useState([]);
  const [shoreData, setShoreData] = useState([]);
  const [kapalOptions, setKapalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fleetModalOpen, setFleetModalOpen] = useState(false);
  const [shoreModalOpen, setShoreModalOpen] = useState(false);
  const [editingFleet, setEditingFleet] = useState(null);
  const [editingShore, setEditingShore] = useState(null);
  const [detailState, setDetailState] = useState(null);
  const [deleteState, setDeleteState] = useState(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getManhoursList(), getManpowerList(), getKapalOptions()])
      .then(([manhours, manpower, kapal]) => {
        if (!isMounted) return;
        setFleetData(manhours);
        setShoreData(manpower);
        setKapalOptions(kapal);
        setErrorMessage("");
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal mengambil data manhours dan manpower.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalManhours = useMemo(
    () => fleetData.reduce((sum, item) => sum + Number(item.manhours || 0), 0),
    [fleetData]
  );
  const totalFleetManpower = useMemo(
    () => fleetData.reduce((sum, item) => sum + Number(item.avgNoOfCrews || item.standardCrew || 0), 0),
    [fleetData]
  );
  const totalShoreManpower = useMemo(
    () => shoreData.reduce((sum, item) => sum + Number(item.jumlahOrang || 0), 0),
    [shoreData]
  );
  const totalAllManpower = totalFleetManpower + totalShoreManpower;

  function openCreateFleet() {
    setEditingFleet(null);
    setFleetModalOpen(true);
  }

  function openCreateShore() {
    setEditingShore(null);
    setShoreModalOpen(true);
  }

  async function handleSaveFleet(data) {
    try {
      setIsSaving(true);
      setErrorMessage("");

      if (editingFleet) {
        const updated = await updateManhours(editingFleet.id, data);
        setFleetData((prev) => prev.map((item) => (item.id === editingFleet.id ? updated : item)));
      } else {
        const created = await createManhours(data);
        setFleetData((prev) => [created, ...prev]);
      }

      setFleetModalOpen(false);
      setEditingFleet(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyimpan data manhours.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveShore(data) {
    try {
      setIsSaving(true);
      setErrorMessage("");

      if (editingShore) {
        const updated = await updateManpower(editingShore.id, data);
        setShoreData((prev) => prev.map((item) => (item.id === editingShore.id ? updated : item)));
      } else {
        const created = await createManpower(data);
        setShoreData((prev) => [created, ...prev]);
      }

      setShoreModalOpen(false);
      setEditingShore(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyimpan data manpower.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteState) return;

    try {
      setIsDeleting(true);
      setErrorMessage("");

      if (deleteState.type === "fleet") {
        await deleteManhours(deleteState.item.id);
        setFleetData((prev) => prev.filter((item) => item.id !== deleteState.item.id));
      } else {
        await deleteManpower(deleteState.item.id);
        setShoreData((prev) => prev.filter((item) => item.id !== deleteState.item.id));
      }

      setDeleteState(null);
    } catch (error) {
      setErrorMessage(error.message || "Gagal menghapus data.");
    } finally {
      setIsDeleting(false);
    }
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
                Kelola data fleet manhours dan shore manpower dari Supabase.
              </p>
            </div>
            <SegmentedButton activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {errorMessage ? (
            <div className="mx-5 mt-4 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {errorMessage}
            </div>
          ) : null}

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
                {loading ? (
                  <div className="px-5 py-12 text-center text-[13px] text-[#98a4ae]">
                    Mengambil data fleet manhours...
                  </div>
                ) : fleetData.length === 0 ? (
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
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#243041]">{item.kapal}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.tahun}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.bulan}</td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              {item.area}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.tipeKapal}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.standardCrew || item.avgNoOfCrews}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.daysInMonth}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-emerald-700">
                            {formatNumber(item.manhours)}
                          </td>
                          <td className="max-w-[260px] px-3 py-3 text-[#667581]">
                            <p className="line-clamp-2">{item.keterangan || "-"}</p>
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
                {loading ? (
                  <div className="px-5 py-12 text-center text-[13px] text-[#98a4ae]">
                    Mengambil data shore manpower...
                  </div>
                ) : shoreData.length === 0 ? (
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
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.tahun}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4c5b67]">{item.bulan}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#243041]">{item.kategori}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-semibold text-emerald-700">
                            {formatNumber(item.jumlahOrang)}
                          </td>
                          <td className="max-w-[280px] px-3 py-3 text-[#667581]">
                            <p className="line-clamp-2">{item.keterangan || "-"}</p>
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
          key={editingFleet?.id || "create-fleet"}
          isOpen={fleetModalOpen}
          onClose={() => {
            setFleetModalOpen(false);
            setEditingFleet(null);
          }}
          onSave={handleSaveFleet}
          initialData={editingFleet}
          isEdit={!!editingFleet}
          kapalOptions={kapalOptions}
          isSaving={isSaving}
        />
      ) : null}

      {shoreModalOpen ? (
        <ShoreFormModal
          key={editingShore?.id || "create-shore"}
          isOpen={shoreModalOpen}
          onClose={() => {
            setShoreModalOpen(false);
            setEditingShore(null);
          }}
          onSave={handleSaveShore}
          initialData={editingShore}
          isEdit={!!editingShore}
          isSaving={isSaving}
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
        isDeleting={isDeleting}
      />
    </div>
  );
}
