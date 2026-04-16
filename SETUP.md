# 🚀 LexAI — Complete Setup Guide

**Tested on:** Windows 10/11 · VS Code · PostgreSQL · Node.js · Python 3.11+

---

## 📋 Prerequisites (Install These First)

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.11+ | https://python.org/downloads |
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 14+ | https://postgresql.org/download/windows |
| VS Code | Latest | https://code.visualstudio.com |
| Git | Latest | https://git-scm.com |

---

## STEP 1 — Clone / Extract the Project

If you downloaded the ZIP, extract it.  
Open VS Code → **File → Open Folder** → select the `lexai` folder.

Open the **integrated terminal** in VS Code: `` Ctrl+` ``

---

## STEP 2 — Create PostgreSQL Database

Open **pgAdmin** (installed with PostgreSQL) OR open a terminal and run:

```bash
# Windows — open psql
psql -U postgres
```

Inside psql, run:
```sql
CREATE DATABASE lexai_db;
\q
```

> **Note your PostgreSQL password** — you set it during installation.  
> Default user is `postgres`.

---

## STEP 3 — Backend Setup

In VS Code terminal:

```bash
cd backend
```

### 3a. Create Python Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 3b. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs FastAPI, SQLAlchemy, anthropic, etc. (~2-3 min)

### 3c. Configure Environment Variables

Open `backend/.env` in VS Code and update:

```env
# Line 4 — update YOUR PostgreSQL password:
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD_HERE@localhost:5432/lexai_db

# Line 11 — add your Anthropic API key:
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx
```

**Get Anthropic API Key:**
1. Go to https://console.anthropic.com
2. Sign up / Login
3. Go to API Keys → Create Key
4. Copy and paste it into `.env`

### 3d. Start the Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
✅ Database tables created/verified
✅ LexAI API started successfully
📖 Docs: http://localhost:8000/api/docs
```

> **Keep this terminal open.** Open a new terminal for the frontend.

---

## STEP 4 — Frontend Setup

Open a **new terminal** in VS Code (click `+` icon):

```bash
cd frontend
```

### 4a. Install Node Dependencies

```bash
npm install
```

(~1-2 min, installs React, Vite, Recharts, etc.)

### 4b. Start the Frontend Dev Server

```bash
npm run dev
```

✅ You should see:
```
  VITE v5.x.x  ready in 500ms

  ➜  Local:   http://localhost:3000/
```

---

## STEP 5 — Open the App

Go to: **http://localhost:3000**

### Create Your Demo Account

1. Click **Register**
2. Fill in your name, email, password
3. Select role: **Law Student**
4. Click **Create Account**

You're in! 🎉

---

## STEP 6 — Seed Demo Data (Optional)

To add a pre-built demo account instantly, run this in `psql`:

```sql
\c lexai_db

-- Demo user: demo@lexai.in / demo1234
-- (password hash for "demo1234" with bcrypt)
INSERT INTO users (name, email, hashed_password, role, is_active)
VALUES (
  'Demo Student',
  'demo@lexai.in',
  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
  'student',
  true
);
```

Login with: `demo@lexai.in` / `demo1234`

---

## 🧪 Test Each Module

| Module | How to Test |
|--------|-------------|
| **Legal Q&A** | Click "Legal Q&A Engine" → Click a sample question → Click "Get Legal Advice" |
| **Moot Court** | Click "Moot Court" → Select a case → Choose Plaintiff → Start → Type 2-3 arguments → End |
| **Document Scanner** | Click "Document Scanner" → "Load Sample Contract" → "Scan Document" |
| **Case Law** | Click "Case Law Explorer" → Click a sample scenario |
| **Dashboard** | Click "Student Dashboard" → View your stats (populate after doing moot sessions) |

---

## 🔌 API Documentation

While backend is running, open:
- **Swagger UI:** http://localhost:8000/api/docs
- **ReDoc:** http://localhost:8000/api/redoc

---

## ❌ Common Errors & Fixes

### "Cannot connect to database"
```
Error: Connection refused (postgresql+asyncpg://...)
```
**Fix:** PostgreSQL is not running.  
- Windows: Open **Services** → Find **postgresql-x64-XX** → Start it  
- Or: `pg_ctl start` in your PostgreSQL bin folder

---

### "Invalid Anthropic API key"
```
Error: 401 Unauthorized
```
**Fix:** Open `backend/.env` → Check `ANTHROPIC_API_KEY` is correct (starts with `sk-ant-`)

---

### "Module not found" errors
```
ModuleNotFoundError: No module named 'fastapi'
```
**Fix:** Virtual environment not activated.
```bash
cd backend
venv\Scripts\activate    # Windows
source venv/bin/activate # Mac/Linux
```

---

### "npm: command not found"
**Fix:** Install Node.js from https://nodejs.org → Restart VS Code

---

### Frontend shows blank page
**Fix:** Check browser console (F12).  
- Usually means backend is not running on port 8000
- Start backend first, then frontend

---

### Port already in use
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

## 📁 VS Code Recommended Extensions

Install these for best development experience:

1. **Python** (Microsoft)
2. **ES7+ React/Redux snippets**
3. **Prettier - Code formatter**
4. **Thunder Client** (API testing, like Postman)
5. **PostgreSQL** (by Chris Kolkman)

---

## 🏗️ Production Deployment (Optional)

### Backend (Railway / Render)
```bash
# Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Upload the `dist/` folder
```

---

## 📞 Troubleshooting Checklist

Run through this if something breaks:

- [ ] PostgreSQL service is running
- [ ] `lexai_db` database exists
- [ ] `.env` has correct DB password
- [ ] `.env` has valid Anthropic API key
- [ ] Virtual environment is activated (see `(venv)` in terminal)
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] No firewall blocking localhost ports
