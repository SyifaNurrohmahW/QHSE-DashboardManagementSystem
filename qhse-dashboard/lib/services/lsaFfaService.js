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
  PMK: "PMK_II",
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

  LIFERAFT: "LIFERAFT",
  LIFEFRAFT: "LIFERAFT",
};

const JENIS_EQUIPMENT_LABELS = {
  PMK_II: "PMK",
  EPIRB_REG_TEST_BASARNAS: "EPIRB REG TEST BASARNAS",
  SERT_HRU_LIFERAFT: "SERT HRU LIFERAFT",
  Co2_System: "Co2 System",
  SCBA: "SCBA",
  EEBD: "EEBD",
  Gas_Detector: "Gas Detector",
  HRU_EPIRB: "HRU EPIRB",
  LIFERAFT: "LIFERAFT",
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

function parseDateOnly(value) {
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function calculateInspectionMonths(start, next, options = {}) {
  const startDate = parseDateOnly(start);
  const nextDate = parseDateOnly(next);
  if (!startDate || !nextDate) return null;
  if (nextDate < startDate) {
    if (options.throwOnInvalid) {
      throw new Error("Next inspection tidak boleh lebih awal dari start inspection.");
    }
    return null;
  }

  const months =
    (nextDate.getFullYear() - startDate.getFullYear()) * 12 +
    (nextDate.getMonth() - startDate.getMonth()) -
    (nextDate.getDate() < startDate.getDate() ? 1 : 0);

  return Math.max(0, months);
}

function toDatabasePayload(payload) {
  const jenisEquipment = normalizeJenisEquipment(
    payload.jenisEquipment || payload.jenis_equipment
  );

  const status = normalizeEquipmentStatus(payload.status);
  const lastInspectionDate =
    payload.lastInspectionDate || payload.last_inspection_date || null;
  const nextInspectionDate =
    payload.nextInspectionDate || payload.next_inspection_date || null;
  const alertMonths = calculateInspectionMonths(lastInspectionDate, nextInspectionDate, { throwOnInvalid: true });

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
    last_inspection_date: lastInspectionDate,
    next_inspection_date: nextInspectionDate,
    bulan_expired:
      payload.bulanExpired?.trim() || payload.bulan_expired?.trim() || null,
    alert_days: alertMonths,
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
    alertDays: calculateInspectionMonths(row.last_inspection_date, row.next_inspection_date) ?? "",

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
  { label: "PMK", value: "PMK_II" },
  { label: "EPIRB REG TEST BASARNAS", value: "EPIRB_REG_TEST_BASARNAS" },
  { label: "SERT HRU LIFERAFT", value: "SERT_HRU_LIFERAFT" },
  { label: "Co2 System", value: "Co2_System" },
  { label: "SCBA", value: "SCBA" },
  { label: "EEBD", value: "EEBD" },
  { label: "Gas Detector", value: "Gas_Detector" },
  { label: "HRU EPIRB", value: "HRU_EPIRB" },
  { label: "LIFERAFT", value: "LIFERAFT" },
];
