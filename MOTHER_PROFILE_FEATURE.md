# 🌸 Mother Profile & Pregnancy Setup - Complete!

**Date:** 2026-09-01  
**Status:** ✅ Fully Functional & Tested

---

## What Was Upgraded

We migrated the **Mother Profile & Pregnancy Setup** from the old single-table JSON blob (`profiles` table) to the new **relational schema** (split tables) in MySQL.

---

## 🗄️ Relational Database Tables Used

| Table | What It Stores | Updated By |
|---|---|---|
| `mother_profiles` | Personal info (name, DOB, phone, height, pre-pregnancy weight, language) | Registration, Wizard, Profile Edit |
| `pregnancy_profiles` | Pregnancy metrics (EDD, LMP, gravida, para, current week, trimester) | Setup Wizard, Profile Edit |
| `mother_medical_info` | Medical baseline (blood type, allergies, conditions, medications) | Setup Wizard (blood type), Profile Edit |
| `emergency_contacts` | Emergency contact (name, phone, relation, is_primary) | Profile Edit |

---

## 🔌 New API Endpoints

### 1. `GET /api/mother-profile/:userId`
Fetches and combines data from all 4 tables:
```json
{
  "motherProfile": {
    "id": "moth-xxx",
    "userId": "usr-xxx",
    "fullName": "Srey Leak",
    "phone": "+855-12-999-888",
    "heightCm": 160,
    "prePregnancyWeightKg": 55,
    "languagePref": "kh"
  },
  "pregnancyProfile": {
    "id": "preg-xxx",
    "edd": "2026-12-21",
    "gravida": 2,
    "para": 1,
    "currentWeek": 24,
    "trimester": 2
  },
  "medicalInfo": {
    "id": "med-xxx",
    "bloodType": "O+",
    "allergies": "Peanuts, Penicillin",
    "existingConditions": "Mild asthma",
    "currentMedications": "Folic acid, Iron"
  },
  "emergencyContacts": [
    {
      "id": "ec-xxx",
      "name": "Sokha Cheat",
      "phone": "+855-12-333-444",
      "relation": "Husband",
      "isPrimary": true
    }
  ]
}
```

### 2. `PUT /api/mother-profile/:userId/setup`
Called when the user completes the **Pregnancy Setup Wizard**:
- Calculates EDD from gestational weeks: `EDD = today + (40 - weeks) * 7 days`
- Calculates Trimester: `1` (1-12w), `2` (13-27w), `3` (28-40w)
- Upserts `pregnancy_profiles` row (EDD, gravida, para, current_week, trimester)
- Upserts `mother_medical_info` row with `blood_type`
- Updates `mother_profiles` with `height_cm` and `pre_pregnancy_weight_kg`

### 3. `PUT /api/mother-profile/:userId`
General profile update endpoint called when user edits their profile from **PassportView**:
- Updates `mother_profiles` (name, DOB, phone, height, weight, language)
- Updates `mother_medical_info` (blood type, allergies, conditions, medications)
- Updates `pregnancy_profiles` (EDD, gravida, para)
- Upserts primary `emergency_contacts` row

---

## 🔄 End-to-End Flow

```
1. Sign Up (Create Account)
   └─ Creates `users` row
   └─ Creates default `mother_profiles` row (name, phone)

2. Auto-redirect to Pregnancy Setup Wizard
   └─ Step 1: Gestational weeks slider (1-40)
   └─ Step 2: Height & Pre-pregnancy weight
   └─ Step 3: Gravida/Para & Blood type

3. Click "Complete Setup"
   └─ Calls `PUT /api/mother-profile/:userId/setup`
   └─ Saves to `pregnancy_profiles`, `mother_medical_info`, `mother_profiles`
   └─ Transitions to Main Mother App

4. Main App Load
   └─ Calls `GET /api/mother-profile/:userId`
   └─ Assembles data into state
   └─ Displays calculated weeks, EDD, blood type, etc.

5. Edit Profile in Passport Tab
   └─ Updates saved via `PUT /api/mother-profile/:userId`
   └─ Writes to proper relational tables in MySQL
```

---

## 🧪 How to Test

### Automated Backend Test
```bash
node test-profile.js
```
Expected output: `🎉 ALL PROFILE TESTS PASSED!`

### Manual Browser Test
1. Make sure server is running: `npm run dev`
2. Open http://localhost:3000
3. Click **"Create Account"** tab:
   - Name: `Bopha Meas`
   - Email: `bopha@test.com`
   - Password: `1234`
   - Confirm: `1234`
4. Click **"Create Account & Start"**
5. You'll see the **Pregnancy Setup Wizard**:
   - Step 1: Slide to **Week 24** → Next
   - Step 2: Height **158 cm**, Weight **50 kg** → Next
   - Step 3: Select Blood Type **B+**, 1st pregnancy **Yes** → Finish
6. Check **Passport tab**:
   - Blood type: **B+**
   - Height/Weight: **158 cm / 50 kg**
   - Weeks: **24 weeks**
7. Check MySQL database:
   ```sql
   SELECT * FROM mother_profiles;
   SELECT * FROM pregnancy_profiles;
   SELECT * FROM mother_medical_info;
   ```
   All tables will have the new data!

---

## 📊 Summary

| Feature | Status |
|---|---|
| Relational schema integration | ✅ Complete |
| Registration creates `mother_profiles` | ✅ Working |
| Setup wizard saves to `pregnancy_profiles` | ✅ Working |
| Setup wizard saves to `mother_medical_info` | ✅ Working |
| Calculated EDD & Trimester | ✅ Working |
| Composite GET endpoint | ✅ Working |
| General PUT profile update | ✅ Working |
| Emergency contact upsert | ✅ Working |
| Frontend backwards-compatibility | ✅ Working |
| Automated tests | ✅ 6/6 Passing |

---

**Next Option to build:**
- **Option 2:** Medical Records CRUD (upload ultrasound, lab results, prescriptions)
- **Option 3:** Appointments & Checkups (calendar, reminders)
- **Option 4:** Doctor Portal (view real patient records)
