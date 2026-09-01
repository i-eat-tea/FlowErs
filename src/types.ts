/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RecordCategory = 
  | 'ultrasound' 
  | 'lab_test' 
  | 'prescription' 
  | 'vaccine' 
  | 'doctor_note' 
  | 'other';

export interface MedicalRecord {
  id: string;
  title: string;
  category: RecordCategory;
  date: string;
  week: number;
  trimester: 1 | 2 | 3;
  facility: string;
  doctor: string;
  notes?: string;
  imageAttachment?: string; // Data URL or scanned photo URL
  status?: 'Normal' | 'Follow-up Needed' | 'Completed' | 'Pending';
  tags?: string[];
  extractedData?: { label: string; value: string; unit?: string }[];
}

export interface PersonalInfo {
  name: string;
  dob: string;
  age: number;
  phone: string;
  height?: number; // Height in cm
  weight?: number; // Pre-pregnancy weight in kg
}

export interface PregnancyInfo {
  edd: string; // Estimated Due Date
  lmp?: string; // Last Menstrual Period
  gravida: number; // Previous pregnancies
  para: number; // Previous births
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

export interface PassportProfile {
  personal: PersonalInfo;
  pregnancy: PregnancyInfo;
  medical: MedicalInfo;
}

export interface Appointment {
  id: string;
  title?: string;
  date: string;
  time: string;
  hospital: string;
  doctor: string;
  notes: string;
  completed: boolean;
  type: 'ANC' | 'Ultrasound' | 'Blood Test' | 'Vaccine' | 'Specialist' | 'Other';
  reminder?: '1_week' | '3_days' | '1_day' | 'same_day' | 'custom' | 'none';
  imageAttachment?: string;
}

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
