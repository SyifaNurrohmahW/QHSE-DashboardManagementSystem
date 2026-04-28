"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  ShipWheel,
  Target,
  X,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AttachmentModulePanel from "@/components/dashboard/attachment-module-panel";

const initialHazardReports = [
  {
    id: 1,
    kapal: "MV Adaro Pioneer",
    tanggal: "2026-04-25",
    target: "12",
    totalReport: "10",
    keterangan: "Pelaporan stabil, perlu dorongan untuk area deck dan engine room.",
  },
  {
    id: 2,
    kapal: "MV South Borneo",
    tanggal: "2026-04-21",
    target: "8",
    totalReport: "9",
    keterangan: "Target tercapai, laporan didominasi unsafe condition di cargo area.",
  },
  {
    id: 3,
    kapal: "MV Energi Nusantara",
    tanggal: "2026-04-18",
    target: "10",
    totalReport: "7",
    keterangan: "Masih di bawah target, perlu peningkatan awareness toolbox meeting.",
  },
  {
    id: 4,
    kapal: "MV Adaro Maritim",
    tanggal: "2026-04-14",
    target: "6",
    totalReport: "6",
    keterangan: "Target bulanan terpenuhi dengan fokus laporan dari area transfer point.",
  },
];

const emptyForm = {
  id: null,
  kapal: "",
  tanggal: "",
  target: "",
  totalReport: "",
  keterangan: "",
};

const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

const fullDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatMonthYear(dateString) {
  if (!dateString) {
    return "-";
  }

  return monthFormatter.format(new Date(dateString));
}

function formatFullDate(dateString) {
  if (!dateString) {
    return "-";
  }

  return fullDateFormatter.format(new Date(dateString));
}

function SummaryCard({ title, value, note, icon: Icon, tone }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[14px] font-medium text-[#44505e]">{title}</p>
            <p className="mt-2 text-[24px] font-bold leading-none text-[#1f2b38]">{value}</p>
            <p className="mt-2 text-[12px] text-[#73808d]">{note}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${tone}`}>
            <Icon size={22} strokeWidth={2.1} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HazardModal({ isOpen, form, onChange, onClose, onSubmit }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1720]/55 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_rgba(15,23,32,0.25)]">
        <div className="flex items-start justify-between border-b border-[#edf1f4] px-6 py-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#d35454]">
              {form.id ? "Ubah Hazard Report" : "Input Hazard Report"}
            </p>
            <h2 className="mt-2 text-[24px] font-bold text-[#243041]">
              {form.id ? "Perbarui data hazard bulanan" : "Tambah data hazard bulanan"}
            </h2>
            <p className="mt-2 text-[13px] text-[#73808d]">
              Isi data kapal dan hazard report
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f7f9] text-[#5e6a76] transition hover:bg-[#e9eff3]"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[13px] font-semibold text-[#304050]">Kapal</span>
              <input
                name="kapal"
                value={form.kapal}
                onChange={onChange}
                placeholder="Contoh: MV Adaro Pioneer"
                className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#d35454] focus:ring-4 focus:ring-[#f8d7d7]"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-semibold text-[#304050]">Tanggal</span>
              <input
                name="tanggal"
                type="date"
                value={form.tanggal}
                onChange={onChange}
                className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#d35454] focus:ring-4 focus:ring-[#f8d7d7]"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-semibold text-[#304050]">Target</span>
              <input
                name="target"
                type="number"
                min="0"
                value={form.target}
                onChange={onChange}
                placeholder="0"
                className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#d35454] focus:ring-4 focus:ring-[#f8d7d7]"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-semibold text-[#304050]">Total Report</span>
              <input
                name="totalReport"
                type="number"
                min="0"
                value={form.totalReport}
                onChange={onChange}
                placeholder="0"
                className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#d35454] focus:ring-4 focus:ring-[#f8d7d7]"
                required
              />
            </label>

           
          </div>

          <label className="block space-y-2">
            <span className="text-[13px] font-semibold text-[#304050]">Keterangan</span>
            <textarea
              name="keterangan"
              value={form.keterangan}
              onChange={onChange}
              rows={4}
              placeholder="Tulis keterangan atau catatan tindak lanjut hazard report"
              className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#d35454] focus:ring-4 focus:ring-[#f8d7d7]"
              required
            />
          </label>

           <div className="rounded-[18px] border border-[#f1d4d4] bg-[#fff7f7] p-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#d35454]">
                Catatan
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#6c7986]">
                Data baru akan langsung muncul pada halaman daftar hazard.
              </p>
            </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#edf1f4] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-[12px] border border-[#d7e0e6] px-4 py-3 text-[13px] font-semibold text-[#51606d] transition hover:bg-[#f6f8fa]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[12px] bg-[#c73f4d] px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-[#b43543]"
            >
              {form.id ? "Update Hazard Report" : "Simpan Hazard Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HazardDetailModal({ report, onClose }) {
  if (!report) {
    return null;
  }

  const targetMet = Number(report.totalReport) >= Number(report.target);

  const detailRows = [
    { label: "Kapal", value: report.kapal || "-" },
    { label: "Tanggal Input", value: formatFullDate(report.tanggal) },
    { label: "Periode", value: formatMonthYear(report.tanggal) },
    { label: "Target", value: report.target || "0" },
    { label: "Total Report", value: report.totalReport || "0" },
    { label: "Selisih", value: String(Number(report.totalReport) - Number(report.target)) },
    { label: "Status", value: targetMet ? "Target Tercapai" : "Perlu Follow Up" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1720]/55 px-4 py-6"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[680px] overflow-hidden rounded-[20px] border border-[#e5eaee] bg-white shadow-[0_24px_60px_rgba(15,23,32,0.25)]">
        <div className="flex items-start justify-between border-b border-[#edf1f4] px-6 py-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#d35454]">
              Detail Hazard Report
            </p>
            <h2 className="mt-2 text-[22px] font-bold text-[#243041]">{report.kapal}</h2>
            <p className="mt-1 text-[13px] text-[#73808d]">
              Informasi lengkap laporan hazard bulanan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f7f9] text-[#5e6a76] transition hover:bg-[#e9eff3]"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {detailRows.map((row) => (
              <div
                key={row.label}
                className="rounded-[14px] border border-[#edf1f4] bg-[#fafbfc] px-4 py-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                  {row.label}
                </p>
                <p className="mt-1 text-[13px] font-medium text-[#243041]">{row.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[14px] border border-[#edf1f4] bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
              Keterangan
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#4b5866]">{report.keterangan || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HazardPage() {
  const [reports, setReports] = useState(initialHazardReports);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [detailReport, setDetailReport] = useState(null);

  const totalReport = reports.reduce((sum, item) => sum + Number(item.totalReport || 0), 0);
  const totalTarget = reports.reduce((sum, item) => sum + Number(item.target || 0), 0);
  const achievedCount = reports.filter(
    (item) => Number(item.totalReport || 0) >= Number(item.target || 0)
  ).length;
  const needFollowUp = reports.length - achievedCount;
  const highestReport = reports.reduce((top, item) => {
    if (!top || Number(item.totalReport) > Number(top.totalReport)) {
      return item;
    }

    return top;
  }, null);

  const achievement =
    totalTarget > 0 ? `${Math.round((totalReport / totalTarget) * 100)}%` : "0%";

  const handleOpenModal = () => {
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const attachmentContexts = reports.map((report) => ({
    recordId: String(report.id),
    moduleName: "hazard_report",
  }));

  const attachmentSeed = useMemo(() => {
        return reports.slice(0, 3).map((item, index) => ({
          id: `seed${item.id}`,
          recordId: String(item.id),
          moduleName: "hazard_report",
          fileName: `Laporan Hazard ${item.kapal}`,
          mimeType: "application/pdf",
          previewUrl: `https://example.com/preview/hazard_report_${item.id}.pdf`,
          uploadedAt: new Date(Date.now() - index * 3600 * 1000).toISOString(),

        }));
      }, [reports]);
  
  const handleEdit = (report) => {
    setForm({
      id: report.id,
      kapal: report.kapal,
      tanggal: report.tanggal,
      target: report.target,
      totalReport: report.totalReport,
      keterangan: report.keterangan,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (reportId) => {
    setReports((current) => current.filter((item) => item.id !== reportId));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm(emptyForm);
  };

  const handleChangeForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.id) {
      setReports((current) =>
        current.map((item) =>
          item.id === form.id
            ? {
                ...item,
                kapal: form.kapal,
                tanggal: form.tanggal,
                target: form.target,
                totalReport: form.totalReport,
                keterangan: form.keterangan,
              }
            : item
        )
      );
    } else {
      setReports((current) => [
        {
          id: Date.now(),
          kapal: form.kapal,
          tanggal: form.tanggal,
          target: form.target,
          totalReport: form.totalReport,
          keterangan: form.keterangan,
        },
        ...current,
      ]);
    }

    handleCloseModal();
  };

  const summaryCards = [
    {
      title: "Total Hazard Report",
      value: String(totalReport),
      note: `${reports.length} data kapal tercatat`,
      icon: FileSpreadsheet,
      tone: "bg-[#fff2f2] text-[#d65555]",
    },
    {
      title: "Total Target",
      value: String(totalTarget),
      note: "Target gabungan seluruh kapal",
      icon: Target,
      tone: "bg-[#fff7e8] text-[#d89a2b]",
    },
    {
      title: "Mencapai Target",
      value: String(achievedCount),
      note: "Kapal sudah memenuhi target",
      icon: CheckCircle2,
      tone: "bg-[#edf9f1] text-[#22a35e]",
    },
    {
      title: "Perlu Follow Up",
      value: String(needFollowUp),
      note: "Kapal masih di bawah target",
      icon: AlertTriangle,
      tone: "bg-[#eef4ff] text-[#4a87d9]",
    },
  ];

  return (
    <>
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[24px] bg-gradient-to-r from-[#8a202c] via-[#bf3f49] to-[#ea7d63] text-white shadow-[0_18px_42px_rgba(138,32,44,0.2)]">
          <div className="flex flex-col gap-5 px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/85">
                <AlertTriangle size={14} />
                Hazard Report Dashboard
              </div>
              <h1 className="mt-3 text-[22px] font-bold leading-tight lg:text-[28px]">
                Monitoring Hazard Report Bulanan 
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] text-white/82 lg:text-[14px]">
                Halaman ini menampilkan target, total report, dan catatan tindak lanjut hazard
                report agar monitoring pelaporan lebih rapi.
              </p>
              
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex items-center gap-2 rounded-[10px] border border-white/25 px-4 py-2.5 text-[13px] font-semibold text-white">
             <FileText size={16} /> 
            Export Laporan
            </button>
            </div>
          
          </div>
          

          <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
            <div className="bg-black/10 px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-white/70">Pencapaian Total</p>
                <ArrowUpRight size={16} className="text-white/80" />
              </div>
              <p className="mt-2 text-[24px] font-bold leading-none">{achievement}</p>
              <p className="mt-1 text-[12px] text-white/75">
                Perbandingan total report terhadap target
              </p>
            </div>
            <div className="bg-black/10 px-5 py-4">
              <p className="text-[12px] text-white/70">Kapal Teraktif</p>
              <div className="mt-2 flex items-center gap-2">
                <ShipWheel size={18} className="text-[#ffe4b3]" />
                <span className="text-[18px] font-bold">
                  {highestReport ? highestReport.kapal : "-"}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-white/75">
                {highestReport
                  ? `${highestReport.totalReport} report di ${formatMonthYear(highestReport.tanggal)}`
                  : "-"}
              </p>
            </div>
            <div className="bg-black/10 px-5 py-4">
              <p className="text-[12px] text-white/70">Status Monitoring</p>
              <div className="mt-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#ffe4b3]" />
                <span className="text-[18px] font-bold">{achievedCount} kapal on track</span>
              </div>
              <p className="mt-1 text-[12px] text-white/75">
                {needFollowUp} kapal masih butuh perhatian
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => (
            <SummaryCard key={item.title} {...item} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Card className="min-w-0">
            <CardContent className="p-5">
              <h2 className="text-[16px] font-semibold text-[#243041]">Monitoring Cepat</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[16px] bg-[#fff7f7] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#d35454]">
                    Total gap target
                  </p>
                  <p className="mt-2 text-[26px] font-bold text-[#243041]">
                    {totalReport - totalTarget}
                  </p>
                  <p className="mt-1 text-[12px] text-[#73808d]">
                    Nilai negatif berarti report masih di bawah target.
                  </p>
                </div>

                <div className="rounded-[16px] bg-[#f5f8fb] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6280a0]">
                    Rata-rata report
                  </p>
                  <p className="mt-2 text-[26px] font-bold text-[#243041]">
                    {reports.length ? (totalReport / reports.length).toFixed(1) : "0"}
                  </p>
                  <p className="mt-1 text-[12px] text-[#73808d]">
                    Rata-rata jumlah hazard report per kapal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardContent className="p-5">
              <h2 className="text-[16px] font-semibold text-[#243041]">Catatan Tindak Lanjut</h2>
              <div className="mt-4 max-h-[220px] space-y-3 overflow-y-auto pr-1">
                {reports.map((item) => (
                  <div
                    key={`note-${item.id}`}
                    className="rounded-[16px] border border-[#edf1f4] bg-[#fcfdfd] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-[#243041]">{item.kapal}</p>
                      <span className="text-[11px] font-medium text-[#8894a0]">
                        {formatMonthYear(item.tanggal)}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] leading-6 text-[#6f7b86]">{item.keterangan}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="min-w-0 self-start overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 border-b border-[#edf1f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#243041]">Daftar Hazard Report</h2>
                  <p className="mt-1 text-[12px] text-[#7a8692]">
                    Data monitoring hazard report bulanan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#c73f4d] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#b43543]"
                >
                  <Plus size={16} />
                  Tambah Data
                </button>
              </div>

              <div className="max-h-[620px] overflow-x-auto overflow-y-auto">
                <table className="min-w-[900px] w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="sticky top-0 z-10 bg-[#f8fafb]">
                      {[
                        "KAPAL",
                        "PERIODE",
                        "TANGGAL INPUT",
                        "TARGET",
                        "TOTAL REPORT",
                        "SELISIH",
                        "STATUS",
                        "KETERANGAN",
                        "AKSI",
                      ].map((header) => (
                        <th
                          key={header}
                          className="whitespace-nowrap border-b border-[#edf1f4] px-3 py-2.5 text-left text-[10px] font-semibold tracking-wider text-[#8b96a1]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((item) => {
                      const targetMet = Number(item.totalReport) >= Number(item.target);
                      const difference = Number(item.totalReport) - Number(item.target);

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-[#f0f3f5] transition-colors hover:bg-[#fafbfc]"
                        >
                          <td className="whitespace-nowrap px-3 py-3 font-medium text-[#243041]">
                            {item.kapal}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                            {formatMonthYear(item.tanggal)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#8b96a1]">
                            {formatFullDate(item.tanggal)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                            {item.target}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                            {item.totalReport}
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-3 font-semibold ${
                              targetMet ? "text-[#1f8f4f]" : "text-[#d84f4f]"
                            }`}
                          >
                            {difference}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                targetMet
                                  ? "bg-[#eaf8ef] text-[#1f8f4f]"
                                  : "bg-[#fff1f1] text-[#d84f4f]"
                              }`}
                            >
                              {targetMet ? "Target Tercapai" : "Perlu Follow Up"}
                            </span>
                          </td>
                          <td className="max-w-[240px] px-3 py-3">
                            <p className="line-clamp-2 text-[11px] leading-5 text-[#667481]">
                              {item.keterangan}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setDetailReport(item)}
                                className="inline-flex items-center gap-1 rounded-[6px] bg-[#f3f4f6] px-2.5 py-1 text-[10px] font-medium text-[#374151] transition hover:bg-[#e5e7eb]"
                              >
                                <Eye size={11} />
                                Detail
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                className="inline-flex items-center justify-center rounded-[6px] bg-[#eff6ff] px-2.5 py-1 text-[10px] font-medium text-[#1d4ed8] transition hover:bg-[#dbeafe]"
                              >
                                Ubah
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="inline-flex items-center justify-center rounded-[6px] bg-[#fff0f0] px-2.5 py-1 text-[10px] font-medium text-[#c53030] transition hover:bg-[#fecaca]"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <AttachmentModulePanel
                      title="Attachment Incident"
                      description="Panel ini tidak dipakai untuk upload. User upload file lewat halaman Attachment, lalu hasilnya otomatis tampil di sini kalau `record id` dan `module name` cocok."
                      contexts={attachmentContexts}
                      seedAttachments={attachmentSeed}
                    />

      <HazardModal
        isOpen={isModalOpen}
        form={form}
        onChange={handleChangeForm}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
      <HazardDetailModal report={detailReport} onClose={() => setDetailReport(null)} />
    </>
  );
}
