# SecureDMS

**Secure, Intelligent, Traceable and Verifiable Digital Document Management System**

> *"Securing Every Document. Preserving Every Record."*

**Team DocShield** — National Innovation Hackathon 2026

---

## 🔒 Overview

SecureDMS is an intelligent document lifecycle platform designed for sensitive legal, investigation, forensic, and administrative records. It provides a complete document intelligence and integrity layer that can integrate with existing government systems through secure APIs.

### Core Philosophy

| Pillar | Implementation |
|--------|---------------|
| **Document Storage** | Cloudinary-backed secure file storage |
| **Document Intelligence** | AI-assisted classification, summarization, OCR |
| **Security** | JWT authentication, bcrypt, RBAC, API security |
| **Integrity** | SHA-256 tamper-evident hash verification |
| **Traceability** | Complete audit trail + version history |
| **Verification** | One-click cryptographic integrity verification |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SecureDMS Frontend                     │
│            React + TypeScript + Tailwind CSS              │
│                    (Vite Build)                           │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API (HTTPS)
┌──────────────────────▼──────────────────────────────────┐
│                    SecureDMS Backend                      │
│              Node.js + Express.js                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │   Auth   │ │   RBAC   │ │  Audit   │ │   Rate     │ │
│  │   JWT    │ │  Guard   │ │  Logger  │ │  Limiter   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  SHA-256 │ │    AI    │ │   OCR    │ │ Cloudinary │ │
│  │  Hash    │ │ Service  │ │ Service  │ │  Service   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
└──────────────────────┬──────────────────────────────────┘
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ MongoDB  │ │Cloudinary│ │ AI/OCR   │
    │ Database │ │  Storage │ │ Provider │
    └──────────┘ └──────────┘ └──────────┘
```

---

## ✨ Features

### ✅ Implemented (Working Prototype)

- **Authentication**: JWT-based secure login/logout
- **Role-Based Access Control**: 4 roles (Admin, Investigator, Forensic, Legal) with granular permissions
- **Case Management**: Create, view, edit, filter, and search cases
- **Document Management**: Full CRUD with metadata, classification, and security levels
- **Secure File Storage**: Cloudinary integration with fallback for demo mode
- **SHA-256 Integrity Hashing**: Automatic hash generation on upload
- **Integrity Verification**: One-click tamper-evident verification with hash comparison
- **Document Versioning**: Full version history with change descriptions
- **Audit Trail**: Comprehensive immutable logging of all system actions
- **AI-Assisted Analysis (Prototype)**: Classification, summarization, entity extraction, keyword extraction
- **OCR Architecture**: Text extraction pipeline (configurable provider)
- **Smart Search**: Full-text search across documents with filters
- **Security Dashboard**: System security status and metrics
- **Analytics Dashboard**: Document statistics and visualizations
- **User Management**: Admin CRUD for users and roles
- **Professional UI**: Government-grade enterprise design

### 🔮 Future / Proposed

- Enterprise SSO (SAML/OAuth)
- Multi-Factor Authentication (MFA)
- Production AI models (OpenAI/Gemini integration)
- Advanced OCR (Tesseract/Google Vision)
- Vector/semantic search
- HSM/key management
- High availability & disaster recovery
- Formal security testing & certification
- Government system integrations (e-Courts, CCTNS, etc.)

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB, Mongoose ODM |
| **File Storage** | Cloudinary (with demo fallback) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Security** | Helmet, CORS, express-rate-limit |
| **Hashing** | Node.js crypto (SHA-256) |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

Copy the example env files:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/securedms
JWT_SECRET=your-secure-jwt-secret-here
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary (falls back to demo mode if not configured)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Demo Data

```bash
cd backend
npm run seed
```

This creates:
- 4 demo user accounts
- 3 realistic cases
- 9 documents with metadata and AI analysis
- Document version history
- 18 audit trail entries

### 4. Start the Application

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 👤 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | admin@securedms.demo | Demo@2026 |
| **Investigating Officer** | officer@securedms.demo | Demo@2026 |
| **Forensic Officer** | forensic@securedms.demo | Demo@2026 |
| **Legal Officer** | legal@securedms.demo | Demo@2026 |

> ⚠️ These are **demo-only** credentials for hackathon demonstration purposes.

---

## 🎯 3–5 Minute Demo Flow

1. **Login** → Use any demo account
2. **Dashboard** → Show KPIs, charts, security pillars
3. **Open Case** → View CASE-2026-00124 Financial Investigation
4. **Open Document** → View an investigation report
5. **Document Preview** → Show embedded preview
6. **AI Intelligence** → Show AI classification, summary, entities
7. **SHA-256 Hash** → Show the integrity fingerprint
8. **Verify Integrity** → Click "Verify" → Watch animation → See result
9. **Version History** → Show document versions timeline
10. **Audit Trail** → Show complete activity log
11. **Search** → Search for a document
12. **Role-Based Access** → Switch between different roles

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/register` | Register user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/users` | List users (admin) |
| POST | `/api/users` | Create user (admin) |
| PUT | `/api/users/:id` | Update user (admin) |
| PATCH | `/api/users/:id/status` | Change user status |
| GET | `/api/cases` | List cases |
| POST | `/api/cases` | Create case |
| GET | `/api/cases/:id` | Get case details |
| PUT | `/api/cases/:id` | Update case |
| GET | `/api/documents` | List documents |
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/documents/:id` | Get document |
| PUT | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Archive document |
| GET | `/api/documents/:id/integrity` | Get integrity info |
| POST | `/api/documents/:id/verify-integrity` | Verify integrity |
| GET | `/api/documents/:id/versions` | Get versions |
| POST | `/api/documents/:id/versions` | Create version |
| POST | `/api/documents/:id/analyze` | AI analysis |
| POST | `/api/documents/:id/summarize` | AI summary |
| POST | `/api/documents/:id/classify` | AI classify |
| GET | `/api/search` | Search documents |
| GET | `/api/audit-logs` | Get audit logs |
| GET | `/api/analytics` | Dashboard analytics |

---

## 🔐 Security Architecture

- **Authentication**: JWT tokens with 24h expiry
- **Password Storage**: bcrypt with salt rounds
- **Authorization**: Role-based middleware on every protected route
- **Input Validation**: Request body and parameter validation
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **HTTP Security**: Helmet.js security headers
- **CORS**: Configured origin allowlist
- **Document Integrity**: SHA-256 cryptographic hashing
- **Audit Logging**: Immutable event trail for all actions
- **Error Handling**: Centralized handler, no stack traces exposed

---

## 📁 Project Structure

```
SecureDMS/
├── backend/
│   ├── server.js                  # Express entry point
│   ├── package.json
│   ├── .env.example
│   ├── seed/
│   │   └── seedData.js            # Demo data seeder
│   └── src/
│       ├── config/                # DB, Cloudinary, env config
│       ├── models/                # Mongoose schemas
│       ├── middleware/            # Auth, RBAC, audit, validation
│       ├── controllers/           # Route handlers
│       ├── routes/                # Express route definitions
│       ├── services/              # Hash, AI, OCR, Cloudinary
│       └── utils/                 # Helpers
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── .env.example
│   └── src/
│       ├── App.tsx                # Router setup
│       ├── main.tsx               # Entry point
│       ├── components/            # Reusable UI components
│       ├── pages/                 # Route pages
│       ├── layouts/               # Dashboard layout
│       ├── hooks/                 # Custom hooks
│       ├── services/              # API service layer
│       ├── context/               # Auth context
│       └── types/                 # TypeScript types
├── README.md
└── ARCHITECTURE.md
```

---

## 📋 License

This project is a hackathon prototype developed by **Team DocShield**.

---

*SecureDMS — Securing Every Document. Preserving Every Record.*
