import { supabase } from "@/lib/supabase";

const TABLE_NAME = "tr_stf_vir";

const MONTH_LABELS = {
  1: "Januari",
  2: "Februari",
  3: "Maret",
  4: "April",
  5: "Mei",
  6: "Juni",
  7: "Juli",
  8: "Agustus",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Desember",
};

const MONTH_NUMBERS = {
  Januari: 1,
  Februari: 2,
  Maret: 3,
  April: 4,
  Mei: 5,
  Juni: 6,
  Juli: 7,
  Agustus: 8,
  September: 9,
  Oktober: 10,
  November: 11,
  Desember: 12,
};

const REPORT_TYPE_VALUES = {
  "STF & VIR": "stf_vir",
  "STF/VIR": "stf_vir",
  "STF VIR": "stf_vir",
  stf_vir: "stf_vir",

  "Management Visit": "management_visit",
  management_visit: "management_visit",
};

const REPORT_TYPE_LABELS = {
  stf_vir: "STF & VIR",
  management_visit: "Management Visit",
};

function normalizeMonth(value) {
  if (!value) return null;

  if (typeof value === "number") return value;

  const parsedNumber = Number(value);

  if (!Number.isNaN(parsedNumber) && parsedNumber >= 1 && parsedNumber <= 12) {
    return parsedNumber;
  }

  return MONTH_NUMBERS[value] || null;
}

function normalizeReportType(value) {
  if (!value) return null;

  const trimmedValue = String(value).trim();

  return REPORT_TYPE_VALUES[trimmedValue] || null;
}

function toDatabasePayload(payload) {
  const bulan = normalizeMonth(payload.bulan);
  const tipeReport = normalizeReportType(payload.tipeReport || payload.tipe_report);

  if (!payload.kapal_id) {
    throw new Error("Kapal wajib dipilih.");
  }

  if (!bulan) {
    throw new Error("Bulan tidak valid.");
  }

  if (!tipeReport) {
    throw new Error("Tipe report tidak valid.");
  }

  return {
    kapal_id: payload.kapal_id,
    tahun: Number(payload.tahun),
    bulan,
    tipe_report: tipeReport,
    target:
      payload.target === "" || payload.target === null || payload.target === undefined
        ? 0
        : Number(payload.target),
    total:
      payload.total === "" || payload.total === null || payload.total === undefined
        ? 0
        : Number(payload.total),
    keterangan: payload.keterangan?.trim() || null,
  };
}

function fromDatabaseRow(row) {
  return {
    id: row.id,
    kapal_id: row.kapal_id,
    kapal: row.ms_kapal?.nama_kapal || "-",
    kodeKapal: row.ms_kapal?.kode_kapal || "",
    tahun: row.tahun,
    bulan: MONTH_LABELS[row.bulan] || row.bulan,
    bulanNumber: row.bulan,
    tipeReport: REPORT_TYPE_LABELS[row.tipe_report] || row.tipe_report || "",
    tipeReportValue: row.tipe_report || "",
    target: row.target ?? 0,
    total: row.total ?? 0,
    keterangan: row.keterangan || "",
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getStfVirList() {
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
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map(fromDatabaseRow);
}

export async function createStfVir(payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);

  const cleanPayload = {
    ...toDatabasePayload(payload),
    created_by: user?.id || null,
  };

  console.log("STF VIR payload to DB:", cleanPayload);

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

  if (error) throw new Error(error.message);

  return fromDatabaseRow(data);
}

export async function updateStfVir(id, payload) {
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

  if (error) throw new Error(error.message);

  return fromDatabaseRow(data);
}

export async function deleteStfVir(id) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) throw new Error(error.message);

  return true;
}