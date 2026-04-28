"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  FileImage,
  FileText,
  FileUp,
  FolderKanban,
  Image as ImageIcon,
  Link2,
  Lock,
  Paperclip,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  isImageAttachment,
  readAttachmentStore,
  writeAttachmentStore,
} from "@/lib/attachment-store";

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateId(items) {
  const next = items.reduce((max, item) => {
    const current = Number(item.id.split("-")[1] || 0);
    return Math.max(max, current);
  }, 0);
  return `ATT-${String(next + 1).padStart(3, "0")}`;
}

function fileSizeLabel(file) {
  if (!file) return "-";
  const sizeKb = file.size / 1024;
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(sizeKb))} KB`;
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ReadonlyField({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[16px] border border-[#e8edf1] bg-[#f8fbf9] px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
        {Icon ? <Icon size={13} /> : null}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-[13px] font-medium text-[#243041]">{value || "-"}</p>
    </div>
  );
}

function AttachmentVisual({ item, compact = false }) {
  if (isImageAttachment(item)) {
    return (
      <Image
        src={item.previewUrl}
        alt={item.fileName}
        width={640}
        height={320}
        unoptimized
        className={`w-full rounded-[16px] object-cover ${compact ? "h-20" : "h-44"}`}
      />
    );
  }

  return (
    <div className={`flex w-full items-center justify-center rounded-[16px] border border-dashed border-[#d8e2e7] bg-[#f8fbf9] ${compact ? "h-20" : "h-44"}`}>
      <div className="text-center">
        <FileText size={compact ? 22 : 28} className="mx-auto text-[#7c8793]" />
        <p className="mt-2 text-[11px] font-medium text-[#6f7c89]">Preview non-image</p>
      </div>
    </div>
  );
}

export default function AttachmentSection({
  title = "Evidence & Attachment Center",
  description = "Halaman ini didesain sebagai pola attachment yang bisa dipakai di semua modul, dengan file input yang sederhana dan metadata sistem yang otomatis tercatat.",
  badgeLabel = "Shared Attachment Hub",
  contexts = [],
  initialAttachments = [],
}) {
  const [attachments, setAttachments] = useState(() => readAttachmentStore(initialAttachments));
  const [activeContext, setActiveContext] = useState(contexts[0] || null);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState(
    readAttachmentStore(initialAttachments)[0]?.id || null,
  );
  const [errors, setErrors] = useState({});

  const selectedAttachment =
    attachments.find((item) => item.id === selectedAttachmentId) || attachments[0] || null;

  const stats = useMemo(() => {
    const total = attachments.length;
    const modules = new Set(attachments.map((item) => item.moduleName)).size;
    const imageCount = attachments.filter((item) => isImageAttachment(item)).length;
    const latest = attachments[0]?.uploadedBy || "-";

    return { total, modules, imageCount, latest };
  }, [attachments]);

  const moduleSummary = useMemo(() => {
    return contexts
      .map((context) => {
        const items = attachments.filter((item) => item.moduleName === context.moduleName);
        return {
          moduleName: context.moduleName,
          total: items.length,
          imageCount: items.filter((item) => isImageAttachment(item)).length,
          lastUpload: items[0]?.uploadedAt || null,
        };
      })
      .filter((item) => item.total > 0);
  }, [attachments, contexts]);

  const filteredAttachments = useMemo(() => {
    return attachments.filter((item) => {
      const keyword = search.toLowerCase();
      return (
        !keyword ||
        item.fileName.toLowerCase().includes(keyword) ||
        item.moduleName.toLowerCase().includes(keyword) ||
        item.recordId.toLowerCase().includes(keyword) ||
        item.uploadedBy.toLowerCase().includes(keyword)
      );
    });
  }, [attachments, search]);

  function syncAttachments(nextItems) {
    setAttachments(nextItems);
    writeAttachmentStore(nextItems);
  }

  function resetForm(nextContext = activeContext) {
    setSelectedFile(null);
    setFileName("");
    setErrors({});
    setFileInputKey((current) => current + 1);
    setActiveContext(nextContext);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setFileName(file ? file.name : "");
    setErrors((current) => ({ ...current, file: false, fileName: false }));
  }

  async function handleSave() {
    const nextErrors = {};
    if (!selectedFile) nextErrors.file = true;
    if (!String(fileName || "").trim()) nextErrors.fileName = true;

    if (Object.keys(nextErrors).length || !activeContext) {
      setErrors(nextErrors);
      return;
    }

    const previewUrl = selectedFile.type.startsWith("image/")
      ? await toDataUrl(selectedFile)
      : null;

    const newItem = {
      id: generateId(attachments),
      fileName: fileName.trim(),
      originalFileName: selectedFile.name,
      moduleName: activeContext.moduleName,
      recordId: activeContext.recordId,
      uploadedBy: activeContext.uploadedBy,
      uploadedAt: new Date().toISOString(),
      sizeLabel: fileSizeLabel(selectedFile),
      mimeType: selectedFile.type || "application/octet-stream",
      previewUrl,
    };

    const nextItems = [newItem, ...attachments];
    syncAttachments(nextItems);
    setSelectedAttachmentId(newItem.id);
    resetForm(activeContext);
  }

  function handleDelete(id) {
    const nextItems = attachments.filter((item) => item.id !== id);
    syncAttachments(nextItems);
    if (selectedAttachmentId === id) {
      setSelectedAttachmentId(nextItems[0]?.id || null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 text-white shadow-[0_16px_36px_rgba(16,185,129,0.18)]">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[1.45fr_0.95fr] lg:px-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
              <Paperclip size={14} />
              {badgeLabel}
            </div>
            <h1 className="mt-4 max-w-3xl text-[28px] font-bold leading-tight">{title}</h1>
            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-white/82">{description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {contexts.map((context) => {
                const isActive = activeContext?.recordId === context.recordId;
                return (
                  <button
                    key={context.recordId}
                    onClick={() => resetForm(context)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                      isActive
                        ? "bg-white text-emerald-700"
                        : "border border-white/20 bg-white/10 text-white/90 hover:bg-white/16"
                    }`}
                  >
                    {context.moduleName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[22px] border border-white/12 bg-black/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[12px] text-white/72">
                <span>Active Context</span>
                <FolderKanban size={15} />
              </div>
              <p className="mt-3 text-[18px] font-semibold leading-6">{activeContext?.moduleName || "-"}</p>
              <p className="mt-2 text-[12px] text-white/78">{activeContext?.recordId || "-"}</p>
            </div>

            <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-[12px] text-white/72">
                <span>Preview Ready</span>
                <ImageIcon size={15} />
              </div>
              <p className="mt-3 text-[16px] font-semibold leading-6">{stats.imageCount} gambar</p>
              <p className="mt-2 text-[12px] text-white/78">File gambar akan langsung tampil sebagai thumbnail/preview</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total Attachment", value: stats.total, note: "file terdaftar di semua modul", icon: Paperclip, tone: "bg-[#edf9f1] text-[#1f9b58]" },
          { title: "Covered Modules", value: stats.modules, note: "modul sudah memakai pola ini", icon: FolderKanban, tone: "bg-[#eef4ff] text-[#376ad6]" },
          { title: "Image Preview", value: stats.imageCount, note: "file gambar siap ditampilkan", icon: FileImage, tone: "bg-[#fff7e8] text-[#c98431]" },
          { title: "Latest Uploader", value: stats.latest, note: "user terakhir yang menambah file", icon: UserRound, tone: "bg-[#f2f4f7] text-[#55616d]" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="overflow-hidden border-[#edf1f4]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-[#53606d]">{item.title}</p>
                    <p className="mt-2 text-[26px] font-bold leading-none text-[#1f2b38]">{item.value}</p>
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

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden border-[#edf1f4]">
          <CardContent className="p-0">
            <div className="border-b border-[#edf1f4] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-[#1f2b38]">Upload Attachment</h2>
                  <p className="mt-1 text-[12px] text-[#7c8793]">
                    Upload dilakukan di halaman ini, lalu hasilnya akan muncul di modul yang punya `module name` dan `record id` yang sama.
                  </p>
                </div>
                <div className="rounded-full bg-[#edf9f1] px-3 py-1 text-[11px] font-semibold text-[#1f9b58]">
                  Shared Source
                </div>
              </div>
            </div>

            <div className="space-y-6 px-5 py-5">
              <div className="rounded-[22px] border border-[#e5ecef] bg-[#fbfcfd] p-4">
                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
                      Upload File <span className="text-[#c53030]">*</span>
                    </label>
                    <label className={`flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed px-4 py-6 text-center transition ${
                      errors.file ? "border-[#c53030] bg-[#fff8f8]" : "border-[#cfe1d8] bg-white hover:border-[#15803d]"
                    }`}>
                      <UploadCloud size={28} className="text-[#15803d]" />
                      <p className="mt-3 text-[13px] font-semibold text-[#243041]">
                        {selectedFile ? selectedFile.name : "Klik untuk pilih file"}
                      </p>
                      <p className="mt-1 text-[12px] text-[#7c8793]">
                        Kalau file berupa gambar, preview akan tampil langsung di halaman ini.
                      </p>
                      <input key={fileInputKey} type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                    {errors.file ? <span className="text-[10px] text-[#c53030]">File wajib dipilih</span> : null}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a8793]">
                        File Name <span className="text-[#c53030]">*</span>
                      </label>
                      <input
                        value={fileName}
                        onChange={(event) => {
                          setFileName(event.target.value);
                          setErrors((current) => ({ ...current, fileName: false }));
                        }}
                        placeholder="Nama file akan terisi otomatis, tapi tetap bisa diedit"
                        className={`w-full rounded-[14px] border px-4 py-3 text-[13px] text-[#273240] outline-none transition focus:border-[#15803d] focus:ring-2 focus:ring-[#d1fae5] ${
                          errors.fileName ? "border-[#c53030]" : "border-[#dfe5ea]"
                        }`}
                      />
                      {errors.fileName ? <span className="text-[10px] text-[#c53030]">Nama file wajib diisi</span> : null}
                    </div>

                    <AttachmentVisual item={{
                      previewUrl: selectedFile && selectedFile.type.startsWith("image/") ? URL.createObjectURL(selectedFile) : null,
                      mimeType: selectedFile?.type,
                      fileName,
                    }} />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0fdf8] text-[#15803d]">
                    <Lock size={15} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#243041]">Hidden Metadata</h3>
                    <p className="text-[12px] text-[#7c8793]">Ini auto dari sistem. Yang dipakai modul untuk menarik attachment adalah pasangan `Module Name` dan `Record ID`.</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <ReadonlyField label="Module Name" value={activeContext?.moduleName} icon={FolderKanban} />
                  <ReadonlyField label="Record ID" value={activeContext?.recordId} icon={Link2} />
                  <ReadonlyField label="Uploaded By" value={activeContext?.uploadedBy} icon={UserRound} />
                  <ReadonlyField label="Uploaded At" value={formatDateTime(new Date().toISOString())} icon={CalendarDays} />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#edf1f4] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] text-[#7a8793]">
                  Upload di sini akan jadi sumber utama attachment untuk semua modul.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => resetForm(activeContext)}
                    className="rounded-[12px] bg-[#eef2f5] px-4 py-2.5 text-[13px] font-semibold text-[#5a6672] hover:bg-[#e6ebef]"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-[12px] bg-[#15803d] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#126c33]"
                  >
                    <Plus size={15} />
                    Simpan Attachment
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="border-[#edf1f4]">
            <CardContent className="p-5">
              <h2 className="text-[17px] font-semibold text-[#1f2b38]">Ringkasan Modul</h2>
              <p className="mt-1 text-[12px] text-[#7c8793]">Attachment yang sudah tersebar per modul</p>
              <div className="mt-4 space-y-3">
                {moduleSummary.map((item) => (
                  <div key={item.moduleName} className="rounded-[18px] border border-[#edf1f4] bg-[#fafdfb] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold text-[#243041]">{item.moduleName}</p>
                        <p className="mt-1 text-[12px] text-[#7c8793]">{item.total} attachment</p>
                      </div>
                      <div className="rounded-full bg-[#edf9f1] px-3 py-1 text-[11px] font-semibold text-[#1f9b58]">
                        {item.imageCount} gambar
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] text-[#8b96a1]">Upload terakhir {formatDateTime(item.lastUpload)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#edf1f4]">
            <CardContent className="p-5">
              <h2 className="text-[17px] font-semibold text-[#1f2b38]">Preview Detail</h2>
              {selectedAttachment ? (
                <div className="mt-4 space-y-3">
                  <AttachmentVisual item={selectedAttachment} />
                  <div className="rounded-[18px] border border-[#edf1f4] bg-[#fafdfb] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">File Name</p>
                    <p className="mt-2 text-[14px] font-semibold text-[#243041]">{selectedAttachment.fileName}</p>
                  </div>
                  <ReadonlyField label="Module Name" value={selectedAttachment.moduleName} icon={FolderKanban} />
                  <ReadonlyField label="Record ID" value={selectedAttachment.recordId} icon={Link2} />
                  <ReadonlyField label="Uploaded By" value={selectedAttachment.uploadedBy} icon={UserRound} />
                  <ReadonlyField label="Uploaded At" value={formatDateTime(selectedAttachment.uploadedAt)} icon={CalendarDays} />
                </div>
              ) : (
                <p className="mt-4 text-[12px] text-[#8b96a1]">Belum ada attachment dipilih.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="overflow-hidden border-[#edf1f4]">
        <CardContent className="p-0">
          <div className="border-b border-[#edf1f4] px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[18px] font-semibold text-[#1f2b38]">Attachment Register</h2>
                <p className="mt-1 text-[12px] text-[#7c8793]">
                  Menampilkan {filteredAttachments.length} dari {attachments.length} attachment
                </p>
              </div>

              <div className="relative w-full lg:w-[300px]">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari file, modul, record id, uploader"
                  className="w-full rounded-[12px] border border-[#dfe5ea] bg-white py-2.5 pl-10 pr-3 text-[13px] text-[#273240] outline-none focus:border-[#15803d] focus:ring-2 focus:ring-[#d1fae5]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1080px] w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-[#fafbfc]">
                  {["Preview", "Attachment ID", "File Name", "Module", "Record ID", "Uploaded By", "Uploaded At", "Size", "Action"].map((head) => (
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
                {filteredAttachments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-14 text-center text-[13px] text-[#8b96a1]">
                      Belum ada attachment yang cocok dengan pencarian saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredAttachments.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-[#f0f3f5] align-top transition hover:bg-[#fcfcfd] ${
                        selectedAttachmentId === item.id ? "bg-[#f7fbf8]" : ""
                      }`}
                    >
                      <td className="px-3 py-3">
                        <div className="w-[92px]">
                          <AttachmentVisual item={item} compact />
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold text-[#283341]">{item.id}</td>
                      <td className="max-w-[280px] px-3 py-3">
                        <p className="font-medium leading-5 text-[#243041]">{item.fileName}</p>
                        <p className="mt-1 text-[11px] text-[#8b96a1]">Asli: {item.originalFileName}</p>
                      </td>
                      <td className="px-3 py-3 text-[#51606d]">{item.moduleName}</td>
                      <td className="px-3 py-3 text-[#51606d]">{item.recordId}</td>
                      <td className="px-3 py-3 text-[#51606d]">{item.uploadedBy}</td>
                      <td className="px-3 py-3 text-[#51606d]">{formatDateTime(item.uploadedAt)}</td>
                      <td className="px-3 py-3 text-[#51606d]">{item.sizeLabel}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setSelectedAttachmentId(item.id)}
                            className="inline-flex items-center gap-1 rounded-[9px] bg-[#f4f7f9] px-2.5 py-1.5 text-[11px] font-semibold text-[#4f5b67] hover:bg-[#e8edf2]"
                          >
                            <FileUp size={13} />
                            Preview
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
    </div>
  );
}
