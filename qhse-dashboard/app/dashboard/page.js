import {
  Activity,
  AlertTriangle,
  BadgeAlert,
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileSpreadsheet,
  Flame,
  LifeBuoy,
  ScanSearch,
  Shield,
  ShieldCheck,
  ShieldOff,
  Timer,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const BULAN_OPTIONS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const summaryStats = [
  {
    title: "Total Record QHSE",
    value: "162",
    note: "Akumulasi seluruh modul bulan aktif",
    icon: FileSpreadsheet,
    tone: "bg-[#edf9f1] text-[#1f9b58]",
  },
  {
    title: "Open Follow Up",
    value: "27",
    note: "Perlu review dan tindak lanjut",
    icon: AlertTriangle,
    tone: "bg-[#fff7e8] text-[#c98431]",
  },
  {
    title: "Close Rate",
    value: "83%",
    note: "Rasio close lintas modul",
    icon: CheckCircle2,
    tone: "bg-[#eef4ff] text-[#376ad6]",
  },
  {
    title: "Due This Week",
    value: "11",
    note: "Agenda verifikasi terdekat",
    icon: BellRing,
    tone: "bg-[#fff0f0] text-[#c53030]",
  },
];

const moduleRows = [
  {
    title: "Incident Report",
    icon: AlertTriangle,
    total: 24,
    open: 6,
    closed: 18,
    trend: "+5",
    color: "#c84f58",
    note: "Near miss dan insiden operasional",
  },
  {
    title: "Hazard Report",
    icon: BadgeAlert,
    total: 31,
    open: 9,
    closed: 22,
    trend: "+4",
    color: "#cf7b2e",
    note: "Unsafe action & unsafe condition",
  },
  {
    title: "Manhours",
    icon: Timer,
    total: 12840,
    open: 0,
    closed: 0,
    trend: "+860",
    color: "#376ad6",
    note: "Akumulasi jam kerja bulanan",
    isManhours: true,
  },
  {
    title: "NCR",
    icon: ClipboardList,
    total: 14,
    open: 5,
    closed: 9,
    trend: "+2",
    color: "#b8434d",
    note: "Temuan audit dan corrective action",
  },
  {
    title: "LSA & FFA",
    icon: LifeBuoy,
    total: 48,
    open: 7,
    closed: 41,
    trend: "+3",
    color: "#1f9b58",
    note: "Expiry control dan replacement plan",
  },
  {
    title: "STF & VIR",
    icon: ScanSearch,
    total: 19,
    open: 4,
    closed: 15,
    trend: "+1",
    color: "#6b7280",
    note: "Checklist dan vessel inspection report",
  },
  {
    title: "Security Record",
    icon: ShieldCheck,
    total: 26,
    open: 8,
    closed: 18,
    trend: "+6",
    color: "#2f63ce",
    note: "Monitoring security event",
  },
];

const manhoursTrend = [
  { month: "Jan", target: 10800, actual: 10240, manpower: 96 },
  { month: "Feb", target: 11200, actual: 10980, manpower: 101 },
  { month: "Mar", target: 11800, actual: 11560, manpower: 108 },
  { month: "Apr", target: 13000, actual: 12840, manpower: 114 },
];

const lsaEquipmentData = [
  {
    equipment: "PMK",
    totalUnits: 15,
    sudahService: 9,
    belumService: 4,
    memasukiService: 2,
    diturunkan: 6,
    belumTurun: 9,
    monthlyCounts: [0, 0, 0, 0, 0, 6, 4, 3, 4, 4, 1, 4],
  },
  {
    equipment: "ILR",
    totalUnits: 8,
    sudahService: 5,
    belumService: 2,
    memasukiService: 1,
    diturunkan: 4,
    belumTurun: 4,
    monthlyCounts: [0, 0, 0, 0, 0, 10, 5, 3, 4, 0, 0, 4],
  },
  {
    equipment: "EPIRB",
    totalUnits: 6,
    sudahService: 4,
    belumService: 1,
    memasukiService: 1,
    diturunkan: 2,
    belumTurun: 4,
    monthlyCounts: [0, 0, 1, 0, 0, 2, 1, 0, 1, 0, 0, 1],
  },
  {
    equipment: "HRU",
    totalUnits: 10,
    sudahService: 8,
    belumService: 1,
    memasukiService: 1,
    diturunkan: 5,
    belumTurun: 5,
    monthlyCounts: [2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  },
];

const lsaEquipmentIcons = {
  PMK: Flame,
  ILR: Shield,
  EPIRB: Zap,
  HRU: Activity,
  CO2: ClipboardCheck,
  "SCBA/EEBD": ShieldOff,
};

const vesselSummary = [
  { vessel: "MV Adaro Pioneer", incident: 4, hazard: 6, ncr: 3, security: 2, open: 5 },
  { vessel: "MV South Borneo", incident: 3, hazard: 5, ncr: 2, security: 1, open: 3 },
  { vessel: "MV Energi Nusantara", incident: 5, hazard: 4, ncr: 4, security: 3, open: 6 },
  { vessel: "MV Adaro Maritim", incident: 2, hazard: 3, ncr: 1, security: 2, open: 2 },
];

const ncrWorkbookData = {
  title: "NCR Record",
  categories: [
    { label: "SEC. A", value: 0 },
    { label: "SEC. B", value: 0 },
    { label: "COMP. SEC B", value: 0 },
    { label: "CLOSED", value: 7 },
  ],
  open: 5,
  closed: 9,
  donuts: [
    { value: 0, color: "#f59e0b" },
    { value: 0, color: "#f59e0b" },
    { value: 0, color: "#f59e0b" },
    { value: 64, color: "#4c76c9" },
  ],
};

const incidentWorkbookData = {
  title: "Incident Record",
  labels: ["FA", "MTI", "LTI", "Grounded", "Collision", "Machinery", "Nearmiss", "Other"],
  values: [0, 0, 0, 0, 0, 0, 0, 0],
};

const securityWorkbookData = {
  title: "Security Record",
  monthly: [0, 0, 2, 0, 2, 0, 0, 0, 0, 1, 1, 0],
};

const hazardWorkbookData = {
  title: "Hazard Report",
  vessels: ["MBP 146", "MBP 143", "MBP 141", "MBP 139", "MBP 136", "MBP 132", "MBP 130", "MBP 135", "MBP 126", "MBP 123", "MBP 121"],
  target: 2026,
  received: 22,
  progress: 78,
};

const stfVirWorkbookData = {
  title: "STF & VIR",
  monthly: [1, 0, 0, 0, 1, 1, 2, 1, 0, 0, 1, 0],
  target: 2026,
  kapal: 19,
  sudah: 15,
  belum: 4,
};

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <Card className="overflow-hidden border-[#edf1f4]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-[#53606d]">{item.title}</p>
            <p className="mt-2 text-[28px] font-bold leading-none text-[#1f2b38]">{item.value}</p>
            <p className="mt-2 text-[12px] leading-5 text-[#7c8793]">{item.note}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
            <Icon size={21} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkbookMiniDonut({ value, color = "#4c76c9" }) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <div className="relative flex h-[56px] w-[56px] items-center justify-center">
      <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
        <circle cx="21" cy="21" r="15.915" fill="none" stroke="#fff3c1" strokeWidth="5" />
        <circle
          cx="21"
          cy="21"
          r="15.915"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${normalized} ${100 - normalized}`}
          strokeDashoffset="25"
        />
      </svg>
    </div>
  );
}

function WorkbookPanelShell({ title, children, className = "" }) {
  return (
    <Card className={`overflow-hidden border-[#d6a300] bg-[#ffc20f] shadow-[0_14px_28px_rgba(173,114,0,0.18)] ${className}`}>
      <CardContent className="p-1.5">
        <div className="rounded-[14px] border border-[#9d7b00] bg-[#ffbf00]">
          <div className="border-b border-[#9d7b00] px-3 py-1.5 text-center">
            <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#2e2200]">{title}</h3>
          </div>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function NcrWorkbookPanel() {
  const max = Math.max(1, ...ncrWorkbookData.categories.map((item) => item.value));
  return (
    <WorkbookPanelShell title={ncrWorkbookData.title}>
      <div className="grid gap-2 p-2 lg:grid-cols-[1.05fr_1fr]">
        <div className="border border-[#9d7b00] bg-[#ffc928] p-3">
          <div className="grid h-[146px] grid-cols-4 items-end gap-3 border-b border-[#f7df8a] pb-2">
            {ncrWorkbookData.categories.map((item) => {
              const height = item.value > 0 ? Math.max(12, (item.value / max) * 110) : 4;
              return (
                <div key={item.label} className="flex h-full flex-col items-center justify-end">
                  <span className="mb-1 text-[10px] font-semibold text-[#6a5200]">{item.value}</span>
                  <div className="w-4 bg-[#4c76c9]" style={{ height: `${height}px` }} />
                  <span className="mt-2 text-center text-[9px] font-semibold uppercase text-[#5d4700]">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <div className="border border-[#9d7b00] bg-[#ffc928]">
            <div className="border-b border-[#9d7b00] px-2 py-1 text-center text-[10px] font-bold uppercase text-[#2e2200]">Total NCR</div>
            <div className="grid grid-cols-[1fr_52px] text-[10px] font-semibold uppercase text-[#2e2200]">
              <span className="border-r border-b border-[#9d7b00] px-2 py-1">Open</span>
              <span className="border-b border-[#9d7b00] px-2 py-1 text-center">{ncrWorkbookData.open}</span>
              <span className="border-r border-[#9d7b00] px-2 py-1">Closed</span>
              <span className="px-2 py-1 text-center">{ncrWorkbookData.closed}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ncrWorkbookData.donuts.map((item, index) => (
              <div key={`ncr-donut-${index}`} className="flex items-center justify-center border border-[#9d7b00] bg-[#ffc928] py-2">
                <WorkbookMiniDonut value={item.value} color={item.color} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkbookPanelShell>
  );
}

function IncidentWorkbookPanel() {
  const max = 1;
  const points = incidentWorkbookData.values
    .map((value, index) => {
      const x = 8 + (index / (incidentWorkbookData.values.length - 1 || 1)) * 84;
      const y = 72 - (value / max) * 54;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <WorkbookPanelShell title={incidentWorkbookData.title}>
      <div className="p-2">
        <div className="border border-[#9d7b00] bg-[#ffc928] p-3">
          <svg viewBox="0 0 100 82" className="h-[176px] w-full">
            {[18, 28, 38, 48, 58, 68].map((y) => (
              <line key={y} x1="8" x2="94" y1={y} y2={y} stroke="#fef3c7" strokeWidth="0.8" />
            ))}
            <polyline fill="none" stroke="#4c76c9" strokeWidth="1.3" points={points} />
            {incidentWorkbookData.values.map((value, index) => {
              const x = 8 + (index / (incidentWorkbookData.values.length - 1 || 1)) * 84;
              const y = 72 - (value / max) * 54;
              return (
                <g key={`${incidentWorkbookData.labels[index]}-${index}`}>
                  <circle cx={x} cy={y} r="1.4" fill="#4c76c9" />
                  <text x={x} y={y - 2} textAnchor="middle" fontSize="4" fill="#2e2200">{value}</text>
                </g>
              );
            })}
          </svg>
          <div className="mt-2 grid grid-cols-8 gap-1 text-center text-[8px] font-semibold uppercase text-[#5d4700]">
            {incidentWorkbookData.labels.map((label) => (
              <span key={label} className="-rotate-25">{label}</span>
            ))}
          </div>
        </div>
      </div>
    </WorkbookPanelShell>
  );
}

function SecurityWorkbookPanel() {
  const max = Math.max(1, ...securityWorkbookData.monthly);
  const points = securityWorkbookData.monthly
    .map((value, index) => {
      const x = 8 + (index / (securityWorkbookData.monthly.length - 1 || 1)) * 84;
      const y = 72 - (value / max) * 54;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <WorkbookPanelShell title={securityWorkbookData.title}>
      <div className="p-2">
        <div className="border border-[#9d7b00] bg-[#ffc928] p-3">
          <svg viewBox="0 0 100 82" className="h-[176px] w-full">
            {[18, 31, 44, 57, 70].map((y) => (
              <line key={y} x1="8" x2="94" y1={y} y2={y} stroke="#fef3c7" strokeWidth="0.8" />
            ))}
            <polyline fill="none" stroke="#4c76c9" strokeWidth="1.5" points={points} />
            {securityWorkbookData.monthly.map((value, index) => {
              const x = 8 + (index / (securityWorkbookData.monthly.length - 1 || 1)) * 84;
              const y = 72 - (value / max) * 54;
              return <circle key={`sec-${index}`} cx={x} cy={y} r="1.8" fill="#4c76c9" />;
            })}
          </svg>
          <div className="mt-2 grid grid-cols-12 gap-1 text-center text-[8px] font-semibold uppercase text-[#5d4700]">
            {BULAN_OPTIONS.map((month) => (
              <span key={`sec-${month}`}>{month}</span>
            ))}
          </div>
        </div>
      </div>
    </WorkbookPanelShell>
  );
}

function HazardWorkbookPanel() {
  return (
    <WorkbookPanelShell title={hazardWorkbookData.title}>
      <div className="grid gap-2 p-2 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="border border-[#9d7b00] bg-[#ffc928] p-3">
          <div className="space-y-2">
            {hazardWorkbookData.vessels.map((vessel) => (
              <div key={vessel} className="grid grid-cols-[72px_1fr] items-center gap-2">
                <span className="text-[10px] font-semibold uppercase text-[#5d4700]">{vessel}</span>
                <div className="h-1.5 bg-[#4c76c9]" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="border border-[#9d7b00] bg-[#ffc928]">
            <div className="grid grid-cols-[1fr_52px] text-[10px] font-semibold uppercase text-[#2e2200]">
              <span className="border-r border-b border-[#9d7b00] px-2 py-1">Target {hazardWorkbookData.target}</span>
              <span className="border-b border-[#9d7b00] px-2 py-1 text-center">{hazardWorkbookData.target}</span>
              <span className="border-r border-[#9d7b00] px-2 py-1">Diterima</span>
              <span className="px-2 py-1 text-center">{hazardWorkbookData.received}</span>
            </div>
          </div>
          <div className="border border-[#9d7b00] bg-[#ffc928] px-3 py-4">
            <p className="text-center text-[12px] font-bold uppercase text-[#2e2200]">Progress</p>
            <div className="mt-3 flex items-center justify-center">
              <div className="relative flex h-[128px] w-[128px] items-center justify-center">
                <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
                  <circle cx="21" cy="21" r="15.915" fill="none" stroke="#fff3c1" strokeWidth="5" />
                  <circle
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="none"
                    stroke="#4c76c9"
                    strokeWidth="5"
                    strokeDasharray={`${hazardWorkbookData.progress} ${100 - hazardWorkbookData.progress}`}
                    strokeDashoffset="25"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkbookPanelShell>
  );
}

function StfVirWorkbookPanel() {
  const max = Math.max(1, ...stfVirWorkbookData.monthly);
  return (
    <WorkbookPanelShell title={stfVirWorkbookData.title}>
      <div className="grid gap-2 p-2 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-[#9d7b00] bg-[#ffc928] px-3 pb-2 pt-4">
          <div className="grid h-[146px] grid-cols-12 items-end gap-2">
            {stfVirWorkbookData.monthly.map((count, index) => {
              const height = count > 0 ? Math.max(10, (count / max) * 102) : 4;
              return (
                <div key={`stf-${index}`} className="flex h-full flex-col items-center justify-end">
                  <div className="w-full bg-[#4c76c9]" style={{ height: `${height}px` }} />
                </div>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-12 gap-2 text-center text-[8px] font-semibold uppercase text-[#5d4700]">
            {BULAN_OPTIONS.map((month) => (
              <span key={`stf-${month}`}>{month}</span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="border border-[#9d7b00] bg-[#ffc928]">
            <div className="grid grid-cols-2 text-[10px] font-semibold uppercase text-[#2e2200]">
              <span className="border-r border-b border-[#9d7b00] px-2 py-1">Target 2026</span>
              <span className="border-b border-[#9d7b00] px-2 py-1 text-center">Kapal</span>
              <span className="border-r border-[#9d7b00] px-2 py-1 text-center">{stfVirWorkbookData.target}</span>
              <span className="px-2 py-1 text-center">{stfVirWorkbookData.kapal}</span>
            </div>
          </div>
          <div className="border border-[#9d7b00] bg-[#ffc928]">
            <div className="grid grid-cols-[1fr_32px_32px] text-[10px] font-semibold uppercase text-[#2e2200]">
              <span className="border-r border-b border-[#9d7b00] px-2 py-1">Sudah STF</span>
              <span className="border-r border-b border-[#9d7b00] px-1 py-1" />
              <span className="border-b border-[#9d7b00] px-1 py-1 text-center">{stfVirWorkbookData.sudah}</span>
              <span className="border-r border-[#9d7b00] px-2 py-1">Belum STF</span>
              <span className="border-r border-[#9d7b00] px-1 py-1" />
              <span className="px-1 py-1 text-center">{stfVirWorkbookData.belum}</span>
            </div>
          </div>
        </div>
      </div>
    </WorkbookPanelShell>
  );
}

function QhseWorkbookSection() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[17px] font-semibold text-[#1f2b38]">QHSE Workbook per Section</h2>
        <p className="mt-1 text-[12px] text-[#7c8793]">
          Incident, Hazard, NCR, Security, dan STF &amp; VIR ditampilkan per section seperti workbook client.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <NcrWorkbookPanel />
        <IncidentWorkbookPanel />
        <SecurityWorkbookPanel />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <HazardWorkbookPanel />
        <StfVirWorkbookPanel />
      </div>
    </section>
  );
}

function ManhoursChart() {
  const maxHours = Math.max(...manhoursTrend.flatMap((item) => [item.target, item.actual]));

  return (
    <Card className="border-[#edf1f4]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[#1f2b38]">Grafik Manhours</h2>
            <p className="mt-1 text-[12px] text-[#7c8793]">Bar comparison target vs actual per bulan</p>
          </div>
          <div className="rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-semibold text-[#376ad6]">
            AMC
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-[12px] text-[#6b7682]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#cbd5e1]" />
            <span>Target</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#376ad6]" />
            <span>Actual</span>
          </div>
        </div>

        <div className="mt-5 rounded-[18px] border border-[#edf1f4] bg-white p-3">
          <svg viewBox="0 0 100 82" className="h-[240px] w-full">
            {[18, 31, 44, 57, 70].map((y) => (
              <line key={y} x1="8" x2="94" y1={y} y2={y} stroke="#edf1f4" strokeWidth="0.8" />
            ))}

            {manhoursTrend.map((item, index) => {
              const baseX = 14 + index * 20;
              const targetHeight = (item.target / maxHours) * 42;
              const actualHeight = (item.actual / maxHours) * 42;
              return (
                <g key={item.month}>
                  <rect x={baseX} y={72 - targetHeight} width="5" height={targetHeight} rx="1.5" fill="#cbd5e1" />
                  <rect x={baseX + 7} y={72 - actualHeight} width="5" height={actualHeight} rx="1.5" fill="#376ad6" />
                </g>
              );
            })}
          </svg>

          <div className="grid grid-cols-4 px-2 text-center text-[11px] text-[#7a8591]">
            {manhoursTrend.map((item) => (
              <span key={item.month}>{item.month}</span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {manhoursTrend.map((item) => (
              <div key={item.month} className="rounded-[14px] border border-[#edf1f4] bg-[#fafdfb] px-3 py-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#8b96a1]">{item.month}</p>
                <p className="mt-2 text-[11px] text-[#7c8793]">Target</p>
                <p className="text-[14px] font-semibold text-[#243041]">{item.target.toLocaleString("id-ID")}</p>
                <p className="mt-1 text-[11px] text-[#7c8793]">Actual</p>
                <p className="text-[14px] font-semibold text-[#376ad6]">{item.actual.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ManpowerChart() {
  const maxManpower = Math.max(...manhoursTrend.map((item) => item.manpower));
  const points = manhoursTrend
    .map((item, index) => {
      const x = 12 + (index / (manhoursTrend.length - 1 || 1)) * 76;
      const y = 70 - (item.manpower / maxManpower) * 46;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card className="border-[#edf1f4]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[#1f2b38]">Grafik Manpower</h2>
            <p className="mt-1 text-[12px] text-[#7c8793]">Line chart manpower aktif per bulan</p>
          </div>
          <div className="rounded-full bg-[#edf9f1] px-3 py-1 text-[11px] font-semibold text-[#1f9b58]">
            Crew Trend
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[12px] text-[#6b7682]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1f9b58]" />
          <span>Manpower aktif</span>
        </div>

        <div className="mt-5 rounded-[18px] border border-[#edf1f4] bg-white p-3">
          <svg viewBox="0 0 100 82" className="h-[240px] w-full">
            {[18, 31, 44, 57, 70].map((y) => (
              <line key={y} x1="8" x2="94" y1={y} y2={y} stroke="#edf1f4" strokeWidth="0.8" />
            ))}
            <polyline
              fill="none"
              stroke="#1f9b58"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            {points.split(" ").map((point) => {
              const [cx, cy] = point.split(",");
              return <circle key={`power-${point}`} cx={cx} cy={cy} r="1.6" fill="#1f9b58" />;
            })}
          </svg>
          <div className="grid grid-cols-4 px-2 text-center text-[11px] text-[#7a8591]">
            {manhoursTrend.map((item) => (
              <span key={item.month}>{item.month}</span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {manhoursTrend.map((item) => (
            <div key={item.month} className="rounded-[14px] border border-[#edf1f4] bg-[#fafdfb] px-3 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.12em] text-[#8b96a1]">{item.month}</p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#edf9f1] px-2.5 py-1 text-[10px] font-semibold text-[#1f9b58]">
                <Users size={12} />
                {item.manpower} crew
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LsaEquipmentWorkbookPanel({ item }) {
  const Icon = lsaEquipmentIcons[item.equipment] || LifeBuoy;
  const totalSegments = item.sudahService + item.belumService + item.memasukiService || 1;
  const segments = [
    { key: "memasuki", label: "Memasuki service", value: item.memasukiService, color: "#5b8def" },
    { key: "belum", label: "Belum service", value: item.belumService, color: "#f59e0b" },
    { key: "sudah", label: "Sudah service", value: item.sudahService, color: "#b0b0b0" },
  ];
  const maxMonthly = Math.max(1, ...item.monthlyCounts);
  let cumulative = 0;
  const donutSegments = segments
    .filter((segment) => segment.value > 0)
    .map((segment) => {
      const dash = (segment.value / totalSegments) * 100;
      const offset = 25 - cumulative;
      cumulative += dash;
      return { ...segment, dash, offset };
    });

  return (
    <Card className="overflow-hidden border-[#d6a300] bg-[#ffc20f] shadow-[0_14px_28px_rgba(173,114,0,0.18)]">
      <CardContent className="p-2.5">
        <div className="rounded-[16px] border border-[#9d7b00] bg-[#ffbf00]">
          <div className="border-b border-[#9d7b00] px-3 py-1.5 text-center">
            <div className="flex items-center justify-center gap-2">
              <Icon size={15} className="text-[#3b2a00]" />
              <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#3b2a00]">
                {item.equipment}
              </h3>
            </div>
          </div>

          <div className="grid gap-2 border-b border-[#9d7b00] p-2 lg:grid-cols-[1fr_1.35fr]">
            <div className="space-y-1">
              {[
                { label: "Sudah service", value: item.sudahService },
                { label: "Belum service", value: item.belumService },
                { label: "Memasuki service", value: item.memasukiService },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.7fr_40px_56px] items-center border border-[#9d7b00] bg-[#ffc928] text-[10px] font-semibold uppercase text-[#2e2200]"
                >
                  <span className="border-r border-[#9d7b00] px-2 py-1">{row.label}</span>
                  <span className="border-r border-[#9d7b00] px-1 py-1" />
                  <span className="px-2 py-1 text-center">{row.value}</span>
                </div>
              ))}

              <div className="border border-[#9d7b00] bg-[#ffc928]">
                <div className="border-b border-[#9d7b00] px-2 py-1 text-center text-[10px] font-bold uppercase text-[#2e2200]">
                  Progress
                </div>
                <div className="grid grid-cols-2 text-[10px] font-semibold uppercase text-[#2e2200]">
                  <div className="border-r border-[#9d7b00] px-2 py-1.5 text-center">
                    Diturunkan
                    <div className="mt-1 text-[12px] font-bold">{item.diturunkan}</div>
                  </div>
                  <div className="px-2 py-1.5 text-center">
                    Belum turun
                    <div className="mt-1 text-[12px] font-bold">{item.belumTurun}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-[#9d7b00] bg-[#ffc928] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-2 text-[10px] uppercase text-[#5d4700]">
                  {segments.map((segment) => (
                    <div key={segment.key} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-white/70"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="font-semibold">{segment.label}</span>
                    </div>
                  ))}
                </div>
                <div className="relative flex h-[116px] w-[116px] items-center justify-center">
                  <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
                    <circle cx="21" cy="21" r="15.915" fill="none" stroke="#fff3c1" strokeWidth="5" />
                    {donutSegments.map((segment) => (
                      <circle
                        key={segment.key}
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="5"
                        strokeDasharray={`${segment.dash} ${100 - segment.dash}`}
                        strokeDashoffset={segment.offset}
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="grid h-[138px] grid-cols-12 items-end gap-2 border border-[#9d7b00] bg-[#ffc928] px-2.5 pb-2 pt-4">
              {item.monthlyCounts.map((count, index) => {
                const height = count > 0 ? Math.max(10, (count / maxMonthly) * 92) : 4;
                return (
                  <div key={`${item.equipment}-${BULAN_OPTIONS[index]}`} className="flex h-full flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-semibold text-[#6a5200]">{count}</span>
                    <div className="w-full rounded-t-[4px] bg-[#4c76c9]" style={{ height: `${height}px` }} />
                  </div>
                );
              })}
            </div>
            <div className="mt-1 grid grid-cols-12 gap-2 px-2.5 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5d4700]">
              {BULAN_OPTIONS.map((month) => (
                <span key={`${item.equipment}-${month}-label`}>{month}</span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LsaWorkbookSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-[#1f2b38]">LSA &amp; FFA per Equipment</h2>
          <p className="mt-1 text-[12px] text-[#7c8793]">
            Grafik workbook dipindah ke dashboard utama agar client langsung lihat ringkasan equipment dari homepage.
          </p>
        </div>
        <div className="rounded-full bg-[#edf9f1] px-3 py-1 text-[11px] font-semibold text-[#1f9b58]">
          LSA &amp; FFA
        </div>
      </div>

      <div className="space-y-4">
        {lsaEquipmentData.map((item) => (
          <LsaEquipmentWorkbookPanel key={item.equipment} item={item} />
        ))}
      </div>
    </section>
  );
}

function ModuleSummaryTable() {
  return (
    <Card className="overflow-hidden border-[#edf1f4]">
      <CardContent className="p-0">
        <div className="border-b border-[#edf1f4] px-5 py-4">
          <h2 className="text-[18px] font-semibold text-[#1f2b38]">Summary by Module</h2>
          <p className="mt-1 text-[12px] text-[#7c8793]">Tampilan dibuat lebih mirip dashboard Excel: tabular, ringkas, dan langsung terbaca</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#fafbfc]">
                {["Module", "Description", "Total", "Open", "Closed / Actual", "Trend", "Progress"].map((head) => (
                  <th
                    key={head}
                    className="border-b border-[#edf1f4] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {moduleRows.map((item) => {
                const Icon = item.icon;
                const progress = item.isManhours ? 98 : Math.round((item.closed / item.total) * 100);

                return (
                  <tr key={item.title} className="border-b border-[#f0f3f5] align-top hover:bg-[#fcfcfd]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}18`, color: item.color }}>
                          <Icon size={16} />
                        </span>
                        <span className="font-semibold text-[#243041]">{item.title}</span>
                      </div>
                    </td>
                    <td className="max-w-[240px] px-4 py-3 text-[#6f7c89]">{item.note}</td>
                    <td className="px-4 py-3 font-semibold text-[#243041]">{item.total.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-[#52606d]">{item.isManhours ? "100%" : item.open}</td>
                    <td className="px-4 py-3 text-[#52606d]">{item.isManhours ? "98%" : item.closed}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#edf9f1] px-2.5 py-1 text-[10px] font-semibold text-[#1f9b58]">
                        {item.trend}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-[140px]">
                        <div className="h-2 overflow-hidden rounded-full bg-[#edf1f4]">
                          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: item.color }} />
                        </div>
                        <p className="mt-1 text-[10px] text-[#8b96a1]">{progress}%</p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function VesselTable() {
  return (
    <Card className="overflow-hidden border-[#edf1f4]">
      <CardContent className="p-0">
        <div className="border-b border-[#edf1f4] px-5 py-4">
          <h2 className="text-[18px] font-semibold text-[#1f2b38]">Summary by Vessel</h2>
          <p className="mt-1 text-[12px] text-[#7c8793]">Pendekatan tabel seperti workbook agar cepat dibandingkan antar kapal</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#fafbfc]">
                {["Vessel", "Incident", "Hazard", "NCR", "Security", "Open Item"].map((head) => (
                  <th
                    key={head}
                    className="border-b border-[#edf1f4] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b96a1]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vesselSummary.map((item) => (
                <tr key={item.vessel} className="border-b border-[#f0f3f5] hover:bg-[#fcfcfd]">
                  <td className="px-4 py-3 font-semibold text-[#243041]">{item.vessel}</td>
                  <td className="px-4 py-3 text-[#52606d]">{item.incident}</td>
                  <td className="px-4 py-3 text-[#52606d]">{item.hazard}</td>
                  <td className="px-4 py-3 text-[#52606d]">{item.ncr}</td>
                  <td className="px-4 py-3 text-[#52606d]">{item.security}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#fff7e8] px-2.5 py-1 text-[10px] font-semibold text-[#c98431]">
                      {item.open} open
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((item) => (
          <StatCard key={item.title} item={item} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ManhoursChart />
        <ManpowerChart />
      </section>

      <QhseWorkbookSection />

      <LsaWorkbookSection />

      <ModuleSummaryTable />

      <VesselTable />
    </div>
  );
}
