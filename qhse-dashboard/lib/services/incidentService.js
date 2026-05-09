import { supabase } from "@/lib/supabase";

const TABLE_NAME = "tr_insiden";

function normalizeStatus(status) {
  const normalized = String(status || "open")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");

  const statusMap = {
    open: "open",
    on_progress: "on_progress",
    progress: "on_progress",
    closed: "closed",
    close: "closed",
    overdue: "overdue",
  };

  return statusMap[normalized] || normalized || "open";
}

function toDatabasePayload(payload) {
  return {
    no_insiden: payload.id || payload.no_insiden,
    no_referensi_client: payload.ref || null,

    tugboat_id: payload.tugboat_id || null,
    barge_id: payload.barge_id || null,

    tugboat_name: payload.tugboat || payload.tugboat_name || null,
    barge_name: payload.barge || payload.barge_name || null,

    tanggal_mulai: payload.start || null,
    tanggal_selesai: payload.end || null,

    durasi_downtime:
      payload.duration === "" || payload.duration === null || payload.duration === undefined
        ? null
        : Number(payload.duration),

    koordinat: payload.coord || null,
    level: payload.level || null,
    kategori_insiden: payload.category || null,
    lokasi: payload.location || null,
    responsibility: payload.resp || null,
    owner_group: payload.owner || null,
    deskripsi: payload.desc || null,

    status: normalizeStatus(payload.status),
  };
}

function fromDatabaseRow(row) {
  return {
    id: row.no_insiden,
    ref: row.no_referensi_client || "",

    tugboat_id: row.tugboat_id,
    barge_id: row.barge_id,

    tugboat: row.tugboat_name || "",
    barge: row.barge_name || "",

    start: row.tanggal_mulai || "",
    end: row.tanggal_selesai || "",

    duration: row.durasi_downtime ?? "",
    coord: row.koordinat || "",
    level: row.level || "",
    category: row.kategori_insiden || "",
    location: row.lokasi || "",
    resp: row.responsibility || "",
    owner: row.owner_group || "",
    desc: row.deskripsi || "",
    status: normalizeStatus(row.status),
  };
}

export async function getIncidentList() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("tanggal_mulai", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromDatabaseRow);
}

export async function getIncidentById(noInsiden) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("no_insiden", noInsiden)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromDatabaseRow(data);
}

export async function createIncident(payload) {
  const cleanPayload = toDatabasePayload(payload);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([cleanPayload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromDatabaseRow(data);
}

export async function updateIncident(noInsiden, payload) {
  const cleanPayload = toDatabasePayload(payload);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(cleanPayload)
    .eq("no_insiden", noInsiden)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromDatabaseRow(data);
}

export async function deleteIncident(noInsiden) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("no_insiden", noInsiden);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function searchIncident(keyword) {
  const searchText = keyword?.trim();

  if (!searchText) {
    return getIncidentList();
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .or(
      [
        `no_insiden.ilike.%${searchText}%`,
        `no_referensi_client.ilike.%${searchText}%`,
        `tugboat_name.ilike.%${searchText}%`,
        `barge_name.ilike.%${searchText}%`,
        `kategori_insiden.ilike.%${searchText}%`,
        `lokasi.ilike.%${searchText}%`,
        `deskripsi.ilike.%${searchText}%`,
      ].join(",")
    )
    .order("tanggal_mulai", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromDatabaseRow);
}
