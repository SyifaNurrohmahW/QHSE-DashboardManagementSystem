import {
  AlertTriangle,
  BellRing,
  BadgeAlert,
  CheckSquare,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Paperclip,
  Settings,
  ScanSearch,
  ShieldCheck,
  Ship,
  Timer,
} from "lucide-react";




export const dashboardMenuSections = [
  {
    title: null,
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["superadmin", "admin", "viewer"],
      },
    ],
  },
  {
    title: "Master Data",
    items: [
      {
        title: "Data Kapal",
        href: "/dashboard/kapal",
        icon: Ship,
        roles: ["superadmin"],
      },
      
    ],
  },
  {
    title: "QHSE Data",
    items: [
      {
        title: "Incident Report",
        href: "/dashboard/incident",
        icon: AlertTriangle,
        roles: ["superadmin", "admin", "viewer"],
      },
      {
        title: "Hazard Report",
        href: "/dashboard/hazard",
        icon: BadgeAlert,
        roles: ["superadmin", "admin", "viewer"],
      },
      {
        title: "Manhours",
        href: "/dashboard/manhours",
        icon: Timer,
        roles: ["superadmin", "admin", "viewer"],
      },
      {
        title: "NCR",
        href: "/dashboard/ncr",
        icon: ClipboardList,
        roles: ["superadmin", "admin", "viewer"],
      },
      {
        title: "LSA & FFA",
        href: "/dashboard/lsa-ffa",
        icon: LifeBuoy,
        roles: ["superadmin", "admin", "viewer"],
      },
      {
        title: "STF & VIR",
        href: "/dashboard/stf-vir",
        icon: ScanSearch,
        roles: ["superadmin", "admin", "viewer"],
      },
      {
        title: "Security Record",
        href: "/dashboard/security",
        icon: ShieldCheck,
        roles: ["superadmin", "admin", "viewer"],
      },
    ],
  },
  {
    title: "Monitoring",
    items: [
      {
        title: "Equipment Expiry Alert",
        href: "/dashboard/equipment",
        icon: BellRing,
        roles: ["superadmin", "admin", "viewer"],
      },
      {
        title: "Evidence / Attachments",
        href: "/dashboard/attachment",
        icon: Paperclip,
        roles: ["superadmin", "admin", "viewer"],
      },
      {
        title: "Monthly Report",
        href: "/dashboard/report",
        icon: FileText,
        roles: ["superadmin", "admin", "viewer"],
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Profile",
        href: "/dashboard/profile",
        icon: Settings,
        roles: ["superadmin", "admin", "viewer"],
      },
    ],
  },
];
