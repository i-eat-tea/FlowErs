/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Doctor Patient Detail View
 * Shows mother's profile, pregnancy progress, and shared records summary
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Heart,
  Flower2,
  FileText,
  Scale,
  Ruler,
  AlertCircle,
  Phone,
  Share2,
  Download,
  Clock
} from 'lucide-react';
import { MotherProfile, PregnancyProfile, MotherMedicalInfo, EmergencyContact, MedicalRecord, Appointment } from '../types';
import { getFlowerForWeek } from '../data';

interface DoctorPatientDetailProps {
  motherProfile: MotherProfile;
  pregnancyProfile: PregnancyProfile;
  medicalInfo: MotherMedicalInfo;
  emergencyContacts: EmergencyContact[];
  records: MedicalRecord[];
  appointments: Appointment[];
  onBack: () => void;
  onViewRecords: () => void;
  lang: 'en' | 'kh';
}

export default function DoctorPatientDetail({
  motherProfile,
  pregnancyProfile,
  medicalInfo,
  emergencyContacts,
  records,
  appointments,
  onBack,
  onViewRecords,
  lang
}: DoctorPatientDetailProps) {
  const [expandedSection, setExpandedSection] = useState<'overview' | 'medical' | 'emergency'>('overview');

  const wording = {
    en: {
      back: 'Back to Patients',
      overview: 'Pregnancy Overview',
      medicalHistory: 'Medical History',
      emergencyInfo: 'Emergency Information',
      gestationalAge: 'Gestational Age',
      week: 'Week',
      trimester: 'Trimester',
      daysRemaining: 'Days to EDD',
      babyGrowth: 'Baby Growth Stage',
      height: 'Height',
      weight: 'Weight',
      bloodType: 'Blood Type',
      allergies: 'Allergies',
      conditions: 'Medical Conditions',
      medications: 'Current Medications',
      emergencyContact: 'Primary Contact',
      phone: 'Phone',
      relation: 'Relation',
      totalRecords: 'Total Records',
      upcomingAppts: 'Upcoming Appointments',
      lastVisit: 'Last Visit',
      noAppts: 'No upcoming appointments',
      viewAllRecords: 'View All Records',
      shareRecords: 'Share Report',
      downloadSummary: 'Download Summary',
      cm: 'cm',
      kg: 'kg'
    },
    kh: {
      back: 'ត្រឡប់ទៅបញ្ជីអ្នកជម្ងឺ',
      overview: 'ទិដ្ឋភាពផ្ទៃពោះ',
      medicalHistory: 'ប្រវត្តិវេជ្ជសាស្ត្រ',
      emergencyInfo: 'ព័ត៌មានសង្គ្រោះបន្ទាន់',
      gestationalAge: 'អាយុគភ៌',
      week: 'សប្តាហ៍',
      trimester: 'ត្រីមាស',
      daysRemaining: 'ថ្ងៃដល់ថ្ងៃសម្រាល',
      babyGrowth: 'ដំណាក់កាលលូតលាស់របស់កូន',
      height: 'កម្ពស់',
      weight: 'ទម្ងន់',
      bloodType: 'ក្រុមឈាម',
      allergies: 'អាឡែកស៊ី',
      conditions: 'ជំងឺប្រចាំកាយ',
      medications: 'ថ្នាំកំពុងប្រើ',
      emergencyContact: 'ទំនាក់ទំនងសង្គ្រោះបន្ទាន់',
      phone: 'ទូរស័ព្ទ',
      relation: 'ទាក់ទងត្រូវបាន',
      totalRecords: 'កំណត់ត្រាសរុប',
      upcomingAppts: 'ការណាត់ជួបខាងមុខ',
      lastVisit: 'ការមកពិនិត្យចុងក្រោយ',
      noAppts: 'មិនទាន់មានការណាត់ជួបខាងមុខ',
      viewAllRecords: 'មើលកំណត់ត្រាទាំងអស់',
      shareRecords: 'ចែករំលែករបាយការណ៍',
      downloadSummary: 'ទាញយករបាយការណ៍',
      cm: 'សង់ទីម៉ែត្រ',
      kg: 'គីឡូក្រាម'
    }
  };

  const t = wording[lang];

  // Calculate days remaining to EDD
  const daysRemaining = Math.ceil(
    (new Date(pregnancyProfile.edd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const flowerStage = getFlowerForWeek(pregnancyProfile.currentWeek);
  const derivedTrimester = pregnancyProfile.trimester || (pregnancyProfile.currentWeek <= 12 ? 1 : pregnancyProfile.currentWeek <= 27 ? 2 : 3);
  const primaryContact = emergencyContacts.find(c => c.isPrimary) || emergencyContacts[0];
  const upcomingAppt = appointments.find(a => !a.completed);

  return (
    <div className={`min-h-screen bg-[#FEFAFB] px-4 py-6 font-sans ${lang === 'kh' ? 'lang-kh' : ''}`} id="doctor-patient-detail">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl hover:bg-[#FDDEEC]/50 text-[#2F6F8F] font-bold text-xs transition-colors cursor-pointer"
            id="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>

          <div className="flex items-center space-x-1.5">
            <button
              className="px-3 py-2 rounded-xl bg-[#AEE3D8]/30 hover:bg-[#AEE3D8]/60 text-[#2F6F8F] border border-[#AEE3D8] font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
              id="download-summary-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadSummary}</span>
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-[#FA6B90]/20 hover:bg-[#FA6B90]/40 text-[#FA6B90] border border-[#FA6B90] font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
              id="share-records-btn"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.shareRecords}</span>
            </button>
          </div>
        </div>

        {/* Patient Info Header */}
        <div className="bg-white rounded-2xl border border-[#FDDEEC] p-6 shadow-3xs">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-[#2F6F8F] font-heading">
                {motherProfile.fullName}
              </h1>
              <p className="text-xs text-[#2F6F8F]/70 font-semibold mt-1">
                {lang === 'en' ? 'Mother ID:' : 'លេខសម្គាល់មាតា:'} {motherProfile.id.slice(0, 8)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-[#2F6F8F] font-mono">
                {pregnancyProfile.currentWeek}
              </div>
              <p className="text-[10px] font-black text-[#FA6B90] uppercase tracking-widest">
                {t.week}
              </p>
            </div>
          </div>
        </div>

        {/* Pregnancy Overview Section */}
        <div className="bg-white rounded-2xl border border-[#FDDEEC] p-6 shadow-3xs space-y-4">
          <h2 className="text-base font-black text-[#2F6F8F] flex items-center space-x-2">
            <Flower2 className="w-5 h-5 text-[#FA6B90]" />
            <span>{t.overview}</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Trimester */}
            <div className="bg-[#FDDEEC]/20 rounded-xl p-3 border border-[#FDDEEC]">
              <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wide">
                {t.trimester}
              </p>
              <p className="text-lg font-black text-[#FA6B90] mt-1">
                {derivedTrimester} {lang === 'en' ? 'T' : 'ត'}
              </p>
            </div>

            {/* Days to EDD */}
            <div className="bg-[#AEE3D8]/20 rounded-xl p-3 border border-[#AEE3D8]">
              <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wide">
                {t.daysRemaining}
              </p>
              <p className="text-lg font-black text-[#2F6F8F] mt-1">
                {daysRemaining > 0 ? daysRemaining : 0} {lang === 'en' ? 'days' : 'ថ្ងៃ'}
              </p>
            </div>
          </div>

          {/* Baby Growth Stage */}
          <div className="bg-[#FFF7E9] rounded-xl p-4 border border-[#F6E5C3] space-y-2">
            <p className="text-xs font-black text-[#2F6F8F] uppercase tracking-wide">
              {t.babyGrowth}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-3xl">{flowerStage.symbol}</span>
              <div>
                <p className="text-sm font-black text-[#2F6F8F]">
                  {lang === 'en' ? flowerStage.stageNameEn : flowerStage.stageNameKh}
                </p>
                <p className="text-xs text-[#2F6F8F]/75 font-medium">
                  {lang === 'en' ? flowerStage.babyLength : flowerStage.babyLength} • {lang === 'en' ? flowerStage.babyWeight : flowerStage.babyWeight}
                </p>
              </div>
            </div>
          </div>

          {/* G/P Status */}
          <div className="bg-white rounded-xl p-3 border border-[#FDDEEC] grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase">Gravida</p>
              <p className="text-lg font-black text-[#2F6F8F] font-mono mt-1">
                {pregnancyProfile.gravida}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase">Para</p>
              <p className="text-lg font-black text-[#2F6F8F] font-mono mt-1">
                {pregnancyProfile.para}
              </p>
            </div>
          </div>
        </div>

        {/* Medical History Section */}
        <div className="bg-white rounded-2xl border border-[#FDDEEC] p-6 shadow-3xs space-y-4">
          <h2 className="text-base font-black text-[#2F6F8F] flex items-center space-x-2">
            <Heart className="w-5 h-5 text-[#FA6B90]" />
            <span>{t.medicalHistory}</span>
          </h2>

          <div className="space-y-3">
            {/* Vitals */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#FEFAFB] rounded-xl p-3 border border-[#FDDEEC]">
                <div className="flex items-center space-x-1 mb-1">
                  <Ruler className="w-3.5 h-3.5 text-[#2F6F8F]" />
                  <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase">
                    {t.height}
                  </p>
                </div>
                <p className="text-base font-black text-[#2F6F8F] font-mono">
                  {motherProfile.heightCm || '—'} {t.cm}
                </p>
              </div>

              <div className="bg-[#FEFAFB] rounded-xl p-3 border border-[#FDDEEC]">
                <div className="flex items-center space-x-1 mb-1">
                  <Scale className="w-3.5 h-3.5 text-[#2F6F8F]" />
                  <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase">
                    {t.weight}
                  </p>
                </div>
                <p className="text-base font-black text-[#2F6F8F] font-mono">
                  {motherProfile.weightKg || '—'} {t.kg}
                </p>
              </div>
            </div>

            {/* Blood Type */}
            <div className="bg-[#FDDEEC]/20 rounded-xl p-3 border border-[#FDDEEC]">
              <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wide">
                {t.bloodType}
              </p>
              <p className="text-lg font-black text-[#FA6B90] font-mono mt-1">
                {medicalInfo.bloodType || 'Unknown'}
              </p>
            </div>

            {/* Allergies */}
            {medicalInfo.allergies && (
              <div className="bg-[#FDDEEC] rounded-xl p-3 border border-[#F4A6B5]">
                <div className="flex items-center space-x-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#FA6B90]" />
                  <p className="text-[10px] font-black text-[#FA6B90] uppercase tracking-wide">
                    {t.allergies}
                  </p>
                </div>
                <p className="text-xs text-[#FA6B90] font-semibold">
                  {medicalInfo.allergies}
                </p>
              </div>
            )}

            {/* Medical Conditions */}
            {medicalInfo.existingConditions && (
              <div className="bg-[#FFF7E9] rounded-xl p-3 border border-[#F6E5C3]">
                <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wide mb-1">
                  {t.conditions}
                </p>
                <p className="text-xs text-[#2F6F8F] font-semibold">
                  {medicalInfo.existingConditions}
                </p>
              </div>
            )}

            {/* Current Medications */}
            {medicalInfo.currentMedications && (
              <div className="bg-[#FEFAFB] rounded-xl p-3 border border-[#FDDEEC]">
                <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wide mb-1">
                  {t.medications}
                </p>
                <p className="text-xs text-[#2F6F8F] font-mono">
                  {medicalInfo.currentMedications}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact Section */}
        {primaryContact && (
          <div className="bg-white rounded-2xl border border-[#FDDEEC] p-6 shadow-3xs space-y-3">
            <h2 className="text-base font-black text-[#2F6F8F] flex items-center space-x-2">
              <Phone className="w-5 h-5 text-[#FA6B90]" />
              <span>{t.emergencyInfo}</span>
            </h2>

            <div className="bg-[#FDDEEC]/20 rounded-xl p-4 border border-[#FDDEEC] space-y-2">
              <p className="text-xs font-black text-[#2F6F8F]/70 uppercase tracking-wide">
                {t.emergencyContact}
              </p>
              <p className="text-sm font-black text-[#2F6F8F]">
                {primaryContact.name}
              </p>
              <p className="text-xs text-[#2F6F8F]/75 font-semibold">
                {t.relation}: {primaryContact.relation}
              </p>
              <a
                href={`tel:${primaryContact.phone}`}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 mt-2 rounded-xl bg-[#AEE3D8] hover:bg-[#96D6C9] text-[#2F6F8F] border border-[#7ECBBF] font-bold text-xs transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>{primaryContact.phone}</span>
              </a>
            </div>
          </div>
        )}

        {/* Records Summary */}
        <div className="bg-white rounded-2xl border border-[#FDDEEC] p-6 shadow-3xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#2F6F8F] flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#FA6B90]" />
              <span>{t.totalRecords}: {records.length}</span>
            </h2>
            <button
              onClick={onViewRecords}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] text-white font-black text-xs transition-all cursor-pointer shadow-3xs"
              id="view-records-btn"
            >
              {t.viewAllRecords}
            </button>
          </div>

          {/* Upcoming Appointments */}
          {upcomingAppt ? (
            <div className="bg-[#AEE3D8]/20 rounded-xl p-3 border border-[#AEE3D8]">
              <div className="flex items-center space-x-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#2F6F8F]" />
                <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase">
                  {t.upcomingAppts}
                </p>
              </div>
              <p className="text-xs font-semibold text-[#2F6F8F]">
                {upcomingAppt.date || upcomingAppt.apptDate} { (upcomingAppt.time || upcomingAppt.apptTime) ? `@ ${upcomingAppt.time || upcomingAppt.apptTime}` : ''}
              </p>
              <p className="text-[10px] text-[#2F6F8F]/75 font-medium">
                {upcomingAppt.hospital} {upcomingAppt.doctor && `• Dr. ${upcomingAppt.doctor}`}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#2F6F8F]/70 font-medium bg-[#FEFAFB] rounded-xl p-3 border border-[#FDDEEC]">
              {t.noAppts}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
