"use client";

import AttachmentSection from "@/components/dashboard/attachment-section";

const MODULE_CONTEXTS = [
  { moduleName: "Incident Report", recordId: "INC-2026-014", uploadedBy: "QHSE Admin" },
  { moduleName: "Hazard Report", recordId: "HZD-2026-027", uploadedBy: "Safety Officer" },
  { moduleName: "NCR", recordId: "NCR-2026-013", uploadedBy: "Superintendent" },
  { moduleName: "Security Record", recordId: "SEC-005", uploadedBy: "Port Security" },
  { moduleName: "STF & VIR", recordId: "VIR-2026-008", uploadedBy: "Marine Inspector" },
];

const INITIAL_ATTACHMENTS = [
  {
    id: "ATT-001",
    fileName: "evidence-ncr-bridge-checklist.pdf",
    originalFileName: "bridge-checklist-revisi.pdf",
    moduleName: "NCR",
    recordId: "NCR-2026-013",
    uploadedBy: "Superintendent",
    uploadedAt: "2026-04-28T09:10:00.000Z",
    sizeLabel: "1.8 MB",
  },
  {
    id: "ATT-002",
    fileName: "foto-cctv-main-deck-night.jpg",
    originalFileName: "main-deck-night-shot.jpg",
    moduleName: "Security Record",
    recordId: "SEC-005",
    uploadedBy: "Port Security",
    uploadedAt: "2026-04-27T20:35:00.000Z",
    sizeLabel: "2.4 MB",
  },
  {
    id: "ATT-003",
    fileName: "incident-scene-overview.png",
    originalFileName: "scene-overview.png",
    moduleName: "Incident Report",
    recordId: "INC-2026-014",
    uploadedBy: "QHSE Admin",
    uploadedAt: "2026-04-26T11:45:00.000Z",
    sizeLabel: "860 KB",
  },
];

export default function AttachmentPage() {
  return (
    <AttachmentSection
      title="Evidence & Attachment Center"
      description="Halaman ini didesain sebagai pola attachment yang bisa dipakai di semua modul, dengan file input yang sederhana dan metadata sistem yang otomatis tercatat."
      badgeLabel="Shared Attachment Hub"
      contexts={MODULE_CONTEXTS}
      initialAttachments={INITIAL_ATTACHMENTS}
    />
  );
}
