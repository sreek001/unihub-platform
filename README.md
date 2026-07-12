<div align="center">

# 🎓 UniHub
### Next-Generation Campus Intelligence & Automation Platform

<p align="center">
  <strong>A decentralized, unified operational ecosystem for modern engineering campuses —<br>
  zero-latency visual computing, high-performance data orchestration, and distributed utility scaling.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8"/>
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Framer_Motion-12.x-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production_Ready-10b981?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-6366f1?style=flat-square" />
  <img src="https://img.shields.io/badge/Platform-Web_%2B_Backend-f59e0b?style=flat-square" />
</p>

</div>

---

## 📌 Overview

**UniHub** is a high-performance, unified campus automation ecosystem purpose-built for the operational demands of modern engineering institutions. It bridges the gap between fragmented digital campus services and physical-world utility by converging five mission-critical operational domains — academics, venue booking, food ordering, document printing, and lost-and-found management — into a single, coherent, role-partitioned application shell.

The platform is engineered around three principal design axioms:

1. **Zero-Latency Interaction.** Every interactive surface is deliberately decoupled from the React synthetic event system where latency is unacceptable. Native browser `PointerEvent` listeners, Framer Motion `useMotionValue` primitives, and `useAnimationFrame` drive the visual layer entirely outside the React render cycle.

2. **Universal Glassmorphism Shell.** A locked, predictable light-theme design system uses `bg-white/60 backdrop-blur-xl` component hulls floating over a live animated coordinate grid, creating a premium spatial depth effect with no compromise to WCAG typography contrast requirements.

3. **Strict Role Isolation.** A five-tier role hierarchy (`student`, `faculty`, `canteen_admin`, `xerox_admin`, `venue_admin`) gates every route at both the frontend navigation layer and the backend JWT middleware layer, ensuring operators and students never share the same interface context.

---

## ⚡ Premium UI/UX & Interactive Canvas Engine

### GPU-Accelerated Infinite Grid Background

The centrepiece of the UniHub visual system is the `InfiniteGridBackground` (`frontend/src/components/ui/infinite-grid-background.tsx`) — a GPU-composited, continuously scrolling coordinate canvas implemented in Framer Motion.

**Architecture:**

- **Dual-layer SVG grid rendering:** A static base grid (`opacity-20`) provides a persistent ambient structure. A second, identical grid layer is rendered above it with full opacity but masked by a dynamic radial gradient — producing the characteristic "flashlight" illumination effect that follows the cursor in real time.
- **`useAnimationFrame` scroll engine:** The grid offset values (`gridOffsetX`, `gridOffsetY`) are advanced by `0.5px` per animation frame entirely within Framer Motion's internal animation scheduler, meaning the scroll loop never triggers a React re-render.
- **Native pointer tracking:** Mouse position is tracked via `window.addEventListener("pointermove", handler, { passive: true })` writing directly into `useMotionValue` primitives — completely bypassing React's synthetic event system and eliminating all input-thread overhead.
- **`useMotionTemplate` masking:** The flashlight mask is computed as a live reactive value:
  ```
  radial-gradient(400px circle at ${mouseX}px ${mouseY}px, black, transparent)
  ```
  This template string updates at pointer speed without scheduling any React state update.
- **Ambient depth orbs:** Two soft `blur-[120px]` orbs (indigo top-right, blue bottom-left) are composited at `z-0` to add environmental depth cues beneath the grid lanes.

**Key Outcome:** The input thread carries zero JavaScript overhead from the background animation. All cursor interactions — clicks, drags, form inputs — pass through to DOM elements at native browser speed.

---

### Universal Glassmorphism Layout Shell

Every authenticated dashboard panel inherits a strict structural pattern:

```
InfiniteGridBackground (bg-slate-50 root)
  └── z-0  → [Static Grid] + [Flashlight Grid] + [Ambient Orbs]
  └── z-10 → Dashboard content
        └── Glassmorphic card hulls
              background: rgba(255,255,255,0.60)
              backdropFilter: blur(24px)
              border: 1px solid rgba(255,255,255,0.60)
```

Component hulls use `bg-white/60 backdrop-blur-xl` so the animated grid visibly drifts beneath them. Typography is anchored to `text-slate-900` (primary) / `text-slate-600` (secondary) for WCAG AA compliance. Navigation bars use `background: rgba(255,255,255,0.60); backdrop-filter: blur(24px)` with sticky positioning, maintaining visual continuity with the grid layer below.

---

### Opaque Authentication Boundary

> **Engineering Note:** `LoginPage.jsx` intentionally and permanently bypasses the global `InfiniteGridBackground` shell. It maintains its own distinct premium, isolated dark glassmorphism viewport layout. **Do not inject global grid wrappers or remove contrast elements from this component.** Its dark visual boundary is a deliberate design decision creating a high-contrast entry point separate from the light-mode dashboard environment.

---

### Role-Partitioned Routing Architecture

The `AuthContext` JWT validation layer (`/api/auth/me`) rehydrates sessions on every app load. Role-to-route mapping is enforced at both frontend (`ProtectedRoute`) and backend middleware layers:

| Role            | Default Landing Route | Interface Context           |
|:----------------|:----------------------|:----------------------------|
| `student`       | `/`                   | Full AppLayout shell        |
| `faculty`       | `/`                   | Full AppLayout shell        |
| `canteen_admin` | `/canteen/admin`      | Isolated KDS workspace      |
| `xerox_admin`   | `/print/admin`        | Isolated Print Admin panel  |
| `venue_admin`   | `/venue/admin`        | Isolated Venue control board|

Admin roles are **server-side seeded only** — the self-registration endpoint (`POST /api/auth/register`) is restricted to `student` and `faculty` roles.

---

## 🏢 Core Platform Interface Modules

### 🍽️ Live Canteen Kitchen Display System (KDS)

A dual-sided, real-time food ordering and order management interface.

**Student-Facing Dashboard (`/canteen`)**
- Live menu browsing with item availability status (per-item toggle controlled by operators).
- Cart management with live per-item quantity controls and animated tray sidebar.
- Order submission via `POST /api/canteen/orders`; real-time order status tracking.
- Glassmorphic sticky cart sidebar (`CartSidebar`) with gradient total display and spring-animated item entry/exit transitions (`AnimatePresence mode="popLayout"`).

**Operator Kitchen Display System (`/canteen/admin`)**
- Full-screen, split-panel layout: a live Kanban board on the left and a menu management sidebar on the right.
- **`AdminKanban`** — a live Kanban ticket engine with four state columns: `received → preparing → ready → completed`. Ticket state is advanced via `PATCH /api/canteen/order/:id/status`.
- Orders are polled at **3-second intervals** via `setInterval`, with a `previousOrderCount` ref tracking the delta to trigger an audio notification (`/sounds/new-order.mp3`) on new incoming tickets.
- **`AdminSidebar`** — per-item availability toggle panel (`PATCH /api/canteen/menu/:id/availability`) with an "Add Menu Item" modal (`AddItemModal`) for live menu injection via `POST /api/canteen/menu`.
- Live status indicator badge (`SYSTEM LIVE` with a pulsing emerald dot) confirms the polling connection is active.

---

### 🖨️ Xerox & Print Hub

A distributed document processing queue with a client-side PDF intelligence layer.

**Student Document Submission (`/print`)**
- File upload interface accepting PDF documents with an **integrated client-side PDF page counter** that scans raw `Uint8Array` PDF structures for `/Type /Page` objects and `/Count N` entries, computing page count locally without a server round-trip.
- **Live cost estimation calculator** — computes total print cost in real time based on page count, copy count, single/double-sided selection, and paper size configuration.
- Configurable per-job parameters: copies, colour/monochrome, paper size, binding options.
- Job submission via the print API with live queue status tracking.

**Print Operator Admin Panel (`/print/admin`)**
- Operator-scoped view with full job queue visibility enabling status workflow progression.
- Live job queue metrics and operator workload indicators.
- Full dual-mode component architecture: `adminMode={true}` prop toggles `PrintDashboard` between student and operator interface contexts.

---

### 🏛️ Campus Venue Booking Dashboard

A temporal grid scheduler for physical space reservation across the engineering campus.

**Student/Faculty Booking Interface (`/bookings`)**
- Real-time venue catalogue with live availability checking against the PostgreSQL booking table.
- Time slot picker covering the full academic day — `08:00–17:00` in one-hour bands (9 discrete slots), with slot labels mapped to human-readable display strings.
- Collision detection enforced at the backend (`booking.sql`) — duplicate slot/venue/date combinations are rejected before persistence.
- Bookable venue registry:

  | Venue | Location | Capacity | Type |
  |:------|:---------|:---------|:-----|
  | Main Seminar Hall | Block A — Ground Floor | 250 | Seminar Hall |
  | Department Seminar Hall | Block B — 2nd Floor | 120 | Seminar Hall |
  | Advanced IoT Lab | Block C — 3rd Floor | 40 | Lab |
  | Open Auditorium | Central Campus Grounds | 500 | Auditorium |
  | Mini Conference Room | Admin Block — Room 104 | 20 | Conference Room |
  | Robotics Research Lab | Block D — 1st Floor | 30 | Lab |
  | Innovation Hub | Library Building — 4th Floor | 60 | Project Space |

- Faculty admin view (`/dashboard/booking-admin`, `adminView={true}`) provides a cross-user booking management interface.

**Venue Admin Control Board (`/venue/admin`)**
- Full campus venue matrix with type-colour-coded status badges.
- Real-time pending request counter with a direct "Open Authorizer Queue" CTA.
- Spring-animated staggered card entry with `containerVariants` / `itemVariants` Framer Motion orchestration.

**Booking Authorizer Queue (`/venue/admin/authorizer`)**
- Dedicated sub-route for venue admins to review, approve, or reject incoming faculty reservation requests.

---

### 📚 Academics Portal — Textbook Marketplace & Vault

A localized academic resource exchange terminal for peer-to-peer textbook trading.

**Textbook Marketplace (`/academics/marketplace`)**
- Full-catalogue peer listing with a four-stage status lifecycle: `Available → Requested → Accepted → Transferred`.
- Per-listing metadata: title, author, price (₹), condition (`Like New` / `Good` / `Fair` / `Poor`), department category, description.
- Department-partitioned category filter matrix:
  - Computer Science & Engineering
  - AI & Data Science Engineering
  - Electrical & Electronics Engineering
  - Electronics & Communication Engineering
  - Electronics & Biomedical Engineering
  - Mechanical Engineering / Civil Engineering
  - Robotics & Automation Engineering
  - Basic Science & Humanities
- Live search across title, author, and description fields with real-time filter composition.
- **Seller flow:** Modal-based listing submission (`POST /api/academics/textbooks`) with full form validation.
- **Buyer flow:** "Request Handover" action (`POST /api/academics/handover`) with an ownership guard preventing self-purchase.

**Digital Vault (`/academics/vault`)**
- Centralized digital document repository for academic reference materials.

**Inventory & Settings**
- `AcademicsLayout` wraps all sub-routes in a shared navigation shell; nested routes include `marketplace`, `vault`, `inventory`, and `settings`.

---

### 🔍 Campus Lost & Found Hub

A community-driven item recovery board with spatial campus coordinate filtering.

- Dual-category filtering: **Lost** and **Found** postings with status badges (`Available`, `Claim Pending`, `Ready for Pickup`).
- Location-based filtering matrix covering campus spatial coordinates: Library Commons, Chemistry Building, Student Center, Engineering Quad, and all major campus blocks.
- Full-text search across item name, description, and location fields.
- Listing lifecycle: post → claim request → claim validation → resolved.
- Contact information exposure (email, phone) for verified item claim coordination.
- **Automated cleanup cron job** (`cleanupLostFound.js`) — a scheduled background task purging stale posts to maintain board relevance. Executed at server startup and on a recurring schedule via `setInterval`.

---

## 🛠️ System Architecture

### Repository Structure

```
unihub-platform-main/
├── backend/                           # Node.js + Express REST API
│   ├── index.js                       # Application entry — mounts all modules, runs initDb
│   └── src/
│       ├── db.js                      # PostgreSQL pool (Supabase connection string)
│       ├── initDb.js                  # Transactional SQL migration runner
│       ├── cron/
│       │   └── cleanupLostFound.js    # Scheduled post-expiry cleanup cron job
│       ├── middleware/                # JWT auth verification middleware
│       └── modules/
│           ├── auth/                  # Users table, role enum, JWT login/register/me
│           ├── booking/               # Venue catalogue, time-slot reservation, collision guard
│           ├── canteen/               # Menu CRUD, order lifecycle, KDS status advancement
│           ├── lostFound/             # Community board posts, claim management
│           ├── print/                 # Document job queue, PDF upload, operator workflow
│           └── academics/             # Textbook listings, handover request management
│
└── frontend/                          # Vite + React 19 Client Interface
    └── src/
        ├── App.jsx                    # Root router — all route definitions, AppLayout shell
        ├── context/
        │   └── AuthContext.jsx        # JWT provider — login, register, logout, authHeader
        ├── components/
        │   ├── ProtectedRoute.jsx     # Role-gated route guard
        │   ├── HeroGeometric.jsx      # Landing hero section
        │   ├── DisplayCards.jsx       # Feature showcase cards
        │   └── ui/
        │       ├── infinite-grid-background.tsx  # GPU-accelerated canvas engine
        │       ├── origin-button.tsx             # Pointer-origin ripple button primitive
        │       └── container-scroll-animation.tsx
        ├── pages/
        │   ├── Auth/LoginPage.jsx         # Isolated dark-glass auth boundary
        │   ├── Canteen/
        │   │   ├── dashboard.jsx          # Student canteen portal
        │   │   ├── AdminDashboard.jsx     # KDS operator control panel
        │   │   └── components/
        │   │       ├── CartSidebar.jsx
        │   │       ├── admin/AdminKanban.jsx
        │   │       ├── admin/AdminSidebar.jsx
        │   │       └── admin/AddItemModal.jsx
        │   ├── Booking/BookingDashboard.jsx
        │   ├── Venue/
        │   │   ├── VenueAdminDashboard.jsx
        │   │   └── VenueAuthorizerPage.jsx
        │   ├── Print/PrintDashboard.jsx
        │   ├── LostFound/LostFound.jsx
        │   └── academics/
        │       ├── AcademicsLayout.jsx
        │       ├── Marketplace.jsx
        │       ├── Vault.jsx
        │       ├── Inventory.jsx
        │       ├── Settings.jsx
        │       └── UserContext.jsx
        └── config/
            └── cdn.js                     # Cloudflare CDN base URLs for static doc resources
```

---

### Dual-Stack Framework Configuration

#### Frontend Client — Vite + React 19

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| Build tool | Vite + `@vitejs/plugin-react` | `8.x` | HMR, ESM-native bundling (Oxc transformer) |
| UI framework | React + React DOM | `19.x` | Component tree, concurrent rendering |
| Animation | Framer Motion + `motion` | `12.x` | Canvas engine, spring transitions, AnimatePresence |
| Styling | Tailwind CSS + PostCSS | `4.x` | Utility-first design tokens |
| Class merging | `tailwind-merge` + `clsx` | `3.x` / `2.x` | Conditional class composition |
| Routing | React Router DOM | `7.x` | Nested routes, protected outlets |
| Icons | Lucide React | `1.x` | Consistent icon vocabulary |
| Animation | GSAP | `3.x` | Supplementary timeline animations |
| Spatial math | `vecteur` | `0.3.x` | Vector utility functions |
| Notifications | React Toastify | `11.x` | User-facing toast alerts |
| Types | TypeScript config matrix | — | `.tsx` UI primitives with full type safety |

#### Backend API — Node.js + Express 5

| Layer | Technology | Version | Purpose |
|:------|:-----------|:--------|:--------|
| Runtime | Node.js | `18+` | Event-loop, async I/O |
| Framework | Express | `5.x` | REST routing, middleware pipeline |
| Database driver | `pg` Pool | `8.x` | PostgreSQL connection pool |
| Hosted DB | Supabase | — | Managed PostgreSQL (`ssl: { rejectUnauthorized: false }`) |
| Auth | `bcryptjs` + `jsonwebtoken` | `3.x` / `9.x` | Password hashing, JWT issuance |
| File upload | Multer | `2.x` | PDF document ingestion, `/uploads` static serving |
| PDF parsing | `pdf-parse` | `2.x` | Server-side document structure analysis |
| Config | `dotenv` | `17.x` | Environment variable injection |
| Dev server | Nodemon | `3.x` | File-watch hot-restart |

---

### API Route Map

| Method | Endpoint | Module | Description |
|:-------|:---------|:-------|:------------|
| `POST` | `/api/auth/register` | Auth | Student/faculty self-registration |
| `POST` | `/api/auth/login` | Auth | JWT issuance on credential validation |
| `GET` | `/api/auth/me` | Auth | Token validation + user rehydration |
| `GET` | `/api/booking/venues` | Booking | Venue catalogue fetch |
| `POST` | `/api/booking` | Booking | Slot reservation with collision guard |
| `GET` | `/api/booking/my` | Booking | User reservation history |
| `GET` | `/api/canteen/menu` | Canteen | Full menu with availability states |
| `POST` | `/api/canteen/menu` | Canteen | Add menu item (operator only) |
| `PATCH` | `/api/canteen/menu/:id/availability` | Canteen | Toggle item availability |
| `POST` | `/api/canteen/orders` | Canteen | Submit new student order |
| `GET` | `/api/canteen/orders` | Canteen | All active orders (KDS live feed) |
| `PATCH` | `/api/canteen/order/:id/status` | Canteen | Advance order through KDS states |
| `GET` | `/api/print` | Print | Print job queue |
| `POST` | `/api/print` | Print | Submit print job with PDF upload |
| `GET` | `/api/lostfound` | Lost & Found | All active board listings |
| `POST` | `/api/lostfound` | Lost & Found | Post new lost/found listing |
| `GET` | `/api/academics/textbooks` | Academics | Full textbook marketplace catalogue |
| `POST` | `/api/academics/textbooks` | Academics | Create new textbook listing |
| `POST` | `/api/academics/handover` | Academics | Submit purchase handover request |

---

### Hardware Acceleration & Edge Runtime Note

The UniHub localization runtime and multi-modal data processing pipeline is benchmarked and optimized for execution on local hardware setups equipped with **NVIDIA RTX 4060** GPUs. The GPU acceleration context is leveraged for:

- High-frequency data sonification model processing.
- Multi-modal parameter batch evaluation at the edge.
- Real-time canvas compositing — GPU-layer promotion is enforced via `will-change: transform` and `willChange: 'transform, opacity'` applied to all animated card and canvas elements, instructing the browser's compositor to promote these elements to independent GPU compositing contexts.

---

## 🌐 Sub-Projects & Regional Ecosystem Integrations

UniHub serves as both a production platform and a foundational framework from which the following specialized ecosystem projects have been developed.

---

### 📖 Slate — Open-Source Academic Tracking Module

**Slate** is a mobile-first academic tracker built as a standalone companion to UniHub's academic infrastructure.

- **Natural Language Parsing Engine:** An embedded NLP layer that parses freeform academic schedule input (e.g., *"Algorithms quiz every Thursday at 2pm"*) into structured calendar events without manual form entry.
- **Glassmorphic Dashboard:** A full glassmorphism UI system — design-compatible with UniHub's visual language — presenting a student's complete academic timeline including assignments, exams, and attendance records.
- **Open-Source Architecture:** Publicly available as a reference implementation for academic lifecycle management, designed to integrate with UniHub's `academics` module API surface.

---

### 📡 Prana-Mesh — Decentralized Emergency Communication Link

**Prana-Mesh** is an off-grid disaster recovery communication and emergency tracking system for scenarios where network infrastructure is unavailable.

- **Android-Native BLE Broadcasting Engine:** A native Android application implementing a **Bluetooth Low Energy (BLE)** mesh broadcasting engine — devices propagate emergency presence signals peer-to-peer without any internet infrastructure dependency.
- **FastAPI Spatial Indexing Backend:** A high-performance **FastAPI** backend with a spatial indexing layer that aggregates BLE node reports and maps active emergency signals to geographic coordinates in real time.
- **Disaster Recovery Use Case:** Deployed as a campus emergency coordination tool, enabling student and faculty location broadcasting during infrastructure failure events.

---

### 🏛️ Koottu — Regional E-Governance Navigation Framework

**Koottu** is a public service orchestration platform targeted at municipal and state-level administrative workflows for the e-governance context of **Kerala**.

- **FastAPI Graph Engine:** A graph-traversal API layer built in FastAPI that models complex administrative process dependencies as directed acyclic graphs (DAGs), allowing citizens to navigate multi-step bureaucratic workflows — land registration, certificate issuance, utility connection requests — with a single unified interface.
- **Process Untangling:** Resolves circular dependencies and ambiguous procedure chains, mapping each workflow to its canonical sequence of steps, responsible departments, and required documentation.
- **Kerala Regional Integration:** Aligned with Kerala state digital governance initiatives, with API schemas designed to interface with existing state service directories.

---

### 🤖 Epic Robotics Framework Integration

Technical faculty and robotics prototyping pipelines developed alongside UniHub integrate computer vision scripts, hardware sensor arrays, and communication modules directly with physical microcontrollers.

- **Computer Vision Pipelines:** Python-based CV scripts (OpenCV, MediaPipe) processing live sensor feeds from campus robotics laboratory setups.
- **Hardware Interfaces:** Direct serial communication targeting **Arduino** (AVR / ARM Cortex) and **ESP32/ESP8266** microcontrollers for IoT sensor integration and actuator control.
- **Robotics Research Lab Node:** The campus Robotics Research Lab (Block D, 1st Floor, capacity 30) is a bookable space within the UniHub venue system — directly linking the software platform to the physical hardware prototyping environment.

---

### 🏦 Enterprise-Grade Placement Benchmarks — UIDAI Technology Centre

The platform's full-stack architecture, database orchestration patterns, and security implementation are engineered to meet the stringent technical benchmarks required for **Technology Centre placements with the Unique Identification Authority of India (UIDAI)**.

- **Security Standards:** JWT-based stateless authentication with role-segregated API access, `bcryptjs` password hashing, and SSL-enforced Supabase PostgreSQL connections.
- **Database Integrity:** Transactional SQL migration execution — all schema changes run within `BEGIN / COMMIT / ROLLBACK` blocks, ensuring atomic schema evolution without partial-state corruption.
- **Scalable Module Partition:** The strict module boundary architecture mirrors enterprise microservice decomposition patterns, enabling horizontal scaling of individual service domains under production load.

---

## 💻 Local Setup & System Runtime

### Prerequisites

| Requirement | Minimum Version |
|:------------|:----------------|
| Node.js | `v18.x` |
| npm | `v9.x` |
| Git | Any recent version |
| PostgreSQL | Managed via Supabase — connection string in `.env` |

---

### Step 1 — Synchronize Repository

```bash
git pull origin main
```

---

### Step 2 — Initialize Frontend Asset Graph

```bash
cd frontend
npm install
```

Resolves the complete dependency manifest including: `react@19`, `framer-motion@12`, `gsap@3`, `vecteur@0.3`, `lucide-react@1`, `tailwindcss@4`, `tailwind-merge@3`, `clsx@2`, `react-toastify@11`, `react-router-dom@7`.

---

### Step 3 — Boot Frontend Dev Server

```bash
npm run dev
```

Navigate to:

```
http://localhost:5174/
```

---

### Step 4 — Initialize Backend API Engine

In a **separate terminal:**

```bash
cd backend
npm install
npm start
```

For Nodemon auto-restart during development:

```bash
npm run dev
```

Express server boots on `http://localhost:4000/`. On startup, `initDatabase()` executes the transactional SQL migration sequence for `auth`, `booking`, and `lostFound` schemas.

---

### Environment Configuration

**`backend/.env`**

```env
DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[database]?sslmode=require
JWT_SECRET=your_jwt_secret_key
PORT=4000
```

**`frontend/.env`** (optional — defaults to `http://localhost:4000`)

```env
VITE_API_URL=http://localhost:4000
```

---

## 📊 Verification & Health Checks

**Database connectivity:**

```bash
cd backend
node verify-db.js
# ✅ Success! Database connected.
```

**API server health:**

```bash
curl http://localhost:4000/api
# → { "status": "ok", "message": "Backend ready for Booking, Canteen & Lost Found" }
```

---

## 🛡️ Engineering & Contribution Guidelines

### Opaque Core Exclusion

`LoginPage.jsx` operates on a **standalone dark-glass aesthetic layout boundary** — a permanent, intentional design decision. Do not:
- Inject `InfiniteGridBackground` or any global grid wrapper into the login viewport.
- Remove or alter the dark contrast glass blocks that define its visual boundary.
- Apply the global light-theme system (`bg-slate-50`, `text-slate-900`) to this component.

### Data Integrity Constraint

**Permissible:** Modifying presentational styling properties — `background`, `backdrop-filter`, `border-radius`, `padding`, `color`, `font-*`.

**Prohibited:** Detaching, renaming, or removing any prop, handler, state variable, or API hook connected to backend data operations. This includes `advanceStatus`, `toggleAvailability`, `placeOrder`, `handleRequestHandover`, `fetchOrders`, `fetchMenu`, and all authentication lifecycle functions.

### Component Path Conventions

```javascript
import { InfiniteGridBackground } from '@/components/ui/infinite-grid-background';
import { OriginButton } from '@/components/ui/origin-button';
import { cn } from '@/lib/utils';
```

### Admin Role Provisioning

`canteen_admin`, `xerox_admin`, and `venue_admin` roles must be seeded directly into the PostgreSQL `users` table server-side with a pre-hashed `bcryptjs` password — they cannot be self-registered via the public endpoint.

---

<div align="center">

---

**UniHub** — Built with precision for the modern engineering campus.

*Vite · React 19 · Framer Motion 12 · Node.js · Express 5 · PostgreSQL · Supabase*

© 2026 UniHub Campus Platform. All rights reserved.

</div>
