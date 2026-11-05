# SecureDMS — Architecture Document

**Version**: 1.0.0 — Hackathon Prototype  
**Team**: DocShield  
**Date**: October 2026

---

## 1. System Architecture

SecureDMS follows a modern three-tier architecture with clear separation of concerns:

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │             React SPA (TypeScript + Vite)              │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────────┐  │  │
│  │  │Auth  │ │RBAC  │ │Pages │ │Charts│ │ Components │  │  │
│  │  │Context│ │Guard │ │Router│ │      │ │            │  │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └────────────┘  │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │ Axios HTTP (JWT Bearer)              │
└───────────────────────┼──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                      APPLICATION TIER                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               Express.js REST API Server               │  │
│  │                                                        │  │
│  │  MIDDLEWARE CHAIN:                                     │  │
│  │  Request → Helmet → CORS → RateLimit → Logger →       │  │
│  │  BodyParser → Router → Auth → RBAC → Controller →     │  │
│  │  Audit → Response                                      │  │
│  │                                                        │  │
│  │  SERVICES:                                             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │  Hash    │ │    AI    │ │   OCR    │ │Cloudinary│ │  │
│  │  │ SHA-256  │ │ Analysis │ │  Extract │ │  Upload  │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────┬──────────────┬──────────────┬─────────────────────┘
           │              │              │
┌──────────▼───┐  ┌───────▼───┐  ┌──────▼──────┐
│   MongoDB    │  │Cloudinary │  │  AI/OCR     │
│   Database   │  │  CDN      │  │  Provider   │
│              │  │           │  │ (Optional)  │
│  • Users     │  │  • PDFs   │  │             │
│  • Cases     │  │  • Images │  │  • Classify │
│  • Documents │  │  • DOCX   │  │  • Summarize│
│  • Versions  │  │           │  │  • Extract  │
│  • AuditLogs │  │           │  │             │
└──────────────┘  └───────────┘  └─────────────┘
```

---

## 2. Data Flow

### Document Upload Flow

```
User selects file
       │
       ▼
┌──────────────┐
│  Frontend    │ Validates file type & size
│  Upload Form │ Creates FormData
└──────┬───────┘
       │ POST /api/documents/upload (multipart/form-data)
       ▼
┌──────────────┐
│  Multer      │ Parses multipart, stores in memory buffer
│  Middleware   │ Validates MIME type
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Controller  │ 1. Generate Document ID (DOC-YYYY-NNNNN)
│              │ 2. Compute SHA-256 hash of file buffer
│              │ 3. Upload to Cloudinary
│              │ 4. Create MongoDB Document record
│              │ 5. Create Version 1 record
│              │ 6. Create Audit Log entry
│              │ 7. Trigger AI analysis (async)
│              │ 8. Return document with metadata
└──────────────┘
```

### Integrity Verification Flow

```
User clicks "Verify Integrity"
       │
       ▼
┌──────────────┐
│  Frontend    │ POST /api/documents/:id/verify-integrity
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Hash Service                             │
│                                          │
│  1. Retrieve stored SHA-256 hash         │
│  2. Fetch current file from Cloudinary   │
│  3. Compute SHA-256 of current file      │
│  4. Compare hashes                       │
│  5. Log verification attempt (audit)     │
│  6. Return result:                       │
│     • verified: boolean                  │
│     • storedHash: string                 │
│     • currentHash: string                │
│     • verifiedAt: timestamp              │
└──────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  Frontend    │ Displays VERIFIED ✓ or FAILED ⚠
│  Animation   │ Shows hash comparison
└──────────────┘
```

---

## 3. Document Lifecycle

```
INGEST          →   Document uploaded, file stored
    │
SECURE          →   SHA-256 hash computed, file encrypted at rest
    │
UNDERSTAND      →   AI classification, summarization, entity extraction
    │
ORGANIZE        →   Assigned to case, tagged, classified
    │
SEARCH          →   Indexed for full-text search
    │
TRACK           →   Version history maintained
    │
VERIFY          →   Integrity verification available at any time
    │
AUDIT           →   Every action logged immutably
```

---

## 4. Security Architecture

### Authentication Flow

```
┌──────────┐    POST /auth/login     ┌──────────┐
│  Client  │ ──────────────────────▶ │  Server  │
│          │    {email, password}     │          │
│          │                         │  1. Find user by email
│          │                         │  2. bcrypt.compare(password, hash)
│          │                         │  3. Generate JWT token
│          │    {token, user}        │  4. Log USER_LOGIN audit
│          │ ◀────────────────────── │          │
│          │                         └──────────┘
│  Store   │
│  token in│    GET /auth/me
│  localStorage  Authorization: Bearer <token>
│          │ ──────────────────────▶ │  Server  │
│          │                         │  Verify JWT
│          │    {user}               │  Return user data
│          │ ◀────────────────────── │          │
└──────────┘                         └──────────┘
```

### Role-Based Access Control Matrix

| Permission | Admin | Investigator | Forensic | Legal |
|-----------|-------|-------------|----------|-------|
| Manage Users | ✓ | ✗ | ✗ | ✗ |
| View All Cases | ✓ | ✗ | ✗ | ✗ |
| Create Cases | ✓ | ✓ | ✗ | ✗ |
| Upload Documents | ✓ | ✓ | ✓ | ✗ |
| View Assigned Cases | ✓ | ✓ | ✓ | ✓ |
| View Case Documents | ✓ | ✓ | ✓ | ✓ |
| Verify Integrity | ✓ | ✓ | ✓ | ✓ |
| View Audit Logs | ✓ | Own | Own | Own |
| Security Dashboard | ✓ | ✗ | ✗ | ✗ |
| Analytics | ✓ | ✗ | ✗ | ✗ |
| Search Documents | ✓ | ✓ | ✓ | ✓ |

### Security Layers

1. **Transport**: HTTPS (production)
2. **Headers**: Helmet.js (CSP, HSTS, X-Frame, etc.)
3. **Rate Limiting**: 100 req/15min per IP
4. **Authentication**: JWT with configurable expiry
5. **Authorization**: Role-based middleware
6. **Input Validation**: Schema validation on all endpoints
7. **Error Handling**: Sanitized error responses, no stack traces
8. **Audit Logging**: Immutable append-only event trail
9. **Document Integrity**: SHA-256 cryptographic hashing

---

## 5. AI Processing Pipeline

```
Document Upload
       │
       ▼
┌──────────────────┐
│  Text Extraction │
│                  │
│  PDF → Extract   │
│  text directly   │
│                  │
│  Image → OCR     │
│  (if provider    │
│   configured)    │
│                  │
│  TXT/DOCX →     │
│  Read directly   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   AI Service     │
│                  │
│  If AI provider  │──────▶ External AI API
│  configured:     │        (OpenAI/Gemini)
│  Use real API    │
│                  │
│  If not:         │──────▶ Demo Fallback
│  Use heuristic   │        (Deterministic)
│  demo fallback   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Results        │
│                  │
│  • Classification│
│  • Summary       │
│  • Entities      │
│  • Keywords      │
│  • Confidence    │
└──────────────────┘
```

> **Note**: The prototype uses a deterministic demo fallback for AI processing. All AI-generated content is clearly labeled as "AI-Assisted Analysis — Prototype". Production deployment would integrate with OpenAI, Google Gemini, or equivalent AI APIs.

---

## 6. Database Schema

### Entity Relationship

```
┌──────────┐       ┌──────────┐       ┌──────────────────┐
│   User   │──────▶│   Case   │──────▶│    Document      │
│          │creates│          │contains│                  │
│  _id     │       │  _id     │       │  _id             │
│  name    │       │  caseId  │       │  documentId      │
│  email   │       │  title   │       │  name            │
│  role    │       │  status  │       │  sha256Hash      │
│  ...     │       │  ...     │       │  fileUrl         │
└──────────┘       └──────────┘       │  aiSummary       │
     │                                │  ...             │
     │                                └──────┬───────────┘
     │                                       │
     │              ┌───────────────┐        │
     │              │ DocumentVersion│◀───────┘
     │              │               │ has versions
     │              │  versionNumber│
     │              │  sha256Hash   │
     │              │  fileUrl      │
     │              └───────────────┘
     │
     │              ┌───────────────┐
     └─────────────▶│  AuditLog     │
        generates   │               │
                    │  action       │
                    │  resourceType │
                    │  timestamp    │
                    └───────────────┘
```

---

## 7. Deployment Architecture (Production Roadmap)

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                      │
│                 (NGINX / AWS ALB)                     │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
    ┌──────▼──────┐            ┌──────▼──────┐
    │  Frontend   │            │   Backend   │
    │  CDN/Static │            │  Container  │
    │  (Vercel/   │            │  (Docker/   │
    │   S3+CF)    │            │   K8s)      │
    └─────────────┘            └──────┬──────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                   │
             ┌──────▼───┐     ┌──────▼───┐       ┌──────▼───┐
             │ MongoDB  │     │Cloudinary│       │ Redis    │
             │ Atlas    │     │  CDN     │       │ Cache    │
             │ (Replica │     │          │       │ (Session │
             │  Set)    │     │          │       │  + Rate) │
             └──────────┘     └──────────┘       └──────────┘
```

> This is the **proposed production architecture**. The current prototype runs on local development servers.

---

## 8. API Security Headers

The Express application applies the following security headers via Helmet.js:

- `Content-Security-Policy`
- `Cross-Origin-Embedder-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `Strict-Transport-Security`
- `X-Download-Options`
- `X-Content-Type-Options`
- `Origin-Agent-Cluster`
- `X-Permitted-Cross-Domain-Policies`
- `Referrer-Policy`
- `X-XSS-Protection`

---

*Document prepared by Team DocShield for the National Innovation Hackathon 2026.*
