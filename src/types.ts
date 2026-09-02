/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * FLOWER — Maternal Health Passport
 * Types split from old PassportProfile (30+ fields) into 10 separate tables.
 * See: backend/schema.sql
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'mother' | 'doctor' | 'hospital_admin' | 'family';

export type RecordCategory =
  | 'ultrasound'
  | 'lab_test'
  | 'prescription'
  | 'vaccine'
  | 'doctor_note'
  | 'other';

export type RecordStatus = 'Normal' | 'Follow-up Needed' | 'Completed' | 'Pending';

export type AppointmentType = 'ANC' | 'Ultrasound' | 'Blood Test' | 'Vaccine' | 'Specialist' | 'Other';

export type ReminderOption = '1_week' | '3_days' | '1_day' | 'same_day' | 'custom' | 'none';

export type SubscriptionTier = 'free' | 'basic' | 'premium';

export type SubscriptionStatus = 'active' | 'expired' | 'pending';

export type LanguagePref = 'en' | 'kh';

// ─── Table 1: users ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ─── Table 2: mother_profiles ────────────────────────────────────────────────

export interface MotherProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  phone: string;
  heightCm?: number;   // in cm
  weightKg?: number;   // pre-pregnancy, in kg
  languagePref: LanguagePref;
}

// ─── Table 3: pregnancy_profiles ──────────────────────────────────────────────

export interface PregnancyProfile {
  id: string;
  motherProfileId: string;
  edd: string;         // Estimated Due Date — YYYY-MM-DD
  lmp?: string;        // Last Menstrual Period — YYYY-MM-DD
  gravida: number;      // Total pregnancies including current
  para: number;         // Completed births > 20 weeks
  currentWeek: number;
  trimester: 1 | 2 | 3;
}

// ─── Table 4: mother_medical_info ───────────────────────────────────────────

export interface MotherMedicalInfo {
  id: string;
  motherProfileId: string;
  bloodType: string;
  allergies: string;
  existingConditions: string;
  currentMedications: string;
}

// ─── Table 5: emergency_contacts ─────────────────────────────────────────────

export interface EmergencyContact {
  id: string;
  motherProfileId: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

// ─── Table 6: medical_records ───────────────────────────────────────────────

export interface MedicalRecord {
  id: string;
  motherProfileId: string;
  title: string;
  category: RecordCategory;
  examDate: string;      // YYYY-MM-DD
  week: number;
  trimester: 1 | 2 | 3;
  facility: string;
  doctor: string;
  notes?: string;
  imageUrl?: string;    // URL or data URL for scanned document
  status?: RecordStatus;
  tags?: string[];
  extractedData?: { label: string; value: string; unit?: string }[];
  createdAt?: string;
}

// ─── Table 7: appointments ────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  motherProfileId: string;
  title?: string;
  apptDate: string;      // YYYY-MM-DD
  apptTime: string;      // HH:MM
  hospital: string;
  doctor: string;
  notes: string;
  type: AppointmentType;
  reminder?: ReminderOption;
  completed: boolean;
}

// ─── Table 8: doctor_profiles ─────────────────────────────────────────────────

export interface DoctorProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  specialty: string;
  facilityName: string;
  phone: string;
  email: string;
}

// ─── Table 9: hospital_profiles ───────────────────────────────────────────────

export interface HospitalProfile {
  id: string;
  userId: string;
  name: string;
  address: string;
  contactPhone: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
}

// ─── Table 10: sharing_permissions ───────────────────────────────────────────

export interface SharingPermission {
  id: string;
  motherProfileId: string;
  doctorProfileId?: string;     // one of these two is set
  hospitalProfileId?: string;
  grantedAt: string;
  expiresAt?: string;
  recordTypesGranted?: RecordCategory[];
}

// ─── Table 11: family_members ─────────────────────────────────────────────────

export interface FamilyMember {
  id: string;
  motherProfileId: string;
  name: string;
  phone: string;
  relation: string;
  canEdit: boolean;
}

// ─── Legacy / Backward-Compatible Aliases ─────────────────────────────────────
// PassportProfile used throughout the current app (home/records/appointments/
// passport/emergency views). These map to the new split tables as follows:
//
//   PassportProfile.personal  → MotherProfile
//   PassportProfile.pregnancy  → PregnancyProfile
//   PassportProfile.medical    → MotherMedicalInfo + EmergencyContacts (array)
//
// These aliases are DEPRECATED — use the split types above in new code.
// ─────────────────────────────────────────────────────────────────────────────

export interface PersonalInfo {
  name: string;
  dob: string;
  age: number;
  phone: string;
  height?: number;
  weight?: number;
}

export interface PregnancyInfo {
  edd: string;
  lmp?: string;
  gravida: number;
  para: number;
}

export interface MedicalInfo {
  bloodType: string;
  allergies: string;
  existingConditions: string;
  currentMedications: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
}

/**
 * @deprecated Use split types: MotherProfile + PregnancyProfile + MotherMedicalInfo + EmergencyContact
 * Maps to: personal → MotherProfile, pregnancy → PregnancyProfile, medical → MotherMedicalInfo + EmergencyContact[]
 */
export interface PassportProfile {
  personal: PersonalInfo;
  pregnancy: PregnancyInfo;
  medical: MedicalInfo;
}

// ─── Flower Growth Stages ─────────────────────────────────────────────────────

export interface FlowerGrowthStage {
  week: number;
  stageKey?: 'seed' | 'sprout' | 'small_plant' | 'growing_plant' | 'flower_bud' | 'blooming' | 'full_bloom';
  stageNameEn: string;
  stageNameKh: string;
  flowerEn: string;
  flowerKh: string;
  symbol: string;
  growthDescriptionEn: string;
  growthDescriptionKh: string;
  babyLength: string;
  babyWeight: string;
}
