"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  LifeBuoy,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const monthlyData = [
  { month: "Jan", hazard: 52, stfVir: 2, security: 0, manhours: 112400 },
  { month: "Feb", hazard: 55, stfVir: 1, security: 0, manhours: 109800 },
  { month: "Mar", hazard: 61, stfVir: 3, security: 2, manhours: 121300 },
  { month: "Apr", hazard: 68, stfVir: 1, security: 0, manhours: 118900 },
  { month: "May", hazard: 59, stfVir: 2, security: 0, manhours: 120200 },
  { month: "Jun", hazard: 64, stfVir: 1, security: 0, manhours: 119600 },
  { month: "Jul", hazard: 70, stfVir: 2, security: 0, manhours: 125700 },
  { month: "Aug", hazard: 58, stfVir: 1, security: 0, manhours: 122100 },
  { month: "Sep", hazard: 60, stfVir: 0, security: 0, manhours: 116900 },
  { month: "Oct", hazard: 65, stfVir: 0, security: 0, manhours: 124500 },
  { month: "Nov", hazard: 72, stfVir: 1, security: 0, manhours: 126200 },
  { month: "Dec", hazard: 63, stfVir: 0, security: 0, manhours: 123800 },
];

const ncrStatus = [
  { name: "Sec. A", value: 2, color: "#f59e0b" },
  { name: "Sec. B", value: 1, color: "#3b82f6" },
  { name: "Completed Sec. B", value: 0, color: "#8b5cf6" },
  { name: "Closed", value: 7, color: "#10b981" },
];

const injuryCategory = [
  { name: "FAI", value: 1 },
  { name: "MTI", value: 0 },
  { name: "LTI", value: 0 },
  { name: "Grounded", value: 3 },
  { name: "Collision", value: 2 },
  { name: "Machinery", value: 1 },
  { name: "Nearmiss", value: 1 },
  { name: "Other", value: 0 },
];

const equipmentAlerts = [
  {
    kapal: "MBP 121",
    equipment: "PMK",
    nextInspection: "2026-06-10",
    remainingDays: 43,
    status: "Warning",
  },
  {
    kapal: "MBP 122",
    equipment: "EPIRB",
    nextInspection: "2026-02-20",
    remainingDays: -68,
    status: "Expired",
  },
  {
    kapal: "MBP 145",
    equipment: "CO2 System",
    nextInspection: "2026-05-18",
    remainingDays: 20,
    status: "Warning",
  },
  {
    kapal: "MBP 148",
    equipment: "SCBA / EEBD",
    nextInspection: "2026-12-01",
    remainingDays: 217,
    status: "Safe",
  },
];

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function statusClass(status) {
  if (status === "Expired") return "bg-red-50 text-red-700";
  if (status === "Warning") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

export default function MonthlyReportPage() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const chartsReady = typeof window !== "undefined";

  const filteredMonthly = useMemo(() => {
    if (selectedMonth === "All") return monthlyData;
    return monthlyData.filter((item) => item.month === selectedMonth);
  }, [selectedMonth]);

  const totalManhours = filteredMonthly.reduce((sum, item) => sum + item.manhours, 0);
  const totalHazard = filteredMonthly.reduce((sum, item) => sum + item.hazard, 0);
  const totalStfVir = filteredMonthly.reduce((sum, item) => sum + item.stfVir, 0);
  const totalSecurity = filteredMonthly.reduce((sum, item) => sum + item.security, 0);
  const totalNcr = ncrStatus.reduce((sum, item) => sum + item.value, 0);
  const openNcr = ncrStatus
    .filter((item) => item.name !== "Closed")
    .reduce((sum, item) => sum + item.value, 0);

  const criticalEquipment = equipmentAlerts.filter(
    (item) => item.status === "Expired" || item.status === "Warning"
  ).length;

  const kpiCards = [
    {
      title: "Total Manhours",
      value: formatNumber(totalManhours),
      note: "Akumulasi periode laporan",
      icon: TrendingUp,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Hazard Report",
      value: formatNumber(totalHazard),
      note: "Total laporan hazard",
      icon: ShieldCheck,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      title: "Open NCR",
      value: formatNumber(openNcr),
      note: `${totalNcr} total NCR`,
      icon: FileText,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      title: "Equipment Alert",
      value: formatNumber(criticalEquipment),
      note: "Expired + warning",
      icon: LifeBuoy,
      tone: "bg-red-50 text-red-700",
    },
  ];

  function exportExcel() {
    const wb = XLSX.utils.book_new();

    const summary = [
      ["Monthly QHSE Report"],
      ["Year", selectedYear],
      ["Month", selectedMonth],
      [],
      ["Metric", "Value"],
      ["Total Manhours", totalManhours],
      ["Total Hazard Report", totalHazard],
      ["Total STF & VIR", totalStfVir],
      ["Total Security Record", totalSecurity],
      ["Total NCR", totalNcr],
      ["Open NCR", openNcr],
      ["Critical Equipment", criticalEquipment],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    const wsMonthly = XLSX.utils.json_to_sheet(filteredMonthly);
    const wsNcr = XLSX.utils.json_to_sheet(ncrStatus);
    const wsIncident = XLSX.utils.json_to_sheet(injuryCategory);
    const wsEquipment = XLSX.utils.json_to_sheet(equipmentAlerts);

    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Trend");
    XLSX.utils.book_append_sheet(wb, wsNcr, "NCR");
    XLSX.utils.book_append_sheet(wb, wsIncident, "Incident");
    XLSX.utils.book_append_sheet(wb, wsEquipment, "Equipment Alert");

    XLSX.writeFile(wb, `Monthly-QHSE-Report-${selectedYear}-${selectedMonth}.xlsx`);
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 text-white shadow-[0_16px_36px_rgba(16,185,129,0.18)]">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/85">
              <FileSpreadsheet size={14} />
              Monthly QHSE Report
            </div>

            <h1 className="mt-3 text-[22px] font-bold leading-tight">
              Rekap bulanan QHSE sesuai format dashboard client.
            </h1>

            <p className="mt-2 max-w-2xl text-[13px] text-white/82">
              Monitoring manhours, incident, hazard report, NCR, STF & VIR,
              security record, dan equipment expiry alert.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-[10px] border border-white/20 bg-white px-4 py-2.5 text-[13px] font-semibold text-emerald-700 outline-none"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-[10px] border border-white/20 bg-white px-4 py-2.5 text-[13px] font-semibold text-emerald-700 outline-none"
            >
              <option value="All">All Month</option>
              {MONTHS.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>

            <button
              onClick={exportExcel}
              className="inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[13px] font-semibold text-emerald-700"
            >
              <Download size={16} />
              Export Excel
            </button>
          </div>
        </div>

        <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Report Period</p>
            <p className="mt-2 text-[22px] font-bold">
              {selectedMonth === "All" ? "Jan - Dec" : selectedMonth} {selectedYear}
            </p>
          </div>

          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">STF & VIR</p>
            <p className="mt-2 text-[24px] font-bold leading-none">{totalStfVir}</p>
            <p className="mt-1 text-[12px] text-white/75">Total report</p>
          </div>

          <div className="bg-black/10 px-5 py-4">
            <p className="text-[12px] text-white/70">Security Record</p>
            <p className="mt-2 text-[24px] font-bold leading-none">{totalSecurity}</p>
            <p className="mt-1 text-[12px] text-white/75">Monthly finding</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium text-[#44505e]">{item.title}</p>
                    <p className="mt-2 text-[24px] font-bold leading-none text-[#1f2b38]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[12px] text-[#73808d]">{item.note}</p>
                  </div>

                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.tone}`}>
                    <Icon size={22} strokeWidth={2.1} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="min-w-0">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-[#243041]">
                  Monthly Trend
                </h2>
                <p className="mt-1 text-[12px] text-[#7a8692]">
                  Hazard Report, STF & VIR, dan Security Record per bulan.
                </p>
              </div>
              <BarChart3 size={18} className="text-emerald-600" />
            </div>

            <div className="h-[320px] min-h-[320px] w-full min-w-0">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredMonthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="hazard" name="Hazard Report" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="stfVir" name="STF & VIR" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="security" name="Security" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="p-5">
            <h2 className="text-[16px] font-semibold text-[#243041]">
              NCR Status
            </h2>
            <p className="mt-1 text-[12px] text-[#7a8692]">
              Mengikuti summary NCR di Master Data.
            </p>

            <div className="mt-4 h-[250px] min-h-[250px] w-full min-w-0">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ncrStatus}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {ncrStatus.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            <div className="mt-3 space-y-2">
              {ncrStatus.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#5c6a77]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[#243041]">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="min-w-0">
          <CardContent className="p-5">
            <h2 className="text-[16px] font-semibold text-[#243041]">
              Incident / Injury Category
            </h2>
            <p className="mt-1 text-[12px] text-[#7a8692]">
              FAI, MTI, LTI, Grounded, Collision, Machinery, Nearmiss, Other.
            </p>

            <div className="mt-4 h-[280px] min-h-[280px] w-full min-w-0">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={injuryCategory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardContent className="p-5">
            <h2 className="text-[16px] font-semibold text-[#243041]">
              Manhours Trend
            </h2>
            <p className="mt-1 text-[12px] text-[#7a8692]">
              Total exposure hours dari sheet Manhours.
            </p>

            <div className="mt-4 h-[280px] min-h-[280px] w-full min-w-0">
              {chartsReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredMonthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Line
                      type="monotone"
                      dataKey="manhours"
                      name="Manhours"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-[#edf1f4] px-5 py-4">
            <div>
              <h2 className="text-[16px] font-semibold text-[#243041]">
                Equipment Expiry Alert
              </h2>
              <p className="mt-1 text-[12px] text-[#7a8692]">
                Ringkasan equipment dari LSA & FFA yang perlu perhatian.
              </p>
            </div>

            <div className="rounded-full bg-red-50 px-3 py-1 text-[12px] font-semibold text-red-700">
              {criticalEquipment} critical item
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[840px] w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#f8fafb]">
                  {["KAPAL", "EQUIPMENT", "NEXT INSPECTION", "SISA HARI", "STATUS"].map((head) => (
                    <th
                      key={head}
                      className="border-b border-[#edf1f4] px-3 py-2 text-left text-[9px] font-semibold tracking-wider text-[#8b96a1]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {equipmentAlerts.map((item) => (
                  <tr key={`${item.kapal}-${item.equipment}`} className="border-b border-[#f0f3f5]">
                    <td className="px-3 py-3 font-semibold text-[#243041]">{item.kapal}</td>
                    <td className="px-3 py-3 text-[#4a5568]">{item.equipment}</td>
                    <td className="px-3 py-3 text-[#4a5568]">{item.nextInspection}</td>
                    <td className="px-3 py-3 font-semibold text-[#4a5568]">
                      {item.remainingDays} hari
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#243041]">
                Catatan Implementasi
              </h2>
              <p className="mt-1 text-[12px] leading-6 text-[#6b7280]">
                Page ini masih memakai mock data untuk tahap desain. Nanti saat connect Supabase,
                data Monthly Report diambil dari view rekap: manhours, incident, hazard report,
                NCR, LSA & FFA, STF & VIR, dan security record.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
