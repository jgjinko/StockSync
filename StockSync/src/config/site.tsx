import { LayoutDashboard, type LucideIcon, Package, LineChart, Settings, Map } from "lucide-react";

export type SiteConfig = typeof siteConfig;
export type Navigation = {
  icon: LucideIcon;
  name: string;
  href: string;
};

export const siteConfig = {
  title: "StockSync Dashboard",
  description: "Multi-Channel Inventory Intelligence Platform",
};

export const navigations: Navigation[] = [
  {
    icon: LayoutDashboard,
    name: "Dashboard",
    href: "/",
  },
  {
    icon: LineChart,
    name: "Finance",
    href: "/finance",
  },
  {
    icon: Settings,
    name: "Management",
    href: "/management",
  },
  {
    icon: Map,
    name: "Sales Heatmap",
    href: "/heatmap",
  },
];
