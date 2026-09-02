# 🌸 FLOWER — Maternal Health Passport

> **One place for all your pregnancy records, ready for any hospital — anytime.**

FLOWER is a bilingual (English / ភាសាខ្មែរ) mobile-first web app for pregnant women in Cambodia. It stores medical records, tracks appointments, and provides an emergency health profile so that when unexpected labor happens at an unfamiliar hospital, staff can access critical history instantly. Healthcare providers have a dedicated dashboard to view consented patient records.

---

## The Problem

Pregnant women manage many physical medical documents across multiple clinics and hospitals. During unexpected labor, arriving at an unfamiliar facility slows admission because staff must collect and verify medical history from scratch — a dangerous delay for mother and baby.

---

## Target Users

| Segment | Description |
|---|---|
| **Primary** | Pregnant women in Cambodia (18–40) |
| **Secondary** | Families, hospitals, doctors, nurses, midwives |

---

## Features

### ✅ Currently Implemented

#### Mother App

| Feature | Description |
|---|---|
| **Pregnancy Setup Wizard** | 3-step onboarding: gestational week selector, body metrics, pregnancy/medical history |
| **Role-Based Logins** | Separate Mother login and Doctor / Hospital Admin login, toggled from the login screen |
| **Emergency Medical ID** | One-tap emergency profile card with blood type, allergies, conditions, medications, emergency contact, and ambulance hotline |
| **Emergency QR Code** | Consent-gated QR code for on-site medical staff to scan |
| **Medical Records** | Add, view, filter, search, and delete records by category (ultrasound, lab test, prescription, vaccine, doctor note) and trimester |
| **Record Scanning** | Camera/upload attachment for physical documents |
| **Appointments** | Full CRUD appointments with type (ANC, Ultrasound, Blood Test, Vaccine, Specialist), reminders, and calendar view |
| **Journey Summary Report** | Fetal weight estimation, trimester overview, health metrics display |
| **Pregnancy Timeline** | Week-by-week growth stages with flower metaphor (seed → sprout → bloom) in EN and KH |
| **Bilingual UI** | Full English and Khmer language toggle throughout the app |

#### Doctor / Hospital Admin Portal

| Feature | Description |
|---|---|
| **Doctor Login** | Role selector (Doctor / Midwife or Hospital Admin) with email + password auth |
| **Patient Dashboard** | List of shared patients with pregnancy summary, record count, and next appointment |
| **Patient Detail** | Full maternal profile, pregnancy info, medical history, emergency contacts, records, and appointments |
| **Patient Records** | View all shared medical records with ability to add clinical notes |
| **Emergencies** | Quick access to critical maternal medical information |

#### Backend & Data

| Feature | Description |
|---|---|
| **Express API** | REST API for profiles, medical records, and appointments |
| **MySQL Database** | Persists all data — profiles (JSON), medical_records, and appointments tables |
| **localStorage** | Offline-first fallback that syncs with the backend when available |

### 🔲 Planned / Not Yet Implemented

| Priority | Feature | Notes |
|---|---|---|
| P0 | **Secure Hospital Sharing (live)** | Doctor view currently uses mock patient data; wire to real shared records |
| P1 | **Family Member Access** | Allow a partner or family member to view/edit records with permission |
| P1 | **Cloud Backup** | Encrypted cloud storage for medical documents |
| P1 | **Hospital / Clinic Portal (B2B)** | Full subscription portal for healthcare providers to receive patient records digitally |
| P1 | **Interactive Timeline Visual** | Richer week-by-week visual timeline with milestones |
| P2 | **Freemium Model** | Free tier vs Premium (unlimited storage, sharing, cloud backup) |
| P2 | **Advanced Reminders** | Push notifications, custom reminder intervals, SMS reminders |
| P2 | **B2B Healthcare Partnerships UI** | Insurance company, maternal health org, and clinic network dashboards |

---

## Lean Canvas Summary

| Block | Content |
|---|---|
| **Problem** | Pregnant women carry physical documents; unexpected labor at unfamiliar hospitals means staff must re-collect history, slowing care |
| **Solution** | Digital pregnancy health records, organized timeline, emergency profile, secure sharing, instant medical info access, provider portal |
| **Unique Value Proposition** | **One place for all your pregnancy records, ready for any hospital — anytime.** |
| **Customer Segments** | Pregnant women in Cambodia (primary); families, hospitals, doctors (secondary) |
| **Revenue Streams** | Freemium/Premium subscriptions; Hospital/Clinic B2B subscriptions; Healthcare partnerships |
| **Channels** | Hospital partnerships, healthcare professionals, Facebook/TikTok, parenting communities, word of mouth |
| **Key Metrics** | Active users, records uploaded, record sharing events, partner hospitals, time saved, user retention |
| **Unfair Advantage** | Hospital partnerships, provider network, local knowledge, and trusted record ecosystem |
| **Cost Structure** | Development, cloud/storage, security/compliance, marketing |

### Freemium Tiers

| | Free | Premium |
|---|---|---|
| Pregnancy profile | ✅ | ✅ |
| Basic medical records (5 max) | ✅ | ✅ |
| Pregnancy timeline | ✅ | ✅ |
| Basic reminders | ✅ | ✅ |
| Unlimited document storage | — | ✅ |
| Secure hospital sharing | — | ✅ |
| Emergency medical profile | — | ✅ |
| Family member access | — | ✅ |
| Cloud backup | — | ✅ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite |
| Animations | Motion (Framer Motion) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Language Support | English + Khmer (KH) |
| State | React `useState` / `useMemo` |
| Frontend Storage | `localStorage` (offline fallback) |
| Backend | Express.js + `tsx` |
| Database | MySQL (via `mysql2`) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun
- MySQL server running locally

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** — copy `.env.example` to `.env` and fill in your MySQL credentials:
   ```bash
   cp .env.example .env
   ```
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=flowers_db
   PORT=3000
   ```

3. **Create the database schema** — run the SQL schema file against MySQL:
   ```bash
   # Using the bundled schema
   mysql -u root -p < db/schema.sql
   # or via Node
   node db/init.js
   ```
   This creates `flowers_db` with `profiles`, `medical_records`, and `appointments` tables.

4. **Run locally**
   ```bash
   npm run dev
   ```

   The Express server starts on `http://localhost:3000` and serves the Vite dev client. Open that URL in your browser.

### Other Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Express + Vite) |
| `npm run build` | Build production bundle (Vite + esbuild server) |
| `npm run start` | Run the production server from `dist/` |
| `npm run lint` | Type-check with `tsc --noEmit` |

---

## Using the App

### Mother Login
1. From the login screen, enter a name and any 4-digit PIN (e.g. `1234`) to unlock.
2. Complete the pregnancy setup wizard (weeks, weight, height, medical history).
3. Explore Home, My Records, Calendar, and Passport tabs.

### Doctor / Hospital Admin Login
1. On the login screen, tap **"Doctor / Hospital Login"**.
2. Select **Doctor / Midwife** or **Hospital Admin**.
3. Enter any email + password (demo accepts any credentials).
4. Use the patient dashboard to view shared patient detail and records.

> Use **Logout** (top-right) to switch between mother and doctor sessions.

---

## API Reference

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — reports DB connection status |
| `GET` | `/api/mother-profile/:userId` | Get structured maternal & pregnancy profile |
| `PUT` | `/api/mother-profile/:userId` | Update maternal & pregnancy profile |
| `GET` | `/api/records/:userId` | List medical records for a user |
| `GET` | `/api/records/:userId/:recordId` | Get single medical record detail |
| `POST` | `/api/records` | Create a medical record |
| `PUT` | `/api/records/:id` | Update a medical record |
| `DELETE` | `/api/records/:id` | Delete a medical record |
| `GET` | `/api/appointments/:userId` | List appointments for a user |
| `GET` | `/api/appointments/:userId/:appointmentId` | Get single appointment detail |
| `POST` | `/api/appointments` | Create an appointment |
| `PUT` | `/api/appointments/:id` | Update an appointment |
| `DELETE` | `/api/appointments/:id` | Delete an appointment |

---

## Database Schema

The MySQL database (`flowers_db`) is defined in `db/schema.sql`:

```
profiles
├── id, user_id (unique), data (JSON), created_at, updated_at

medical_records
├── id, user_id, title, category, date, week, trimester,
│   facility, doctor, notes, status, image_attachment,
│   tags (JSON), extracted_data (JSON), created_at

appointments
├── id, user_id, title, date, time, hospital, doctor,
│   notes, completed, type, reminder, image_attachment, created_at
```

All three tables link back to `profiles.user_id` with `ON DELETE CASCADE`.

---

## Roadmap

- [ ] **P0** — Live secure hospital record sharing (connected to real shared data)
- [ ] **P1** — Family member access
- [ ] **P1** — Cloud backup for documents
- [ ] **P1** — Hospital/Clinic B2B subscription portal
- [ ] **P1** — Interactive pregnancy timeline visual
- [ ] **P2** — Freemium tier system
- [ ] **P2** — Push notifications + SMS reminders
- [ ] **P2** — B2B healthcare partnerships UI (insurance, clinics, networks)

> ✅ Backend API + MySQL schema, Doctor/Nurse dashboard, and role-based auth are **implemented**.

---

## License

Apache-2.0
