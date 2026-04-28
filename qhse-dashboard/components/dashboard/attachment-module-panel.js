"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, Eye, FileImage, FileText, FolderKanban, Link2, Paperclip } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { isImageAttachment, readAttachmentStore } from "@/lib/attachment-store";

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

function AttachmentVisual({ item }) {
  if (isImageAttachment(item)) {
    return (
      <Image
        src={item.previewUrl}
        alt={item.fileName}
        width={320}
        height={180}
        unoptimized
        className="h-24 w-full rounded-[14px] object-cover"
      />
    );
  }

  return (
    <div className="flex h-24 w-full items-center justify-center rounded-[14px] border border-dashed border-[#d8e2e7] bg-[#f8fbf9]">
      <div className="text-center">
        <FileText size={20} className="mx-auto text-[#7c8793]" />
        <p className="mt-2 text-[10px] font-medium text-[#6f7c89]">Dokumen</p>
      </div>
    </div>
  );
}

export default function AttachmentModulePanel({
  title = "Attachment Modul",
  description = "Menampilkan hasil upload attachment yang terkait dengan record pada modul ini.",
  contexts = [],
  seedAttachments = [],
}) {
  const [attachments] = useState(() => readAttachmentStore(seedAttachments));
  const [activeRecordId, setActiveRecordId] = useState(contexts[0]?.recordId || null);

  const filteredAttachments = useMemo(() => {
    const validIds = new Set(contexts.map((item) => item.recordId));
    return attachments.filter(
      (item) => item.moduleName === contexts[0]?.moduleName && validIds.has(item.recordId),
    );
  }, [attachments, contexts]);

  const previewItems = useMemo(() => {
    return filteredAttachments.filter((item) => item.recordId === activeRecordId);
  }, [filteredAttachments, activeRecordId]);

  return (
    <section className="rounded-[22px] border border-[#dfe9e3] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#edf9f1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1f9b58]">
            <Paperclip size={14} />
            Module Attachment
          </div>
          <h2 className="mt-3 text-[22px] font-bold text-[#1f2b38]">{title}</h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-6 text-[#6f7c89]">{description}</p>
        </div>

        <div className="relative min-w-[220px]">
          <select
            value={activeRecordId || ""}
            onChange={(event) => setActiveRecordId(event.target.value)}
            className="w-full appearance-none rounded-[14px] border border-[#dfe5ea] bg-white px-4 py-3 pr-10 text-[12px] font-semibold text-[#243041] outline-none transition focus:border-[#15803d] focus:ring-2 focus:ring-[#d1fae5]"
          >
            {contexts.map((context) => (
              <option key={context.recordId} value={context.recordId}>
                {context.recordId} - {context.uploadedBy}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b96a1]" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-[#edf1f4]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[#1f2b38]">Hasil Attachment Record</h3>
                <p className="mt-1 text-[12px] text-[#7c8793]">
                  File yang muncul di sini berasal dari upload pusat di halaman Attachment.
                </p>
              </div>
              <div className="rounded-full bg-[#edf9f1] px-3 py-1 text-[11px] font-semibold text-[#1f9b58]">
                {previewItems.length} file
              </div>
            </div>

            {previewItems.length === 0 ? (
              <div className="mt-6 rounded-[18px] border border-dashed border-[#d8e2e7] bg-[#f8fbf9] px-5 py-10 text-center">
                <Paperclip size={24} className="mx-auto text-[#8b96a1]" />
                <p className="mt-3 text-[13px] font-medium text-[#52606d]">Belum ada attachment untuk record ini</p>
                <p className="mt-1 text-[12px] text-[#8b96a1]">
                  Upload file dulu lewat halaman Attachment dengan `record id` yang sama.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {previewItems.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-[#edf1f4] bg-[#fafdfb] p-4">
                    <AttachmentVisual item={item} />
                    <div className="mt-3">
                      <p className="text-[13px] font-semibold text-[#243041]">{item.fileName}</p>
                      <p className="mt-1 text-[11px] text-[#7c8793]">{item.sizeLabel}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#7c8793]">
                      <span>{formatDateTime(item.uploadedAt)}</span>
                      <span className="inline-flex items-center gap-1 text-[#52606d]">
                        <Eye size={12} />
                        Preview
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#edf1f4]">
          <CardContent className="p-5">
            <h3 className="text-[16px] font-semibold text-[#1f2b38]">Context Aktif</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-[16px] border border-[#edf1f4] bg-[#fafdfb] px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                  <FolderKanban size={13} />
                  Module Name
                </div>
                <p className="mt-2 text-[13px] font-medium text-[#243041]">{contexts[0]?.moduleName || "-"}</p>
              </div>
              <div className="rounded-[16px] border border-[#edf1f4] bg-[#fafdfb] px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                  <Link2 size={13} />
                  Record ID
                </div>
                <p className="mt-2 text-[13px] font-medium text-[#243041]">{activeRecordId || "-"}</p>
              </div>
              <div className="rounded-[16px] border border-[#edf1f4] bg-[#fafdfb] px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]">
                  <FileImage size={13} />
                  Matching Files
                </div>
                <p className="mt-2 text-[13px] font-medium text-[#243041]">{previewItems.length} attachment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
