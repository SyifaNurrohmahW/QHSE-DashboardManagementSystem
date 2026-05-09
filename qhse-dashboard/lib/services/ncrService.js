import { supabase } from "@/lib/supabase";

const TABLE_NAME = "tr_ncr";

function toDatabasePayload(payload) {
  return {
    kapal_id: payload.kapal_id || null,
    ncr_no: payload.ncrNo?.trim() || payload.ncr_no?.trim() || null,
    tanggal_release: payload.tanggalRelease || payload.tanggal_release || null,
    section: payload.section?.trim() || null,
    status_ncr: payload.statusNcr || payload.status_ncr || null,
    temuan: payload.temuan?.trim() || null,
    akar_masalah: payload.akarMasalah?.trim() || payload.akar_masalah?.trim() || null,
    corrective_action:
      payload.correctiveAction?.trim() || payload.corrective_action?.trim() || null,
    preventive_action:
      payload.preventiveAction?.trim() || payload.preventive_action?.trim() || null,
    due_date: payload.dueDate || payload.due_date || null,
    status: payload.status || "open",
  };
}

function fromDatabaseRow(row) {
  return {
    id: row.id,
    kapal_id: row.kapal_id,
    kapal: row.ms_kapal?.nama_kapal || "-",
    kodeKapal: row.ms_kapal?.kode_kapal || "",

    ncrNo: row.ncr_no || "",
    tanggalRelease: row.tanggal_release || "",
    section: row.section || "",
    statusNcr: row.status_ncr || "",
    temuan: row.temuan || "",
    akarMasalah: row.akar_masalah || "",
    correctiveAction: row.corrective_action || "",
    preventiveAction: row.preventive_action || "",
    dueDate: row.due_date || "",
    status: row.status || "open",

    createdBy: row.created_by,
    closedBy: row.closed_by,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getNcrList() {
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
    .order("tanggal_release", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromDatabaseRow);
}

export async function getNcrById(id) {
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

export async function createNcr(payload) {
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

export async function updateNcr(id, payload) {
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

export async function closeNcr(id) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      status: "closed",
      closed_by: user?.id || null,
      closed_at: new Date().toISOString(),
    })
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

export async function reopenNcr(id) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      status: "open",
      closed_by: null,
      closed_at: null,
    })
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

export async function deleteNcr(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function searchNcr(keyword) {
  const searchText = keyword?.trim();

  if (!searchText) {
    return getNcrList();
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
        `ncr_no.ilike.%${searchText}%`,
        `section.ilike.%${searchText}%`,
        `status_ncr.ilike.%${searchText}%`,
        `temuan.ilike.%${searchText}%`,
        `akar_masalah.ilike.%${searchText}%`,
        `corrective_action.ilike.%${searchText}%`,
        `preventive_action.ilike.%${searchText}%`,
      ].join(",")
    )
    .order("tanggal_release", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromDatabaseRow);
}
