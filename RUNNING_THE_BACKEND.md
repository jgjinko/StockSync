# Running the StockSync Backend

> The backend is a **FastAPI** application powered by Python, served via **Uvicorn**.
> All commands below are run inside **WSL (Ubuntu)**.

---

## Prerequisites

- WSL 2 with Ubuntu installed
- Python 3.12+
- `uvicorn` installed system-wide (see Step 1)

---

## Step 1 — Install Uvicorn (first time only)

If `uvicorn` is not yet installed on your system, run:

```bash
sudo apt install uvicorn
```

---

## Step 2 — Navigate to the Backend Directory

> ⚠️ **Important:** Always use quotes around the path — the folder `AI4Devs Holberton` contains a space.

```bash
cd "/mnt/c/Users/User/Documents/AI4Devs Holberton/StockSync/backend"
```

Verify you are in the right place:

```bash
ls
```

You should see `main.py`, `preprocessing.py`, and `requirements.txt`.

---

## Step 3 — Install Python Dependencies (first time only)

```bash
pip install -r requirements.txt --break-system-packages
```

This installs:
| Package | Purpose |
|---|---|
| `fastapi` | Web framework |
| `uvicorn[standard]` | ASGI server with extras (watchfiles, websockets) |
| `pandas` | Data processing |
| `numpy` | Numeric operations |
| `pydantic` | Request validation |

---

## Step 4 — Start the Backend Server

```bash
uvicorn main:app --reload
```

You should see:

```
INFO:     Will watch for changes in these directories: ['.../backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process using WatchFiles
INFO:     Application startup complete.
```

The API is now live at **http://localhost:8000**.

---

## Step 5 — Verify It's Working

Open your browser or run in a separate terminal:

```bash
curl http://localhost:8000/api/inventory | head -c 200
```

You should see a JSON array starting with `[{"sku": ...`.

You can also open the **interactive API docs** at:

```
http://localhost:8000/docs
```

---

## Available Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/inventory` | Full inventory list |
| `GET` | `/api/inventory/{sku}` | Single SKU detail |
| `GET` | `/api/analytics/heatmap` | Geographic heatmap data |
| `GET` | `/api/finance/ticker` | Live Revenue Stream (real transactions) |
| `GET` | `/api/finance/trends` | Time-series revenue & profit chart data |
| `GET` | `/api/finance/kpi` | Net Margin, AOV, Dead Stock Value |
| `POST` | `/api/simulate-purchase` | Demo Store purchase simulation |

---

## Stopping the Server

Press `Ctrl + C` in the terminal where uvicorn is running.

---

## Troubleshooting

### ❌ `Could not import module "main"`
You ran `uvicorn` from the wrong directory. Make sure you `cd` into the `backend/` folder **before** running the command (Step 2).

### ❌ `FileNotFoundError: inventory_data.json`
The data files are expected at `StockSync/StockSync/src/data/`. Ensure the frontend project structure is intact and you haven't moved the JSON files.

### ❌ `ModuleNotFoundError: No module named 'fastapi'`
Re-run Step 3 to install dependencies.

### ❌ `Address already in use`
Another process is using port 8000. Find and kill it:
```bash
lsof -i :8000
kill -9 <PID>
```
