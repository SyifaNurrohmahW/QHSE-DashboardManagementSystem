"use client";

import { useEffect, useState } from "react";
import {
  Anchor,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Fuel,
  Plus,
  Ship,
  ShieldCheck,
  Wrench,
  X,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  createKapal,
  deleteKapal,
  getKapalList,
  updateKapal,
} from "@/lib/services/kapalService";
import { AREA_OPTIONS, TIPE_KAPAL_OPTIONS } from "@/constants/kapalOptions";

const dokumenKapal = [];
const rencanaPerawatan = [];

const emptyForm = {
  id: null,
  kodeKapal: "",
  namaKapal: "",
  tipeKapal: "",
  ownerGroup: "",
  areaOperasi: "",
  status: "Aktif",
};

function VesselStatCard({ title, value, note, icon: Icon, tone }) {
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

function statusBadgeClass(status) {
  return status === "Aktif"
    ? "bg-[#eaf8ef] text-[#1f8f4f]"
    : "bg-[#fff1f1] text-[#d84f4f]";
}

function getAreaLabel(value) {
  const normalizedValue = value?.toLowerCase();
  return (
    AREA_OPTIONS.find((option) => option.value === value)?.label ||
    AREA_OPTIONS.find((option) => option.value === normalizedValue)?.label ||
    value
  );
}

function getTipeLabel(value) {
  return TIPE_KAPAL_OPTIONS.find((option) => option.value === value)?.label || value;
}

function VesselModal({ isOpen, form, onChange, onClose, onSubmit, isSaving }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1720]/55 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-[0_24px_60px_rgba(15,23,32,0.25)]">
        <div className="flex items-start justify-between border-b border-[#edf1f4] px-6 py-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#118468]">
              {form.id ? "Ubah Data Kapal" : "Tambah Data Kapal"}
            </p>
            <h2 className="mt-2 text-[24px] font-bold text-[#243041]">
              {form.id ? "Perbarui data kapal" : "Input kapal baru"}
            </h2>
            <p className="mt-2 text-[13px] text-[#73808d]">
              Lengkapi data kapal.
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
              <span className="text-[13px] font-semibold text-[#304050]">Kode Kapal</span>
              <input
                name="kodeKapal"
                value={form.kodeKapal}
                onChange={onChange}
                placeholder="Contoh: VSL-001"
                className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#118468] focus:ring-4 focus:ring-[#d5efe8]"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-semibold text-[#304050]">Nama Kapal</span>
              <input
                name="namaKapal"
                value={form.namaKapal}
                onChange={onChange}
                placeholder="Contoh: MV Adaro Pioneer"
                className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#118468] focus:ring-4 focus:ring-[#d5efe8]"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-semibold text-[#304050]">Tipe Kapal</span>
              <select
                name="tipeKapal"
                value={form.tipeKapal}
                onChange={onChange}
                className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#118468] focus:ring-4 focus:ring-[#d5efe8]"
                required
              >
                <option value="">Pilih tipe kapal</option>
                {TIPE_KAPAL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-semibold text-[#304050]">Owner Group</span>
              <input
                name="ownerGroup"
                value={form.ownerGroup}
                onChange={onChange}
                placeholder="Contoh: Adaro Marine"
                className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#118468] focus:ring-4 focus:ring-[#d5efe8]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-semibold text-[#304050]">Area Operasi</span>
              <select
                name="areaOperasi"
                value={form.areaOperasi}
                onChange={onChange}
                className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#118468] focus:ring-4 focus:ring-[#d5efe8]"
                required
              >
                <option value="">Pilih area operasi</option>
                {AREA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-[13px] font-semibold text-[#304050]">Status</span>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full rounded-[14px] border border-[#dbe3e8] bg-white px-4 py-3 text-[14px] text-[#243041] outline-none transition focus:border-[#118468] focus:ring-4 focus:ring-[#d5efe8]"
                required
              >
                <option value="">Pilih status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </label>
          </div>

          <div className="rounded-[18px] border border-[#d8ebe6] bg-[#f4fbf8] p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#118468]">
              Informasi
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#60707d]">
              Data yang disimpan akan muncul di daftar kapal.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#edf1f4] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-[12px] border border-[#d7e0e6] px-4 py-3 text-[13px] font-semibold text-[#51606d] transition hover:bg-[#f6f8fa]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-[12px] bg-[#118468] px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-[#0e7259] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Menyimpan..." : form.id ? "Update Kapal" : "Simpan Kapal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VesselPage() {
  const [vessels, setVessels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalKapal = vessels.length;
  const kapalAktif = vessels.filter((item) => item.status === "Aktif").length;
  const kapalNonaktif = totalKapal - kapalAktif;
  const areaUpper = vessels.filter((item) => item.areaOperasi?.toLowerCase() === "upper").length;
  const areaLower = vessels.filter((item) => item.areaOperasi?.toLowerCase() === "lower").length;
  const areaShore = vessels.filter((item) => item.areaOperasi?.toLowerCase() === "shore").length;

  useEffect(() => {
    let isMounted = true;

    async function loadKapal() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const data = await getKapalList();
        if (isMounted) {
          setVessels(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Gagal memuat data kapal.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadKapal();

    return () => {
      isMounted = false;
    };
  }, []);

  const vesselStats = [
    {
      title: "Total Kapal",
      value: String(totalKapal),
      note: `${kapalAktif} aktif, ${kapalNonaktif} nonaktif`,
      icon: Ship,
      tone: "bg-[#eef6ff] text-[#3b82f6]",
    },
    {
      title: "Area Upper",
      value: String(areaUpper),
      note: "Kapal yang beroperasi di area upper",
      icon: Anchor,
      tone: "bg-[#edf9f1] text-[#16a34a]",
    },
    {
      title: "Dokumen Perlu Perhatian",
      value: String(dokumenKapal.length),
      note: "Pantau masa berlaku dokumen kapal",
      icon: ShieldCheck,
      tone: "bg-[#fff7e8] text-[#f59e0b]",
    },
    {
      title: "Rencana Perawatan",
      value: String(rencanaPerawatan.length),
      note: "Pekerjaan terjadwal yang sedang dipantau",
      icon: Wrench,
      tone: "bg-[#fff1f1] text-[#ef4444]",
    },
  ];

  const handleOpenModal = () => {
    setForm(emptyForm);
    setIsModalOpen(true);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      if (form.id) {
        const updatedKapal = await updateKapal(form.id, form);
        setVessels((current) =>
          current.map((item) =>
            item.id === form.id ? updatedKapal : item
          )
        );
      } else {
        const newKapal = await createKapal(form);
        setVessels((current) => [newKapal, ...current]);
      }

      handleCloseModal();
    } catch (error) {
      setErrorMessage(error.message || "Gagal menyimpan data kapal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (vessel) => {
    setForm({
      id: vessel.id,
      kodeKapal: vessel.kodeKapal,
      namaKapal: vessel.namaKapal,
      tipeKapal: vessel.tipeKapal,
      ownerGroup: vessel.ownerGroup,
      areaOperasi: vessel.areaOperasi,
      status: vessel.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (vesselId) => {
    const isConfirmed = window.confirm("Hapus data kapal ini?");
    if (!isConfirmed) {
      return;
    }

    try {
      setErrorMessage("");
      await deleteKapal(vesselId);
      setVessels((current) => current.filter((item) => item.id !== vesselId));
    } catch (error) {
      setErrorMessage(error.message || "Gagal menghapus data kapal.");
    }
  };

  return (
    <>
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[24px] bg-gradient-to-r from-[#0a5b4d] via-[#117b60] to-[#27a36a] text-white shadow-[0_18px_42px_rgba(15,72,57,0.16)]">
          <div className="flex flex-col gap-5 px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/85">
                <Anchor size={14} />
                Ringkasan Data Kapal
              </div>
              <h1 className="mt-3 text-[22px] font-bold leading-tight lg:text-[28px]">
                Monitoring data kapal untuk kebutuhan operasional.
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] text-white/82 lg:text-[14px]">
                Halaman ini menampilkan daftar kapal, area operasi, dokumen penting, dan rencana
                perawatan.
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
                <p className="text-[12px] text-white/70">Ketersediaan Armada</p>
                <ArrowUpRight size={16} className="text-white/80" />
              </div>
              <p className="mt-2 text-[24px] font-bold leading-none">
                {totalKapal ? `${Math.round((kapalAktif / totalKapal) * 100)}%` : "0%"}
              </p>
              <p className="mt-1 text-[12px] text-white/75">
                Persentase kapal berstatus aktif
              </p>
            </div>
            <div className="bg-black/10 px-5 py-4">
              <p className="text-[12px] text-white/70">Distribusi Area Operasi</p>
              <div className="mt-2 flex items-center gap-2">
                <Fuel size={18} className="text-[#ddeb2c]" />
                <span className="text-[20px] font-bold">
                  {areaLower} Lower / {areaUpper} Upper
                </span>
              </div>
              <p className="mt-1 text-[12px] text-white/75">{areaShore} kapal di area shore</p>
            </div>
            <div className="bg-black/10 px-5 py-4">
              <p className="text-[12px] text-white/70">Jadwal Terdekat</p>
              <div className="mt-2 flex items-center gap-2">
                <CalendarClock size={18} className="text-[#ddeb2c]" />
                <span className="text-[15px] font-semibold">27 Apr 2026</span>
              </div>
              <p className="mt-1 text-[12px] text-white/75">Pemeriksaan Mesin Utama</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {vesselStats.map((item) => (
            <VesselStatCard key={item.title} {...item} />
          ))}
        </section>

        {errorMessage ? (
          <div className="rounded-[16px] border border-[#ffd7d7] bg-[#fff7f7] px-4 py-3 text-[13px] font-medium text-[#b42318]">
            {errorMessage}
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-3">
          <Card className="min-w-0">
            <CardContent className="p-5">
              <h2 className="text-[16px] font-semibold text-[#243041]">Pengingat Dokumen</h2>
              <div className="mt-4 max-h-[240px] space-y-4 overflow-y-auto pr-1">
                {dokumenKapal.map((item) => (
                  <div
                    key={`${item.kapal}-${item.dokumen}`}
                    className="rounded-[14px] bg-[#fafbfb] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[#293544]">{item.dokumen}</p>
                        <p className="mt-1 text-[12px] text-[#71808d]">{item.kapal}</p>
                      </div>
                      <span className={`text-[12px] font-semibold ${item.levelClass}`}>
                        {item.level}
                      </span>
                    </div>
                    <p className="mt-3 text-[12px] text-[#5f6d79]">
                      Jatuh tempo: {item.jatuhTempo}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardContent className="p-5">
              <h2 className="text-[16px] font-semibold text-[#243041]">Rencana Perawatan</h2>
              <div className="mt-4 max-h-[240px] space-y-4 overflow-y-auto pr-1">
                {rencanaPerawatan.map((item) => (
                  <div
                    key={`${item.pekerjaan}-${item.kapal}`}
                    className="rounded-[14px] border border-[#eef2f4] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[#293544]">{item.pekerjaan}</p>
                        <p className="mt-1 text-[12px] text-[#71808d]">{item.kapal}</p>
                      </div>
                      <CheckCircle2 size={18} className="text-[#18a558]" />
                    </div>
                    <p className="mt-3 text-[12px] text-[#60707d]">Jadwal: {item.jadwal}</p>
                    <div className="mt-3 h-2 rounded-full bg-[#edf1f4]">
                      <div
                        className="h-2 rounded-full bg-[#1ea35d]"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-[#6d7985]">
                      Progress {item.progress}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardContent className="p-5">
              <h2 className="text-[16px] font-semibold text-[#243041]">Ringkasan Operasional</h2>
              <div className="mt-4 max-h-[240px] space-y-3 overflow-y-auto pr-1">
                <div className="rounded-[16px] bg-[#f5f8fb] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6280a0]">
                    Total Crew Onboard
                  </p>
                  <p className="mt-2 text-[26px] font-bold text-[#243041]">286</p>
                  <p className="mt-1 text-[12px] text-[#73808d]">
                    Estimasi onboard dari seluruh armada aktif.
                  </p>
                </div>
                <div className="rounded-[16px] bg-[#fff7f7] p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#d35454]">
                    Kapal Nonaktif
                  </p>
                  <p className="mt-2 text-[26px] font-bold text-[#243041]">{kapalNonaktif}</p>
                  <p className="mt-1 text-[12px] text-[#73808d]">
                    Perlu ditinjau untuk pembaruan status operasional.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="min-w-0 self-start overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 border-b border-[#edf1f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold text-[#243041]">Daftar Kapal</h2>
                  <p className="mt-1 text-[12px] text-[#7a8692]">
                    Register data kapal dengan informasi yang lebih ringkas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#118468] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0e7259]"
                >
                  <Plus size={16} />
                  Tambah Data
                </button>
              </div>

              <div className="max-w-full overflow-x-auto overflow-y-auto" style={{ maxHeight: 640 }}>
                <table className="min-w-[820px] w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="sticky top-0 z-10 bg-[#f8fafb]">
                      {[
                        "KODE KAPAL",
                        "NAMA KAPAL",
                        "TIPE KAPAL",
                        "OWNER GROUP",
                        "AREA OPERASI",
                        "STATUS",
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
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-[12px] text-[#7a8692]">
                          Memuat data kapal...
                        </td>
                      </tr>
                    ) : vessels.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-[12px] text-[#7a8692]">
                          Belum ada data kapal.
                        </td>
                      </tr>
                    ) : (
                      vessels.map((vessel) => (
                      <tr
                        key={vessel.id}
                        className="border-b border-[#f0f3f5] transition-colors hover:bg-[#fafbfc]"
                      >
                        <td className="whitespace-nowrap px-3 py-3 font-medium text-[#5c6a77]">
                          {vessel.kodeKapal}
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-[12px] font-semibold text-[#243041]">{vessel.namaKapal}</p>
                          <p className="mt-0.5 text-[10px] text-[#8b96a1]">
                            {vessel.areaOperasi ? `Area ${getAreaLabel(vessel.areaOperasi)}` : "Area belum diisi"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                          {getTipeLabel(vessel.tipeKapal) || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                          {vessel.ownerGroup || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#4a5568]">
                          {getAreaLabel(vessel.areaOperasi) || "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusBadgeClass(vessel.status)}`}
                          >
                            {vessel.status || "-"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEdit(vessel)}
                              className="inline-flex items-center justify-center rounded-[6px] bg-[#eff6ff] px-2.5 py-1 text-[10px] font-medium text-[#1d4ed8] transition hover:bg-[#dbeafe]"
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(vessel.id)}
                              className="inline-flex items-center justify-center rounded-[6px] bg-[#fff0f0] px-2.5 py-1 text-[10px] font-medium text-[#c53030] transition hover:bg-[#fecaca]"
                            >
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
        </section>
      </div>

      <VesselModal
        isOpen={isModalOpen}
        form={form}
        onChange={handleChangeForm}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </>
  );
}
