/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Home, FileText, Calendar, User, Plus, Camera, Flower2 } from 'lucide-react';

// Data and Types
import { PassportProfile, MedicalRecord, Appointment } from './types';
import {
  DEFAULT_PROFILE,
  DEFAULT_RECORDS,
  DEFAULT_APPOINTMENTS,
  TRANSLATIONS
} from './data';

// Components
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateUserId(): string {
  const stored = localStorage.getItem('flowers_user_id');
  if (stored) return stored;
  const id = 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  localStorage.setItem('flowers_user_id', id);
  return id;
}

const USER_ID = generateUserId();

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

  // Authentication & Setup States (still in localStorage — device flags)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('flowers_is_logged_in') === 'true';
  });

  const [hasCompletedSetup, setHasCompletedSetup] = useState<boolean>(() => {
    return localStorage.getItem('flowers_pregnancy_setup_completed') === 'true';
  });

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
    if (!isLoggedIn) return;

    async function loadFromDB() {
      const [dbProfile, dbRecords, dbAppointments] = await Promise.all([
        apiGet<PassportProfile>(`/api/profile/${USER_ID}`),
        apiGet<MedicalRecord[]>(`/api/records/${USER_ID}`),
        apiGet<Appointment[]>(`/api/appointments/${USER_ID}`),
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
  }, [isLoggedIn]);

  // ─── Sync profile to MySQL + localStorage ─────────────────────────────────

  useEffect(() => {
    if (!dataLoaded || !isLoggedIn) return;
    localStorage.setItem('flowers_maternal_profile', JSON.stringify(profile));
    apiPut(`/api/profile/${USER_ID}`, profile);
  }, [profile, dataLoaded, isLoggedIn]);

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
    await apiPost('/api/records', { ...newRecord, userId: USER_ID });
  }, []);

  const handleDeleteRecord = useCallback(async (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    await apiDelete(`/api/records/${id}`);
  }, []);

  const handleAddAppointment = useCallback(async (newAppt: Appointment) => {
    setAppointments(prev => [...prev, newAppt]);
    await apiPost('/api/appointments', { ...newAppt, userId: USER_ID });
  }, []);

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

  const handleLoginSuccess = (motherName: string) => {
    setProfile(prev => ({
      ...prev,
      personal: { ...prev.personal, name: motherName }
    }));
    setIsLoggedIn(true);
    localStorage.setItem('flowers_is_logged_in', 'true');
    // Persist the updated profile to both localStorage and MySQL
    const updated = {
      ...profile,
      personal: { ...profile.personal, name: motherName }
    };
    localStorage.setItem('flowers_maternal_profile', JSON.stringify(updated));
    apiPut(`/api/profile/${USER_ID}`, updated).catch(() => {});
  };

  const handleSetupComplete = useCallback((setupData: {
    weeks: number;
    height: number;
    weight: number;
    gravida: number;
    para: number;
    bloodType: string;
  }) => {
    const today = new Date();
    const daysRemaining = (40 - setupData.weeks) * 7;
    const eddDate = new Date(today.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
    const eddString = eddDate.toISOString().split('T')[0];

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
    apiPut(`/api/profile/${USER_ID}`, updated).catch(() => {});
    setHasCompletedSetup(true);
    localStorage.setItem('flowers_pregnancy_setup_completed', 'true');
  }, [profile]);

  const t = TRANSLATIONS[lang];

  // Auth gates
  if (!isLoggedIn) {
    return (
      <LoginView
        lang={lang}
        setLang={setLang}
        onLoginSuccess={handleLoginSuccess}
      />
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

  return (
    <div className={`min-h-screen bg-[#FEFAFB] flex flex-col font-sans ${lang === 'kh' ? 'lang-kh' : ''}`} id="app-root-container">
      {/* 1. PERSISTENT HEADER WITH FLOWER BRANDING & SOS */}
      <Header
        lang={lang}
        setLang={setLang}
        onOpenEmergency={() => setEmergencyOpen(true)}
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
