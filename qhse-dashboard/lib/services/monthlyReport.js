import { supabase } from "@/lib/supabase";

const LAPORAN_TABLE = "tr_laporan";

const MONTHLY_MANHOURS_VIEW = "vw_monthly_manhours";
const MONTHLY_MANPOWER_VIEW = "vw_monthly_manpower_summary";
const MONTHLY_REPORT_VIEW = "vw_monthly_report";
const MANHOURS_TABLE = "tr_manhours";
const MANHOURS_DAYS = 31;
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

function monthKey(tahun, bulan) {
  return `${tahun}-${bulan}`;
}

async function getCalculatedMonthlyManhoursMap() {
  const { data, error } = await supabase
    .from(MANHOURS_TABLE)
    .select("tahun, bulan, avg_no_of_crews");

  if (error) {
    throw new Error(error.message);
  }

  return data.reduce((summary, row) => {
    const key = monthKey(row.tahun, row.bulan);
    summary[key] = (summary[key] || 0) + calculateManhours(row.avg_no_of_crews);
    return summary;
  }, {});
}

function mergeCalculatedManhours(reportRows, calculatedManhoursMap) {
  const reportByMonth = new Map(
    reportRows.map((item) => [monthKey(item.tahun, item.bulanNumber), item])
  );

  Object.entries(calculatedManhoursMap).forEach(([key, totalManhours]) => {
    const existing = reportByMonth.get(key);

    if (existing) {
      existing.totalManhours = totalManhours;
      return;
    }

    const [tahun, bulan] = key.split("-").map(Number);
    reportByMonth.set(key, {
      tahun,
      bulan: MONTH_LABELS[bulan] || bulan,
      bulanNumber: bulan,
      totalManhours,
      totalInsiden: 0,
      totalHazardReport: 0,
      totalNcr: 0,
      totalStfVir: 0,
      totalSecurityRecord: 0,
      totalManpowerFleet: 0,
      totalManpowerShore: 0,
      totalManpowerAll: 0,
      raw: { tahun, bulan, total_manhours: totalManhours },
    });
  });

  return [...reportByMonth.values()].sort((a, b) => {
    if (a.tahun !== b.tahun) return b.tahun - a.tahun;
    return b.bulanNumber - a.bulanNumber;
  });
}

function fromMonthlyReportViewRow(row) {
  return {
    tahun: row.tahun,
    bulan: MONTH_LABELS[row.bulan] || row.bulan,
    bulanNumber: row.bulan,

    totalManhours: row.total_manhours ?? 0,
    totalInsiden: row.total_insiden ?? 0,
    totalHazardReport: row.total_hazard_report ?? 0,
    totalNcr: row.total_ncr ?? 0,
    totalStfVir: row.total_stf_vir ?? 0,
    totalSecurityRecord: row.total_security_record ?? 0,

    totalManpowerFleet: row.total_manpower_fleet ?? 0,
    totalManpowerShore: row.total_manpower_shore ?? 0,
    totalManpowerAll: row.total_manpower_all ?? 0,

    raw: row,
  };
}

function fromMonthlyManhoursViewRow(row) {
  return {
    tahun: row.tahun,
    bulan: MONTH_LABELS[row.bulan] || row.bulan,
    bulanNumber: row.bulan,

    totalManhours: row.total_manhours ?? row.manhours ?? 0,
    totalCrew: row.total_crew ?? row.total_crews ?? 0,
    avgNoOfCrews: row.avg_no_of_crews ?? 0,

    raw: row,
  };
}

function fromMonthlyManpowerViewRow(row) {
  return {
    tahun: row.tahun,
    bulan: MONTH_LABELS[row.bulan] || row.bulan,
    bulanNumber: row.bulan,

    totalManpowerFleet: row.total_manpower_fleet ?? 0,
    totalManpowerShore: row.total_manpower_shore ?? 0,
    totalManpowerAll: row.total_manpower_all ?? 0,

    raw: row,
  };
}

function fromLaporanRow(row) {
  return {
    id: row.id,

    tahun: row.tahun,
    bulan: MONTH_LABELS[row.bulan] || row.bulan,
    bulanNumber: row.bulan,

    jenisLaporan: row.jenis_laporan || "monthly",

    totalManhours: row.total_manhours ?? 0,
    totalInsiden: row.total_insiden ?? 0,
    totalHazardReport: row.total_hazard_report ?? 0,
    totalNcr: row.total_ncr ?? 0,
    totalStfVir: row.total_stf_vir ?? 0,
    totalSecurityRecord: row.total_security_record ?? 0,

    totalManpowerFleet: row.total_manpower_fleet ?? 0,
    totalManpowerShore: row.total_manpower_shore ?? 0,
    totalManpowerAll: row.total_manpower_all ?? 0,

    catatan: row.catatan || "",

    generatedBy: row.generated_by,
    generatedAt: row.generated_at,

    raw: row,
  };
}

function toLaporanPayload(payload) {
  const bulan = normalizeMonth(payload.bulan);

  if (!payload.tahun) {
    throw new Error("Tahun wajib diisi.");
  }

  if (!bulan) {
    throw new Error("Bulan tidak valid.");
  }

  return {
    tahun: Number(payload.tahun),
    bulan,
    jenis_laporan: payload.jenisLaporan || payload.jenis_laporan || "monthly",

    total_manhours: toNumberOrZero(
      payload.totalManhours ?? payload.total_manhours
    ),

    total_insiden: toNumberOrZero(
      payload.totalInsiden ?? payload.total_insiden
    ),

    total_hazard_report: toNumberOrZero(
      payload.totalHazardReport ?? payload.total_hazard_report
    ),

    total_ncr: toNumberOrZero(
      payload.totalNcr ?? payload.total_ncr
    ),

    total_stf_vir: toNumberOrZero(
      payload.totalStfVir ?? payload.total_stf_vir
    ),

    total_security_record: toNumberOrZero(
      payload.totalSecurityRecord ?? payload.total_security_record
    ),

    total_manpower_fleet: toNumberOrZero(
      payload.totalManpowerFleet ?? payload.total_manpower_fleet
    ),

    total_manpower_shore: toNumberOrZero(
      payload.totalManpowerShore ?? payload.total_manpower_shore
    ),

    total_manpower_all: toNumberOrZero(
      payload.totalManpowerAll ?? payload.total_manpower_all
    ),

    catatan: payload.catatan?.trim() || null,
  };
}

/**
 * READ VIEW: vw_monthly_manhours
 */
export async function getMonthlyManhoursView() {
  const { data, error } = await supabase
    .from(MONTHLY_MANHOURS_VIEW)
    .select("*")
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromMonthlyManhoursViewRow);
}

export async function getMonthlyManhoursByPeriod(tahun, bulan) {
  const bulanNumber = normalizeMonth(bulan);

  const { data, error } = await supabase
    .from(MONTHLY_MANHOURS_VIEW)
    .select("*")
    .eq("tahun", Number(tahun))
    .eq("bulan", bulanNumber)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? fromMonthlyManhoursViewRow(data) : null;
}

/**
 * READ VIEW: vw_monthly_manpower_summary
 */
export async function getMonthlyManpowerSummaryView() {
  const { data, error } = await supabase
    .from(MONTHLY_MANPOWER_VIEW)
    .select("*")
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromMonthlyManpowerViewRow);
}

export async function getMonthlyManpowerSummaryByPeriod(tahun, bulan) {
  const bulanNumber = normalizeMonth(bulan);

  const { data, error } = await supabase
    .from(MONTHLY_MANPOWER_VIEW)
    .select("*")
    .eq("tahun", Number(tahun))
    .eq("bulan", bulanNumber)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? fromMonthlyManpowerViewRow(data) : null;
}

/**
 * READ VIEW: vw_monthly_report
 */
export async function getMonthlyReportView() {
  const [{ data, error }, calculatedManhoursMap] = await Promise.all([
    supabase
    .from(MONTHLY_REPORT_VIEW)
    .select("*")
    .order("tahun", { ascending: false })
      .order("bulan", { ascending: false }),
    getCalculatedMonthlyManhoursMap(),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return mergeCalculatedManhours(data.map(fromMonthlyReportViewRow), calculatedManhoursMap);
}

export async function getMonthlyReportByPeriod(tahun, bulan) {
  const bulanNumber = normalizeMonth(bulan);

  const [{ data, error }, calculatedManhoursMap] = await Promise.all([
    supabase
      .from(MONTHLY_REPORT_VIEW)
      .select("*")
      .eq("tahun", Number(tahun))
      .eq("bulan", bulanNumber)
      .maybeSingle(),
    getCalculatedMonthlyManhoursMap(),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const totalManhours = calculatedManhoursMap[monthKey(Number(tahun), bulanNumber)] || 0;

  if (data) {
    return {
      ...fromMonthlyReportViewRow(data),
      totalManhours,
    };
  }

  if (!totalManhours) {
    return null;
  }

  return {
    tahun: Number(tahun),
    bulan: MONTH_LABELS[bulanNumber] || bulanNumber,
    bulanNumber,
    totalManhours,
    totalInsiden: 0,
    totalHazardReport: 0,
    totalNcr: 0,
    totalStfVir: 0,
    totalSecurityRecord: 0,
    totalManpowerFleet: 0,
    totalManpowerShore: 0,
    totalManpowerAll: 0,
    raw: { tahun: Number(tahun), bulan: bulanNumber, total_manhours: totalManhours },
  };
}

/**
 * READ TABLE: tr_laporan
 * Ini untuk laporan yang sudah disimpan/final.
 */
export async function getSavedMonthlyReports() {
  const { data, error } = await supabase
    .from(LAPORAN_TABLE)
    .select("*")
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false })
    .order("generated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(fromLaporanRow);
}

export async function getSavedMonthlyReportById(id) {
  const { data, error } = await supabase
    .from(LAPORAN_TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromLaporanRow(data);
}

export async function getSavedMonthlyReportByPeriod(tahun, bulan) {
  const bulanNumber = normalizeMonth(bulan);

  const { data, error } = await supabase
    .from(LAPORAN_TABLE)
    .select("*")
    .eq("tahun", Number(tahun))
    .eq("bulan", bulanNumber)
    .eq("jenis_laporan", "monthly")
    .order("generated_at", { ascending: false })
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? fromLaporanRow(data) : null;
}

/**
 * Generate preview dari view.
 * Belum menyimpan ke tr_laporan.
 */
export async function generateMonthlyReportPreview(tahun, bulan) {
  const report = await getMonthlyReportByPeriod(tahun, bulan);

  if (!report) {
    return {
      tahun: Number(tahun),
      bulan: MONTH_LABELS[normalizeMonth(bulan)] || bulan,
      bulanNumber: normalizeMonth(bulan),
      totalManhours: 0,
      totalInsiden: 0,
      totalHazardReport: 0,
      totalNcr: 0,
      totalStfVir: 0,
      totalSecurityRecord: 0,
      totalManpowerFleet: 0,
      totalManpowerShore: 0,
      totalManpowerAll: 0,
      catatan: "",
      isEmpty: true,
    };
  }

  return {
    ...report,
    catatan: "",
    isEmpty: false,
  };
}

/**
 * Save snapshot manual dari payload FE ke tr_laporan.
 */
export async function saveMonthlyReport(payload) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const cleanPayload = {
    ...toLaporanPayload(payload),
    generated_by: user?.id || null,
    generated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(LAPORAN_TABLE)
    .insert([cleanPayload])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromLaporanRow(data);
}

/**
 * Generate dari vw_monthly_report lalu simpan ke tr_laporan.
 */
export async function generateAndSaveMonthlyReport({
  tahun,
  bulan,
  catatan = "",
  overwrite = false,
}) {
  const bulanNumber = normalizeMonth(bulan);

  if (!tahun) {
    throw new Error("Tahun wajib diisi.");
  }

  if (!bulanNumber) {
    throw new Error("Bulan tidak valid.");
  }

  const preview = await generateMonthlyReportPreview(tahun, bulanNumber);

  const payload = {
    tahun: Number(tahun),
    bulan: bulanNumber,
    jenisLaporan: "monthly",

    totalManhours: preview.totalManhours,
    totalInsiden: preview.totalInsiden,
    totalHazardReport: preview.totalHazardReport,
    totalNcr: preview.totalNcr,
    totalStfVir: preview.totalStfVir,
    totalSecurityRecord: preview.totalSecurityRecord,

    totalManpowerFleet: preview.totalManpowerFleet,
    totalManpowerShore: preview.totalManpowerShore,
    totalManpowerAll: preview.totalManpowerAll,

    catatan,
  };

  if (!overwrite) {
    const existing = await getSavedMonthlyReportByPeriod(tahun, bulanNumber);

    if (existing) {
      throw new Error(
        "Laporan bulan ini sudah pernah digenerate. Gunakan overwrite jika ingin mengganti."
      );
    }

    return saveMonthlyReport(payload);
  }

  return upsertMonthlyReport(payload);
}

/**
 * Upsert snapshot laporan berdasarkan tahun, bulan, jenis_laporan.
 * Supabase upsert butuh unique constraint kalau pakai onConflict.
 * Kalau belum ada unique constraint, function ini pakai manual check.
 */
export async function upsertMonthlyReport(payload) {
  const existing = await getSavedMonthlyReportByPeriod(
    payload.tahun,
    payload.bulan
  );

  if (existing) {
    return updateSavedMonthlyReport(existing.id, payload);
  }

  return saveMonthlyReport(payload);
}

export async function updateSavedMonthlyReport(id, payload) {
  const cleanPayload = toLaporanPayload(payload);

  const { data, error } = await supabase
    .from(LAPORAN_TABLE)
    .update({
      ...cleanPayload,
      generated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return fromLaporanRow(data);
}

export async function deleteSavedMonthlyReport(id) {
  const { error } = await supabase
    .from(LAPORAN_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export const MONTHLY_REPORT_MONTH_OPTIONS = Object.entries(MONTH_LABELS).map(
  ([value, label]) => ({
    value: Number(value),
    label,
  })
);

export const MONTHLY_REPORT_TYPE_OPTIONS = [
  {
    label: "Monthly",
    value: "monthly",
  },
];
