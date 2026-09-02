# 🩺 Medical Records CRUD API - Complete!

**Date:** 2026-09-02  
**Status:** ✅ Backend Complete

---

## What Was Built

Complete backend API for **Medical Records CRUD** with proper relational schema integration, validation, and support for ultrasound scans, lab tests, prescriptions, vaccines, and doctor notes.

---

## 🗄️ Database Schema

The `medical_records` table uses a dual-key system for backward compatibility and relational integrity:

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR(36) | Primary key (e.g., `rec-1725248391234-abc123`) |
| `user_id` | VARCHAR(36) | FK to `users` table (backward compat) |
| `mother_profile_id` | VARCHAR(36) | FK to `mother_profiles` table (relational model) |
| `title` | VARCHAR(255) | **Required** — Record title (e.g., "Week 20 Ultrasound") |
| `category` | ENUM | **Required** — `ultrasound`, `lab_test`, `prescription`, `vaccine`, `doctor_note`, `other` |
| `date` | DATE | Date of exam/visit (YYYY-MM-DD) |
| `week` | INT | Gestational week (1-42) |
| `trimester` | INT | Auto-calculated if week provided (1, 2, or 3) |
| `facility` | VARCHAR(255) | Hospital/clinic name |
| `doctor` | VARCHAR(255) | Healthcare provider name |
| `notes` | TEXT | Clinical notes and findings |
| `image_attachment` | LONGTEXT | Base64-encoded document scan image |
| `status` | ENUM | `Normal`, `Follow-up Needed`, `Completed`, `Pending` |
| `tags` | JSON | Array of tags (e.g., `["ultrasound", "Week 20", "T2"]`) |
| `extracted_data` | JSON | Structured clinical data (e.g., biomarkers, measurements) |
| `created_at` | TIMESTAMP | Auto-generated creation timestamp |

---

## 🔌 API Endpoints

### 1. `GET /api/records/:userId`
**Fetch all medical records for a user**

**Example:**
```bash
GET /api/records/user-1725248391234-abc123
```

**Response:**
```json
[
  {
    "id": "rec-1725248391234-xyz789",
    "userId": "user-1725248391234-abc123",
    "motherProfileId": "moth-1725248391234-def456",
    "title": "Week 20 Anomaly Ultrasound Scan",
    "category": "ultrasound",
    "date": "2026-08-15",
    "week": 20,
    "trimester": 2,
    "facility": "Calmette Hospital",
    "doctor": "Dr. Sophy Lim",
    "notes": "Baby growth normal, heartbeat strong at 145 bpm, no anomalies detected.",
    "status": "Normal",
    "imageAttachment": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "tags": ["ultrasound", "Week 20", "T2"],
    "extractedData": [
      { "label": "Heartbeat", "value": "145", "unit": "bpm" },
      { "label": "Baby Length", "value": "25.6", "unit": "cm" }
    ],
    "createdAt": "2026-08-15T10:30:00.000Z"
  }
]
```

---

### 2. `GET /api/records/:userId/:recordId`
**Fetch a single record by ID**

**Example:**
```bash
GET /api/records/user-1725248391234-abc123/rec-1725248391234-xyz789
```

**Response:**
```json
{
  "id": "rec-1725248391234-xyz789",
  "userId": "user-1725248391234-abc123",
  "motherProfileId": "moth-1725248391234-def456",
  "title": "Week 20 Anomaly Ultrasound Scan",
  "category": "ultrasound",
  "date": "2026-08-15",
  "week": 20,
  "trimester": 2,
  "facility": "Calmette Hospital",
  "doctor": "Dr. Sophy Lim",
  "notes": "Baby growth normal, heartbeat strong at 145 bpm.",
  "status": "Normal",
  "imageAttachment": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "tags": ["ultrasound", "Week 20", "T2"],
  "extractedData": [],
  "createdAt": "2026-08-15T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Record not found"
}
```

---

### 3. `POST /api/records`
**Create a new medical record**

**Request Body:**
```json
{
  "id": "rec-1725248391234-xyz789",
  "userId": "user-1725248391234-abc123",
  "title": "Week 24 Glucose Tolerance Test",
  "category": "lab_test",
  "date": "2026-08-20",
  "week": 24,
  "facility": "Khema Clinic",
  "doctor": "Dr. Bopha Meas",
  "notes": "OGTT results within normal range. No gestational diabetes detected.",
  "status": "Normal",
  "imageAttachment": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "tags": ["lab_test", "Week 24", "T2", "OGTT"],
  "extractedData": [
    { "label": "Fasting Glucose", "value": "85", "unit": "mg/dL" },
    { "label": "1-Hour Glucose", "value": "160", "unit": "mg/dL" },
    { "label": "2-Hour Glucose", "value": "140", "unit": "mg/dL" }
  ]
}
```

**Validation Rules:**
- ✅ `title` — **Required**, non-empty string
- ✅ `category` — **Required**, must be one of: `ultrasound`, `lab_test`, `prescription`, `vaccine`, `doctor_note`, `other`
- ✅ `week` — Optional, must be between 1-42 if provided
- ✅ `trimester` — Auto-calculated from `week` if not provided (1-12 → 1, 13-27 → 2, 28-40 → 3)

**Response (201 Created):**
```json
{
  "success": true,
  "id": "rec-1725248391234-xyz789",
  "motherProfileId": "moth-1725248391234-def456"
}
```

**Error Response (400):**
```json
{
  "error": "Title is required"
}
```
```json
{
  "error": "Invalid category"
}
```
```json
{
  "error": "Week must be between 1 and 42"
}
```

---

### 4. `PUT /api/records/:recordId`
**Update an existing medical record (partial updates supported)**

**Example:**
```bash
PUT /api/records/rec-1725248391234-xyz789
```

**Request Body (partial update):**
```json
{
  "notes": "Updated clinical notes: Follow-up ultrasound recommended at week 28.",
  "status": "Follow-up Needed"
}
```

**Features:**
- ✅ **Partial updates** — Only provided fields are updated (uses SQL `COALESCE`)
- ✅ **Auto-trimester calculation** — If `week` is updated but `trimester` is not provided, it's auto-calculated
- ✅ **Validation** — Same rules as POST (category enum, week range 1-42)

**Response:**
```json
{
  "success": true,
  "message": "Record updated successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid category"
}
```

---

### 5. `DELETE /api/records/:recordId`
**Delete a medical record**

**Example:**
```bash
DELETE /api/records/rec-1725248391234-xyz789
```

**Response:**
```json
{
  "success": true
}
```

---

## 🔗 Relational Model Integration

The API automatically resolves `userId` → `motherProfileId` when creating records:

1. **POST request** includes `userId`
2. **Server** queries `mother_profiles` table: `SELECT id FROM mother_profiles WHERE user_id = ?`
3. **Both keys stored**: `user_id` (for backward compat) + `mother_profile_id` (for relational integrity)
4. **Response** includes both IDs

This allows:
- ✅ Old client code using `userId` continues to work
- ✅ New doctor portal can query records via `mother_profile_id` directly
- ✅ Proper foreign key constraints and cascade deletes

---

## 📊 Data Flow Example

### Creating a Record with Image Upload

1. **Frontend** captures image via camera or file upload
2. **Frontend** converts image to base64 data URL: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`
3. **Frontend** calls `POST /api/records` with full record data including base64 `imageAttachment`
4. **Server** validates input, resolves `motherProfileId`, stores to MySQL
5. **Server** responds with success + record ID
6. **Frontend** refreshes records list

### Editing a Record

1. **Frontend** calls `GET /api/records/:userId/:recordId` to fetch existing data
2. **Frontend** displays edit modal pre-filled with current values
3. **User** modifies fields (e.g., updates notes, changes status)
4. **Frontend** calls `PUT /api/records/:recordId` with only changed fields
5. **Server** applies partial update using `COALESCE`
6. **Frontend** refreshes records list

---

## 🧪 Testing the API

### Manual Testing with cURL

```bash
# 1. Create a record
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -d '{
    "id": "rec-test-123",
    "userId": "user-1725248391234-abc123",
    "title": "Week 28 Checkup",
    "category": "doctor_note",
    "date": "2026-09-02",
    "week": 28,
    "facility": "Sunrise Clinic",
    "doctor": "Dr. Leak Cheat",
    "notes": "Blood pressure normal, baby position cephalic.",
    "status": "Normal"
  }'

# 2. Get all records for user
curl http://localhost:3000/api/records/user-1725248391234-abc123

# 3. Get single record
curl http://localhost:3000/api/records/user-1725248391234-abc123/rec-test-123

# 4. Update record
curl -X PUT http://localhost:3000/api/records/rec-test-123 \
  -H "Content-Type: application/json" \
  -d '{"notes": "Follow-up scheduled for week 32."}'

# 5. Delete record
curl -X DELETE http://localhost:3000/api/records/rec-test-123
```

---

## 📝 Summary

| Feature | Status |
|---------|--------|
| Schema alignment (user_id + mother_profile_id) | ✅ Complete |
| GET all records | ✅ Complete |
| GET single record by ID | ✅ Complete |
| POST create with validation | ✅ Complete |
| PUT partial update with COALESCE | ✅ Complete |
| DELETE record | ✅ Complete |
| Auto-trimester calculation | ✅ Complete |
| Relational model integration | ✅ Complete |
| Base64 image storage | ✅ Complete |
| Extracted data JSON support | ✅ Complete |
| Error handling & validation | ✅ Complete |

---

## 🚀 Next Steps

**For frontend integration:**
- Use existing `AddRecordModal.tsx` (already working)
- Build `EditRecordModal.tsx` (call `GET /api/records/:userId/:recordId`, then `PUT /api/records/:recordId`)
- Existing `RecordsView.tsx` list/filter/delete works as-is

**For Option 3 (Appointments):**
- Similar CRUD pattern already exists for appointments
- Can mirror the medical records approach

**For Option 4 (Doctor Portal):**
- Query records via `mother_profile_id` using `sharing_permissions` table
- Doctor can view patient records they have permission to access
