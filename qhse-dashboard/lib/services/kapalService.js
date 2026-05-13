import { supabase } from "@/lib/supabase";

const TABLE_NAME = "ms_kapal";

function normalizeKapalPayload(payload) {
  return {
    kode_kapal: (payload.kode_kapal ?? payload.kodeKapal)?.trim(),
    nama_kapal: (payload.nama_kapal ?? payload.namaKapal)?.trim(),
    tipe_kapal: payload.tipe_kapal ?? payload.tipeKapal,
    area: payload.area ?? payload.areaOperasi,
    owner_group: (payload.owner_group ?? payload.ownerGroup)?.trim() || null,
    status: payload.status || "Aktif",
  };
}

export function mapKapalFromRow(row) {
  return {
    id: row.id,
    kodeKapal: row.kode_kapal || "",
    namaKapal: row.nama_kapal || "",
    tipeKapal: row.tipe_kapal || "",
    ownerGroup: row.owner_group || "",
    areaOperasi: row.area || "",
    status: row.status || "Aktif",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getKapalList() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("nama_kapal", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapKapalFromRow);
}

export async function getKapalById(id) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapKapalFromRow(data);
}

export async function createKapal(payload) {
  const cleanPayload = normalizeKapalPayload(payload);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([cleanPayload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapKapalFromRow(data);
}

export async function updateKapal(id, payload) {
  const cleanPayload = normalizeKapalPayload(payload);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(cleanPayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapKapalFromRow(data);
}

export async function deleteKapal(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function searchKapal(keyword) {
  const searchText = keyword?.trim() || "";

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .or(`kode_kapal.ilike.%${searchText}%,nama_kapal.ilike.%${searchText}%`)
    .order("nama_kapal", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapKapalFromRow);
}


export async function getKapalOptions() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, kode_kapal, nama_kapal, tipe_kapal, area")
    .order("nama_kapal", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item) => ({
    label: item.kode_kapal
      ? `${item.nama_kapal} (${item.kode_kapal})`
      : item.nama_kapal,
    value: item.id,
    nama_kapal: item.nama_kapal,
    kode_kapal: item.kode_kapal,
    tipe_kapal: item.tipe_kapal,
    area: item.area,
  }));
}
