# FlowErs — Fix List v2 (for the agent)

Repo: `i-eat-tea/FlowErs` (`main`). Stack: Express + TypeScript (`server.ts`), React 19 + Vite (`src/`), MySQL via `mysql2`.
Hosting: **Aiven** MySQL (database name **`defaultdb`**) + **Render** web service.

This replaces the first `fixes.md`. Tasks 1–6 of that list were committed (`git log` shows "Task 2 + 3 … Task 6b"), but the live app is still broken. This file lists what is still wrong, why, and exactly what to change. Line numbers are from `main` today. Re-grep before editing.

## Ground rules

- **Destructive DB action is authorised ONLY as described in Task 1.** The user said the Aiven `defaultdb` holds a single test case and wants a clean start. No other destructive SQL.
- Never commit SQL containing `DROP` into `backend/schema.sql`. Destructive SQL lives only in `backend/reset.sql` and runs only through the guarded `db/reset.js`.
- After any change to `server.ts` or `src/`, run `npm run lint` and `npm run build` before committing.
- Use `npm` only. The repo had an empty `bun.lock` that broke Render builds (Render picks Bun when it sees that file). Make sure it stays deleted.
- One commit per task.

## Current symptoms → root causes

| Symptom | Root cause | Task |
|---|---|---|
| DB blank / 500 on `/api/profile`, `/api/records` | Tables missing in the database the server uses, because the schema aborts halfway (see Task 1) and `schema.sql` selected `flowers_db` while the server uses `defaultdb` | 1 |
| Can't log off (laptop); phone won't reopen after closing | Stuck "Loading…" screen with no logout button; `loadFromDB` can hang forever; server exits at startup if the DB is unreachable | 2 |
| Folder QR shows a stock photo instead of the uploaded image | `public/folder.html` hardcodes an Unsplash image; `/api/folder/:id` returns made-up data and no image | 3 |
| QR "can't be shared" | No share/copy/download action exists; the folder QR uses `window.location.origin` | 4 |
| Uploaded images are huge | Raw base64 stored in the DB, no compression | 5 |

---

## Task 1 (P0) — Fresh database: fix the schema and add a guarded reset

### What was found (tested against MariaDB 10.11)

1. **`backend/schema.sql` cannot load completely.** `sharing_permissions` has
   `CHECK (doctor_profile_id IS NOT NULL OR hospital_profile_id IS NOT NULL)`, but those same columns are used by `FOREIGN KEY … ON DELETE SET NULL`. MySQL and MariaDB both reject that (`ERROR 1901` on MariaDB; MySQL 8 reports the same restriction). The script stops there, so **`sharing_permissions`, `profiles` and `family_members` are never created**. That is why `/api/profile` returns 500.
2. **Database name mismatch.** The schema ran `CREATE DATABASE flowers_db; USE flowers_db;` while Render uses `MYSQL_DATABASE=defaultdb`. Tables landed in one database and the server looked in the other.
3. **The user's local copy of the schema contained `DROP TABLE` for every table, `USE defaultdb; USE flowers_db;`, a dangling `use defaultdb; select`, and a `DELIMITER` trigger.** Running that file wipes the DB each time and breaks `mysql2`. Tell the user to delete that local copy.

### Deliverables (already written and tested, in `db-reset-kit/`)

Copy these into the repo:

| Kit file | Repo path | Purpose |
|---|---|---|
| `backend/schema.sql` | `backend/schema.sql` | **Safe**, re-runnable. `CREATE TABLE IF NOT EXISTS`, no `DROP`, no database selection, no CHECK/trigger. |
| `backend/reset.sql` | `backend/reset.sql` | **Destructive.** Drops all 12 tables, recreates them empty. |
| `db/helpers.js` | `db/helpers.js` | Shared connection config (reads `MYSQL_*`, optional TLS). |
| `db/init.js` | `db/init.js` | Replaces the old `init.js`. Runs `schema.sql` safely against `MYSQL_DATABASE`. |
| `db/reset.js` | `db/reset.js` | Runs `reset.sql`. **Refuses to run without `--yes`** and refuses if `MYSQL_DATABASE` is unset. |

Test results already obtained: `schema.sql` runs twice with no error and keeps existing rows; `reset.sql` runs twice, leaves 12 empty tables; `db/reset.js` without `--yes` exits 1 and deletes nothing; with `--yes` it wipes and recreates; `profiles` and the `medical_records.image_attachment` column accept inserts.

### Steps

1. Copy the five files above. Delete any other schema file that contains `DROP`.
2. Add to `package.json` scripts:
   ```json
   "db:init": "node db/init.js",
   "db:reset": "node db/reset.js"
   ```
3. Enforce the dropped CHECK rule in code. Find the `INSERT INTO sharing_permissions` route in `server.ts` and reject the request with HTTP 400 unless `doctorProfileId || hospitalProfileId` is present.
4. Add optional TLS to the pool in `server.ts` (~L62–72), matching `db/helpers.js`:
   ```ts
   const sslOpt = process.env.MYSQL_SSL === 'true'
     ? (process.env.MYSQL_SSL_CA
         ? { ca: process.env.MYSQL_SSL_CA.replace(/\\n/g, '\n'), minVersion: 'TLSv1.2' as const }
         : { rejectUnauthorized: false, minVersion: 'TLSv1.2' as const })
     : undefined;
   const pool = mysql.createPool({ /* existing options */ ssl: sslOpt });
   ```
   Leave TLS off unless the DB connection fails with a TLS or handshake error. Aiven's CA is private, so `rejectUnauthorized: true` without the CA will fail. If the user pastes the Aiven CA certificate into `MYSQL_SSL_CA`, verification is on. Without it the connection is encrypted but not verified; tell the user that tradeoff.
5. Add `.env.example` entries: `MYSQL_DATABASE=defaultdb`, `MYSQL_SSL=false`, `MYSQL_SSL_CA=`.
6. **Run the reset (user-authorised).** With the user's Aiven credentials in a local `.env` (`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER=avnadmin`, `MYSQL_PASSWORD`, `MYSQL_DATABASE=defaultdb`, plus `MYSQL_SSL=true` if needed):
   ```bash
   npm run db:reset -- --yes
   ```
   First print the target (`host/database`) to the user and confirm it is their Aiven service. The script prints it too.
7. Verify: `SHOW TABLES;` lists 12 tables including `profiles`, `family_members`, `sharing_permissions`, `medical_records`.
8. Render environment variables must match: same `MYSQL_*` values, `MYSQL_DATABASE=defaultdb`, `NODE_ENV=production`, a real `JWT_SECRET`. Build command `npm ci && npm run build`, start command `npm start`.
9. The user must **sign up again**. All old accounts are gone. Tell the user to clear the browser's saved login (`localStorage.clear()`).

**Done when:** `GET /api/health` returns `{"status":"ok","database":"connected"}`, and signing up, adding a record and adding an appointment return no 500s.

---

## Task 2 (P0) — Login/logout and the stuck loading screen

### Problems (`src/App.tsx`, `server.ts`)

1. **~L724** `if (!dataLoaded) return <spinner/>` has no Log out button, so a stuck load traps the user. This is why the user cannot log off.
2. **~L196** `loadFromDB()` has no `try/catch`. Any thrown error means `setDataLoaded(true)` is never reached and the spinner never ends.
3. **~L43** `apiGet` has `return res.json()` without `await`, so a bad response body (for example an HTML page) escapes its own `catch`. It also has no timeout, so a sleeping server hangs it.
4. **`startServer()`** calls `process.exit(1)` if `SELECT 1` fails. Aiven's free tier powers off unused services, and Render's free tier sleeps. A DB blip then crash-loops the server and the site will not open.

### Fix

**a) `apiGet`** (apply the same `await res.json()` fix and timeout to the other helpers):
```ts
async function apiGet<T>(path: string): Promise<T | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000); // allows a Render cold start
  try {
    const res = await fetch(path, { signal: ctrl.signal });
    if (!res.ok) { console.error(`[API ERROR] GET ${path} status=${res.status}`); return null; }
    return (await res.json()) as T;
  } catch (e) { console.error(`[API ERROR] GET ${path}`, e); return null; }
  finally { clearTimeout(timer); }
}
```

**b) `loadFromDB`**: wrap the whole body in `try/catch`. On error, call `setLoadError(true)`. **Do not** just call `setDataLoaded(true)` in a `finally`: the sync effect at ~L283 would then push stale cached data over the user's real DB data. Add `const [loadError, setLoadError] = useState(false);` and a retry counter so Retry re-runs the effect:
```ts
const [loadAttempt, setLoadAttempt] = useState(0);
// effect deps: [isLoggedIn, userRole, userId, loadAttempt]
```
Reset `loadError` to `false` at the start of each attempt.

**c) Loading screen (~L724):** keep the spinner, and after 5 seconds or when `loadError` is true also show a message ("Can't reach the server") and two buttons: **Retry** (`setLoadAttempt(n => n + 1)`) and **Log out** (`handleLogout`). Use a small `useEffect` timer for the 5-second reveal.

**d) `server.ts`:** in `startServer()`, replace `process.exit(1)` with a logged warning (keep the host/port/database log, never the password) and continue to `app.listen`. `/api/health` already reports 503 honestly.

**e)** `handleLogout` is already correct (clears all `flowers_*` keys). Keep it. Make sure the doctor/hospital dashboard and the `isDoctorDataLoaded` loading screen (~L604) also have a Log out button.

**Done when:** with the server stopped or the DB powered off, the app shows a "Can't reach the server" state with working Retry and Log out; Log out returns to the sign-in screen and a reload keeps it there; closing and reopening the phone tab works.

---

## Task 3 (P0) — Folder QR shows a stock photo

### Root causes

- `public/folder.html` ~L64–72 sets `img.src = 'https://images.unsplash.com/…'` unconditionally, and it runs on every page load. The Task 6b `fetch` only overwrites the title, with fake data.
- `server.ts` ~L1551 `GET /api/folder/:id` returns made-up metadata (`'Folder ' + id.substring(0, 8)`) and never reads the DB, so no image is ever returned.
- The QR link already carries `folderId=folder-<medical_records.id>` (`RecordsView.tsx` ~L439), so the server can look the record up.

### Fix

**a) Replace the route in `server.ts`:**
```ts
app.get('/api/folder/:id', async (req, res) => {
  try {
    const raw = req.params.id;
    const recordId = raw.startsWith('folder-') ? raw.slice('folder-'.length) : raw;
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, title, category, date, image_attachment FROM medical_records WHERE id = ? LIMIT 1',
      [recordId],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const r = rows[0];
    // Share only what the page needs. Never include notes, doctor, facility or extracted_data.
    res.json({ id: r.id, name: r.title, category: r.category, date: r.date, imageUrl: r.image_attachment || null });
  } catch (err: any) {
    console.error('GET /api/folder error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});
```

**b) Replace the whole `<script>` block in `public/folder.html`.** Delete the Unsplash line and the old block entirely. Use `textContent` only, never `innerHTML`, and do not read `name` or `cat` from the URL (they can be spoofed):
```html
<script>
(function () {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('folderId');
  var $ = function (i) { return document.getElementById(i); };
  function fail(msg) { $('folder-title').textContent = msg; $('doc-section').style.display = 'none'; }
  if (!id) return fail('Invalid link');
  $('folder-id').textContent = id.substring(0, 12) + '...';
  fetch('/api/folder/' + encodeURIComponent(id))
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      var cat = (d.category || '').replace(/_/g, ' ');
      var when = d.date ? new Date(d.date).toLocaleDateString() : '';
      $('folder-title').textContent = d.name || 'Document';
      $('folder-sub').textContent = cat ? 'Category: ' + cat : 'Scanned medical document';
      $('folder-cat').textContent = cat || '—';
      $('folder-label').textContent = d.name || '—';
      $('folder-date').textContent = when || '—';
      if (d.imageUrl) {
        $('doc-img').src = d.imageUrl;
        $('doc-img').alt = d.name || 'Document scan';
        $('doc-title').textContent = d.name || 'Document';
        $('doc-meta').textContent = cat + (when ? ' • ' + when : '');
        $('doc-section').style.display = 'block';
      } else { $('doc-section').style.display = 'none'; }
    })
    .catch(function () { fail('Document not found or no longer shared'); });
})();
</script>
```

**c)** In `RecordsView.tsx` (~L547 and ~L562) shorten the QR URL to `${PUBLIC_BASE_URL}/folder.html?folderId=${encodeURIComponent(folderQRData.folderId)}` (see Task 4 for `PUBLIC_BASE_URL`).

### Privacy note (tell the user, do not silently change)

Anyone holding the link can view that one record's image. That is what a share QR means, but record ids are built from `Date.now()` plus 7 random base-36 characters (`server.ts` L57), so they are not strong secrets. A stronger design adds a random `share_token` column to `medical_records`, creates it when the user taps "Share QR", and uses the token in the URL instead of the id. Do this only if the user asks.

**Done when:** upload an image to a record, tap its QR, scan or open the link on another device: the page shows that exact image and the record title. A bad or deleted id shows "Document not found…", never a stock photo.

---

## Task 4 (P1) — Make QR codes shareable

Today the app only draws the QR and has an "Open Folder" button. There is no share, copy or download action (no `navigator.share` or clipboard code exists), and the folder QR uses `window.location.origin`, so a QR made on `localhost` is useless on a phone.

1. **Add `src/lib/publicUrl.ts`:**
   ```ts
   export const PUBLIC_BASE_URL = (
     (import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) || window.location.origin
   ).replace(/\/$/, '');
   ```
   Use it in `RecordsView.tsx` and `PassportView.tsx` (replace the local constant at `PassportView.tsx` L15). **`VITE_*` values are baked in at build time**, so on Render set `VITE_PUBLIC_BASE_URL=https://<your-service>.onrender.com` in Environment *before* the build runs, then redeploy.

2. **Add `src/lib/share.ts`:**
   ```ts
   export async function shareLink(url: string, title: string): Promise<'shared' | 'copied' | 'failed'> {
     try {
       if (navigator.share) { await navigator.share({ title, url }); return 'shared'; }
     } catch (e: any) { if (e?.name === 'AbortError') return 'failed'; }
     try { await navigator.clipboard.writeText(url); return 'copied'; } catch { return 'failed'; }
   }
   export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string) {
     const a = document.createElement('a');
     a.href = canvas.toDataURL('image/png');
     a.download = filename;
     a.click();
   }
   ```
   `navigator.share` and the clipboard need HTTPS (Render provides it).

3. **UI:** in the folder QR modal (`RecordsView.tsx` ~L524–575) and the Emergency QR card (`PassportView.tsx` ~L501), add three buttons: **Share** (calls `shareLink`), **Copy link**, **Save QR image** (`downloadCanvasPng` using a `ref` on the `QRCodeCanvas`). Show a short "Link copied" confirmation. Keep "Open Folder".

**Done when:** on a phone, Share opens the system share sheet; on desktop, Copy link puts a working URL on the clipboard; the saved PNG scans correctly; the URL starts with the Render domain, not `localhost`.

---

## Task 5 (P1) — Uploaded images: compress before saving

Images are stored as raw base64 in `medical_records.image_attachment` / `appointments.image_attachment` (both `LONGTEXT`, which is fine technically). Problems: base64 is about 33% larger than the file; Aiven's free MySQL has about 1 GB of disk; and `GET /api/records/:userId` returns **every** image for every record on each load.

**Phase 1 (do now):** compress in the browser. In `AddRecordModal.tsx` (~L60–75, where `FileReader.readAsDataURL` is used) resize and re-encode first:
```ts
export async function compressImage(file: File, maxSide = 1280, quality = 0.7): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', quality);
}
```
Use it only for `file.type.startsWith('image/')`. A typical phone photo should drop from several MB to roughly 150–300 KB.

**Phase 2 (only if the user asks):** stop returning `image_attachment` from the list query, return a `hasImage` flag, and load the image on demand from the existing `GET /api/records/:userId/:recordId`. Long term, move images to object storage (Cloudflare R2, S3 or Cloudinary) and store only the URL in the same column. This touches `RecordsView`, `HomeView` and `DoctorRecordsView`, so ask first.

---

## Task 6 (P2) — Auth on data routes (unchanged, do last, confirm first)

Only `GET /api/auth/me` checks the JWT. No data route does, and the frontend never sends `Authorization`. Anyone who knows or guesses a `userId` can read and write that user's medical data. Fix as one change: send `Authorization: Bearer <flowers_auth_token>` from all `api*` helpers, add `authenticateToken` to the data routes, check `req.user.id === :userId`, and on 401/403 call `handleLogout`. Also refuse to start in production if `JWT_SECRET` is unset (`server.ts` L19 has a hardcoded fallback).

---

## Final verification checklist

- [ ] `npm run lint` and `npm run build` pass; no `bun.lock` in the repo.
- [ ] `npm run db:reset` without `--yes` refuses and deletes nothing.
- [ ] `SHOW TABLES` on the Aiven `defaultdb` shows 12 tables.
- [ ] `/api/health` → `ok` / `connected`; with the DB off → HTTP 503 and the site still loads with a Retry/Log out screen.
- [ ] Sign up, add a record with a photo, add an appointment: no 500s in the console.
- [ ] Log out works from every screen and survives a reload; closing and reopening on the phone works.
- [ ] Folder QR opens the **uploaded** image on a second device; a wrong id shows "not found".
- [ ] Share / Copy link / Save QR work, and links use the Render domain.
- [ ] Uploaded photos are compressed (check the record's size in the DB).