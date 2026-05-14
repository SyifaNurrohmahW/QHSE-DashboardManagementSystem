import { supabase } from "@/lib/supabase";

const TABLE_NAME = "tr_attachments";
const BUCKET_NAME = "attachments";

export const ATTACHMENT_MODULE_OPTIONS = [
  {
    label: "Incident Report",
    value: "incident",
  },
  {
    label: "Hazard Report",
    value: "hazard_report",
  },
  {
    label: "NCR",
    value: "ncr",
  },
  {
    label: "Security Record",
    value: "security_record",
  },
  {
    label: "STF & VIR",
    value: "stf_vir",
  },
  {
    label: "LSA & FFA",
    value: "lsa_ffa",
  },
];

function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

function getFilePath({ moduleName, recordId, file }) {
  const cleanModuleName = String(moduleName || "general")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");

  const cleanFileName = sanitizeFileName(file.name);
  const timestamp = Date.now();

  return `${cleanModuleName}/${recordId}/${timestamp}-${cleanFileName}`;
}

function formatRoleName(role) {
  const labels = {
    superadmin: "Super Admin",
    admin: "Admin",
    viewer: "Viewer",
  };

  return labels[role] || role || "";
}

function getDisplayNameFromUser(user, role = "") {
  const metadata = user?.user_metadata || {};

  return (
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    formatRoleName(role) ||
    user?.email?.split("@")[0] ||
    "User"
  );
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

async function getCurrentUploaderName() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("User belum login.");

  const { data: role } = await supabase.rpc("get_current_user_role");

  return {
    user,
    displayName: getDisplayNameFromUser(user, role),
  };
}

export async function getCurrentAttachmentUploaderName() {
  const currentUploader = await getCurrentUploaderName();
  return currentUploader.displayName;
}

function resolveUploadedBy(value, currentUploader = null) {
  if (!value) return "-";

  if (currentUploader?.user?.id === value) {
    return currentUploader.displayName;
  }

  if (isUuid(value)) {
    return currentUploader?.displayName || "Super Admin";
  }

  return value;
}

function fromDatabaseRow(row, currentUploader = null) {
  return {
    id: row.id,
    moduleName: row.module_name,
    recordId: row.record_id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    uploadedBy: resolveUploadedBy(row.uploaded_by, currentUploader),
    uploadedAt: row.uploaded_at,
  };
}

export async function getAttachments() {
  let currentUploader = null;

  try {
    currentUploader = await getCurrentUploaderName();
  } catch {
    currentUploader = null;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((row) => fromDatabaseRow(row, currentUploader));
}

export async function getAttachmentsByRecord(moduleName, recordId) {
  let currentUploader = null;

  try {
    currentUploader = await getCurrentUploaderName();
  } catch {
    currentUploader = null;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("module_name", moduleName)
    .eq("record_id", recordId)
    .order("uploaded_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((row) => fromDatabaseRow(row, currentUploader));
}

export async function uploadAttachment({ moduleName, recordId, file }) {
  if (!moduleName) throw new Error("Module wajib dipilih.");
  if (!recordId) throw new Error("Record wajib dipilih.");
  if (!file) throw new Error("File wajib dipilih.");

  const currentUploader = await getCurrentUploaderName();

  const filePath = getFilePath({
    moduleName,
    recordId,
    file,
  });

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([
      {
        module_name: moduleName,
        record_id: recordId,
        file_name: file.name,
        file_url: publicUrl,
        uploaded_by: currentUploader.user.id,
      },
    ])
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    throw new Error(error.message);
  }

  return fromDatabaseRow(data, currentUploader);
}

export async function deleteAttachment(id) {
  const { data: attachment, error: fetchError } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  await removeStorageFileFromUrl(attachment.file_url);

  return true;
}

async function removeStorageFileFromUrl(fileUrl) {
  if (!fileUrl) return;

  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = fileUrl.indexOf(marker);

  if (index === -1) return;

  const filePath = decodeURIComponent(fileUrl.slice(index + marker.length));

  if (!filePath) return;

  await supabase.storage.from(BUCKET_NAME).remove([filePath]);
}

export async function getAttachmentRecordOptions(moduleName) {
  if (!moduleName) return [];

  if (moduleName === "incident") {
    return getIncidentRecordOptions();
  }

  if (moduleName === "hazard_report") {
    return getHazardRecordOptions();
  }

  if (moduleName === "ncr") {
    return getNcrRecordOptions();
  }

  if (moduleName === "security_record") {
    return getSecurityRecordOptions();
  }

  if (moduleName === "stf_vir") {
    return getStfVirRecordOptions();
  }

  if (moduleName === "lsa_ffa") {
    return getLsaFfaRecordOptions();
  }

  return [];
}

async function getIncidentRecordOptions() {
  const { data, error } = await supabase
    .from("tr_insiden")
    .select("id, no_insiden, tanggal_mulai, deskripsi")
    .order("tanggal_mulai", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((item) => ({
    value: item.id,
    label: item.no_insiden || item.id,
    description: item.deskripsi || "",
  }));
}

async function getHazardRecordOptions() {
  const { data, error } = await supabase
    .from("tr_hazard_report")
    .select(`
      id,
      tahun,
      bulan,
      kapal_id,
      ms_kapal:kapal_id (
        nama_kapal,
        kode_kapal
      )
    `)
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((item) => ({
    value: item.id,
    label: `${item.ms_kapal?.nama_kapal || "Kapal"} - ${item.bulan}/${item.tahun}`,
    description: item.ms_kapal?.kode_kapal || "",
  }));
}

async function getNcrRecordOptions() {
  const { data, error } = await supabase
    .from("tr_ncr")
    .select(`
      id,
      ncr_no,
      tanggal_release,
      section,
      kapal_id,
      ms_kapal:kapal_id (
        nama_kapal,
        kode_kapal
      )
    `)
    .order("tanggal_release", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((item) => ({
    value: item.id,
    label: item.ncr_no || item.id,
    description: `${item.ms_kapal?.nama_kapal || "-"} • ${item.section || "-"}`,
  }));
}

async function getSecurityRecordOptions() {
  const { data, error } = await supabase
    .from("tr_security_record")
    .select(`
      id,
      tahun,
      bulan,
      no_urut,
      tanggal,
      kapal_id,
      ms_kapal:kapal_id (
        nama_kapal,
        kode_kapal
      )
    `)
    .order("tanggal", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((item) => ({
    value: item.id,
    label: `SEC-${item.tahun}-${String(item.no_urut || 0).padStart(3, "0")}`,
    description: `${item.ms_kapal?.nama_kapal || "-"} • Bulan ${item.bulan}`,
  }));
}

async function getStfVirRecordOptions() {
  const { data, error } = await supabase
    .from("tr_stf_vir")
    .select(`
      id,
      tahun,
      bulan,
      tipe_report,
      kapal_id,
      ms_kapal:kapal_id (
        nama_kapal,
        kode_kapal
      )
    `)
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((item) => ({
    value: item.id,
    label: `${item.tipe_report || "STF/VIR"} - ${item.bulan}/${item.tahun}`,
    description: item.ms_kapal?.nama_kapal || "-",
  }));
}

async function getLsaFfaRecordOptions() {
  const { data, error } = await supabase
    .from("tr_lsa_ffa")
    .select(`
      id,
      jenis_equipment,
      next_inspection_date,
      kapal_id,
      ms_kapal:kapal_id (
        nama_kapal,
        kode_kapal
      )
    `)
    .order("next_inspection_date", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((item) => ({
    value: item.id,
    label: item.jenis_equipment || item.id,
    description: `${item.ms_kapal?.nama_kapal || "-"} • ${item.next_inspection_date || "-"}`,
  }));
}
