import { supabase } from "@/lib/supabase";

const TABLE_NAME = "tr_hazard_report";

function getDateFromYearMonth(tahun, bulan) {
  if (!tahun || !bulan) return "";
  return `${tahun}-${String(bulan).padStart(2, "0")}-01`;
}

function getYearMonthFromDate(dateString) {
  if (!dateString) {
    const now = new Date();

    return {
      tahun: now.getFullYear(),
      bulan: now.getMonth() + 1,
    };
  }

  const dateParts = String(dateString).match(/^(\d{4})-(\d{2})/);
  if (dateParts) {
    return {
      tahun: Number(dateParts[1]),
      bulan: Number(dateParts[2]),
    };
  }

  const date = new Date(dateString);

  return {
    tahun: date.getFullYear(),
    bulan: date.getMonth() + 1,
  };
}

function toDatabasePayload(payload) {
  const { tahun, bulan } = getYearMonthFromDate(payload.tanggal);

  return {
    kapal_id: payload.kapal_id || null,
    tanggal: payload.tanggal || null,
    tahun,
    bulan,
    target:
      payload.target === "" || payload.target === null || payload.target === undefined
        ? 0
        : Number(payload.target),
    total_report:
      payload.totalReport === "" || payload.totalReport === null || payload.totalReport === undefined
        ? 0
        : Number(payload.totalReport),
    keterangan: payload.keterangan?.trim() || null,
  };
}

function fromDatabaseRow(row) {
  return {
    id: row.id,
    kapal_id: row.kapal_id,
    kapal: row.ms_kapal?.nama_kapal || "-",
    tanggal: row.tanggal || getDateFromYearMonth(row.tahun, row.bulan),
    tahun: row.tahun,
    bulan: row.bulan,
    target: row.target ?? 0,
    totalReport: row.total_report ?? 0,
    keterangan: row.keterangan || "",
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getHazardReports() {
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
    .order("tanggal", { ascending: false, nullsFirst: false })
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromDatabaseRow);
}

export async function getHazardReportById(id) {
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

export async function createHazardReport(payload) {
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

export async function updateHazardReport(id, payload) {
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

export async function deleteHazardReport(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
