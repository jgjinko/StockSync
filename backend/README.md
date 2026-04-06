# StockSync Backend — Multi-Channel Inventory Intelligence

This is the headless API for the **StockSync** platform. It acts as the central "Source of Truth," reconciling fragmented inventory data from Shopify, Amazon SP-API, and TikTok Shop into a unified JSON format optimized for a **Next.js** frontend and **shadcn/ui** components.

## 🛠 Tech Stack
- **Framework:** FastAPI (Python 3.10+)
- **Data Processing:** Pandas & NumPy
- **Validation:** Pydantic (Type safety for React integration)
- **Server:** Uvicorn
- **Documentation:** Swagger UI / OpenAPI (available at `/docs`)

## 📋 Prerequisites
- Python 3.10 or later
- `pip` (Python package manager)
- Virtual Environment (WSL recommended for Windows users)

## 🚀 Setup and Installation

1. **Create a Virtual Environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate