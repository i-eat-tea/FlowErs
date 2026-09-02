/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Calendar, FileText, Plus, Camera, ArrowRight, ShieldAlert, 
  CheckCircle2, AlertCircle, Clock, MapPin, Eye,
  Flower2, ChevronRight, UploadCloud, Heart
} from 'lucide-react';
import { PassportProfile, MedicalRecord, Appointment } from '../types';
import { TRANSLATIONS, getFlowerForWeek } from '../data';
import GrowingFlowerIllustration from './GrowingFlowerIllustration';

interface HomeViewProps {
  profile: PassportProfile;
  records: MedicalRecord[];
  appointments: Appointment[];
  lang: 'en' | 'kh';
  onNavigateToTab: (tabId: string) => void;
  onOpenEmergency: () => void;
  onOpenScanRecord: () => void;
  onSelectRecord?: (record: MedicalRecord) => void;
  calculatedWeeks: number;
  calculatedTrimester: number;
  daysRemaining: number;
}

export default function HomeView({
  profile,
  records,
  appointments,
  lang,
  onNavigateToTab,
  onOpenEmergency,
  onOpenScanRecord,
  onSelectRecord,
  calculatedWeeks,
  calculatedTrimester,
  daysRemaining
}: HomeViewProps) {
  const t = TRANSLATIONS[lang];

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return t.goodMorning;
    if (hours < 18) return t.goodAfternoon;
    return t.goodEvening;
  }, [t]);

  // Flower Growth Stage for the current gestational week
  const flowerStage = useMemo(() => {
    return getFlowerForWeek(calculatedWeeks);
  }, [calculatedWeeks]);

  // Next upcoming appointment
  const nextAppointment = useMemo(() => {
    const upcoming = appointments
      .filter(a => !a.completed)
      .map(a => ({
        ...a,
        date: (a.date || a.apptDate || '').split('T')[0],
        time: (a.time || a.apptTime || '00:00').slice(0, 5),
      }))
      .filter(a => a.date)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [appointments]);

  // Most recent 3 uploaded medical records
  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [records]);

  // Category Icon helper
  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'ultrasound': return '🩺';
      case 'lab_test': return '🧪';
      case 'prescription': return '💊';
      case 'vaccine': return '💉';
      case 'doctor_note': return '📝';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200" id="home-view-container">
      
      {/* 1. WELCOME HEADER */}
      <div className="bg-white -mx-4 px-4 py-4 border-b-2 border-[#AEE3D8] mb-0.5 rounded-b-2xl shadow-3xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#2F6F8F] font-heading">
              {greeting}, <span className="text-[#FA6B90]">{profile.personal.name || 'Mother'}</span> 🌸
            </h2>
            <p className="text-xs text-[#2F6F8F]/75 font-semibold mt-0.5">
              {lang === 'en' 
                ? `Week ${calculatedWeeks} of your pregnancy journey` 
                : `សប្តាហ៍ទី ${calculatedWeeks} នៃដំណើរមានផ្ទៃពោះរបស់អ្នក`}
            </p>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-[#AEE3D8]/30 border border-[#AEE3D8] flex items-center justify-center p-1 shadow-3xs shrink-0 overflow-hidden">
            <GrowingFlowerIllustration week={calculatedWeeks} stage={flowerStage.stageKey} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* 2. MAIN PREGNANCY PROGRESS CARD WITH FLOWER THEME (MINT BACKGROUND WITH DEEP BLUE TEXT) */}
      <div className="bg-gradient-to-br from-[#AEE3D8] via-[#BCECE3] to-[#9CDFD2] rounded-[28px] p-5.5 text-[#2F6F8F] relative overflow-hidden shadow-sm border-2 border-[#7ECBBF]">
        {/* Soft background floral glow */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-[#FA6B90]/15 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-32 h-32 bg-white/40 rounded-full blur-lg pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-black tracking-widest text-[#2F6F8F]">
              {lang === 'en' 
                ? `${calculatedTrimester === 1 ? 'First' : calculatedTrimester === 2 ? 'Second' : 'Third'} Trimester` 
                : `${t.trimester} ទី${calculatedTrimester}`}
            </span>
            <h3 className="text-4xl sm:text-5xl font-black tracking-tight leading-none font-heading text-[#2F6F8F]">
              {lang === 'en' ? `Week ${calculatedWeeks}` : `សប្តាហ៍ ${calculatedWeeks}`}
            </h3>
          </div>

          {/* Delivery Countdown Circle */}
          <div className="flex flex-col items-center justify-center border-2 border-[#2F6F8F]/30 rounded-full w-22 h-22 bg-white/80 backdrop-blur-3xs text-center shrink-0 shadow-xs">
            <span className="text-[8.5px] uppercase font-black tracking-wider leading-none text-[#2F6F8F]">
              {lang === 'en' ? 'Days left' : 'នៅសល់'}
            </span>
            <span className="text-2xl font-black my-0.5 leading-none text-[#2F6F8F] font-heading">
              {daysRemaining}
            </span>
            <span className="text-[8.5px] uppercase font-black tracking-wider leading-none text-[#2F6F8F]">
              {lang === 'en' ? 'to birth' : 'ថ្ងៃសម្រាល'}
            </span>
          </div>
        </div>

        {/* Progress Bar (Mint & Rose Health Element) */}
        <div className="mt-5 space-y-1.5 relative z-10">
          <div className="h-2.5 w-full bg-white/70 rounded-full overflow-hidden p-0.5 border border-[#7ECBBF]">
            <div 
              className="h-full bg-gradient-to-r from-[#2F6F8F] via-[#357B9E] to-[#FA6B90] rounded-full transition-all duration-500 shadow-2xs" 
              style={{ width: `${Math.min((calculatedWeeks / 40) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9.5px] text-[#2F6F8F] font-black font-mono">
            <span>{t.conception}</span>
            <span>{t.week40} (EDD: {profile.pregnancy.edd})</span>
          </div>
        </div>

        {/* 🌸 FLOWER GROWTH STAGE CARD (REPLACING FRUIT COMPARISON) */}
        <div className="mt-4 flex items-center space-x-3 bg-white/85 backdrop-blur-md rounded-2xl p-3.5 border border-[#7ECBBF] relative z-10 shadow-3xs">
          <div className="w-11 h-11 rounded-xl bg-[#AEE3D8]/40 border border-[#7ECBBF] flex items-center justify-center p-1 shadow-2xs shrink-0 overflow-hidden">
            <GrowingFlowerIllustration week={calculatedWeeks} stage={flowerStage.stageKey} className="w-full h-full" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <Flower2 className="w-3.5 h-3.5 text-[#2F6F8F]" />
              <span className="text-[9.5px] text-[#2F6F8F] font-black uppercase tracking-wider block">
                {t.babyGrowthStage}
              </span>
            </div>
            <span className="text-sm font-black block truncate leading-tight text-[#2F6F8F] font-heading">
              {lang === 'en' ? flowerStage.stageNameEn : flowerStage.stageNameKh} ({lang === 'en' ? flowerStage.flowerEn : flowerStage.flowerKh})
            </span>
            <p className="text-[10px] text-[#2F6F8F]/85 line-clamp-1 mt-0.5 font-medium">
              {lang === 'en' ? flowerStage.growthDescriptionEn : flowerStage.growthDescriptionKh}
            </p>
            <div className="text-[9px] text-[#2F6F8F] font-mono font-bold mt-1">
              📏 {flowerStage.babyLength} • ⚖️ {flowerStage.babyWeight}
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY CORE ACTION: ＋ SCAN / UPLOAD MEDICAL RECORD (BRIGHT ROSE CTA) */}
      <div 
        onClick={onOpenScanRecord}
        className="bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] rounded-2xl p-4.5 text-white flex items-center justify-between cursor-pointer transition-all shadow-md active:scale-[0.99] border border-[#FA6B90]/50"
        id="btn-primary-scan-record"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FFF7E9] text-[#2F6F8F] flex items-center justify-center shadow-3xs shrink-0">
            <Camera className="w-5 h-5 text-[#2F6F8F]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-black tracking-tight text-white font-heading">
                {t.scanUploadCTA}
              </span>
              <span className="bg-[#FFF7E9] text-[#2F6F8F] text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded font-mono shadow-3xs">
                Vault
              </span>
            </div>
            <p className="text-[10.5px] text-white/90 font-semibold mt-0.5 line-clamp-1">
              {t.scanUploadDesc}
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-white shrink-0">
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* 4. QUICK OVERVIEW STATS (RECORDS COUNT + NEXT APPOINTMENT) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Records Vault Tile */}
        <div 
          onClick={() => onNavigateToTab('records')}
          className="bg-white hover:bg-[#FFF7E9]/50 border border-[#FDDEEC] rounded-2xl p-4 flex flex-col justify-between h-34 cursor-pointer transition-all shadow-3xs hover:border-[#F4A6B5]"
          id="tile-vault-overview"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#FDDEEC] flex items-center justify-center text-[#FA6B90]">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[9px] text-[#FA6B90] bg-[#FDDEEC] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
              {lang === 'en' ? 'Vault' : 'ឃ្លាំង'}
            </span>
          </div>
          <div>
            <span className="text-2xl font-black text-[#2F6F8F] block leading-none font-heading">
              {records.length}
            </span>
            <span className="text-[10px] font-bold text-[#2F6F8F]/75 block mt-1">
              {t.totalRecords}
            </span>
          </div>
        </div>

        {/* Next Calendar Appointment Tile */}
        <div 
          onClick={() => onNavigateToTab('calendar')}
          className="bg-white hover:bg-[#FFF7E9]/50 border border-[#FDDEEC] rounded-2xl p-4 flex flex-col justify-between h-34 cursor-pointer transition-all shadow-3xs hover:border-[#F4A6B5]"
          id="tile-calendar-overview"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#AEE3D8]/30 flex items-center justify-center text-[#2F6F8F] border border-[#AEE3D8]">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[9px] text-[#2F6F8F] bg-[#AEE3D8] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
              {lang === 'en' ? 'Calendar' : 'ប្រតិទិន'}
            </span>
          </div>
          <div>
            {nextAppointment ? (
              <>
                <span className="text-xs font-black text-[#2F6F8F] block truncate leading-tight font-heading">
                  {nextAppointment.date}
                </span>
                <span className="text-[10px] text-[#2F6F8F]/75 font-bold block truncate mt-0.5">
                  {nextAppointment.hospital.split('(')[0]}
                </span>
              </>
            ) : (
              <span className="text-xs text-[#CFADB9] font-bold block italic">
                {t.noUpcomingAppt}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. RECENT MEDICAL RECORDS IN VAULT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-[#2F6F8F]" />
            <h3 className="text-sm font-black text-[#2F6F8F] font-heading">
              {t.recentRecords}
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('records')}
            className="text-[11px] font-black text-[#FA6B90] hover:text-[#2F6F8F] flex items-center space-x-0.5 cursor-pointer transition-colors"
          >
            <span>{t.viewAllRecords}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#F4A6B5] p-6 text-center space-y-2">
            <p className="text-xs text-[#2F6F8F]/80 font-bold">
              {lang === 'en' ? 'No digitized records yet. Tap below to scan your first report!' : 'មិនទាន់មានឯកសារនៅឡើយទេ។ ចុចខាងក្រោមដើម្បីស្កេន!'}
            </p>
            <button
              onClick={onOpenScanRecord}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#FA6B90] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-3xs hover:bg-[#f05e84] transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t.uploadRecordBtn}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentRecords.map(record => (
              <div
                key={record.id}
                onClick={() => {
                  if (onSelectRecord) onSelectRecord(record);
                  onNavigateToTab('records');
                }}
                className="bg-white border border-[#FDDEEC] hover:border-[#F4A6B5] rounded-2xl p-3.5 transition-all cursor-pointer shadow-3xs hover:shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7E9] flex items-center justify-center text-lg shrink-0 border border-[#F6E5C3]">
                    {getCategoryEmoji(record.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] font-mono font-bold text-[#2F6F8F]/70">
                        {record.date}
                      </span>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-[#FDDEEC] text-[#FA6B90]">
                        Wk {record.week}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-[#2F6F8F] truncate mt-0.5 font-heading">
                      {record.title}
                    </h4>
                    <p className="text-[10px] text-[#2F6F8F]/75 font-semibold truncate">
                      {record.facility} • {record.doctor}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                  {record.imageAttachment && (
                    <span className="p-1 rounded-md bg-[#FDDEEC] text-[#FA6B90]" title="Has Scanned Document">
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#CFADB9]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. EMERGENCY SOS CARD (COMPACT & RELIABLE) */}
      <div 
        onClick={onOpenEmergency}
        className="bg-[#FDDEEC] border border-[#F4A6B5] rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-[#FEC7DF] active:scale-[0.99] shadow-3xs"
        id="home-emergency-card-btn"
      >
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-[#FA6B90] rounded-full animate-pulse shrink-0" />
          <div>
            <h4 className="text-xs font-black text-[#FA6B90] uppercase tracking-wider leading-none mb-1 font-heading">
              {t.emergencyCard}
            </h4>
            <p className="text-[11px] text-[#2F6F8F] font-bold leading-none">
              {t.emergencyTap}
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-[#FA6B90]" />
      </div>

      {/* 7. MEDICAL DISCLAIMER BAR */}
      <div className="bg-[#AEE3D8]/20 rounded-2xl p-3.5 border border-[#AEE3D8] space-y-1">
        <div className="flex items-center space-x-1 text-[#2F6F8F] font-black text-[9px] uppercase tracking-wider">
          <AlertCircle className="w-3.5 h-3.5 text-[#2F6F8F]" />
          <span>{t.disclaimerTitle}</span>
        </div>
        <p className="text-[10.5px] text-[#2F6F8F]/85 leading-normal font-medium">
          {t.disclaimerContent}
        </p>
      </div>

    </div>
  );
}
