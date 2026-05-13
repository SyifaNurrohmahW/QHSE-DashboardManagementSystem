"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { getMonthlyReportView } from "@/lib/services/monthlyReport";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_SHORT_BY_NUMBER = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const NCR_COLORS = {
  open: "#f59e0b",
  closed: "#10b981",
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function statusClass(status) {
  if (status === "Expired") return "bg-red-50 text-red-700";
  if (status === "Warning") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

function ChartContainer({ height, children, className = "" }) {
  const frameRef = useRef(null);
  const [frameWidth, setFrameWidth] = useState(0);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const updateWidth = () => {
      const nextWidth = Math.floor(node.getBoundingClientRect().width);
      setFrameWidth(nextWidth > 0 ? nextWidth : 0);
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(node);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className={`relative w-full min-w-0 overflow-hidden ${className}`}
      style={{ height: `${height}px`, minHeight: `${height}px` }}
    >
      {frameWidth > 0 ? children(frameWidth, height) : null}
    </div>
  );
}

export default function MonthlyReportPage() {
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    getMonthlyReportView()
      .then((result) => {
        if (!isMounted) return;
        setMonthlyReports(result);
        setErrorMessage("");

        const latestYear = result[0]?.tahun;
        if (latestYear) {
          setSelectedYear(String(latestYear));
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || "Gagal mengambil data monthly report.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const monthlyData = useMemo(() => {
    return monthlyReports
      .filter((item) => String(item.tahun) === selectedYear)
      .map((item) => ({
        month: MONTH_SHORT_BY_NUMBER[item.bulanNumber] || item.bulan,
        monthNumber: item.bulanNumber,
        hazard: Number(item.totalHazardReport || 0),
        stfVir: Number(item.totalStfVir || 0),
        security: Number(item.totalSecurityRecord || 0),
        manhours: Number(item.totalManhours || 0),
        ncr: Number(item.totalNcr || 0),
        incident: Number(item.totalInsiden || 0),
        manpowerFleet: Number(item.totalManpowerFleet || 0),
        manpowerShore: Number(item.totalManpowerShore || 0),
        manpowerAll: Number(item.totalManpowerAll || 0),
      }))
      .sort((a, b) => a.monthNumber - b.monthNumber);
  }, [monthlyReports, selectedYear]);

  const yearOptions = useMemo(() => {
    const years = [...new Set(monthlyReports.map((item) => String(item.tahun)).filter(Boolean))];
    if (!years.includes(selectedYear)) years.push(selectedYear);
    return years.sort((a, b) => Number(b) - Number(a));
  }, [monthlyReports, selectedYear]);

  const filteredMonthly = useMemo(() => {
    if (selectedMonth === "All") return monthlyData;
    return monthlyData.filter((item) => item.month === selectedMonth);
  }, [monthlyData, selectedMonth]);

  const totalManhours = filteredMonthly.reduce((sum, item) => sum + item.manhours, 0);
  const totalHazard = filteredMonthly.reduce((sum, item) => sum + item.hazard, 0);
  const totalStfVir = filteredMonthly.reduce((sum, item) => sum + item.stfVir, 0);
  const totalSecurity = filteredMonthly.reduce((sum, item) => sum + item.security, 0);
  const totalNcr = filteredMonthly.reduce((sum, item) => sum + item.ncr, 0);
  const totalIncident = filteredMonthly.reduce((sum, item) => sum + item.incident, 0);
  const totalManpowerAll = filteredMonthly.reduce((sum, item) => sum + item.manpowerAll, 0);
  const openNcr = totalNcr;

  const ncrStatus = useMemo(
    () => [
      { name: "Open / Recorded", value: openNcr, color: NCR_COLORS.open },
      { name: "Closed", value: 0, color: NCR_COLORS.closed },
    ],
    [openNcr]
  );

  const injuryCategory = useMemo(
    () => [
      { name: "Incident", value: totalIncident },
      { name: "Other", value: 0 },
    ],
    [totalIncident]
  );

  const equipmentAlerts = [];
  const criticalEquipment = 0;

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
      ["Total Incident", totalIncident],
      ["Total Manpower All", totalManpowerAll],
      ["Critical Equipment", criticalEquipment],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    const wsMonthly = XLSX.utils.json_to_sheet(filteredMonthly);
    const wsNcr = XLSX.utils.json_to_sheet(ncrStatus);
    const wsIncident = XLSX.utils.json_to_sheet(injuryCategory);
    const wsEquipment = XLSX.utils.json_to_sheet(equipmentAlerts.length ? equipmentAlerts : [{ message: "Tidak ada data equipment alert dari monthly report." }]);

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
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
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

      {errorMessage ? (
        <div className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[14px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700">
          Mengambil data monthly report dari Supabase...
        </div>
      ) : null}

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

            <ChartContainer height={320}>
              {(width, height) => (
              <BarChart width={width} height={height} data={filteredMonthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="hazard" name="Hazard Report" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="stfVir" name="STF & VIR" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="security" name="Security" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
              )}
            </ChartContainer>
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

            <ChartContainer height={250} className="mt-4">
              {(width, height) => (
              <PieChart width={width} height={height}>
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
              )}
            </ChartContainer>

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

            <ChartContainer height={280} className="mt-4">
              {(width, height) => (
              <BarChart width={width} height={height} data={injuryCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
              )}
            </ChartContainer>
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

            <ChartContainer height={280} className="mt-4">
              {(width, height) => (
              <LineChart width={width} height={height} data={filteredMonthly}>
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
              )}
            </ChartContainer>
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
                {equipmentAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-[12px] text-[#8b96a1]">
                      Tidak ada data equipment alert dari monthly report.
                    </td>
                  </tr>
                ) : equipmentAlerts.map((item) => (
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
                Catatan Data
              </h2>
              <p className="mt-1 text-[12px] leading-6 text-[#6b7280]">
                Data Monthly Report diambil dari Supabase view rekap bulanan. Bagian yang membutuhkan data detail di luar view akan tampil kosong sampai tersedia di service.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
