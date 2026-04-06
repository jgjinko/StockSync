# Project Overview — StockSync

## Purpose of this document
This document defines the StockSync project at a high level for stakeholders and developers. It outlines the product vision, target audience, and the core "Source of Truth" mission.

## Project Summary
StockSync is a Business Intelligence (BI) and inventory management platform that unifies fragmented data from multiple sales channels (Shopify, Amazon, TikTok Shop, Physical POS). It provides a single, interactive dashboard with geographic heatmapping and predictive analytics.

## Main Goal
To transform raw multi-channel sales data into actionable intelligence, allowing retailers to:
- Monitor inventory levels across all platforms in real-time.
- Identify high-opportunity geographic sales zones via heatmaps.
- Utilize predictive modeling to prevent stockouts and optimize reordering.

## Target Users
- **E-commerce Founders:** Seeking a "bird's-eye view" of their business performance.
- **Inventory Managers:** Responsible for stock accuracy and preventing overselling.
- **Growth Specialists:** Using geographic trends to optimize advertising spend.

## Product Principles
- **Unified Data:** Single source of truth for fragmented inventory.
- **Actionable Visuals:** Clean, data-driven UI using shadcn/ui components.
- **Predictive Intelligence:** Moving from reactive to proactive supply chain management.
- **Scalable Architecture:** Built with FastAPI and Next.js for high performance.

## Scope of the First Version (MVP)
The first version focuses on the end-to-end data flow:
1. Reconciling inventory from a unified JSON source.
2. A main dashboard for multi-channel stock monitoring.
3. Geographic sales visualization via Mapbox.
4. Basic "Days of Cover" predictive calculations.