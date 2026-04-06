# UI Style Guide — StockSync

## Purpose
This document defines the visual identity and design system for the StockSync BI Platform. It ensures a consistent "Modern Enterprise" look and feel across all dashboard modules.

## Design Goals
- **Data-Density:** Clear presentation of high volumes of inventory data.
- **Urgency Signaling:** Using color strategically to highlight low-stock risks.
- **Precision:** Clean borders and consistent alignment for a professional BI tool.

## CSS Framework
This project uses **Tailwind CSS** integrated with **shadcn/ui**.
- Use Tailwind utility classes for layout and spacing.
- Use shadcn variables for theme consistency.

## Color Palette (Tailwind / shadcn)
- **Primary:** `bg-indigo-600` (#4F46E5) — Main actions and brand highlights.
- **Background:** `bg-slate-50` — Main application canvas.
- **Surface:** `bg-white` — Dashboard cards and table containers.
- **Status Colors:**
  - `Success (In Stock):` Green-500
  - `Warning (Low Stock):` Amber-500
  - `Destructive (Out of Stock):` Red-600

## Typography
- **Primary Font:** `Inter` or `Geist` (Sans-serif).
- **Headings:** Bold, Slate-900.
- **Data Points:** Tabular figures for numbers in tables to ensure vertical alignment.

## Dashboard Components
- **Cards:** Rounded-lg corners with subtle `shadow-sm` and `border-slate-200`.
- **Tables:** Fixed headers with horizontal scroll for multi-column inventory data.
- **Interactive:** Hover states on table rows to indicate "click-to-detail" capability.