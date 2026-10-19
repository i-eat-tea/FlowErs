# PATCH 3: make `user_consents` and `feature_usage` actually receive rows

> **For the AI agent.** This replaces the previous `patch.md`. Written against `main` @ `d2d5e94`.
> **Scope: only these two tables.** Do not touch daily notes, the walkthrough, or anything else except where this file says so.
> The previous report said "fixed" but both tables are still empty. This patch lists the **exact** causes found by reading the code. Fix those, then **prove it** (§5). If you cannot run something, write `NOT VERIFIED` instead of "fixed".

## 1. Why both tables are empty (verified in the code)

The chain is: nothing writes `user_consents` → `hasConsent()` is always false → every usage write is dropped → `feature_usage` stays empty.

| # | Cause | Where |
|---|-------|-------|
| C1 | **`POST /api/auth/register` and `POST /api/auth/login` never read `consent` and never insert into `user_consents`.** `LoginView` sends `consent: true`, but the server destructures only `email, password, role, fullName, phone`. | `server.ts` register/login routes |
| C2 | **The "Agree" button in `ConsentGate` never calls the server.** It only runs `setConsentGateOpen(false)` and opens the walkthrough. | `ConsentGate.tsx`, `App.tsx` (`<ConsentGate onAgree=...>`) |
| C3 | **No client code ever calls `POST /api/consent`.** The only consent call in `src/` is a `GET` inside `FeatureWalkthrough.tsx`. | whole `src/` |
| C4 | **"Decline" does not log the user out**, so consent is not actually required. | `App.tsx` (`onDecline`) |
| C5 | `/api/consent` routes have **no auth middleware**, so `req.user` is always undefined; the last commit worked around it by trusting `userId` from the request body. That lets anyone write consent for any user. | `server.ts` `app.get/post('/api/consent')` |
| C6 | `POST /api/usage` still requires the `flowers_consent` **cookie** to equal `accepted`, but nothing sets that cookie any more (the banner was deleted). `trackFeature()` in `usage.ts` has the same cookie check, so the client doesn't even send events. | `server.ts` `/api/usage`, `src/lib/usage.ts` |
| C7 | `hasConsent()` caches a **negative** answer for 10 minutes, and nothing clears the cache when consent is saved. A user who agrees stays "not consented" for up to 10 minutes. | `server.ts` `hasConsent` |
| C8 | `setUsageLang()` is defined but **never called**, so `lang` is always `'en'`. | `src/lib/usage.ts`, `App.tsx` |
| C9 | Server-confirmed hooks for `login`, `signup`, `setup_wizard`, `doctor_note` do not exist (only `record_add`, `appointment_add`/`reminder_set`, `daily_note` do). | `server.ts` |
| C10 | `schema.sql` declares `user_id ... NOT NULL UNIQUE` on `user_consents` in addition to `UNIQUE(user_id, consent_version)`. The stray single-column UNIQUE allows only one row per user ever. | `backend/schema.sql` line ~171 |

## 2. Fix: consent reaches the database

**Rule: the user id for consent comes only from a verified JWT or from the account the server just authenticated. Never from the request body.**

1. **`POST /api/auth/register`**: read `consent` and `lang` from the body. If `consent !== true` → `400 { error: 'consent_required' }`. After the user row is inserted, `INSERT IGNORE INTO user_consents (user_id, consent_version, lang) VALUES (?, CONSENT_VERSION, ?)`. Clear the cache entry (C7). Add `consentRequired: false` to the JSON response.
2. **`POST /api/auth/login`**: after a successful login, query `user_consents` for `(user.id, CONSENT_VERSION)` **directly (no cache)**. Add `consentRequired: boolean` to the JSON response.
3. **`POST /api/consent`**: add `authenticateToken`. `userId = req.user.id` only; **delete** the `req.body.userId` / `user_id` fallback (C5). Body: `{ choice: 'accepted' | 'declined', lang }`.
   - `accepted` → `INSERT IGNORE` into `user_consents`, clear the cache entry, set the cookies below, respond `{ consent: 'accepted' }`.
   - `declined` → write nothing, clear both cookies, respond `{ consent: 'declined' }`.
4. **New `GET /api/consent/status`** (`authenticateToken`) → `{ required: boolean, version: CONSENT_VERSION }`, where `required = !(row exists for req.user.id and CONSENT_VERSION)`, read directly from the DB. Remove the old unauthenticated `GET /api/consent`.
5. **`hasConsent()`**: cache **only positive** results. Never cache `false`. Call `consentCache.delete(userId)` wherever a consent row is inserted.
6. **Cookies** (set on register/login when consent exists, and on `POST /api/consent` accepted): `flowers_consent=accepted` (180 days, not httpOnly) and `flowers_sid` (random 32 hex, 30 days, httpOnly), both `path=/`, `SameSite=Lax`, `Secure` when `NODE_ENV === 'production'`. They are informational only now; **nothing may depend on them for gating** (C6).
7. **`schema.sql`** (C10): the table must have only `UNIQUE(user_id, consent_version)`; remove the extra `UNIQUE` on `user_id`. (`CREATE TABLE IF NOT EXISTS` will not change a table that already exists. If the owner already created it, mention in the report that the stray index is harmless because inserts use `INSERT IGNORE`.)

**Client**

8. `LoginView` / `DoctorLoginView`: read `consentRequired` from the login and register responses and pass it up: `onLoginSuccess(..., consentRequired)`. `handleLoginSuccess` and `handleDoctorLoginSuccess` open `ConsentGate` **only if `consentRequired === true`** (a user who just ticked the register checkbox must not see the gate again).
9. **`ConsentGate` "Agree"** (C2/C3): `POST /api/consent` with headers `Content-Type`, `Authorization: Bearer <flowers_auth_token>`, `X-App-Lang`, body `{ choice: 'accepted', lang }`. Close the gate **only when the response is OK**. On failure show a visible error and a retry button; do not continue silently.
10. **"Decline"** (C4): call `handleLogout()` (clears the session). It must not just close the gate.
11. **Session restore:** on app start, if a stored token exists, call `GET /api/consent/status` (with the Authorization header). If `required` is true, open `ConsentGate` before the main UI.
12. `FeatureWalkthrough.tsx`: remove its `fetch('/api/consent')`; consent is guaranteed by the time it runs.

## 3. Fix: usage rows are written

1. **`/api/usage`** (C6): delete the `flowers_consent` cookie check. Gate **only** on: valid JWT (`req.user`) **and** `hasConsent(req.user.id)`. No token → `204`, nothing written. Keep the rate limit.
2. **`trackFeature()`** (C6): delete the `document.cookie` check. Send the event if `localStorage.flowers_auth_token` exists; otherwise return. Keep the 2-second debounce, `keepalive: true`, the `Authorization` header and `X-App-Lang`.
3. **Language** (C8): in `App.tsx`, call `setUsageLang(lang)` in a `useEffect` whenever `lang` changes (and once on mount). Make sure `LoginView`'s own login/register `fetch` calls also send `X-App-Lang`.
4. **Server hooks** (C9). Add with `logServerEvent`, after the DB write succeeds, user id taken from the row just created or the verified token, never from untrusted input where a verified value exists:

   | Where | feature_key | action |
   |-------|-------------|--------|
   | register success | `signup` | `create` |
   | login success (only if `consentRequired` is false) | `login` | `create` |
   | `PUT /api/mother-profile/:userId/setup` success | `setup_wizard` | `complete` |
   | `POST /api/doctor/records/:recordId/notes` success | `doctor_note` | `create` |

   Keep the existing `record_add`, `appointment_add`, `reminder_set` and `daily_note` hooks.
5. Right after a user accepts consent, the `login` event for that session was skipped (consent was missing at login time). That is acceptable; do not add a workaround.

## 4. Deploy rules (this is why "nothing changed" looked true)

- **Render only runs `bun install`.** The deployment log shows Build Command = `bun install` and Start = `node dist/server.cjs`. It never builds. The site runs whatever is in the **committed `dist/` folder**.
- Therefore, before every commit that changes `src/` or `server.ts`: run `npm run build` and **commit the updated `dist/`** (`dist/server.cjs`, `dist/assets/*`, `dist/index.html`).
- Tell the owner to change the Render **Build Command** to `bun install && bun run build`, so Render builds on every deploy. State this in your report.
- **Database tables are not created by Render.** `feature_usage`, `user_consents`, `daily_notes` exist in the production Aiven database only if someone ran `npm run db:init` against it. Your report **must start with**:

  `DB UPGRADE NEEDED: YES` (or `NO`), the command (`npm run db:init` with the production DB env vars), and the check `SHOW TABLES LIKE 'user_consents'; SHOW TABLES LIKE 'feature_usage'; SHOW TABLES LIKE 'daily_notes';`.

  The owner can also open `https://flowers-qrr1.onrender.com/api/health`: its `missingTables` list shows which tables are missing in production.

## 5. Proof required in your final report (paste raw output)

Do not use the word "fixed" for anything that does not have its output pasted here.

1. `npm run build` output (success), and `git show --stat HEAD` showing `dist/` files in the commit.
2. `SHOW TABLES LIKE ...` for the three tables, against the **same database the deployed server uses**.
3. **Through the real UI in a browser (not by curl):**
   1. Register a new throwaway account with the consent box ticked, then run
      `SELECT user_id, consent_version, lang, accepted_at FROM user_consents ORDER BY id DESC LIMIT 3;`
      and paste the result.
   2. Click through tabs, save one record, save one appointment, then run
      `SELECT feature_key, action, source, lang, user_id, created_at FROM feature_usage ORDER BY id DESC LIMIT 15;`
      and paste the result. Expected: `signup`, tab `*_view` rows, `record_add` (source `server`), `appointment_add` (source `server`), `lang` filled (not NULL).
   3. Log in with an **old** account: `ConsentGate` appears. **Agree** → a new `user_consents` row appears. **Decline** → logged out, no row.
4. Browser Network tab: `POST /api/consent` returns 200 on Agree, and `POST /api/usage` is sent with an `Authorization` header.
5. If you cannot do step 3 (no browser or no database access), write `NOT VERIFIED: <what you could not run>` for each item. Do not substitute a hand-written curl as proof of the UI flow.

## 6. Out of scope (do not touch now)

Daily notes behavior, the walkthrough, calendar fixes, cookie text, and the unauthenticated data routes (`/api/records/:userId` etc.). They are known and will be handled in later patches.