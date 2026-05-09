import { supabase } from "@/lib/supabase";

const TABLE_NAME = "tr_security_record";

const MONTH_LABELS = {
  1: "JAN",
  2: "FEB",
  3: "MAR",
  4: "APR",
  5: "MAY",
  6: "JUN",
  7: "JUL",
  8: "AUG",
  9: "SEP",
  10: "OCT",
  11: "NOV",
  12: "DEC",
};

const MONTH_NUMBERS = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

function normalizeStatus(status) {
  return String(status || "open").trim().toLowerCase().replaceAll(" ", "_");
}

function toDatabasePayload(payload) {
  return {
    kapal_id: payload.kapal_id || null,
    tahun: Number(payload.tahun),
    bulan: typeof payload.bulan === "number" ? payload.bulan : MONTH_NUMBERS[payload.bulan],
    no_urut: Number(payload.noUrut),
    tanggal: payload.tanggal || null,
    deskripsi: payload.deskripsi?.trim() || null,
    keterangan: payload.keterangan?.trim() || null,
    status: normalizeStatus(payload.status),
  };
}

function fromDatabaseRow(row) {
  return {
    id: row.id,
    kapal_id: row.kapal_id || "",
    kapal: row.ms_kapal?.nama_kapal || "",
    tahun: row.tahun,
    bulan: MONTH_LABELS[row.bulan] || row.bulan,
    bulanNumber: row.bulan,
    noUrut: row.no_urut,
    tanggal: row.tanggal || "",
    deskripsi: row.deskripsi || "",
    keterangan: row.keterangan || "",
    status: normalizeStatus(row.status),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const securitySelect = `
  *,
  ms_kapal:kapal_id (
    id,
    kode_kapal,
    nama_kapal
  )
`;

export async function getSecurityRecords() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(securitySelect)
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false })
    .order("no_urut", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromDatabaseRow);
}

export async function createSecurityRecord(payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([{ ...toDatabasePayload(payload), created_by: user?.id || null }])
    .select(securitySelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromDatabaseRow(data);
}

export async function updateSecurityRecord(id, payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(toDatabasePayload(payload))
    .eq("id", id)
    .select(securitySelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromDatabaseRow(data);
}

export async function deleteSecurityRecord(id) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
