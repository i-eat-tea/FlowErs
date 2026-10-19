/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Home, FileText, Calendar, User, Plus, Camera, Flower2, LogOut, Info } from 'lucide-react';

// Data and Types
import { PassportProfile, MedicalRecord, Appointment, UserRole, MotherProfile, PregnancyProfile, MedicalRecord as NewMedicalRecord, PatientSummary, SubscriptionTier, DocumentFolder } from './types';
import {
  DEFAULT_PROFILE,
  DEFAULT_RECORDS,
  DEFAULT_APPOINTMENTS,
  TRANSLATIONS
} from './data';

// Tracking
import { trackFeature, setUsageLang } from './lib/usage';

// Components — Mother
import Header from './components/Header';
import EmergencyModal from './components/EmergencyModal';
import HomeView from './components/HomeView';
import RecordsView from './components/RecordsView';
import AppointmentsView from './components/AppointmentsView';
import PassportView from './components/PassportView';
import AddRecordModal from './components/AddRecordModal';
import JourneySummaryReport from './components/JourneySummaryReport';
import LoginView from './components/LoginView';
import PregnancySetupWizard from './components/PregnancySetupWizard';
import InfoAccessView from './components/InfoAccessView';
import UpgradeModal from './components/UpgradeModal';
import ConsentGate from './components/ConsentGate';
import FeatureWalkthrough from './components/FeatureWalkthrough';

// Components — Doctor
import DoctorLoginView from './components/DoctorLoginView';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorPatientDetail from './components/DoctorPatientDetail';
import DoctorRecordsView from './components/DoctorRecordsView';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoredUserId(): string {
  return localStorage.getItem('flowers_user_id') || '';
}

async function apiGet<T>(path: string): Promise<T | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000); // allows a Render cold start
  try {
    const res = await fetch(path, { signal: ctrl.signal, headers: { 'X-App-Lang': document.documentElement.lang === 'km' ? 'kh' : 'en' } });
    if (!res.ok) { console.error(`[API ERROR] GET ${path} status=${res.status}`); return null; }
    return (await res.json()) as T;
  } catch (e) { console.error(`[API ERROR] GET ${path}`, e); return null; }
  finally { clearTimeout(timer); }
}

async function apiPost<T = any>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Lang': document.documentElement.lang === 'km' ? 'kh' : 'en' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  } catch (e) {
    console.error(`[API ERROR] POST ${path}`, e);
    return null;
  }
}

async function apiPut<T = any>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-App-Lang': document.documentElement.lang === 'km' ? 'kh' : 'en' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  } catch (e) {
    console.error(`[API ERROR] PUT ${path}`, e);
    return null;
  }
}

async function apiDelete(path: string): Promise<boolean> {
  try {
    const res = await fetch(path, { method: 'DELETE', headers: { 'X-App-Lang': document.documentElement.lang === 'km' ? 'kh' : 'en' } });
    return res.ok;
  } catch (e) {
    console.error(`[API ERROR] DELETE ${path}`, e);
    return false;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  // Application Language ('en' | 'kh')
  const [lang, setLang] = useState<'en' | 'kh'>('en');

  // Login Mode (Mother vs Doctor)
  const [loginMode, setLoginMode] = useState<'mother' | 'doctor'>('mother');

  // User ID - dynamically loaded from localStorage
  const [userId, setUserId] = useState<string>(() => getStoredUserId());

  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(() => (localStorage.getItem('flowers_subscription_tier') as SubscriptionTier) || 'free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // User Role & Authentication
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('flowers_user_role') as UserRole) || null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('flowers_is_logged_in') === 'true';
  });

  const [hasCompletedSetup, setHasCompletedSetup] = useState<boolean>(() => {
    return localStorage.getItem('flowers_pregnancy_setup_completed') === 'true';
  });

  // Doctor-specific state
  const [doctorEmail, setDoctorEmail] = useState<string>(() => {
    return localStorage.getItem('flowers_doctor_email') || '';
  });

  const [doctorName, setDoctorName] = useState<string>(() => {
    return localStorage.getItem('flowers_doctor_name') || '';
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [doctorView, setDoctorView] = useState<'dashboard' | 'patient-detail' | 'patient-records'>('dashboard');
  const [doctorPatients, setDoctorPatients] = useState<PatientSummary[]>([]);
  const [selectedPatientRecords, setSelectedPatientRecords] = useState<MedicalRecord[]>([]);
  const [selectedPatientAppointments, setSelectedPatientAppointments] = useState<Appointment[]>([]);
  const [isDoctorDataLoaded, setIsDoctorDataLoaded] = useState(false);

  // Active Tab: 4 MVP tabs strictly
  const [activeTab, setActiveTab] = useState<'home' | 'records' | 'calendar' | 'passport' | 'info'>('home');

  // Modal Overlays
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [showJourneyReport, setShowJourneyReport] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Consent Gate state (shown after sign-in / on session restore when server says consent required)
  const [consentGateOpen, setConsentGateOpen] = useState(false);

  // Walkthrough state
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);

  // Daily notes state
  const [dailyNotes, setDailyNotes] = useState<{ id: string; user_id: string; note_date: string; task?: string | null; note?: string | null; created_at?: string }[]>([]);

  // Data States — initialized from localStorage fallback, then synced from MySQL
  const [profile, setProfile] = useState<PassportProfile>(() => {
    const saved = localStorage.getItem('flowers_maternal_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [records, setRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('flowers_medical_records');
    return saved ? JSON.parse(saved) : DEFAULT_RECORDS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('flowers_maternal_appointments');
    return saved ? JSON.parse(saved) : DEFAULT_APPOINTMENTS;
  });

  const [folders, setFolders] = useState<DocumentFolder[]>(() => {
    const saved = localStorage.getItem('flowers_document_folders');
    return saved ? JSON.parse(saved) : [];
  });

  // Track whether data has been loaded from MySQL to avoid overwriting
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // ─── Load Doctor Patients from MySQL on mount (only for doctor/hospital_admin) ───

  useEffect(() => {
    if (!isLoggedIn || (userRole !== 'doctor' && userRole !== 'hospital_admin')) return;

    async function loadDoctorPatients() {
      const patients = await apiGet<PatientSummary[]>('/api/doctor/patients');
      if (patients && Array.isArray(patients)) {
        setDoctorPatients(patients);
      }
      setIsDoctorDataLoaded(true);
    }

    loadDoctorPatients();
  }, [isLoggedIn, userRole]);

  // ─── Load data from MySQL on mount (only after login) ─────────────────────

  useEffect(() => {
    if (!isLoggedIn || userRole !== 'mother' || !userId) return;

    async function loadFromDB() {
      setLoadError(false);
      try {
        // Try new relational endpoint first, fall back to old JSON blob
        const motherProfileData = await apiGet<{
        motherProfile: any;
        pregnancyProfile: any;
        medicalInfo: any;
        emergencyContacts: any[];
      }>(`/api/mother-profile/${userId}`);

      let dbProfile: PassportProfile | null = null;

      if (motherProfileData) {
        // Convert new relational schema back to legacy PassportProfile shape
        const mp = motherProfileData.motherProfile;
        const pp = motherProfileData.pregnancyProfile;
        const mi = motherProfileData.medicalInfo;
        const ec = motherProfileData.emergencyContacts.find((c: any) => c.isPrimary);

        dbProfile = {
          personal: {
            name: mp?.fullName || '',
            dob: mp?.dateOfBirth || '',
            age: mp?.dateOfBirth ? new Date().getFullYear() - new Date(mp.dateOfBirth).getFullYear() : 0,
            phone: mp?.phone || '',
            height: mp?.heightCm || 0,
            weight: mp?.prePregnancyWeightKg || 0,
          },
          pregnancy: {
            edd: pp?.edd || '',
            gravida: pp?.gravida || 0,
            para: pp?.para || 0,
          },
          medical: {
            bloodType: mi?.bloodType || '',
            allergies: mi?.allergies || '',
            existingConditions: mi?.existingConditions || '',
            currentMedications: mi?.currentMedications || '',
            emergencyContactName: ec?.name || '',
            emergencyContactRelation: ec?.relation || '',
            emergencyContactPhone: ec?.phone || '',
          },
        };
      } else {
        // Fall back to old JSON blob endpoint
        dbProfile = await apiGet<PassportProfile>(`/api/profile/${userId}`);
      }

      const [dbRecords, dbAppointments, dbDailyNotes] = await Promise.all([
        apiGet<MedicalRecord[]>(`/api/records/${userId}`),
        apiGet<Appointment[]>(`/api/appointments/${userId}`),
        apiGet<{ id: string; user_id: string; note_date: string; task?: string | null; note?: string | null }[]>(`/api/daily-notes/${userId}`),
      ]);

      const pp = motherProfileData?.pregnancyProfile;
      // CRITICAL FIX: If pregnancy_profile exists, or we have medical records or appointments or edd, setup is complete!
      if (
        (pp && pp.edd) ||
        (dbProfile?.pregnancy?.edd) ||
        (dbRecords && dbRecords.length > 0) ||
        (dbAppointments && dbAppointments.length > 0)
      ) {
        setHasCompletedSetup(true);
        localStorage.setItem('flowers_pregnancy_setup_completed', 'true');
      }

      if (dbProfile) {
        setProfile(dbProfile);
        localStorage.setItem('flowers_maternal_profile', JSON.stringify(dbProfile));
      }
      if (dbRecords !== null) {
        setRecords(dbRecords);
        localStorage.setItem('flowers_medical_records', JSON.stringify(dbRecords));
      }
      if (dbAppointments !== null) {
        setAppointments(dbAppointments);
        localStorage.setItem('flowers_maternal_appointments', JSON.stringify(dbAppointments));
      }
      if (dbDailyNotes !== null) {
        setDailyNotes(dbDailyNotes);
      }
      setDataLoaded(true);
      } catch (e) {
        console.error('loadFromDB error:', e);
        setLoadError(true);
      }
    }

    loadFromDB();
  }, [isLoggedIn, userRole, userId, loadAttempt]);

  // ─── Sync profile to MySQL + localStorage ─────────────────────────────────

  useEffect(() => {
    if (!dataLoaded || !isLoggedIn || userRole !== 'mother' || !userId) return;
    localStorage.setItem('flowers_maternal_profile', JSON.stringify(profile));

    // Convert PassportProfile back to relational schema fields
    const primaryEC = profile.medical.emergencyContactName ? {
      emergencyContactName: profile.medical.emergencyContactName,
      emergencyContactPhone: profile.medical.emergencyContactPhone,
      emergencyContactRelation: profile.medical.emergencyContactRelation,
    } : {};

    apiPut(`/api/mother-profile/${userId}`, {
      fullName: profile.personal.name,
      dateOfBirth: profile.personal.dob || null, // Convert empty string to null
      phone: profile.personal.phone,
      heightCm: profile.personal.height,
      weightKg: profile.personal.weight,
      bloodType: profile.medical.bloodType,
      allergies: profile.medical.allergies,
      existingConditions: profile.medical.existingConditions,
      currentMedications: profile.medical.currentMedications,
      edd: profile.pregnancy.edd || null, // Convert empty string to null
      gravida: profile.pregnancy.gravida,
      para: profile.pregnancy.para,
      ...primaryEC,
    });
  }, [profile, dataLoaded, isLoggedIn, userRole, userId]);

  // Sync records to MySQL + localStorage
  useEffect(() => {
    if (!dataLoaded || !isLoggedIn) return;
    localStorage.setItem('flowers_medical_records', JSON.stringify(records));
  }, [records, dataLoaded, isLoggedIn]);

  // Sync appointments to MySQL + localStorage
  useEffect(() => {
    if (!dataLoaded || !isLoggedIn) return;
    localStorage.setItem('flowers_maternal_appointments', JSON.stringify(appointments));
  }, [appointments, dataLoaded, isLoggedIn]);

  // One-time import of legacy daily reminder localStorage into daily_notes
  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    const legacy = localStorage.getItem('flowers_daily_reminders');
    if (!legacy) return;
    try {
      const parsed = JSON.parse(legacy);
      const entries = Array.isArray(parsed) ? parsed : (parsed && parsed.entries ? parsed.entries : []);
      entries.forEach((entry: any) => {
        if (entry.date && (entry.task || entry.note)) {
          apiPost('/api/daily-notes', {
            userId,
            note_date: entry.date,
            task: entry.task || null,
            note: entry.note || null,
          }).catch(() => {});
        }
      });
    } catch (e) { console.error('daily reminder import failed', e); }
    finally {
      localStorage.removeItem('flowers_daily_reminders');
    }
  }, [isLoggedIn, userId]);

  // Set usage language when language changes (and once on mount via effect below)
  useEffect(() => {
    setUsageLang(lang);
  }, [lang]);

  // Sync document language
  useEffect(() => {
    document.documentElement.lang = lang === 'kh' ? 'km' : 'en';
  }, [lang]);

  // Track tab views (mother only)
  useEffect(() => {
    if (!isLoggedIn || userRole !== 'mother') return;
    const tabFeatureMap: Record<typeof activeTab, any> = {
      home: 'home_view',
      records: 'records_view',
      calendar: 'calendar_view',
      info: 'info_view',
      passport: 'passport_view'
    };
    const feature = tabFeatureMap[activeTab];
    if (feature) trackFeature(feature, 'view', { tab: activeTab });
  }, [activeTab, isLoggedIn, userRole]);

  // Session restore: if a stored token exists, check consent status
  useEffect(() => {
    const token = localStorage.getItem('flowers_auth_token');
    if (token && isLoggedIn && !consentGateOpen) {
      (async () => {
        try {
          const res = await fetch('/api/consent/status', {
            headers: { 'Authorization': 'Bearer ' + token, 'X-App-Lang': lang === 'kh' ? 'kh' : 'en' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.required === true) setConsentGateOpen(true);
          }
        } catch {}
      })();
    }
  }, [isLoggedIn, lang, consentGateOpen]);

  // Set usage language when language changes
  useEffect(() => {
    setUsageLang(lang);
  }, [lang]);

  // Auto-start feature walkthrough once per user (after consent gate closed and setup done)
  useEffect(() => {
    if (!isLoggedIn) return;
    if (consentGateOpen) return;
    const id = userRole === 'doctor' || userRole === 'hospital_admin' ? doctorEmail : userId;
    if (!id) return;
    const seenKey = 'walkthrough_seen:' + id;
    const hasCompleted = (userRole === 'mother' && hasCompletedSetup) || (userRole === 'doctor' || userRole === 'hospital_admin');
    if (hasCompleted && !localStorage.getItem(seenKey)) {
      setWalkthroughOpen(true);
      trackFeature('walkthrough', 'start', { step: 1, total_steps: userRole === 'mother' ? 9 : 4, variant: userRole === 'mother' ? 'mother' : 'doctor', lang });
    }
  }, [isLoggedIn, consentGateOpen, userId, doctorEmail, userRole, hasCompletedSetup, lang]);

  // ========================================================
  // PREGNANCY METRICS CALCULATOR
  // ========================================================
  const pregnancyMetrics = useMemo(() => {
    const eddDate = new Date(profile.pregnancy.edd);
    const today = new Date();

    if (isNaN(eddDate.getTime())) {
      return { weeks: 26, trimester: 2, daysRemaining: 98 };
    }

    const diffTime = eddDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = diffDays > 0 ? diffDays : 0;

    const daysElapsed = 280 - daysRemaining;
    const rawWeeks = Math.floor(daysElapsed / 7);
    const weeks = Math.max(4, Math.min(rawWeeks, 40));

    let trimester = 1;
    if (weeks >= 13 && weeks <= 27) trimester = 2;
    if (weeks >= 28) trimester = 3;

    return { weeks, trimester, daysRemaining };
  }, [profile.pregnancy.edd]);

  // ========================================================
  // RECORD & APPOINTMENT HANDLERS
  // ========================================================

  const FREE_RECORD_LIMIT = 5;
  const handleAddRecord = useCallback(async (newRecord: MedicalRecord) => {
    if (subscriptionTier === 'free' && records.length >= FREE_RECORD_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }
    setRecords(prev => [newRecord, ...prev]);
    await apiPost('/api/records', { ...newRecord, userId });
  }, [userId, subscriptionTier, records.length]);

  const handleDeleteRecord = useCallback(async (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    await apiDelete(`/api/records/${id}`);
  }, []);

  const handleAddAppointment = useCallback(async (newAppt: Appointment) => {
    setAppointments(prev => [...prev, newAppt]);
    await apiPost('/api/appointments', { ...newAppt, userId });
  }, [userId]);

  const handleUpdateAppointment = useCallback(async (updatedAppt: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updatedAppt.id ? updatedAppt : a));
    await apiPut(`/api/appointments/${updatedAppt.id}`, updatedAppt);
  }, []);

  const handleToggleAppointmentComplete = useCallback(async (id: string) => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;
    const updated = { ...appt, completed: !appt.completed };
    setAppointments(prev => prev.map(a => a.id === id ? updated : a));
    await apiPut(`/api/appointments/${id}`, { completed: updated.completed });
  }, [appointments]);

  const handleDeleteAppointment = useCallback(async (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    await apiDelete(`/api/appointments/${id}`);
  }, []);

  const handleUpdateProfile = useCallback((updated: PassportProfile) => {
    setProfile(updated);
  }, []);

  const handleSelectRecordFromHome = (record: MedicalRecord) => {
    setSelectedRecordId(record.id);
    setActiveTab('records');
  };

  // ── Daily note handlers ──
  const handleAddDailyNote = useCallback(async (task: string, note: string, noteDate: string) => {
    if (!task && !note) return;
    const optimistic: { id: string; user_id: string; note_date: string; task?: string | null; note?: string | null } = {
      id: `note-${Date.now()}`,
      user_id: userId,
      note_date: noteDate,
      task: task || null,
      note: note || null,
    };
    setDailyNotes(prev => [...prev, optimistic]);
    await apiPost('/api/daily-notes', {
      userId,
      note_date: noteDate,
      task: task || null,
      note: note || null,
    }).catch(() => {
      setDailyNotes(prev => prev.filter(n => n.id !== optimistic.id));
    });
  }, [userId]);

  const handleDeleteDailyNote = useCallback(async (id: string) => {
    setDailyNotes(prev => prev.filter(n => n.id !== id));
    await apiDelete(`/api/daily-notes/${id}`).catch(() => {
      // reload on failure
      apiGet(`/api/daily-notes/${userId}`).then(notes => {
        if (notes) setDailyNotes(notes);
      });
    });
  }, [userId]);

  // ─── Auth Handlers ─────────────────────────────────────────────────────────

  const handleLoginSuccess = (motherName: string, serverUserId: string, consentRequired?: boolean) => {
    // CRITICAL: Store the actual user ID from the server
    localStorage.setItem('flowers_user_id', serverUserId);
    (window as any).__userId = serverUserId;
    setUserId(serverUserId); // Update state immediately
    setDataLoaded(false); // Reset data loaded to trigger fresh DB load

    setProfile(prev => ({
      ...prev,
      personal: { ...prev.personal, name: motherName }
    }));
    setUserRole('mother');
    setIsLoggedIn(true);
    localStorage.setItem('flowers_is_logged_in', 'true');
    localStorage.setItem('flowers_user_role', 'mother');
    const updated = {
      ...profile,
      personal: { ...profile.personal, name: motherName }
    };
    localStorage.setItem('flowers_maternal_profile', JSON.stringify(updated));

    // Save to new endpoint using the correct userId
    apiPut(`/api/mother-profile/${serverUserId}`, {
      fullName: motherName,
    }).catch(() => {});

    // Open consent gate only when the server says consent is actually required
    // (a user who ticked the register checkbox should not see it again)
    setConsentGateOpen(consentRequired === true);
  };

  const handleDoctorLoginSuccess = (email: string, role: 'doctor' | 'hospital_admin', consentRequired?: boolean) => {
    // Extract doctor name from email (e.g., "dr.sophy@hospital.com" → "Dr. Sophy")
    const nameParts = email.split('@')[0].split('.');
    const name = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    setDoctorEmail(email);
    setDoctorName(name);
    setUserRole(role);
    setIsLoggedIn(true);
    setIsDoctorDataLoaded(false);
    localStorage.setItem('flowers_is_logged_in', 'true');
    localStorage.setItem('flowers_user_role', role);
    localStorage.setItem('flowers_doctor_email', email);
    localStorage.setItem('flowers_doctor_name', name);

    setConsentGateOpen(consentRequired === true);
  };

  const handleSelectPatient = useCallback(async (motherProfileId: string) => {
    setSelectedPatientId(motherProfileId);
    setDoctorView('patient-detail');

    // Fetch patient's records and appointments concurrently
    const [patientRecords, patientAppts] = await Promise.all([
      apiGet<MedicalRecord[]>(`/api/doctor/patient/${motherProfileId}/records`),
      apiGet<Appointment[]>(`/api/doctor/patient/${motherProfileId}/appointments`),
    ]);

    if (patientRecords && Array.isArray(patientRecords)) {
      setSelectedPatientRecords(patientRecords);
    }
    if (patientAppts && Array.isArray(patientAppts)) {
      setSelectedPatientAppointments(patientAppts);
    }
  }, []);

  const handleAddClinicalNote = useCallback(async (recordId: string, noteText: string) => {
    const res = await apiPost<{ success: boolean; notes: string }>(`/api/doctor/records/${recordId}/notes`, {
      note: noteText,
      doctorName: doctorName || 'Attending Doctor',
    });

    if (res && res.notes) {
      setSelectedPatientRecords(prev =>
        prev.map(r => r.id === recordId ? { ...r, notes: res.notes } : r)
      );
    }
  }, [doctorName]);

  const handleLogout = () => {
    trackFeature('logout', 'click');
    setIsLoggedIn(false);
    setUserRole(null);
    setUserId(''); // Clear userId state
    setHasCompletedSetup(false);
    setProfile(DEFAULT_PROFILE);
    setRecords(DEFAULT_RECORDS);
    setAppointments(DEFAULT_APPOINTMENTS);
    setDoctorEmail('');
    setDoctorName('');
    setSelectedPatientId(null);
    setDoctorView('dashboard');
    setDoctorPatients([]);
    setSelectedPatientRecords([]);
    setSelectedPatientAppointments([]);
    setIsDoctorDataLoaded(false);
    setDataLoaded(false); // Reset data loaded state on logout
    setConsentGateOpen(false);
    setWalkthroughOpen(false);
    localStorage.removeItem('flowers_is_logged_in');
    localStorage.removeItem('flowers_user_id'); // CRITICAL: Clear stored userId on logout
    localStorage.removeItem('flowers_user_role');
    localStorage.removeItem('flowers_doctor_email');
    localStorage.removeItem('flowers_doctor_name');
    localStorage.removeItem('flowers_pregnancy_setup_completed');
    localStorage.removeItem('flowers_maternal_profile');
    localStorage.removeItem('flowers_medical_records');
    localStorage.removeItem('flowers_maternal_appointments');
    localStorage.removeItem('flowers_auth_token');
    localStorage.removeItem('flowers_user_email');
    localStorage.removeItem('flowers_subscription_tier');
    localStorage.removeItem('flowers_document_folders');
    Object.keys(localStorage)
      .filter(k => k.startsWith('flowers_'))
      .forEach(k => localStorage.removeItem(k));
    setSubscriptionTier('free');
  };

  const handleSetupComplete = useCallback((setupData: {
    weeks: number;
    height: number;
    weight: number;
    gravida: number;
    para: number;
    bloodType: string;
  }) => {
    // Calculate EDD client-side for immediate UI
    const today = new Date();
    const daysRemaining = (40 - setupData.weeks) * 7;
    const eddDate = new Date(today.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
    const eddString = eddDate.toISOString().split('T')[0];

    // Update local PassportProfile state for immediate UI
    const updated: PassportProfile = {
      ...profile,
      personal: {
        ...profile.personal,
        height: setupData.height,
        weight: setupData.weight
      },
      pregnancy: {
        ...profile.pregnancy,
        edd: eddString,
        gravida: setupData.gravida,
        para: setupData.para
      },
      medical: {
        ...profile.medical,
        bloodType: setupData.bloodType
      }
    };

    setProfile(updated);
    localStorage.setItem('flowers_maternal_profile', JSON.stringify(updated));

    // Save to new relational tables via setup endpoint
    apiPut(`/api/mother-profile/${userId}/setup`, {
      weeks: setupData.weeks,
      height: setupData.height,
      weight: setupData.weight,
      gravida: setupData.gravida,
      para: setupData.para,
      bloodType: setupData.bloodType,
    }).catch((err) => console.error('Setup save failed:', err));

    setHasCompletedSetup(true);
    localStorage.setItem('flowers_pregnancy_setup_completed', 'true');
  }, [profile, userId]);

  const t = TRANSLATIONS[lang];

  // ========================================================
  // ROLE-BASED ROUTING & CONDITIONAL RENDER
  // ========================================================

  // 1. NO LOGIN — show role selector or login view
  if (!isLoggedIn) {
    if (loginMode === 'doctor') {
      return (
        <DoctorLoginView
          lang={lang}
          setLang={setLang}
          onLoginSuccess={handleDoctorLoginSuccess}
          onSwitchToMotherLogin={() => setLoginMode('mother')}
        />
      );
    }
    return (
      <div className="min-h-screen bg-[#FEFAFB]">
        <LoginView
          lang={lang}
          setLang={setLang}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToDoctorLogin={() => setLoginMode('doctor')}
        />
      </div>
    );
  }

  // 1b. CONSENT GATE — shown after sign-in / on session restore before app UI
  if (consentGateOpen) {
    return (
      <ConsentGate
        lang={lang}
        onAgree={() => {
          setConsentGateOpen(false);
        }}
        onDecline={() => {
          setConsentGateOpen(false);
        }}
      />
    );
  }

  // 2. DOCTOR / HOSPITAL ADMIN VIEW
  if (userRole === 'doctor' || userRole === 'hospital_admin') {
    if (!isDoctorDataLoaded) {
      return (
        <div className="min-h-screen bg-[#FEFAFB] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-[#2F6F8F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-black text-[#2F6F8F] font-heading">
              {lang === 'en' ? 'Loading patient registry...' : 'កំពុងផ្ទុកបញ្ជីអ្នកជម្ងឺ...'}
            </p>
          </div>
        </div>
      );
    }

    // Doctor Dashboard
    if (doctorView === 'dashboard') {
      return (
        <div className={`min-h-screen bg-[#FEFAFB] ${lang === 'kh' ? 'lang-kh' : ''}`}>
          <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'kh' : 'en')}
              className="px-3 py-1.5 rounded-full text-xs font-black bg-[#AEE3D8]/30 hover:bg-[#AEE3D8]/60 text-[#2F6F8F] transition-all cursor-pointer border border-[#AEE3D8] shadow-3xs"
            >
              {lang === 'en' ? 'KH' : 'EN'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full text-xs font-black bg-[#FDDEEC] hover:bg-[#F4A6B5] text-[#FA6B90] transition-all cursor-pointer border border-[#FA6B90] shadow-3xs flex items-center space-x-1"
            >
              <LogOut className="w-3 h-3" />
              <span>{lang === 'en' ? 'Logout' : 'ចាកចេញ'}</span>
            </button>
          </div>

          <DoctorDashboard
            doctorId="doctor-001"
            doctorName={doctorName || 'Doctor'}
            patients={doctorPatients}
            onSelectPatient={handleSelectPatient}
            lang={lang}
            onReplayWalkthrough={() => setWalkthroughOpen(true)}
          />
        </div>
      );
    }

    // Doctor Patient Detail
    if (doctorView === 'patient-detail' && selectedPatientId) {
      const patient = doctorPatients.find(p => p.motherProfile.id === selectedPatientId);
      if (!patient) return null;

      return (
        <div className={`min-h-screen bg-[#FEFAFB] ${lang === 'kh' ? 'lang-kh' : ''}`}>
          <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'kh' : 'en')}
              className="px-3 py-1.5 rounded-full text-xs font-black bg-[#AEE3D8]/30 hover:bg-[#AEE3D8]/60 text-[#2F6F8F] transition-all cursor-pointer border border-[#AEE3D8] shadow-3xs"
            >
              {lang === 'en' ? 'KH' : 'EN'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full text-xs font-black bg-[#FDDEEC] hover:bg-[#F4A6B5] text-[#FA6B90] transition-all cursor-pointer border border-[#FA6B90] shadow-3xs flex items-center space-x-1"
            >
              <LogOut className="w-3 h-3" />
              <span>{lang === 'en' ? 'Logout' : 'ចាកចេញ'}</span>
            </button>
          </div>

          <DoctorPatientDetail
            motherProfile={patient.motherProfile}
            pregnancyProfile={patient.pregnancyProfile}
            medicalInfo={patient.medicalInfo || {
              id: `med-${patient.motherProfile.id}`,
              motherProfileId: patient.motherProfile.id,
              bloodType: '',
              allergies: '',
              existingConditions: '',
              currentMedications: ''
            }}
            emergencyContacts={patient.emergencyContacts || []}
            records={selectedPatientRecords}
            appointments={selectedPatientAppointments}
            onBack={() => setDoctorView('dashboard')}
            onViewRecords={() => setDoctorView('patient-records')}
            lang={lang}
          />
        </div>
      );
    }

    // Doctor Records View
    if (doctorView === 'patient-records' && selectedPatientId) {
      const patient = doctorPatients.find(p => p.motherProfile.id === selectedPatientId);
      if (!patient) return null;

      return (
        <div className={`min-h-screen bg-[#FEFAFB] ${lang === 'kh' ? 'lang-kh' : ''}`}>
          <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'kh' : 'en')}
              className="px-3 py-1.5 rounded-full text-xs font-black bg-[#AEE3D8]/30 hover:bg-[#AEE3D8]/60 text-[#2F6F8F] transition-all cursor-pointer border border-[#AEE3D8] shadow-3xs"
            >
              {lang === 'en' ? 'KH' : 'EN'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full text-xs font-black bg-[#FDDEEC] hover:bg-[#F4A6B5] text-[#FA6B90] transition-all cursor-pointer border border-[#FA6B90] shadow-3xs flex items-center space-x-1"
            >
              <LogOut className="w-3 h-3" />
              <span>{lang === 'en' ? 'Logout' : 'ចាកចេញ'}</span>
            </button>
          </div>

          <DoctorRecordsView
            motherName={patient.motherProfile.fullName}
            records={selectedPatientRecords}
            onBack={() => setDoctorView('patient-detail')}
            onAddClinicalNote={handleAddClinicalNote}
            lang={lang}
          />
        </div>
      );
    }
  }

  // 3. MOTHER VIEW — requires setup completion
  // Show loading spinner while fetching from database to prevent wizard flickering
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-[#FEFAFB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#FA6B90] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-black text-[#2F6F8F] font-heading">
            {lang === 'en' ? 'Loading your health passport...' : 'កំពុងផ្ទុកទិន្នន័យសុខភាព...'}
          </p>
        </div>
      </div>
    );
  }

  if (!hasCompletedSetup) {
    return (
      <PregnancySetupWizard
        lang={lang}
        motherName={profile.personal.name || 'Srey Leak'}
        onComplete={handleSetupComplete}
      />
    );
  }

  // 4. MOTHER MAIN APP
  return (
    <div className={`min-h-screen bg-[#FEFAFB] flex flex-col font-sans ${lang === 'kh' ? 'lang-kh' : ''}`} id="app-root-container">
      {/* PERSISTENT HEADER */}
      <Header
        lang={lang}
        setLang={setLang}
        onOpenEmergency={() => setEmergencyOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. CORE DISPLAY CONTAINER (FOCUSED MOBILE/TABLET VIEWPORT) */}
      <main className="flex-1 w-full max-w-md mx-auto bg-[#FEFAFB] pb-24 min-h-[calc(100vh-60px)] px-4 py-4 relative border-x border-[#AEE3D8]/50">

        {/* TAB 1: ❀ HOME */}
        {activeTab === 'home' && (
          <HomeView
            profile={profile}
            records={records}
            appointments={appointments}
            lang={lang}
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
            onOpenEmergency={() => setEmergencyOpen(true)}
            onOpenScanRecord={() => setIsScanModalOpen(true)}
            onSelectRecord={handleSelectRecordFromHome}
            calculatedWeeks={pregnancyMetrics.weeks}
            calculatedTrimester={pregnancyMetrics.trimester}
            daysRemaining={pregnancyMetrics.daysRemaining}
          />
        )}

        {/* TAB 2: ✿ MY RECORDS (MEDICAL DOCUMENT VAULT) */}
        {activeTab === 'records' && (
          <RecordsView
            records={records}
            folders={folders}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
            onOpenScanRecord={() => setIsScanModalOpen(true)}
            onGenerateFolderQR={(folder) => {
              const url = `${window.location.origin}/folder.html?folderId=${folder.id}`;
              window.open(url, '_blank');
            }}
            lang={lang}
            selectedRecordId={selectedRecordId}
          />
        )}

        {/* TAB 3: ❁ CALENDAR (CHECKUP REMINDERS) */}
        {activeTab === 'calendar' && (
          <AppointmentsView
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onToggleComplete={handleToggleAppointmentComplete}
            onDeleteAppointment={handleDeleteAppointment}
            lang={lang}
            profile={profile}
            currentWeek={pregnancyMetrics.weeks}
            dailyNotes={dailyNotes}
            onAddDailyNote={handleAddDailyNote}
            onDeleteDailyNote={handleDeleteDailyNote}
          />
        )}

                {/* TAB: INFORMATION ACCESS (Telegram bot + information portal) */}
        {activeTab === 'info' && <InfoAccessView lang={lang} />}

{/* TAB 4: ⚘ PASSPORT (UNIFIED PROFILE & MATERNAL PASSPORT) */}
        {activeTab === 'passport' && (
          <PassportView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onOpenSummaryReport={() => setShowJourneyReport(true)}
            onLogout={handleLogout}
            lang={lang}
            calculatedWeeks={pregnancyMetrics.weeks}
            calculatedTrimester={pregnancyMetrics.trimester}
          />
        )}
      </main>

      {/* 3. PERSISTENT 4-TAB NAVIGATION BAR (sticky bottom bar) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#FEFAFB]/95 backdrop-blur-md border-t-2 border-[#AEE3D8] z-40 py-2 shadow-xs pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="max-w-md mx-auto grid grid-cols-5 text-center items-stretch">

          {/* Home Tab */}
          <button
            onClick={() => {
              setSelectedRecordId(null);
              setActiveTab('home');
            }}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
              activeTab === 'home' ? 'text-[#2F6F8F]' : 'text-[#CFADB9] hover:text-[#2F6F8F]'
            }`}
            style={{ minHeight: '56px' }}
            id="tab-home"
          >
            <div className={`p-1 rounded-full transition-all ${activeTab === 'home' ? 'bg-[#AEE3D8] shadow-3xs' : ''}`}>
              <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#2F6F8F] stroke-[2.5]' : ''}`} />
            </div>
            <span className={`text-[10px] mt-0.5 uppercase tracking-tight ${activeTab === 'home' ? 'font-black text-[#2F6F8F]' : 'font-semibold'}`}>
              {t.home}
            </span>
          </button>

          {/* My Records Tab */}
          <button
            onClick={() => setActiveTab('records')}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors relative ${
              activeTab === 'records' ? 'text-[#2F6F8F]' : 'text-[#CFADB9] hover:text-[#2F6F8F]'
            }`}
            style={{ minHeight: '48px' }}
            id="tab-records"
          >
            <div className={`p-1 rounded-full transition-all ${activeTab === 'records' ? 'bg-[#AEE3D8] shadow-3xs' : ''}`}>
              <FileText className={`w-5 h-5 ${activeTab === 'records' ? 'text-[#2F6F8F] stroke-[2.5]' : ''}`} />
            </div>
            <span className={`text-[10px] mt-0.5 uppercase tracking-tight ${activeTab === 'records' ? 'font-black text-[#2F6F8F]' : 'font-semibold'}`}>
              {t.records}
            </span>
          </button>

          {/* Calendar Tab */}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
              activeTab === 'calendar' ? 'text-[#2F6F8F]' : 'text-[#CFADB9] hover:text-[#2F6F8F]'
            }`}
            style={{ minHeight: '42px' }}
            id="tab-calendar"
          >
            <div className={`p-1 rounded-full transition-all ${activeTab === 'calendar' ? 'bg-[#AEE3D8] shadow-3xs' : ''}`}>
              <Calendar className={`w-5 h-5 ${activeTab === 'calendar' ? 'text-[#2F6F8F] stroke-[2.5]' : ''}`} />
            </div>
            <span className={`text-[8px] mt-0.5 uppercase tracking-tight ${activeTab === 'calendar' ? 'font-black text-[#2F6F8F]' : 'font-semibold'}`}>
              {t.calendar}
            </span>
          </button>

          {/* Information Tab */}
          <button
            onClick={() => setActiveTab('info')}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
              activeTab === 'info' ? 'text-[#2F6F8F]' : 'text-[#CFADB9] hover:text-[#2F6F8F]'
            }`}
            style={{ minHeight: '42px' }}
            id="tab-info"
          >
            <div className={`p-1 rounded-full transition-all ${activeTab === 'info' ? 'bg-[#AEE3D8] shadow-3xs' : ''}`}>
              <Info className={`w-5 h-5 ${activeTab === 'info' ? 'text-[#2F6F8F] stroke-[2.5]' : ''}`} />
            </div>
            <span className={`text-[8px] mt-0.5 uppercase tracking-tight ${activeTab === 'info' ? 'font-black text-[#2F6F8F]' : 'font-semibold'}`}>
              {t.info}
            </span>
          </button>

          {/* Passport Tab */}
          <button
            onClick={() => setActiveTab('passport')}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
              activeTab === 'passport' ? 'text-[#2F6F8F]' : 'text-[#CFADB9] hover:text-[#2F6F8F]'
            }`}
            style={{ minHeight: '42px' }}
            id="tab-passport"
          >
            <div className={`p-1 rounded-full transition-all ${activeTab === 'passport' ? 'bg-[#AEE3D8] shadow-3xs' : ''}`}>
              <User className={`w-5 h-5 ${activeTab === 'passport' ? 'text-[#2F6F8F] stroke-[2.5]' : ''}`} />
            </div>
            <span className={`text-[8px] mt-0.5 uppercase tracking-tight ${activeTab === 'passport' ? 'font-black text-[#2F6F8F]' : 'font-semibold'}`}>
              {t.passport}
            </span>
          </button>

        </div>
      </nav>

      {/* 4. MODAL: SCAN / UPLOAD MEDICAL RECORD */}
      <AddRecordModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onSaveRecord={handleAddRecord}
        lang={lang}
        currentCalculatedWeek={pregnancyMetrics.weeks}
      />

      {/* 5. MODAL: EMERGENCY SOS MEDICAL CARD */}
      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        lang={lang}
        profile={profile}
        calculatedWeeks={pregnancyMetrics.weeks}
      />

      {/* 6. MODAL: MATERNAL SUMMARY REPORT */}
      {showJourneyReport && (
        <JourneySummaryReport
          profile={profile}
          lang={lang}
          onClose={() => setShowJourneyReport(false)}
        />
      )}

      {/* 7. MODAL: FREEMIUM UPGRADE PROMPT */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setSubscriptionTier('premium');
          localStorage.setItem('flowers_subscription_tier', 'premium');
          setShowUpgradeModal(false);
        }}
        lang={lang}
        feature={lang === 'en' ? 'Premium Features' : 'លក្ខ�ន�ព special'}
      />

      {/* 8. MODAL: FEATURE WALKTHROUGH */}
      {walkthroughOpen && (
        <FeatureWalkthrough
          lang={lang}
          variant="mother"
          userId={userId}
          onNavigate={(tab) => { setActiveTab(tab as any); }}
          onComplete={() => setWalkthroughOpen(false)}
          onSkip={() => setWalkthroughOpen(false)}
        />
      )
      }
    </div>
  );
}
