import { supabase } from "@/lib/supabase";

const TABLE_NAME = "tr_manhours";
const MANHOURS_DAYS = 31;
const MANHOURS_ALLOWANCE_PERCENT = 5;
const MANHOURS_MULTIPLIER = 1.05;

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

const AREA_VALUES = {
  lower: "lower",
  upper: "upper",
  shore: "shore",
  mip_taboneo: "mip_taboneo",

  Lower: "lower",
  Upper: "upper",
  Shore: "shore",
  "MIP Taboneo": "mip_taboneo",
  "MIP TABONEO": "mip_taboneo",
};

const AREA_LABELS = {
  lower: "Lower",
  upper: "Upper",
  shore: "Shore",
  mip_taboneo: "MIP Taboneo",
};

const TIPE_KAPAL_VALUES = {
  FC: "FC",
  TUG: "TUG",
  FTU: "FTU",
  SPB: "SPB",
  LCT: "LCT",
  PB: "PB",
  FOTB: "FOTB",

  fc: "FC",
  tug: "TUG",
  ftu: "FTU",
  spb: "SPB",
  lct: "LCT",
  pb: "PB",
  fotb: "FOTB",
};

const TIPE_KAPAL_LABELS = {
  FC: "FC",
  TUG: "TUG",
  FTU: "FTU",
  SPB: "SPB",
  LCT: "LCT",
  PB: "PB",
  FOTB: "FOTB",
};

function normalizeMonth(value) {
  if (!value) return null;

  if (typeof value === "number") {
    return value;
  }

  const parsedNumber = Number(value);

  if (!Number.isNaN(parsedNumber) && parsedNumber >= 1 && parsedNumber <= 12) {
    return parsedNumber;
  }

  return MONTH_NUMBERS[value] || null;
}

function normalizeArea(value) {
  if (!value) return null;

  const trimmedValue = String(value).trim();

  return AREA_VALUES[trimmedValue] || null;
}

function normalizeTipeKapal(value) {
  if (!value) return null;

  const trimmedValue = String(value).trim();

  return TIPE_KAPAL_VALUES[trimmedValue] || null;
}

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return null;
  }

  return numberValue;
}

function toNumberOrZero(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return numberValue;
}

function calculateManhours(avgNoOfCrews) {
  return Math.round(toNumberOrZero(avgNoOfCrews) * 24 * MANHOURS_DAYS * MANHOURS_MULTIPLIER);
}

function toDatabasePayload(payload) {
  const bulan = normalizeMonth(payload.bulan);
  const area = normalizeArea(payload.area);
  const tipeKapal = normalizeTipeKapal(payload.tipeKapal || payload.tipe_kapal);

  if (!payload.kapal_id) {
    throw new Error("Kapal wajib dipilih.");
  }

  if (!payload.tahun) {
    throw new Error("Tahun wajib diisi.");
  }

  if (!bulan) {
    throw new Error("Bulan tidak valid.");
  }

  if (!area) {
    throw new Error("Area operasi tidak valid.");
  }

  if (!tipeKapal) {
    throw new Error("Tipe kapal tidak valid.");
  }

  return {
    kapal_id: payload.kapal_id,
    tahun: Number(payload.tahun),
    bulan,
    area,

    avg_no_of_crews: toNumberOrZero(
      payload.avgNoOfCrews ?? payload.avg_no_of_crews
    ),

    keterangan: payload.keterangan?.trim() || null,

    tipe_kapal: tipeKapal,

    standard_crew: toNumberOrNull(
      payload.standardCrew ?? payload.standard_crew
    ),

    allowance_percent: toNumberOrNull(
      payload.allowancePercent ?? payload.allowance_percent
    ),
  };
}

function fromDatabaseRow(row) {
  const avgNoOfCrews = row.avg_no_of_crews ?? 0;

  return {
    id: row.id,

    kapal_id: row.kapal_id,
    kapal: row.ms_kapal?.nama_kapal || "-",
    kodeKapal: row.ms_kapal?.kode_kapal || "",

    tahun: row.tahun,
    bulan: MONTH_LABELS[row.bulan] || row.bulan,
    bulanNumber: row.bulan,

    area: AREA_LABELS[row.area] || row.area || "",
    areaValue: row.area || "",

    avgNoOfCrews,
    manhours: calculateManhours(avgNoOfCrews),

    keterangan: row.keterangan || "",

    tipeKapal: TIPE_KAPAL_LABELS[row.tipe_kapal] || row.tipe_kapal || "",
    tipeKapalValue: row.tipe_kapal || "",

    standardCrew: row.standard_crew ?? "",
    allowancePercent: MANHOURS_ALLOWANCE_PERCENT,
    daysInMonth: MANHOURS_DAYS,

    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getManhoursList() {
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

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromDatabaseRow);
}

export async function getManhoursById(id) {
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

export async function createManhours(payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const cleanPayload = {
    ...toDatabasePayload(payload),
    created_by: user?.id || null,
  };

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

export async function updateManhours(id, payload) {
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

export async function deleteManhours(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function searchManhours(keyword) {
  const searchText = keyword?.trim();

  if (!searchText) {
    return getManhoursList();
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
        `keterangan.ilike.%${searchText}%`,
      ].join(",")
    )
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromDatabaseRow);
}

export const MANHOURS_MONTH_OPTIONS = Object.entries(MONTH_LABELS).map(
  ([value, label]) => ({
    value: Number(value),
    label,
  })
);

export const MANHOURS_AREA_OPTIONS = [
  { label: "Lower", value: "lower" },
  { label: "Upper", value: "upper" },
  { label: "Shore", value: "shore" },
  { label: "MIP Taboneo", value: "mip_taboneo" },
];

export const MANHOURS_TIPE_KAPAL_OPTIONS = [
  { label: "FC", value: "FC" },
  { label: "TUG", value: "TUG" },
  { label: "FTU", value: "FTU" },
  { label: "SPB", value: "SPB" },
  { label: "LCT", value: "LCT" },
  { label: "PB", value: "PB" },
  { label: "FOTB", value: "FOTB" },
];
