/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Doctor Records View — for selected patient
 * Shows shared medical records with ability to add clinical notes
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  FileText,
  Search,
  Filter,
  Eye,
  MessageSquare,
  AlertTriangle,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { MedicalRecord, RecordCategory } from '../types';

interface DoctorRecordsViewProps {
  motherName: string;
  records: MedicalRecord[];
  onBack: () => void;
  onAddClinicalNote: (recordId: string, note: string) => void;
  lang: 'en' | 'kh';
}

const CATEGORY_TABS: { id: 'all' | RecordCategory; labelEn: string; labelKh: string; emoji: string }[] = [
  { id: 'all', labelEn: 'All', labelKh: 'ទាំងអស់', emoji: '📁' },
  { id: 'ultrasound', labelEn: 'Ultrasound', labelKh: 'អេកូ', emoji: '🩺' },
  { id: 'lab_test', labelEn: 'Lab', labelKh: 'ឧសម័ន្តន៍', emoji: '🧪' },
  { id: 'prescription', labelEn: 'Rx', labelKh: 'ថ្នាំ', emoji: '💊' },
  { id: 'vaccine', labelEn: 'Vaccine', labelKh: 'វ៉ាក់សាំង', emoji: '💉' },
  { id: 'doctor_note', labelEn: 'Notes', labelKh: 'កំណត់ត្រា', emoji: '📝' }
];

export default function DoctorRecordsView({
  motherName,
  records,
  onBack,
  onAddClinicalNote,
  lang
}: DoctorRecordsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | RecordCategory>('all');
  const [activeTrimester, setActiveTrimester] = useState<'all' | 1 | 2 | 3>('all');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [noteModalRecordId, setNoteModalRecordId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const wording = {
    en: {
      back: 'Back to Patient',
      title: 'Medical Records',
      search: 'Search records...',
      filterT1: 'T1',
      filterT2: 'T2',
      filterT3: 'T3',
      filterAll: 'All',
      noRecords: 'No medical records',
      noRecordsDesc: 'No records match your filters.',
      date: 'Date',
      week: 'Week',
      facility: 'Facility',
      doctor: 'Doctor',
      status: 'Status',
      notes: 'Notes',
      addClinicalNote: 'Add Clinical Note',
      saveClinicalNote: 'Save Clinical Note',
      cancel: 'Cancel',
      placeholderNote: 'Enter your clinical notes...',
      viewAttachment: 'View Document',
      noAttachment: 'No scan',
      clinicalNotesModal: 'Add Clinical Note to Record'
    },
    kh: {
      back: 'ត្រឡប់ទៅអ្នកជម្ងឺ',
      title: 'កំណត់ត្រាវេជ្ជសាស្ត្រ',
      search: 'ស្វែងរកកំណត់ត្រា...',
      filterT1: 'ត១',
      filterT2: 'ត២',
      filterT3: 'ត៣',
      filterAll: 'ទាំងអស់',
      noRecords: 'គ្មានកំណត់ត្រាវេជ្ជសាស្ត្រ',
      noRecordsDesc: 'គ្មានកំណត់ត្រាដែលត្រូវនឹងលក្ខខណ្ឌរបស់អ្នក។',
      date: 'កាលបរិច្ឆេទ',
      week: 'សប្តាហ៍',
      facility: 'មន្ទីរពេទ្យ',
      doctor: 'វេជ្ជបណ្ឌិត',
      status: 'ស្ថានភាព',
      notes: 'កំណត់ត្រា',
      addClinicalNote: 'បន្ថែមកំណត់ត្រាលម្អិត',
      saveClinicalNote: 'រក្សាទុកកំណត់ត្រា',
      cancel: 'បោះបង់',
      placeholderNote: 'វាយបញ្ចូលកំណត់ត្រាលម្អិតរបស់អ្នក...',
      viewAttachment: 'មើលឯកសារ',
      noAttachment: 'គ្មានឯកសារ',
      clinicalNotesModal: 'បន្ថែមកំណត់ត្រាលម្អិត'
    }
  };

  const t = wording[lang];

  // Filter records
  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        if (activeCategory !== 'all' && record.category !== activeCategory) return false;
        if (activeTrimester !== 'all' && record.trimester !== activeTrimester) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            record.title.toLowerCase().includes(q) ||
            record.facility?.toLowerCase().includes(q) ||
            record.doctor?.toLowerCase().includes(q) ||
            record.notes?.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
  }, [records, activeCategory, activeTrimester, searchQuery]);

  const handleSaveNote = () => {
    if (noteModalRecordId && noteText.trim()) {
      onAddClinicalNote(noteModalRecordId, noteText);
      setNoteText('');
      setNoteModalRecordId(null);
    }
  };

  return (
    <div className={`min-h-screen bg-[#FEFAFB] px-4 py-6 font-sans ${lang === 'kh' ? 'lang-kh' : ''}`} id="doctor-records-view">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl hover:bg-[#FDDEEC]/50 text-[#2F6F8F] font-bold text-xs transition-colors cursor-pointer mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>
            <h1 className="text-2xl font-black text-[#2F6F8F] flex items-center space-x-2 font-heading">
              <FileText className="w-6 h-6 text-[#FA6B90]" />
              <span>{t.title}</span>
            </h1>
            <p className="text-xs text-[#2F6F8F]/70 font-semibold mt-1">
              {motherName} • {filteredRecords.length} {lang === 'en' ? 'records' : 'កំណត់ត្រា'}
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
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-semibold"
            />
          </div>

          {/* Trimester Filter */}
          <select
            value={activeTrimester}
            onChange={(e) => setActiveTrimester(e.target.value as any)}
            className="px-3 py-2.5 bg-white rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] text-sm font-bold text-[#2F6F8F]"
          >
            <option value="all">{t.filterAll}</option>
            <option value="1">{t.filterT1}</option>
            <option value="2">{t.filterT2}</option>
            <option value="3">{t.filterT3}</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2">
          {CATEGORY_TABS.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#FDDEEC] border border-[#FA6B90] text-[#FA6B90]'
                  : 'bg-white border border-[#FDDEEC] text-[#2F6F8F]/70 hover:text-[#2F6F8F]'
              }`}
              id={`tab-${cat.id}`}
            >
              <span className="mr-1">{cat.emoji}</span>
              {lang === 'en' ? cat.labelEn : cat.labelKh}
            </button>
          ))}
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#FDDEEC] p-12 text-center">
            <FileText className="w-12 h-12 text-[#CFADB9] mx-auto mb-3" />
            <h3 className="text-sm font-black text-[#2F6F8F] mb-1">{t.noRecords}</h3>
            <p className="text-xs text-[#2F6F8F]/70 font-medium">{t.noRecordsDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map(record => (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-[#FDDEEC] hover:border-[#FA6B90] transition-all shadow-3xs"
              >
                {/* Record Header (clickable to expand) */}
                <button
                  onClick={() => setExpandedRecordId(expandedRecordId === record.id ? null : record.id)}
                  className="w-full p-4 flex items-start justify-between text-left cursor-pointer"
                  id={`record-${record.id}`}
                >
                  <div className="flex-1">
                    <h3 className="font-black text-[#2F6F8F] text-sm mb-1">
                      {record.title}
                    </h3>
                    <div className="flex items-center flex-wrap gap-2 text-xs text-[#2F6F8F]/70 font-semibold">
                      <span>{record.examDate}</span>
                      <span>•</span>
                      <span>{t.week} {record.week}</span>
                      {record.facility && (
                        <>
                          <span>•</span>
                          <span>{record.facility}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-2 ml-4">
                    {record.status === 'Normal' && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-[#AEE3D8]/30 rounded-full">
                        <Check className="w-3 h-3 text-[#2F6F8F]" />
                        <span className="text-[10px] font-black text-[#2F6F8F]">OK</span>
                      </div>
                    )}
                    {record.status === 'Follow-up Needed' && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-[#FDDEEC]/50 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-[#FA6B90]" />
                        <span className="text-[10px] font-black text-[#FA6B90]">FU</span>
                      </div>
                    )}
                    {record.status === 'Pending' && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-[#FFF7E9]/50 rounded-full">
                        <Clock className="w-3 h-3 text-[#2F6F8F]" />
                        <span className="text-[10px] font-black text-[#2F6F8F]">...</span>
                      </div>
                    )}

                    {expandedRecordId === record.id ? (
                      <ChevronUp className="w-5 h-5 text-[#CFADB9]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#CFADB9]" />
                    )}
                  </div>
                </button>

                {/* Expanded Record Details */}
                {expandedRecordId === record.id && (
                  <div className="px-4 pb-4 space-y-4 border-t border-[#FDDEEC]">
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {record.doctor && (
                        <div>
                          <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase">{t.doctor}</p>
                          <p className="text-xs font-semibold text-[#2F6F8F] mt-0.5">
                            {record.doctor}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase">{t.week}</p>
                        <p className="text-xs font-semibold text-[#2F6F8F] mt-0.5">
                          {record.week} (T{record.trimester})
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {record.notes && (
                      <div className="bg-[#FEFAFB] rounded-xl p-3 border border-[#FDDEEC]">
                        <p className="text-[10px] font-black text-[#2F6F8F]/70 uppercase mb-1">
                          {t.notes}
                        </p>
                        <p className="text-xs text-[#2F6F8F] font-medium leading-relaxed">
                          {record.notes}
                        </p>
                      </div>
                    )}

                    {/* Attachment */}
                    {record.imageUrl ? (
                      <button className="w-full px-3 py-2 rounded-xl bg-[#AEE3D8]/30 hover:bg-[#AEE3D8]/60 text-[#2F6F8F] border border-[#AEE3D8] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t.viewAttachment}</span>
                      </button>
                    ) : (
                      <p className="text-xs text-[#2F6F8F]/60 text-center font-medium py-2">
                        {t.noAttachment}
                      </p>
                    )}

                    {/* Clinical Note Button */}
                    <button
                      onClick={() => {
                        setNoteModalRecordId(record.id);
                        setNoteText('');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] text-white font-black text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-3xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.addClinicalNote}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Note Modal */}
      {noteModalRecordId && (
        <div
          className="fixed inset-0 z-50 bg-[#2F6F8F]/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setNoteModalRecordId(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl border border-[#FDDEEC] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-black text-[#2F6F8F] mb-4 font-heading">
              {t.clinicalNotesModal}
            </h2>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t.placeholderNote}
              className="w-full h-32 p-3 rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-semibold resize-none"
              id="clinical-note-textarea"
            />

            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={() => setNoteModalRecordId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FFF7E9] hover:bg-[#F6E5C3] text-[#2F6F8F] border border-[#F6E5C3] font-black text-xs transition-all cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] text-white font-black text-xs transition-all cursor-pointer shadow-3xs"
              >
                {t.saveClinicalNote}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
