import { supabase } from "@/lib/supabase";

const TABLE_NAME = "tr_lsa_ffa";

const EQUIPMENT_STATUS_VALUES = {
  Sudah: "sudah",
  Belum: "belum",
  Expired: "expired",
  "Perlu Perbaikan": "perlu_perbaikan",
  Nil: "nil",
  Proses: "proses",

  sudah: "sudah",
  belum: "belum",
  expired: "expired",
  perlu_perbaikan: "perlu_perbaikan",
  nil: "nil",
  proses: "proses",
};

const EQUIPMENT_STATUS_LABELS = {
  sudah: "Sudah",
  belum: "Belum",
  expired: "Expired",
  perlu_perbaikan: "Perlu Perbaikan",
  nil: "Nil",
  proses: "Proses",
};

const JENIS_EQUIPMENT_VALUES = {
  "PMK II": "PMK_II",
  PMK_II: "PMK_II",

  "EPIRB REG TEST BASARNAS": "EPIRB_REG_TEST_BASARNAS",
  EPIRB_REG_TEST_BASARNAS: "EPIRB_REG_TEST_BASARNAS",

  "SERT HRU LIFERAFT": "SERT_HRU_LIFERAFT",
  SERT_HRU_LIFERAFT: "SERT_HRU_LIFERAFT",

  "Co2 System": "Co2_System",
  Co2_System: "Co2_System",

  SCBA: "SCBA",
  EEBD: "EEBD",

  "Gas Detector": "Gas_Detector",
  Gas_Detector: "Gas_Detector",

  "HRU EPIRB": "HRU_EPIRB",
  HRU_EPIRB: "HRU_EPIRB",
};

const JENIS_EQUIPMENT_LABELS = {
  PMK_II: "PMK II",
  EPIRB_REG_TEST_BASARNAS: "EPIRB REG TEST BASARNAS",
  SERT_HRU_LIFERAFT: "SERT HRU LIFERAFT",
  Co2_System: "Co2 System",
  SCBA: "SCBA",
  EEBD: "EEBD",
  Gas_Detector: "Gas Detector",
  HRU_EPIRB: "HRU EPIRB",
};

function normalizeEquipmentStatus(value) {
  if (!value) return null;

  const normalizedValue = String(value).trim();

  return EQUIPMENT_STATUS_VALUES[normalizedValue] || null;
}

function normalizeJenisEquipment(value) {
  if (!value) return null;

  const normalizedValue = String(value).trim();

  return JENIS_EQUIPMENT_VALUES[normalizedValue] || null;
}

function toDatabasePayload(payload) {
  const jenisEquipment = normalizeJenisEquipment(
    payload.jenisEquipment || payload.jenis_equipment
  );

  const status = normalizeEquipmentStatus(payload.status);

  if (!payload.kapal_id) {
    throw new Error("Kapal wajib dipilih.");
  }

  if (!jenisEquipment) {
    throw new Error("Jenis equipment tidak valid.");
  }

  return {
    kapal_id: payload.kapal_id,
    jenis_equipment: jenisEquipment,
    qty:
      payload.qty === "" ||
      payload.qty === null ||
      payload.qty === undefined
        ? null
        : String(payload.qty).trim(),
    last_inspection_date:
      payload.lastInspectionDate || payload.last_inspection_date || null,
    next_inspection_date:
      payload.nextInspectionDate || payload.next_inspection_date || null,
    bulan_expired:
      payload.bulanExpired?.trim() || payload.bulan_expired?.trim() || null,
    alert_days:
      payload.alertDays === "" ||
      payload.alertDays === null ||
      payload.alertDays === undefined
        ? null
        : Number(payload.alertDays),
    status,
    keterangan: payload.keterangan?.trim() || null,
  };
}

function fromDatabaseRow(row) {
  return {
    id: row.id,

    kapal_id: row.kapal_id,
    kapal: row.ms_kapal?.nama_kapal || "-",
    kodeKapal: row.ms_kapal?.kode_kapal || "",

    jenisEquipment:
      JENIS_EQUIPMENT_LABELS[row.jenis_equipment] || row.jenis_equipment || "",
    jenisEquipmentValue: row.jenis_equipment || "",

    qty: row.qty || "",
    lastInspectionDate: row.last_inspection_date || "",
    nextInspectionDate: row.next_inspection_date || "",
    bulanExpired: row.bulan_expired || "",
    alertDays: row.alert_days ?? "",

    status: row.status || "",
    statusLabel: EQUIPMENT_STATUS_LABELS[row.status] || row.status || "",

    keterangan: row.keterangan || "",
  };
}

export async function getLsaFfaList() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`
      *,
      ms_kapal:kapal_id (
        id,
        kode_kapal,
        nama_kapal
      )
    `)
    .order("next_inspection_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromDatabaseRow);
}

export async function getLsaFfaById(id) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`
      *,
      ms_kapal:kapal_id (
        id,
        kode_kapal,
        nama_kapal
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromDatabaseRow(data);
}

export async function createLsaFfa(payload) {
  const cleanPayload = toDatabasePayload(payload);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([cleanPayload])
    .select(`
      *,
      ms_kapal:kapal_id (
        id,
        kode_kapal,
        nama_kapal
      )
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromDatabaseRow(data);
}

export async function updateLsaFfa(id, payload) {
  const cleanPayload = toDatabasePayload(payload);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(cleanPayload)
    .eq("id", id)
    .select(`
      *,
      ms_kapal:kapal_id (
        id,
        kode_kapal,
        nama_kapal
      )
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromDatabaseRow(data);
}

export async function deleteLsaFfa(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function searchLsaFfa(keyword) {
  const searchText = keyword?.trim();

  if (!searchText) {
    return getLsaFfaList();
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`
      *,
      ms_kapal:kapal_id (
        id,
        kode_kapal,
        nama_kapal
      )
    `)
    .or(
      [
        `qty.ilike.%${searchText}%`,
        `bulan_expired.ilike.%${searchText}%`,
        `keterangan.ilike.%${searchText}%`,
      ].join(",")
    )
    .order("next_inspection_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromDatabaseRow);
}

export const LSA_FFA_STATUS_OPTIONS = [
  { label: "Sudah", value: "sudah" },
  { label: "Belum", value: "belum" },
  { label: "Expired", value: "expired" },
  { label: "Perlu Perbaikan", value: "perlu_perbaikan" },
  { label: "Nil", value: "nil" },
  { label: "Proses", value: "proses" },
];

export const LSA_FFA_EQUIPMENT_OPTIONS = [
  { label: "PMK II", value: "PMK_II" },
  { label: "EPIRB REG TEST BASARNAS", value: "EPIRB_REG_TEST_BASARNAS" },
  { label: "SERT HRU LIFERAFT", value: "SERT_HRU_LIFERAFT" },
  { label: "Co2 System", value: "Co2_System" },
  { label: "SCBA", value: "SCBA" },
  { label: "EEBD", value: "EEBD" },
  { label: "Gas Detector", value: "Gas_Detector" },
  { label: "HRU EPIRB", value: "HRU_EPIRB" },
];