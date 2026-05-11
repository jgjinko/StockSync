import { 
  LayoutDashboard, 
  type LucideIcon, 
  Package, 
  Map, 
  Banknote, 
  Settings 
} from "lucide-react";

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
    icon: Package,
    name: "Inventory",
    href: "/ticket",
  },
  {
    icon: Map,
    name: "Sales Heatmap",
    href: "/heatmap",
  },
  {
    icon: Banknote,
    name: "Finance Hub",
    href: "/finance",
  },
  {
    icon: Settings,
    name: "Management",
    href: "/management",
  },
];
