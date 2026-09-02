/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Doctor Dashboard — Patient List View
 * Shows all mothers who have granted record-sharing permissions to this doctor
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Calendar,
  FileText,
  ChevronRight,
  Stethoscope,
  Activity,
  Clock,
  Flower2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { MotherProfile, PregnancyProfile, SharingPermission } from '../types';

interface PatientSummary {
  motherProfile: MotherProfile;
  pregnancyProfile: PregnancyProfile;
  sharingPermission: SharingPermission;
  recordCount: number;
  lastRecordDate?: string;
  nextAppointmentDate?: string;
}

interface DoctorDashboardProps {
  doctorId: string;
  doctorName: string;
  patients: PatientSummary[];
  onSelectPatient: (motherProfileId: string) => void;
  lang: 'en' | 'kh';
}

export default function DoctorDashboard({
  doctorId,
  doctorName,
  patients,
  onSelectPatient,
  lang
}: DoctorDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrimester, setFilterTrimester] = useState<'all' | 1 | 2 | 3>('all');

  const wording = {
    en: {
      title: 'My Patients',
      subtitle: 'Mothers who shared records with you',
      search: 'Search by name or ID...',
      filterAll: 'All Trimesters',
      filterT1: 'Trimester 1',
      filterT2: 'Trimester 2',
      filterT3: 'Trimester 3',
      stats: 'Clinical Overview',
      totalPatients: 'Total Patients',
      highRisk: 'High Risk',
      upcomingAppts: 'Upcoming',
      noPatients: 'No patients found',
      noPatientsDesc: 'Patients will appear here once they grant you sharing permissions.',
      week: 'Week',
      trimester: 'Trimester',
      records: 'Records',
      lastVisit: 'Last visit',
      nextAppt: 'Next appt',
      viewDetails: 'View Details',
      granted: 'Access granted',
      expires: 'Expires'
    },
    kh: {
      title: 'អ្នកជម្ងឺរបស់ខ្ញុំ',
      subtitle: 'មាតាដែលបានចែករំលែកកំណត់ត្រាជាមួយអ្នក',
      search: 'ស្វែងរកតាមឈ្មោះ ឬលេខសម្គាល់...',
      filterAll: 'គ្រប់ត្រីមាស',
      filterT1: 'ត្រីមាសទី១',
      filterT2: 'ត្រីមាសទី២',
      filterT3: 'ត្រីមាសទី៣',
      stats: 'ទិដ្ឋភាពទូទៅ',
      totalPatients: 'អ្នកជម្ងឺសរុប',
      highRisk: 'ហានិភ័យខ្ពស់',
      upcomingAppts: 'ខាងមុខ',
      noPatients: 'មិនមានអ្នកជម្ងឺ',
      noPatientsDesc: 'អ្នកជម្ងឺនឹងបង្ហាញនៅទីនេះនៅពេលពួកគេផ្តល់សិទ្ធិចែករំលែក។',
      week: 'សប្តាហ៍',
      trimester: 'ត្រីមាស',
      records: 'កំណត់ត្រា',
      lastVisit: 'ការមកពិនិត្យចុងក្រោយ',
      nextAppt: 'ការណាត់ជួបបន្ទាប់',
      viewDetails: 'មើលលម្អិត',
      granted: 'បានអនុញ្ញាត',
      expires: 'ផុតកំណត់'
    }
  };

  const t = wording[lang];

  // Filter and search patients
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      // Trimester filter
      if (filterTrimester !== 'all' && p.pregnancyProfile.trimester !== filterTrimester) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.motherProfile.fullName.toLowerCase().includes(q);
        const matchId = p.motherProfile.id.toLowerCase().includes(q);
        return matchName || matchId;
      }
      return true;
    });
  }, [patients, filterTrimester, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = patients.length;
    const highRisk = patients.filter(p => p.pregnancyProfile.trimester === 3).length; // Simplified: T3 = high priority
    const upcomingAppts = patients.filter(p => p.nextAppointmentDate).length;
    return { total, highRisk, upcomingAppts };
  }, [patients]);

  return (
    <div
      className={`min-h-screen bg-[#FEFAFB] px-4 py-6 font-sans ${lang === 'kh' ? 'lang-kh' : ''}`}
      id="doctor-dashboard"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#2F6F8F] tracking-tight font-heading flex items-center space-x-2">
              <Stethoscope className="w-6 h-6 text-[#FA6B90]" />
              <span>{t.title}</span>
            </h1>
            <p className="text-xs text-[#2F6F8F]/75 font-semibold mt-1">
              {t.subtitle}
            </p>
            <p className="text-[10px] text-[#2F6F8F]/60 font-bold mt-0.5">
              Dr. {doctorName}
            </p>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#AEE3D8]/30 rounded-full border border-[#AEE3D8]">
            <Activity className="w-3.5 h-3.5 text-[#2F6F8F]" />
            <span className="text-xs font-black text-[#2F6F8F]">
              {lang === 'en' ? 'Live' : 'ផ្ទាល់'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-[#FDDEEC] p-4 shadow-3xs">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-4 h-4 text-[#2F6F8F]" />
              <span className="text-2xl font-black text-[#2F6F8F] font-mono">{stats.total}</span>
            </div>
            <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wide">
              {t.totalPatients}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#FDDEEC] p-4 shadow-3xs">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-4 h-4 text-[#FA6B90]" />
              <span className="text-2xl font-black text-[#FA6B90] font-mono">{stats.highRisk}</span>
            </div>
            <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wide">
              {t.highRisk}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#FDDEEC] p-4 shadow-3xs">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-4 h-4 text-[#2F6F8F]" />
              <span className="text-2xl font-black text-[#2F6F8F] font-mono">{stats.upcomingAppts}</span>
            </div>
            <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wide">
              {t.upcomingAppts}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CFADB9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-semibold"
              id="patient-search"
            />
          </div>

          {/* Trimester Filter */}
          <select
            value={filterTrimester}
            onChange={(e) => setFilterTrimester(e.target.value as any)}
            className="px-4 py-3 bg-white rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] text-sm font-bold text-[#2F6F8F]"
            id="trimester-filter"
          >
            <option value="all">{t.filterAll}</option>
            <option value="1">{t.filterT1}</option>
            <option value="2">{t.filterT2}</option>
            <option value="3">{t.filterT3}</option>
          </select>
        </div>

        {/* Patient List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#FDDEEC] p-12 text-center shadow-3xs">
            <Flower2 className="w-12 h-12 text-[#CFADB9] mx-auto mb-3" />
            <h3 className="text-sm font-black text-[#2F6F8F] mb-1">{t.noPatients}</h3>
            <p className="text-xs text-[#2F6F8F]/70 font-medium max-w-xs mx-auto">
              {t.noPatientsDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <button
                key={patient.motherProfile.id}
                onClick={() => onSelectPatient(patient.motherProfile.id)}
                className="w-full bg-white rounded-2xl border border-[#FDDEEC] hover:border-[#FA6B90] hover:shadow-md p-4 transition-all cursor-pointer text-left"
                id={`patient-card-${patient.motherProfile.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Name & Week */}
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-base font-black text-[#2F6F8F] font-heading">
                        {patient.motherProfile.fullName}
                      </h3>
                      <div className="flex items-center space-x-1 px-2 py-0.5 bg-[#FDDEEC] rounded-full">
                        <span className="text-xs font-black text-[#FA6B90] font-mono">
                          {t.week} {patient.pregnancyProfile.currentWeek}
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center space-x-4 text-xs text-[#2F6F8F]/70 font-semibold">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{t.trimester} {patient.pregnancyProfile.trimester}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{patient.recordCount} {t.records}</span>
                      </div>
                      {patient.nextAppointmentDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{patient.nextAppointmentDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Sharing Permission Info */}
                    <div className="mt-2 flex items-center space-x-1.5 text-[10px] text-[#2F6F8F]/60 font-bold">
                      <Clock className="w-3 h-3" />
                      <span>
                        {t.granted}: {new Date(patient.sharingPermission.grantedAt).toLocaleDateString()}
                      </span>
                      {patient.sharingPermission.expiresAt && (
                        <span>
                          • {t.expires}: {new Date(patient.sharingPermission.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-[#CFADB9] shrink-0 ml-2" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
