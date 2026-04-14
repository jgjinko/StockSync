import { LayoutDashboard, type LucideIcon, Package } from "lucide-react";

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
];
