# PATCH 2: fix the build, required sign-in consent, complete usage tracking, daily notes, walkthrough

> **For the AI agent.** This replaces the previous `patch.md`. Written against `main` @ `26c526f`. Line numbers are hints; find code by identifier.
> This is a spec. Implement it as written. If you think something should change, say so in your final report instead of changing it silently.

## 0. Rules for this patch (read first)

1. **The build is currently broken.** In `26c526f`, `src/components/LoginView.tsx` was overwritten by a 29-line JSX fragment (it was 408 lines) and `npm run build` fails at `LoginView.tsx:15`. Fix this **first** (§1).
2. **Make targeted edits only.** Never replace a whole component file with a snippet. Do not regenerate `package-lock.json` wholesale (commit `9418901` removed about 5,400 lines from it). Do not add dependencies.
3. **Run `npm run build` before you finish.** If it fails, do not commit; fix it. Also run `npx tsc --noEmit` and report any errors in files you touched.
4. **DB change notice (mandatory, this patch and every future one).** Whenever the database schema changes, your final report must start with a section called `DB UPGRADE NEEDED: YES` or `NO`. If YES: list each new/changed table, the exact command to run (`npm run db:init`, against the production Aiven DB), and a check query (`SHOW TABLES LIKE '...'`). Use only idempotent `CREATE TABLE IF NOT EXISTS` in `backend/schema.sql`. If you ever need an `ALTER`, put it in `backend/migrations/<date>-<name>.sql` and say so. The owner will run it; do not assume it already ran.
5. Final report must also contain: build result, what you did **not** do, and anything that deviates from this file.

## 1. Fix the errors found in the last review

| # | Problem found | Required fix |
|---|---------------|--------------|
| 1 | `LoginView.tsx` truncated, build fails | `git checkout c44a7ed -- src/components/LoginView.tsx` (the last good 408-line version), then re-apply only what this patch asks (§2, §3.3). |
| 2 | Cookie banner (`CookieBanner.tsx`) never shows | Delete it and its mount in `main.tsx`; consent moves to sign-in (§2). Remove `setConsentCookie` / the `document.cookie` writes from `src/lib/consent.ts` (the server sets cookies now; the client only reads). |
| 3 | No server-confirmed events exist (`writeUsageEvent` is only called from `/api/usage`) | Add the hooks in §3.2. |
| 4 | `lang` column is always NULL | Send the language on every API call and save it (§3.4). |
| 5 | Client calls `trackFeature('register', ...)`, a key the server rejects | Remove the `login` / `register` click events from `LoginView`. The server logs `login` / `signup` only after success (§3.2). |
| 6 | `login` was logged on button click, even with a wrong password | Same fix as 5. |
| 7 | `metadata` accepts any string up to 100 chars (could leak record IDs or free text) | Vocabulary-only metadata (§3.5). |
| 8 | Daily Note allows one entry per date and Save looks broken; notes are wiped on logout | §4. |
| 9 | `FeatureWalkthrough` is never mounted; Khmer text is garbled; 4 steps; needs consent; seen flag is wiped on logout | §5. |

## 2. Required consent at sign-in

### 2.1 Decisions

- **Consent is required.** A user who does not agree cannot use the app.
- **Consent is stored per account** in a new table `user_consents`. The server (not a cookie) decides whether tracking is allowed.
- The text below is bilingual and must be shown exactly (EN and KH together, or by current language).
- Changing `CONSENT_VERSION` (server constant, start with `'2026-10-v1'`) makes every user agree again on next sign-in.
- Applies to mothers **and** doctors / hospital admins.

### 2.2 Consent text

| | Text |
|--|------|
| EN title | **Activity tracking & your consent** |
| EN body | To improve FlowErs and understand how it is used, we record which screens and buttons you use (for example: opening a tab, saving a record or appointment, opening our Telegram bot or information center), the time, and your language. These records are linked to your account. We never record what is inside your records, notes, photos or health values, and never your name, phone number or other personal text. A small cookie keeps one visit together. |
| EN checkbox | I understand and agree. |
| EN hint | You need to agree to continue. |
| KH title | **ការតាមដានសកម្មភាព និងការយល់ព្រមរបស់អ្នក** |
| KH body | ដើម្បីកែលម្អ FlowErs និងយល់ពីរបៀបដែលវាត្រូវបានប្រើ យើងកត់ត្រាថាអ្នកប្រើអេក្រង់ និងប៊ូតុងណាខ្លះ (ឧទាហរណ៍៖ បើកផ្ទាំង រក្សាទុកកំណត់ត្រា ឬការណាត់ជួប បើក Telegram bot ឬមជ្ឈមណ្ឌលព័ត៌មានរបស់យើង) ពេលវេលា និងភាសារបស់អ្នក។ កំណត់ត្រាទាំងនេះត្រូវបានភ្ជាប់ទៅនឹងគណនីរបស់អ្នក។ យើងមិនកត់ត្រាខ្លឹមសារក្នុងកំណត់ត្រា កំណត់ចំណាំ រូបថត ឬតម្លៃសុខភាពរបស់អ្នកទេ ហើយក៏មិនកត់ត្រាឈ្មោះ លេខទូរស័ព្ទ ឬអត្ថបទផ្ទាល់ខ្លួនផ្សេងទៀតដែរ។ ខូគីតូចមួយជួយភ្ជាប់សកម្មភាពក្នុងការចូលមួយលើក។ |
| KH checkbox | ខ្ញុំយល់ និងយល់ព្រម។ |
| KH hint | អ្នកត្រូវយល់ព្រមដើម្បីបន្ត។ |

> A native Khmer speaker should review the KH text before release.

### 2.3 UI

New component `src/components/ConsentNotice.tsx` (title + body + checkbox) used in two places:

1. **Sign-up forms** (`LoginView` register mode and the doctor/admin register mode in `DoctorLoginView`): show the notice with the checkbox. The "Create Account" button stays disabled until it is ticked. Send `consent: true` in the register request body.
2. **`ConsentGate` screen** (`src/components/ConsentGate.tsx`): full-screen, shown **after sign-in** when the server says consent is required (existing users, and anyone on a new `CONSENT_VERSION`), and also when a stored session is restored on app start. Two buttons: **Agree & continue** (needs the checkbox) and **Decline** (calls `handleLogout`).

Sign-in (login) forms get no checkbox. Existing users see `ConsentGate` once.

### 2.4 Server

- Constant `CONSENT_VERSION`.
- `POST /api/auth/register`: if `consent !== true` return `400 { error: 'consent_required' }`. After the user row is created, insert into `user_consents`, set the cookies (§2.5), include `consentRequired: false` in the response.
- `POST /api/auth/login`: after a successful login, check `user_consents` for `(user_id, CONSENT_VERSION)`. Add `consentRequired: boolean` to the response. If consent exists, set the cookies.
- `GET /api/consent/status` (`authenticateToken`): `{ required: boolean, version }`. The client calls it when a stored session is restored.
- `POST /api/consent` (`authenticateToken`): body `{ choice: 'accepted' | 'declined' }`. `accepted` → `INSERT IGNORE` into `user_consents`, set the cookies, return `{ consent: 'accepted' }`. `declined` → return `{ consent: 'declined' }` and write nothing (the client then logs out). **Replace the old unauthenticated `POST /api/consent` and `GET /api/consent`.**
- `POST /api/auth/logout`: clears both cookies (an httpOnly cookie can only be cleared by the server). The client calls it (fire-and-forget) from `handleLogout`.
- Helper `hasConsent(userId)`: reads `user_consents` for the current version, with an in-memory cache (10 minute TTL, updated when consent is accepted). **Every** usage write (§3) must pass this check.

### 2.5 Cookies

| Cookie | Value | httpOnly | Lifetime | Set / cleared |
|--------|-------|----------|----------|---------------|
| `flowers_consent` | `accepted` | no | 180 days | set at login/register/accept when consent exists; cleared at logout |
| `flowers_sid` | 32 hex chars (`crypto.randomBytes(16)`) | yes | 30 days | same |

Both: `path=/`, `SameSite=Lax`, `Secure` when `NODE_ENV === 'production'`. `trust proxy` is already set. `trackFeature` keeps its cheap check on `flowers_consent`, but the **server is the authority**.

### 2.6 New table (`backend/schema.sql` and `backend/reset.sql`)

`user_consents`

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT AUTO_INCREMENT PK | |
| `user_id` | VARCHAR(36) NOT NULL | FK → `users(id)` ON DELETE CASCADE, same charset/collation as `users.id` |
| `consent_version` | VARCHAR(32) NOT NULL | |
| `lang` | ENUM('en','kh') NULL | language shown when agreed |
| `accepted_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |

`UNIQUE (user_id, consent_version)`. In `reset.sql`, drop it before `users`.

## 3. Usage tracking

### 3.1 Gate (server)

`/api/usage` and every server hook write **only if** the user is known (verified token for `/api/usage`; the route's user id for server hooks) **and** `hasConsent(userId)` is true. Events from guests (no valid token) are dropped with `204`. Rate limit stays (120 events/min per session id, fallback IP).

### 3.2 Server-confirmed events (`source = 'server'`)

Write after the DB operation succeeds. Fire-and-forget inside try/catch; a logging failure must never fail the request. Add a helper `logServerEvent({ userId, role, req, feature, action, metadata })` that applies §3.1 and §3.4.

| Route (find by path) | feature_key | action | metadata |
|----------------------|-------------|--------|----------|
| `POST /api/auth/register` (success) | `signup` | `create` | none |
| `POST /api/auth/login` (success) | `login` | `create` | none |
| `PUT /api/mother-profile/:userId/setup` (success) | `setup_wizard` | `complete` | none |
| `POST /api/records` (after INSERT succeeds). This is **"Save to Medical Vault"** | `record_add` | `create` | `category` |
| `POST /api/appointments` (after INSERT succeeds). This is **"Save Appointment"** | `appointment_add` | `create` | `type` |
| same route, **only if** `reminder` is not `none` | `reminder_set` | `create` | `type`, `reminder` |
| `POST /api/daily-notes` (§4) | `daily_note` | `create` | none |
| `POST /api/doctor/records/:recordId/notes` | `doctor_note` | `create` | none |

Notes:
- The free-plan limit check happens in the client, so a blocked "Save to Medical Vault" never reaches the server and correctly logs nothing.
- Edits (`PUT`) are not tracked.
- **What "reminder" means (owner asked for this):** the appointment form has a Reminder dropdown (1 week, 3 days, 1 day, same day, custom, none). `appointment_add` logs **every** saved appointment. `reminder_set` logs only when the user picked a reminder time other than `none`.

### 3.3 Client events

Keep what already works, remove what's invalid, add what's missing. All use `trackFeature()` from `src/lib/usage.ts`.

| feature_key / action | Where | Status |
|----------------------|-------|--------|
| `home_view` … `passport_view` / `view` (`tab`) | effect on `activeTab` in `App.tsx` | keep |
| `logout` / `click` | `handleLogout`, fire **before** localStorage is cleared | keep |
| `language_switch` / `click` (`lang`) | `Header` | keep |
| `emergency_modal` / `open` | `Header` | keep |
| `emergency_qr` / `open`, `journey_report` / `open` | `PassportView` | keep |
| `record_scan` / `open` | `AddRecordModal` | keep |
| `walkthrough` / `start, step, skip, complete` | `FeatureWalkthrough` | keep (§5) |
| `login` / `register` click events | `LoginView` | **remove** (server logs them, §3.2) |
| **`info_link` / `click`, `target: 'telegram_bot'`** | the **Open** button for the Telegram bot (`t.me/FlowErs168bot`) in `InfoAccessView` | **add** |
| **`info_link` / `click`, `target: 'data_center'`** | the **Open** button for the information center (`mae-app-byflowers.vercel.app`) in `InfoAccessView` | **add** |
| `upgrade_modal` / `open`, and `click` on its confirm button | `UpgradeModal` | add |
| `setup_wizard` / `start`, `step` (`step`, `total_steps`) | `PregnancySetupWizard` | add |
| `doctor_dashboard` / `view`, `patient_detail` / `open` | `DoctorDashboard`, `DoctorPatientDetail` | add |
| `walkthrough` / `replay` | replay buttons (§5) | add |

The two `info_link` handlers go on the `<a>` elements (they open a new tab, so use the existing `keepalive: true` fetch; do not block navigation).

### 3.4 Language

- `src/lib/usage.ts`: export `setUsageLang(lang)`; `App.tsx` calls it in an effect whenever `lang` changes.
- Every API request from the client (`apiGet/apiPost/apiPut/apiDelete` in `App.tsx`, the login/register `fetch` calls, and `trackFeature`) sends header `X-App-Lang: en|kh`.
- Server: `getLang(req)` reads that header, accepts only `en` / `kh`, else NULL. Pass it to `writeUsageEvent` so the `lang` column is filled for both client and server events.

### 3.5 Allowlists and metadata (server)

**`VALID_FEATURES`** (final): `signup, login, logout, setup_wizard, home_view, records_view, calendar_view, info_view, passport_view, record_scan, record_add, appointment_add, reminder_set, daily_note, info_link, emergency_modal, emergency_qr, journey_report, language_switch, upgrade_modal, walkthrough, doctor_dashboard, patient_detail, doctor_note`. Mirror it in the `Feature` type in `usage.ts`.

**`VALID_ACTIONS`**: unchanged.

**Metadata: vocabulary only.** Keep a key only if its value is in the allowed set; drop the key otherwise.

| key | allowed values |
|-----|----------------|
| `tab` | home, records, calendar, info, passport |
| `target` | telegram_bot, data_center |
| `category` | the record categories (`ultrasound`, `lab_test`, `prescription`, `vaccine`, `doctor_note`) |
| `type` | ANC, Ultrasound, Blood Test, Vaccine, Specialist, Other |
| `reminder` | 1_week, 3_days, 1_day, same_day, custom, none |
| `tier` | free, premium |
| `variant` | mother, doctor |
| `step`, `total_steps` | integers 1 to 20 |
| `lang` | en, kh |

**Never** store record, folder or appointment IDs, titles, notes, names, phones, emails, dates of birth, medical values or any free text. (The previous explanation allowed `target` to be an ID. That is wrong.)

## 4. Calendar: Daily Notes (fix)

**Problem:** the box stores one `{task, note}` per date in `localStorage['flowers_daily_reminders']` (wiped at logout), and Save clears what's shown.

**Required behavior (in `AppointmentsView.tsx`)**

- Show **all notes for the selected date** as cards (📌 task, 📝 note), each with a delete button (edit optional).
- Below them, an input form: task field, note field, **Add** button (disabled if both empty). On Add: the new card appears immediately, the fields clear, the note is saved to the DB.
- Multiple notes per day, no limit in the UI (server cap: 20 per user per day).
- The calendar dot logic that currently reads `dailyReminders` shows a dot when the date has an appointment **or** at least one daily note.
- Notes survive logout and work across devices. Remove the `flowers_daily_reminders` usage. **One-time import:** if that localStorage key exists on load, POST each non-empty entry to the API, then remove the key.
- `AppointmentsView` receives `dailyNotes`, `onAddDailyNote`, `onDeleteDailyNote` as props; the state and handlers live in `App.tsx` next to the appointment handlers (optimistic update, then API call). Load notes in the same initial `Promise.all` that loads records and appointments.

**New table `daily_notes`** (`schema.sql` + `reset.sql`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | VARCHAR(36) PK | `generateId('note')` |
| `user_id` | VARCHAR(36) NOT NULL | FK → `users(id)` ON DELETE CASCADE |
| `note_date` | DATE NOT NULL | |
| `task` | VARCHAR(255) NULL | |
| `note` | TEXT NULL | ≤ 2000 chars |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

Index `(user_id, note_date)`. **Not unique**, so many notes per day are allowed.

**Endpoints** (same style as appointments): `GET /api/daily-notes/:userId`, `POST /api/daily-notes`, `DELETE /api/daily-notes/:id`. Validate: `userId` and `note_date` (YYYY-MM-DD) required; at least one of `task` / `note` non-empty; length limits above. Log `daily_note` / `create` after insert (§3.2).

## 5. Feature walkthrough (fix and mount)

Rework `FeatureWalkthrough.tsx`; keep the file and its tracking calls.

- **Mount it** in `App.tsx` for the mother app and the doctor dashboard. Props: `lang`, `variant`, `userId`, `onNavigate(tab)`.
- **Start** when `localStorage['walkthrough_seen:<userId>']` is absent, after `ConsentGate` is resolved and, for mothers, after the setup wizard is complete. **No consent check inside the component** (consent is guaranteed by then).
- Seen key is `walkthrough_seen:<userId>` (it must **not** start with `flowers_`, because logout wipes those). Written on Skip and Done.
- Replay: "Take the tour again" button at the bottom of `InfoAccessView` (mothers) and a small link in `DoctorDashboard`; fires `walkthrough` / `replay`.
- Bottom-sheet modal with a step counter, dots, **Back / Next / Skip**, **Done** on the last step. z-index above the bottom nav (z-40) and cookie/consent UI.
- Mother steps with a `tab` call `onNavigate(tab)` so the real screen is behind the sheet.
- Step 3 must use the existing `FREE_RECORD_LIMIT` (hoist it to a shared constant) instead of hard-coding 5.
- Existing users see the tour once on next load (intended).
- Remove the extra `direction: 'back'` metadata (not in the whitelist).

### Mother tour (9 steps)

| # | Tab | EN | KH |
|---|-----|----|----|
| 1 | | **Welcome to FlowErs 🌸** → Your pregnancy records in one safe place, ready for any hospital. Here's a one-minute tour. | **សូមស្វាគមន៍មកកាន់ FlowErs 🌸** → កំណត់ត្រាមាតារបស់អ្នកក្នុងកន្លែងតែមួយដែលមានសុវត្ថិភាព ហើយរួចរាល់សម្រាប់មន្ទីរពេទ្យណាមួយ។ តោះមើលការណែនាំរយៈពេលមួយនាទី។ |
| 2 | home | **Home** → See your pregnancy week and what's next. Use the quick buttons to scan a record or open your calendar. | **ទំព័រដើម** → មើលសប្តាហ៍ផ្ទៃពោះរបស់អ្នក និងអ្វីដែលត្រូវធ្វើបន្ទាប់។ ប្រើប៊ូតុងរហ័សដើម្បីស្កែនកំណត់ត្រា ឬបើកប្រតិទិន។ |
| 3 | records | **My Records** → Keep ultrasounds, lab results and prescriptions together. Tap + or Scan to add one. Free accounts can store up to {FREE_RECORD_LIMIT} records. | **កំណត់ត្រាខ្ញុំ** → រក្សាទុកលទ្ធផលអ៊ុលត្រាសោន ការធ្វើតេស្តឈាម និងវេជ្ជបញ្ជាទុកជាមួយគ្នា។ ចុច + ឬ ស្កែន ដើម្បីបន្ថែម។ គណនីឥតគិតថ្លៃអាចរក្សាទុកបានរហូតដល់ {FREE_RECORD_LIMIT} កំណត់ត្រា។ |
| 4 | calendar | **Calendar** → Add checkups and appointments, and write notes for any day, so you never miss one. | **ប្រតិទិន** → បន្ថែមការពិនិត្យ និងការណាត់ជួបពេទ្យ ហើយសរសេរកំណត់ចំណាំសម្រាប់ថ្ងៃណាមួយ កុំឱ្យភ្លេចណាមួយ។ |
| 5 | info | **Info** → Read trusted pregnancy information and chat with our Telegram bot. | **ព័ត៌មាន** → អានព័ត៌មានអំពីការមានផ្ទៃពោះដែលអាចទុកចិត្តបាន និងជជែកជាមួយ Telegram bot របស់យើង។ |
| 6 | passport | **Passport** → Your profile, medical info and Emergency QR code for doctors, all in one place. You can also create a journey summary report. | **លិខិតឆ្លងដែន** → ប្រវត្តិរូប ព័ត៌មានវេជ្ជសាស្ត្រ និង QR code សង្គ្រោះបន្ទាន់សម្រាប់គ្រូពេទ្យ នៅកន្លែងតែមួយ។ អ្នកក៏អាចបង្កើតរបាយការណ៍សង្ខេបដំណើរផ្ទៃពោះបានដែរ។ |
| 7 | | **SOS** → In an emergency, tap SOS to show your emergency profile and QR code right away. | **ប៊ូតុងសង្គ្រោះ** → ពេលមានអាសន្ន សូមចុចប៊ូតុង «សង្គ្រោះ» ដើម្បីបង្ហាញប្រវត្តិរូបសង្គ្រោះបន្ទាន់ និង QR code ភ្លាមៗ។ |
| 8 | | **Language** → Switch between Khmer and English anytime with the KH / EN button. | **ភាសា** → ប្តូររវាងភាសាខ្មែរ និងអង់គ្លេសបានគ្រប់ពេលដោយប៊ូតុង KH / EN។ |
| 9 | home | **You're all set!** → You can replay this tour anytime from the Info tab. | **រួចរាល់ហើយ!** → អ្នកអាចមើលការណែនាំនេះម្តងទៀតបានគ្រប់ពេលពីផ្ទាំងព័ត៌មាន។ |

Buttons: Back / ត្រឡប់ក្រោយ · Next / បន្ទាប់ · Skip / រំលង · Done / បញ្ចប់.

### Doctor tour (4 steps, English only)

| # | Text |
|---|------|
| 1 | **Welcome, Doctor** → A quick look at how FlowErs helps you review your patients' pregnancy records. |
| 2 | **Patient list** → Your dashboard lists your patients. Tap a patient to open her file. |
| 3 | **Patient file** → Review her records and appointments in one place. |
| 4 | **Clinical notes** → Add a note to any record so it stays with her history. |

## 6. Missing-table detection (so silent DB failures stop being silent)

- On server start, check that `feature_usage`, `user_consents` and `daily_notes` exist. If any is missing, `console.error` a clear message naming them and saying to run `npm run db:init`. Do **not** crash.
- Add `missingTables: string[]` to the `/api/health` response.

## 7. File list

| File | Change |
|------|--------|
| `backend/schema.sql`, `backend/reset.sql` | add `user_consents`, `daily_notes` (and keep `feature_usage`) |
| `server.ts` | consent endpoints, `hasConsent`, logout endpoint, hooks (§3.2), `/api/usage` rewrite (§3.1, §3.4, §3.5), daily-notes routes, startup table check |
| `src/lib/usage.ts` | `Feature` type, `setUsageLang`, `X-App-Lang` header |
| `src/lib/consent.ts` | read-only helpers |
| `src/components/CookieBanner.tsx`, `src/main.tsx` | delete / unmount |
| `src/components/ConsentNotice.tsx`, `ConsentGate.tsx` | new |
| `src/components/LoginView.tsx` | restore from `c44a7ed`; add consent checkbox on register; remove login/register click events; send `consent` and `X-App-Lang` |
| `src/components/DoctorLoginView.tsx` | same consent checkbox on register |
| `src/App.tsx` | `ConsentGate` on login/session restore, `X-App-Lang` in API helpers, `setUsageLang`, call `/api/auth/logout`, daily-notes state and handlers, mount walkthrough |
| `src/components/AppointmentsView.tsx` | daily notes UI (§4) |
| `src/components/InfoAccessView.tsx` | `info_link` tracking, replay button |
| `src/components/FeatureWalkthrough.tsx` | §5 |
| `UpgradeModal.tsx`, `PregnancySetupWizard.tsx`, `DoctorDashboard.tsx`, `DoctorPatientDetail.tsx` | tracking calls (§3.3) |

## 8. Acceptance checklist

- [ ] `npm run build` succeeds on a clean checkout.
- [ ] Register without ticking the box: button disabled; forcing the request returns `400 consent_required`.
- [ ] Register with the box ticked: a `user_consents` row exists, `flowers_consent` and `flowers_sid` cookies are set (`flowers_sid` is HttpOnly).
- [ ] An existing user signs in and sees `ConsentGate` once; **Decline** logs them out; **Agree** continues and creates the row.
- [ ] Reloading with a stored session and no consent shows `ConsentGate` before the app.
- [ ] A user without consent produces **zero** rows in `feature_usage`.
- [ ] Press **Save to Medical Vault** → one `record_add` row (`source='server'`, `category` set, `lang` filled). Count of these rows per day equals new `medical_records` rows for consented users.
- [ ] Press **Save Appointment** → `appointment_add`; with a reminder time chosen → also `reminder_set`; with `none` → no `reminder_set`.
- [ ] Press **Open** (Telegram) → `info_link` with `target='telegram_bot'`; **Open** (information center) → `target='data_center'`.
- [ ] Login success → `login` row (server). Wrong password → no row.
- [ ] Send `metadata: { target: 'rec-123', title: 'x' }` to `/api/usage` → both keys dropped.
- [ ] Daily notes: add 3 notes on one day; all three show; sign out and in; they are still there; they exist in `daily_notes`.
- [ ] Tour shows once for a new user, not again after logout/login, and replays from the Info tab; Khmer text is correct.
- [ ] Final report starts with `DB UPGRADE NEEDED: YES` and lists `user_consents`, `daily_notes`, the command, and the check queries.

## 9. Not in this patch (still open, owner should decide)

1. **Most data routes are still unauthenticated** (`/api/records/:userId`, `/api/appointments/:userId`, `/api/daily-notes/:userId`, `/api/mother-profile/:userId`, and others). Anyone who knows a user id can read or write that mother's data, and the server hooks in §3.2 take the user id from the request body (so they prove the action happened, not who did it). This is the most important remaining problem and should be the next patch.
2. `JWT_SECRET` falls back to a hardcoded value when the env var is missing.
3. Withdrawing consent is not offered, because consent is required.
4. Telegram document uploads are not tracked (not possible, as the owner said).