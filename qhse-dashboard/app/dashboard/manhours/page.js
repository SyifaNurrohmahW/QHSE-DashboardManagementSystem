"use client";

import { useMemo, useState } from "react";
import {
  Clock3,
  Ship,
  Users,
  Plus,
  Filter,
  Eye,
  Pencil,
  Trash2,
  X,
  BarChart3,
  CalendarDays,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const KAPAL_LIST = [
  "MV Adaro Pioneer",
  "MV South Borneo",
  "MV Energi Nusantara",
  "MV Adaro Maritim",
];

const AREAS = ["Lower", "Upper", "Shore"];

const INITIAL_MANHOURS = [
  {
    id: "MH-2026-001",
    kapal: "MV Adaro Pioneer",
    tanggal: "2026-01-01",
    area: "Lower",
    avgCrew: 12,
    manhours: 8640,
    keterangan: "Normal operation",
  },
  {
    id: "MH-2026-002",
    kapal: "MV South Borneo",
    tanggal: "2026-02-01",
    area: "Upper",
    avgCrew: 10,
    manhours: 7200,
    keterangan: "Full month operation",
  },
];

const EMPTY_FORM = {
  id: "",
  kapal: "",
  tanggal: "",
  area: "",
  avgCrew: "",
  manhours: "",
  keterangan: "",
};

function genId(data) {
  const nums = data.map((i) => Number(i.id.split("-")[2])).filter(Boolean);
  const max = nums.length ? Math.max(...nums) : 0;
  return `MH-${new Date().getFullYear()}-${String(max + 1).padStart(3, "0")}`;
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString("id-ID");
}

function formatMonthYear(dateString) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function getYear(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).getFullYear();
}

function getMonth(dateString) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", { month: "long" }).format(new Date(dateString));
}

function FormField({ label, req, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium uppercase tracking-wide text-[#6b7a87]">
        {label} {req && <span className="text-red-600">*</span>}
      </label>
      {children}
      {error && <span className="text-[10px] text-red-600">Wajib diisi</span>}
    </div>
  );
}

function AreaBadge({ area }) {
  const styles = {
    Lower: "bg-emerald-50 text-emerald-700",
    Upper: "bg-blue-50 text-blue-700",
    Shore: "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
        styles[area] || "bg-gray-100 text-gray-600"
      }`}
    >
      {area}
    </span>
  );
}

function FormModal({ isOpen, onClose, onSave, initialData, isEdit, nextId }) {
  const [form, setForm] = useState(initialData || { ...EMPTY_FORM, id: nextId });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const set = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const inputCls = (key) =>
    `rounded-[8px] border px-3 py-2 text-[12px] bg-white w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
      errors[key] ? "border-red-500" : "border-[#dde3e8]"
    }`;

  function handleSave() {
    const required = ["kapal", "tanggal", "area", "avgCrew", "manhours"];
    const errs = {};

    required.forEach((key) => {
      if (!form[key]?.toString().trim()) errs[key] = true;
    });

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    onSave({
      ...form,
      id: form.id || nextId,
      avgCrew: Number(form.avgCrew),
      manhours: Number(form.manhours),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[560px] rounded-[16px] border border-[#e5eaee] bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[#edf1f4] px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-[#1f2b38]">
              {isEdit ? "Edit Manhours" : "Tambah Manhours"}
            </p>
            <p className="mt-0.5 text-[11px] text-[#8a95a2]">Input data jam kerja crew per kapal dan periode.</p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6b7a87] hover:bg-[#eaeff3]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          <FormField label="No. Manhours">
            <input
              value={form.id || nextId}
              readOnly
              className={`${inputCls("id")} bg-[#f8f9fb] text-[#8a95a2]`}
            />
          </FormField>

          <FormField label="Kapal" req error={errors.kapal}>
            <select className={inputCls("kapal")} value={form.kapal} onChange={set("kapal")}>
              <option value="">-- Pilih Kapal --</option>
              {KAPAL_LIST.map((kapal) => (
                <option key={kapal} value={kapal}>
                  {kapal}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tanggal Periode" req error={errors.tanggal}>
            <input
              type="date"
              className={inputCls("tanggal")}
              value={form.tanggal}
              onChange={set("tanggal")}
            />
          </FormField>

          <div className="rounded-[12px] border border-[#edf1f4] bg-[#fafbfc] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
              Ringkasan Periode
            </p>
            <p className="mt-1 text-[13px] font-medium text-[#243041]">
              {form.tanggal ? formatMonthYear(form.tanggal) : "Pilih tanggal terlebih dahulu"}
            </p>
          </div>

          <FormField label="Area Operasi" req error={errors.area}>
            <select className={inputCls("area")} value={form.area} onChange={set("area")}>
              <option value="">-- Pilih Area --</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Average Crew" req error={errors.avgCrew}>
            <input
              type="number"
              min="0"
              className={inputCls("avgCrew")}
              value={form.avgCrew}
              onChange={set("avgCrew")}
              placeholder="Contoh: 12"
            />
          </FormField>

          <FormField label="Manhours" req error={errors.manhours}>
            <input
              type="number"
              min="0"
              className={inputCls("manhours")}
              value={form.manhours}
              onChange={set("manhours")}
              placeholder="Contoh: 8640"
            />
          </FormField>

          <div className="col-span-2">
            <FormField label="Keterangan">
              <textarea
                rows={3}
                className={`${inputCls("keterangan")} resize-y`}
                value={form.keterangan}
                onChange={set("keterangan")}
                placeholder="Catatan tambahan..."
              />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#edf1f4] px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-[8px] bg-[#f4f7f9] px-4 py-2 text-[12px] font-medium text-[#5c6a77] hover:bg-[#eaeff3]"
          >
            Batal
          </button>

          <button
            onClick={handleSave}
            className="rounded-[8px] bg-emerald-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-emerald-700"
          >
            {isEdit ? "Simpan Perubahan" : "Simpan Data"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ data, onClose }) {
  if (!data) return null;

  const rows = [
    ["No. Manhours", data.id],
    ["Kapal", data.kapal],
    ["Periode", formatMonthYear(data.tanggal)],
    ["Tahun", getYear(data.tanggal)],
    ["Bulan", getMonth(data.tanggal)],
    ["Area Operasi", data.area],
    ["Average Crew", data.avgCrew],
    ["Manhours", formatNumber(data.manhours)],
    ["Keterangan", data.keterangan || "-"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[620px] rounded-[16px] border border-[#e5eaee] bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-[#edf1f4] px-5 py-4">
          <div>
            <p className="text-[15px] font-semibold text-[#1f2b38]">Detail Manhours</p>
            <p className="mt-0.5 text-[11px] text-[#8a95a2]">{data.id}</p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f7f9] text-[#6b7a87] hover:bg-[#eaeff3]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-[12px] border border-[#edf1f4] bg-[#fafbfc] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                {label}
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#243041]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, itemId, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
      <div className="w-full max-w-[360px] rounded-[14px] border border-[#e5eaee] bg-white p-6 text-center shadow-lg">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <Trash2 size={20} className="text-red-600" />
        </div>

        <p className="mb-1 text-[15px] font-semibold text-[#1f2b38]">Hapus Data Manhours?</p>
        <p className="mb-5 text-[12px] text-[#7a8692]">
          Data <span className="font-semibold text-[#1f2b38]">{itemId}</span> akan dihapus.
        </p>

        <div className="flex justify-center gap-2">
          <button
            onClick={onCancel}
            className="rounded-[8px] bg-[#f4f7f9] px-5 py-2 text-[12px] font-medium text-[#5c6a77] hover:bg-[#eaeff3]"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="rounded-[8px] bg-red-600 px-5 py-2 text-[12px] font-semibold text-white hover:bg-red-700"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManhoursPage() {
  const [manhoursData, setManhoursData] = useState(INITIAL_MANHOURS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalManhours = useMemo(
    () => manhoursData.reduce((sum, item) => sum + Number(item.manhours || 0), 0),
    [manhoursData]
  );

  const totalCrew = useMemo(
    () => manhoursData.reduce((sum, item) => sum + Number(item.avgCrew || 0), 0),
    [manhoursData]
  );

  const averageCrew = manhoursData.length ? totalCrew / manhoursData.length : 0;

  const activeVessels = new Set(manhoursData.map((item) => item.kapal)).size;

  const stats = [
    {
      title: "Total Manhours",
      value: formatNumber(totalManhours),
      note: "Akumulasi seluruh periode",
      icon: Clock3,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Average Crew",
      value: averageCrew.toFixed(1),
      note: "Rata-rata crew per kapal",
      icon: Users,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      title: "Active Vessel",
      value: String(activeVessels).padStart(2, "0"),
      note: "Kapal dengan data manhours",
      icon: Ship,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      title: "Total Record",
      value: String(manhoursData.length).padStart(2, "0"),
      note: "Data bulanan tercatat",
      icon: BarChart3,
      tone: "bg-slate-100 text-slate-700",
    },
  ];

  function openCreate() {
    setEditData(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditData(item);
    setModalOpen(true);
  }

  function handleSave(data) {
    if (editData) {
      setManhoursData((prev) => prev.map((item) => (item.id === data.id ? data : item)));
    } else {
      setManhoursData((prev) => [data, ...prev]);
    }

    setModalOpen(false);
    setEditData(null);
  }

  function handleDelete() {
    setManhoursData((prev) => prev.filter((item) => item.id !== deleteTarget));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 text-white shadow-[0_16px_36px_rgba(16,185,129,0.18)]">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/85">
              <Clock3 size={14} />
              Manhours Monitoring
            </div>

            <h1 className="mt-3 text-[22px] font-bold leading-tight">
              Monitoring Manhours Kapal & Performa Keselamatan
            </h1>

            <p className="mt-2 max-w-2xl text-[13px] text-white/82">
              Data manhours digunakan untuk kebutuhan dashboard QHSE, perhitungan performa keselamatan,
              dan rekap bulanan client.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-semibold text-emerald-700"
            >
              <Plus size={16} />
              Tambah Data
            </button>

            <button className="inline-flex items-center gap-2 rounded-[10px] border border-white/25 px-4 py-2.5 text-[13px] font-semibold text-white">
              <FileText size={16} />
              Export Laporan
            </button>
          </div>
        </div>

        <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Periode Aktif</p>
            <div className="mt-2 flex items-center gap-2">
              <CalendarDays size={18} className="text-white" />
              <span className="text-[20px] font-bold">2026</span>
            </div>
          </div>

          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Area Terdata</p>
            <p className="mt-2 text-[20px] font-bold">Lower / Upper / Shore</p>
          </div>

          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Total Jam Kerja</p>
            <p className="mt-2 text-[24px] font-bold leading-none">{formatNumber(totalManhours)}</p>
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
                    <p className="text-[14px] font-medium text-[#44505e]">{item.title}</p>
                    <p className="mt-2 text-[24px] font-bold leading-none text-[#1f2b38]">
                      {item.value}
                    </p>
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

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-[#edf1f4] px-5 py-4">
            <div>
              <h2 className="text-[16px] font-semibold text-[#243041]">Daftar Manhours</h2>
              <p className="mt-1 text-[12px] text-[#7a8692]">
                Register data manhours per kapal dan bulan.
              </p>
            </div>

            <div className="rounded-full bg-[#f4f7f9] px-3 py-1 text-[12px] font-medium text-[#5c6a77]">
              {manhoursData.length} data
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 420 }}>
            {manhoursData.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#9aa4ae]">
                Belum ada data manhours.
              </div>
            ) : (
              <table className="min-w-[920px] w-full border-collapse text-[11px]">
                <thead>
                  <tr className="sticky top-0 z-10 bg-[#f8fafb]">
                    {[
                      "NO",
                      "KAPAL",
                      "TAHUN",
                      "BULAN",
                      "AREA",
                      "AVG CREW",
                      "MANHOURS",
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
                  {manhoursData.map((item) => (
                    <tr key={item.id} className="border-b border-[#f0f3f5] hover:bg-[#fafbfc]">
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-[#5c6a77]">
                        {item.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#243041]">
                        {item.kapal}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                        {getYear(item.tanggal)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                        {getMonth(item.tanggal)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <AreaBadge area={item.area} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                        {item.avgCrew}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-emerald-700">
                        {formatNumber(item.manhours)}
                      </td>
                      <td className="max-w-[220px] px-3 py-3 text-[#6b7280]">
                        <p className="line-clamp-2">{item.keterangan || "-"}</p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
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
                            className="inline-flex items-center gap-1 rounded-[6px] bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100"
                          >
                            <Pencil size={11} />
                            Edit
                          </button>

                          <button
                            onClick={() => setDeleteTarget(item.id)}
                            className="inline-flex items-center gap-1 rounded-[6px] bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100"
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

      {modalOpen && (
        <FormModal
          key={editData?.id || genId(manhoursData)}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditData(null);
          }}
          onSave={handleSave}
          initialData={editData}
          isEdit={!!editData}
          nextId={genId(manhoursData)}
        />
      )}

      <DetailModal data={detailData} onClose={() => setDetailData(null)} />

      <ConfirmModal
        isOpen={!!deleteTarget}
        itemId={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
