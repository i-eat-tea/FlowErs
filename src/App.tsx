/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Home, FileText, Calendar, User, Plus, Camera, Flower2, LogOut } from 'lucide-react';

// Data and Types
import { PassportProfile, MedicalRecord, Appointment, UserRole, MotherProfile, PregnancyProfile, MedicalRecord as NewMedicalRecord } from './types';
import {
  DEFAULT_PROFILE,
  DEFAULT_RECORDS,
  DEFAULT_APPOINTMENTS,
  TRANSLATIONS
} from './data';

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
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function apiPost(path: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function apiPut(path: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function apiDelete(path: string): Promise<boolean> {
  try {
    const res = await fetch(path, { method: 'DELETE' });
    return res.ok;
  } catch {
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

  // Active Tab: 4 MVP tabs strictly
  const [activeTab, setActiveTab] = useState<'home' | 'records' | 'calendar' | 'passport'>('home');

  // Modal Overlays
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [showJourneyReport, setShowJourneyReport] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

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

  // Track whether data has been loaded from MySQL to avoid overwriting
  const [dataLoaded, setDataLoaded] = useState(false);

  // ─── Load data from MySQL on mount (only after login) ─────────────────────

  useEffect(() => {
    if (!isLoggedIn || userRole !== 'mother' || !userId) return;

    async function loadFromDB() {
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

        // CRITICAL FIX: If pregnancy_profile exists, setup is complete!
        if (pp && pp.edd) {
          setHasCompletedSetup(true);
          localStorage.setItem('flowers_pregnancy_setup_completed', 'true');
        }
      } else {
        // Fall back to old JSON blob endpoint
        dbProfile = await apiGet<PassportProfile>(`/api/profile/${userId}`);
      }

      const [dbRecords, dbAppointments] = await Promise.all([
        apiGet<MedicalRecord[]>(`/api/records/${userId}`),
        apiGet<Appointment[]>(`/api/appointments/${userId}`),
      ]);

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
      setDataLoaded(true);
    }

    loadFromDB();
  }, [isLoggedIn, userRole, userId]);

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

  // Sync document language
  useEffect(() => {
    document.documentElement.lang = lang === 'kh' ? 'km' : 'en';
  }, [lang]);

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

  const handleAddRecord = useCallback(async (newRecord: MedicalRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    await apiPost('/api/records', { ...newRecord, userId });
  }, [userId]);

  const handleDeleteRecord = useCallback(async (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    await apiDelete(`/api/records/${id}`);
  }, []);

  const handleAddAppointment = useCallback(async (newAppt: Appointment) => {
    setAppointments(prev => [...prev, newAppt]);
    await apiPost('/api/appointments', { ...newAppt, userId });
  }, [userId]);

  const handleToggleAppointmentComplete = useCallback(async (id: string) => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;
    const updated = { ...appt, completed: !appt.completed };
    setAppointments(prev => prev.map(a => a.id === id ? updated : a));
    await apiPut(`/api/appointments/${id}`, updated);
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

  // ─── Auth Handlers ─────────────────────────────────────────────────────────

  const handleLoginSuccess = (motherName: string, serverUserId: string) => {
    // CRITICAL: Store the actual user ID from the server
    localStorage.setItem('flowers_user_id', serverUserId);
    setUserId(serverUserId); // Update state immediately

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
  };

  const handleDoctorLoginSuccess = (email: string, role: 'doctor' | 'hospital_admin') => {
    // Extract doctor name from email (e.g., "dr.sophy@hospital.com" → "Dr. Sophy")
    const nameParts = email.split('@')[0].split('.');
    const name = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    setDoctorEmail(email);
    setDoctorName(name);
    setUserRole(role);
    setIsLoggedIn(true);
    localStorage.setItem('flowers_is_logged_in', 'true');
    localStorage.setItem('flowers_user_role', role);
    localStorage.setItem('flowers_doctor_email', email);
    localStorage.setItem('flowers_doctor_name', name);
  };

  const handleLogout = () => {
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
    setDataLoaded(false); // Reset data loaded state on logout
    localStorage.removeItem('flowers_is_logged_in');
    localStorage.removeItem('flowers_user_id'); // CRITICAL: Clear stored userId on logout
    localStorage.removeItem('flowers_user_role');
    localStorage.removeItem('flowers_doctor_email');
    localStorage.removeItem('flowers_doctor_name');
    localStorage.removeItem('flowers_pregnancy_setup_completed');
    localStorage.removeItem('flowers_maternal_profile');
    localStorage.removeItem('flowers_medical_records');
    localStorage.removeItem('flowers_maternal_appointments');
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

  // 2. DOCTOR / HOSPITAL ADMIN VIEW
  if (userRole === 'doctor' || userRole === 'hospital_admin') {
    // Mock patient data — in production, fetch from API
    const mockPatients = [
      {
        motherProfile: {
          id: 'mother-001',
          userId: 'user-001',
          fullName: 'Sophy Cheat',
          dateOfBirth: '1998-05-15',
          phone: '+855-97-123-4567',
          heightCm: 158,
          weightKg: 52,
          languagePref: 'kh' as const
        },
        pregnancyProfile: {
          id: 'preg-001',
          motherProfileId: 'mother-001',
          edd: '2026-11-20',
          lmp: '2026-02-13',
          gravida: 1,
          para: 0,
          currentWeek: 28,
          trimester: 3
        },
        sharingPermission: {
          id: 'share-001',
          motherProfileId: 'mother-001',
          doctorProfileId: 'doctor-001',
          grantedAt: new Date().toISOString(),
          recordTypesGranted: ['ultrasound', 'lab_test', 'doctor_note']
        },
        recordCount: 8,
        lastRecordDate: '2026-08-25',
        nextAppointmentDate: '2026-09-08'
      }
    ];

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
            doctorName={doctorName}
            patients={mockPatients}
            onSelectPatient={(motherProfileId) => {
              setSelectedPatientId(motherProfileId);
              setDoctorView('patient-detail');
            }}
            lang={lang}
          />
        </div>
      );
    }

    // Doctor Patient Detail
    if (doctorView === 'patient-detail' && selectedPatientId) {
      const patient = mockPatients.find(p => p.motherProfile.id === selectedPatientId);
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
            medicalInfo={{
              id: 'med-001',
              motherProfileId: patient.motherProfile.id,
              bloodType: 'O+',
              allergies: 'Penicillin',
              existingConditions: 'Gestational diabetes',
              currentMedications: 'Iron supplement'
            }}
            emergencyContacts={[
              {
                id: 'em-001',
                motherProfileId: patient.motherProfile.id,
                name: 'Husband Name',
                phone: '+855-97-123-4567',
                relation: 'Spouse',
                isPrimary: true
              }
            ]}
            records={records}
            appointments={appointments}
            onBack={() => setDoctorView('dashboard')}
            onViewRecords={() => setDoctorView('patient-records')}
            lang={lang}
          />
        </div>
      );
    }

    // Doctor Records View
    if (doctorView === 'patient-records' && selectedPatientId) {
      const patient = mockPatients.find(p => p.motherProfile.id === selectedPatientId);
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
            records={records}
            onBack={() => setDoctorView('patient-detail')}
            onAddClinicalNote={(recordId, note) => {
              console.log(`Clinical note added to ${recordId}: ${note}`);
              // TODO: Call API to save clinical note
            }}
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
      />

      {/* Add Logout button to header — TODO: integrate into Header component */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-full text-xs font-black bg-[#FDDEEC] hover:bg-[#F4A6B5] text-[#FA6B90] transition-all cursor-pointer border border-[#FA6B90] shadow-3xs flex items-center space-x-1"
        >
          <LogOut className="w-3 h-3" />
          <span>{lang === 'en' ? 'Logout' : 'ចាកចេញ'}</span>
        </button>
      </div>

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
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
            onOpenScanRecord={() => setIsScanModalOpen(true)}
            lang={lang}
            selectedRecordId={selectedRecordId}
          />
        )}

        {/* TAB 3: ❁ CALENDAR (CHECKUP REMINDERS) */}
        {activeTab === 'calendar' && (
          <AppointmentsView
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onToggleComplete={handleToggleAppointmentComplete}
            onDeleteAppointment={handleDeleteAppointment}
            lang={lang}
          />
        )}

        {/* TAB 4: ⚘ PASSPORT (UNIFIED PROFILE & MATERNAL PASSPORT) */}
        {activeTab === 'passport' && (
          <PassportView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onOpenSummaryReport={() => setShowJourneyReport(true)}
            lang={lang}
            calculatedWeeks={pregnancyMetrics.weeks}
            calculatedTrimester={pregnancyMetrics.trimester}
          />
        )}
      </main>

      {/* 3. PERSISTENT 4-TAB NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#FEFAFB]/95 backdrop-blur-md border-t-2 border-[#AEE3D8] z-40 py-2 shadow-xs">
        <div className="max-w-md mx-auto grid grid-cols-4 text-center">

          {/* Home Tab */}
          <button
            onClick={() => {
              setSelectedRecordId(null);
              setActiveTab('home');
            }}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
              activeTab === 'home' ? 'text-[#2F6F8F]' : 'text-[#CFADB9] hover:text-[#2F6F8F]'
            }`}
            style={{ minHeight: '48px' }}
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
    </div>
  );
}
