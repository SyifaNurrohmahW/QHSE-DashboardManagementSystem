"use client";

import AttachmentSection from "@/components/dashboard/attachment-section";
import { ATTACHMENT_MODULE_OPTIONS } from "@/lib/services/attachmentServices";

export default function AttachmentPage() {
  return (
    <AttachmentSection
      title="Evidence & Attachment Center"
      description="Halaman ini didesain sebagai pola attachment yang bisa dipakai di semua modul, dengan file input yang sederhana dan metadata sistem yang otomatis tercatat."
      badgeLabel="Shared Attachment Hub"
      contexts={ATTACHMENT_MODULE_OPTIONS}
    />
  );
}
