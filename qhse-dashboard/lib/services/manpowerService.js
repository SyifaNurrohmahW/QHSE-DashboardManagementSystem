import { supabase } from "@/lib/supabase";

const TABLE_NAME = "tr_manpower";

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

const MANPOWER_CATEGORY_VALUES = {
  "MBP BJM": "mbp_bjm",
  mbp_bjm: "mbp_bjm",

  ISS: "iss",
  iss: "iss",

  Crew: "crew",
  crew: "crew",

  Officer: "officer",
  officer: "officer",

  Engineer: "engineer",
  engineer: "engineer",

  Deck: "deck",
  deck: "deck",

  Office: "office",
  office: "office",

  QHSE: "qhse",
  qhse: "qhse",

  Operational: "operational",
  operational: "operational",

  Other: "other",
  other: "other",
};

const MANPOWER_CATEGORY_LABELS = {
  mbp_bjm: "MBP BJM",
  iss: "ISS",
  crew: "Crew",
  officer: "Officer",
  engineer: "Engineer",
  deck: "Deck",
  office: "Office",
  qhse: "QHSE",
  operational: "Operational",
  other: "Other",
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

function normalizeCategory(value) {
  if (!value) return null;

  const trimmedValue = String(value).trim();

  return MANPOWER_CATEGORY_VALUES[trimmedValue] || null;
}

function toNumberOrZero(value) {
  if (value === "" || value === null || value === undefined) return 0;

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return 0;

  return numberValue;
}

function toDatabasePayload(payload) {
  const bulan = normalizeMonth(payload.bulan);
  const kategori = normalizeCategory(payload.kategori);

  if (!payload.tahun) {
    throw new Error("Tahun wajib diisi.");
  }

  if (!bulan) {
    throw new Error("Bulan tidak valid.");
  }

  if (!kategori) {
    throw new Error("Kategori manpower tidak valid.");
  }

  return {
    tahun: Number(payload.tahun),
    bulan,
    kategori,
    jumlah_orang: toNumberOrZero(payload.jumlahOrang ?? payload.jumlah_orang),
    keterangan: payload.keterangan?.trim() || null,
  };
}

function fromDatabaseRow(row) {
  return {
    id: row.id,
    tahun: row.tahun,
    bulan: MONTH_LABELS[row.bulan] || row.bulan,
    bulanNumber: row.bulan,

    kategori: MANPOWER_CATEGORY_LABELS[row.kategori] || row.kategori || "",
    kategoriValue: row.kategori || "",

    jumlahOrang: row.jumlah_orang ?? 0,
    keterangan: row.keterangan || "",

    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getManpowerList() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false })
    .order("kategori", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map(fromDatabaseRow);
}

export async function getManpowerById(id) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return fromDatabaseRow(data);
}

export async function createManpower(payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);

  const cleanPayload = {
    ...toDatabasePayload(payload),
    created_by: user?.id || null,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([cleanPayload])
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return fromDatabaseRow(data);
}

export async function updateManpower(id, payload) {
  const cleanPayload = toDatabasePayload(payload);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(cleanPayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return fromDatabaseRow(data);
}

export async function deleteManpower(id) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) throw new Error(error.message);

  return true;
}

export const MANPOWER_MONTH_OPTIONS = Object.entries(MONTH_LABELS).map(
  ([value, label]) => ({
    value: Number(value),
    label,
  })
);

export const MANPOWER_CATEGORY_OPTIONS = [
  { label: "MBP BJM", value: "mbp_bjm" },
  { label: "ISS", value: "iss" },
  { label: "Crew", value: "crew" },
  { label: "Officer", value: "officer" },
  { label: "Engineer", value: "engineer" },
  { label: "Deck", value: "deck" },
  { label: "Office", value: "office" },
  { label: "QHSE", value: "qhse" },
  { label: "Operational", value: "operational" },
  { label: "Other", value: "other" },
];