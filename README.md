# ⚖️ LexAI — AI-Powered Legal Intelligence Platform

> Final Year CSE Project | Full-Stack | FastAPI + React + PostgreSQL + Claude AI

---

## 🧠 Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Legal Q&A Engine** | Ask legal questions in English/Hindi/Tamil, get structured answers |
| 2 | **AI Moot Court** | Practice arguments against AI Judge + Opposing Counsel |
| 3 | **Document Scanner** | Identify SAFE/RISKY/ILLEGAL clauses in contracts |
| 4 | **Case Law Explorer** | Semantic search across Indian case law |
| 5 | **Student Dashboard** | Track performance, score trends, citation bank |

---

## 🗂️ Project Structure

```
lexai/
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── main.py
│   │   ├── core/     # config, database, security
│   │   ├── models/   # SQLAlchemy models
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # business logic
│   │   └── ai/       # LLM integration
│   ├── requirements.txt
│   └── .env
└── frontend/         # React + Vite frontend
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   └── utils/
    ├── package.json
    └── .env
```

---

## ⚡ Quick Setup

See **SETUP.md** for full step-by-step instructions.

**TL;DR:**
```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/qa` | Legal Q&A |
| POST | `/api/moot/start` | Start moot session |
| POST | `/api/moot/turn` | Submit argument |
| POST | `/api/moot/end` | End session + verdict |
| GET | `/api/moot/sessions` | List sessions |
| POST | `/api/document/scan-text` | Scan pasted text |
| POST | `/api/document/scan` | Scan uploaded file |
| POST | `/api/cases/search` | Case law search |
| GET | `/api/student/dashboard` | Dashboard data |

---

## 🗄️ Database Schema

- **users** — id, name, email, hashed_password, role, is_active
- **moot_sessions** — id, user_id, case_title, scores, verdict, messages
- **document_scans** — id, user_id, filename, risk, clauses
- **case_searches** — id, user_id, query, results

---

## 🛠️ Tech Stack

**Backend:** FastAPI · SQLAlchemy (async) · PostgreSQL · Anthropic Claude API · JWT Auth  
**Frontend:** React 18 · Vite · React Router · Axios · Recharts · Zustand  
**AI:** Claude claude-opus-4-6 · Structured JSON outputs · Multi-turn conversations

---

## 👨‍💻 Team

Built as a Final Year CSE Project demonstrating real-world AI integration with full-stack web development.
