/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, Plus, Search, Filter, Camera, Eye, Trash2, X,
  Calendar, MapPin, User, ChevronRight, UploadCloud, Tag,
  CheckCircle, AlertTriangle, Clock, Share2, Download,
  Flower2, Building
} from 'lucide-react';
import { MedicalRecord, RecordCategory } from '../types';
import { TRANSLATIONS } from '../data';

interface RecordsViewProps {
  records: MedicalRecord[];
  onAddRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onOpenScanRecord: () => void;
  lang: 'en' | 'kh';
  selectedRecordId?: string | null;
}

const CATEGORY_TABS: { id: 'all' | RecordCategory; labelEn: string; labelKh: string; emoji: string }[] = [
  { id: 'all', labelEn: 'All Documents', labelKh: 'ឯកសារទាំងអស់', emoji: '📁' },
  { id: 'ultrasound', labelEn: 'Ultrasounds', labelKh: 'អេកូស្កេន', emoji: '🩺' },
  { id: 'lab_test', labelEn: 'Lab Tests', labelKh: 'តេស្តមន្ទីរពិសោធន៍', emoji: '🧪' },
  { id: 'prescription', labelEn: 'Prescriptions', labelKh: 'វេជ្ជបញ្ជា & ថ្នាំ', emoji: '💊' },
  { id: 'vaccine', labelEn: 'Vaccines', labelKh: 'វ៉ាក់សាំង', emoji: '💉' },
  { id: 'doctor_note', labelEn: 'Doctor Notes', labelKh: 'កំណត់ត្រាគ្រូពេទ្យ', emoji: '📝' }
];

export default function RecordsView({
  records,
  onAddRecord,
  onDeleteRecord,
  onOpenScanRecord,
  lang,
  selectedRecordId
}: RecordsViewProps) {
  const t = TRANSLATIONS[lang];

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | RecordCategory>('all');
  const [activeTrimester, setActiveTrimester] = useState<'all' | 1 | 2 | 3>('all');
  
  // Detail & Lightbox states
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(selectedRecordId || null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered and searched records list
  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        // Category filter
        if (activeCategory !== 'all' && record.category !== activeCategory) {
          return false;
        }
        // Trimester filter
        if (activeTrimester !== 'all' && record.trimester !== activeTrimester) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = record.title.toLowerCase().includes(q);
          const matchFacility = record.facility?.toLowerCase().includes(q);
          const matchDoctor = record.doctor?.toLowerCase().includes(q);
          const matchNotes = record.notes?.toLowerCase().includes(q);
          const matchTags = record.tags?.some(tag => tag.toLowerCase().includes(q));
          return matchTitle || matchFacility || matchDoctor || matchNotes || matchTags;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, activeCategory, activeTrimester, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: records.length };
    records.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [records]);

  const getCategoryBadge = (cat: RecordCategory) => {
    switch (cat) {
      case 'ultrasound':
        return { label: lang === 'en' ? 'Ultrasound Scan' : 'អេកូស្កេន', color: 'bg-[#AEE3D8]/30 text-[#2F6F8F] border-[#AEE3D8]' };
      case 'lab_test':
        return { label: lang === 'en' ? 'Lab Test' : 'តេស្តមន្ទីរពិសោធន៍', color: 'bg-[#D5D1F1] text-[#2F6F8F] border-[#BFBEE9]' };
      case 'prescription':
        return { label: lang === 'en' ? 'Prescription' : 'វេជ្ជបញ្ជា & ថ្នាំ', color: 'bg-[#FDDEEC] text-[#FA6B90] border-[#F5B1CE]' };
      case 'vaccine':
        return { label: lang === 'en' ? 'Vaccine' : 'វ៉ាក់សាំង', color: 'bg-[#FEC7DF] text-[#2F6F8F] border-[#F4A6B5]' };
      case 'doctor_note':
        return { label: lang === 'en' ? 'Doctor Note' : 'កំណត់ត្រាគ្រូពេទ្យ', color: 'bg-[#FFF7E9] text-[#2F6F8F] border-[#F6E5C3]' };
      default:
        return { label: lang === 'en' ? 'Medical Record' : 'ឯកសារវេជ្ជសាស្ត្រ', color: 'bg-white text-[#2F6F8F] border-[#FDDEEC]' };
    }
  };

  return (
    <div className="space-y-4.5 animate-in fade-in duration-200" id="records-vault-container">
      
      {/* 1. TOP VAULT HEADER & SCAN CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-[#2F6F8F] tracking-tight font-heading">
            {t.vaultTitle}
          </h3>
          <p className="text-[10px] text-[#2F6F8F]/75 font-semibold">
            {records.length} {lang === 'en' ? 'digitized medical records' : 'ឯកសារបានឌីជីថលូបនីយកម្ម'}
          </p>
        </div>

        <button
          onClick={onOpenScanRecord}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-black bg-[#AEE3D8] hover:bg-[#96D6C9] text-[#2F6F8F] border border-[#7ECBBF] shadow-3xs transition-all cursor-pointer"
          id="btn-vault-scan-record"
        >
          <Plus className="w-4 h-4 text-[#2F6F8F] stroke-[2.5]" />
          <span>{lang === 'en' ? 'Scan Document' : 'ស្កេនឯកសារ'}</span>
        </button>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="relative">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchRecordsPlaceholder}
          className="w-full pl-9 pr-8 py-2.5 bg-white rounded-2xl border border-[#AEE3D8] text-xs font-medium focus:ring-2 focus:ring-[#AEE3D8] focus:border-[#7ECBBF] placeholder:text-[#CFADB9] text-[#2F6F8F] shadow-3xs"
          id="input-vault-search"
        />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#2F6F8F]/60">
          <Search className="w-4 h-4" />
        </div>
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-3 flex items-center text-[#CFADB9] hover:text-[#2F6F8F]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. CATEGORY FILTER TABS */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORY_TABS.map(tab => {
          const count = categoryCounts[tab.id] || 0;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-full font-black text-[10.5px] uppercase tracking-wider flex items-center space-x-1.5 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive 
                  ? 'bg-[#AEE3D8] text-[#2F6F8F] border border-[#7ECBBF] shadow-3xs' 
                  : 'bg-white text-[#2F6F8F] border border-[#FDDEEC] hover:border-[#AEE3D8]'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{lang === 'en' ? tab.labelEn : tab.labelKh}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-white/60 text-[#2F6F8F]' : 'bg-[#AEE3D8]/30 text-[#2F6F8F]'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. TRIMESTER SEGMENTED PILLS BAR */}
      <div className="flex bg-[#AEE3D8]/20 p-1 rounded-2xl border border-[#AEE3D8] text-[10px] font-black uppercase">
        <button
          onClick={() => setActiveTrimester('all')}
          className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTrimester === 'all' ? 'bg-white text-[#2F6F8F] shadow-3xs' : 'text-[#2F6F8F]/70'
          }`}
        >
          {lang === 'en' ? 'All (W1-40)' : 'ទាំងអស់'}
        </button>
        <button
          onClick={() => setActiveTrimester(1)}
          className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTrimester === 1 ? 'bg-white text-[#2F6F8F] shadow-3xs' : 'text-[#2F6F8F]/70'
          }`}
        >
          {lang === 'en' ? 'T1 (W1-12)' : 'ត្រីមាសទី១'}
        </button>
        <button
          onClick={() => setActiveTrimester(2)}
          className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTrimester === 2 ? 'bg-white text-[#2F6F8F] shadow-3xs' : 'text-[#2F6F8F]/70'
          }`}
        >
          {lang === 'en' ? 'T2 (W13-27)' : 'ត្រីមាសទី២'}
        </button>
        <button
          onClick={() => setActiveTrimester(3)}
          className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTrimester === 3 ? 'bg-white text-[#2F6F8F] shadow-3xs' : 'text-[#2F6F8F]/70'
          }`}
        >
          {lang === 'en' ? 'T3 (W28-40)' : 'ត្រីមាសទី៣'}
        </button>
      </div>

      {/* 5. RECORDS LIST */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#F4A6B5] p-8 text-center space-y-3 shadow-3xs">
          <div className="w-12 h-12 rounded-full bg-[#FDDEEC] text-[#FA6B90] flex items-center justify-center mx-auto text-xl">
            📂
          </div>
          <div>
            <h4 className="text-sm font-black text-[#2F6F8F] font-heading">
              {t.noRecordsFound}
            </h4>
            <p className="text-[11px] text-[#2F6F8F]/75 font-semibold mt-0.5">
              {searchQuery 
                ? (lang === 'en' ? 'Try adjusting your search query or filters' : 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក') 
                : t.addFirstRecord}
            </p>
          </div>
          <button
            onClick={onOpenScanRecord}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#FA6B90] hover:bg-[#f05e84] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-3xs transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t.uploadRecordBtn}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map(record => {
            const badge = getCategoryBadge(record.category);
            const isExpanded = expandedRecordId === record.id;

            return (
              <div 
                key={record.id}
                className={`bg-white rounded-2xl border transition-all shadow-3xs overflow-hidden ${
                  isExpanded ? 'border-[#FA6B90] ring-1 ring-[#FA6B90]/30' : 'border-[#FDDEEC] hover:border-[#F4A6B5]'
                }`}
                id={`record-card-${record.id}`}
              >
                {/* Header Summary Row */}
                <div 
                  onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                  className="p-4 cursor-pointer flex items-start justify-between space-x-3"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FFF7E9] text-[#2F6F8F] font-mono border border-[#F6E5C3]">
                        Week {record.week} (T{record.trimester})
                      </span>
                      {record.status && (
                        <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${
                          record.status === 'Normal' ? 'text-[#2F6F8F] bg-[#FDDEEC]' :
                          record.status === 'Follow-up Needed' ? 'text-[#FA6B90] bg-[#FFF7E9] border border-[#FA6B90]/30' : 'text-[#2F6F8F] bg-[#FFF7E9]'
                        }`}>
                          {record.status}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-[#2F6F8F] leading-snug font-heading">
                      {record.title}
                    </h4>

                    <div className="flex items-center space-x-3 text-[10.5px] text-[#2F6F8F]/75 font-semibold">
                      <div className="flex items-center space-x-1 font-mono">
                        <Calendar className="w-3 h-3 text-[#CFADB9]" />
                        <span>{record.date}</span>
                      </div>
                      <div className="flex items-center space-x-1 truncate">
                        <Building className="w-3 h-3 text-[#CFADB9]" />
                        <span className="truncate">{record.facility}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail / Action indicator */}
                  <div className="flex items-center space-x-2 shrink-0 pt-1">
                    {record.imageAttachment ? (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(record.imageAttachment || null);
                        }}
                        className="w-11 h-11 rounded-xl bg-[#FFF7E9] border border-[#F6E5C3] overflow-hidden relative group/thumb cursor-pointer shadow-3xs"
                        title="Click to view full scan"
                      >
                        <img 
                          src={record.imageAttachment} 
                          alt={record.title} 
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-all"
                        />
                        <div className="absolute inset-0 bg-[#2F6F8F]/30 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-[#FFF7E9] text-[#2F6F8F] flex items-center justify-center border border-[#F6E5C3]">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-[#FDDEEC] bg-[#FEFAFB] space-y-3.5 animate-in fade-in duration-150 text-xs">
                    
                    {/* Doctor Info */}
                    {record.doctor && (
                      <div className="flex items-center space-x-2 text-[11px] text-[#2F6F8F] font-semibold">
                        <User className="w-3.5 h-3.5 text-[#FA6B90]" />
                        <span>{t.doctor}: <b className="text-[#2F6F8F] font-bold">{record.doctor}</b></span>
                      </div>
                    )}

                    {/* Clinical Notes */}
                    {record.notes && (
                      <div className="bg-white p-3 rounded-xl border border-[#FDDEEC] space-y-1">
                        <span className="text-[9px] font-black uppercase text-[#2F6F8F]/75 tracking-wider block">
                          {t.clinicalNotes}
                        </span>
                        <p className="text-[11px] text-[#2F6F8F] leading-relaxed font-medium">
                          {record.notes}
                        </p>
                      </div>
                    )}

                    {/* Extracted Clinical Findings / Biomarkers */}
                    {record.extractedData && record.extractedData.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase text-[#2F6F8F]/75 tracking-wider block">
                          {t.extractedFindings}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {record.extractedData.map((dataItem, idx) => (
                            <div key={idx} className="bg-white p-2.5 rounded-xl border border-[#FDDEEC] text-center">
                              <span className="text-[8.5px] uppercase font-bold text-[#2F6F8F]/70 block truncate">
                                {dataItem.label}
                              </span>
                              <span className="text-xs font-black text-[#FA6B90] font-mono mt-0.5 block">
                                {dataItem.value} {dataItem.unit || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full Scan preview trigger button */}
                    {record.imageAttachment && (
                      <button
                        onClick={() => setLightboxImage(record.imageAttachment || null)}
                        className="w-full py-2.5 bg-white hover:bg-[#FFF7E9] border border-dashed border-[#FA6B90] rounded-xl text-[11px] font-black text-[#FA6B90] cursor-pointer flex items-center justify-center space-x-1.5 transition-all shadow-3xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#FA6B90]" />
                        <span>{t.viewAttachment}</span>
                      </button>
                    )}

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-[#CFADB9] font-mono">ID: {record.id}</span>
                      
                      {deleteConfirmId === record.id ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[#FA6B90] font-bold">{lang === 'en' ? 'Confirm delete?' : 'លុបមែនទេ?'}</span>
                          <button
                            onClick={() => {
                              onDeleteRecord(record.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2.5 py-1 bg-[#FA6B90] text-white font-black rounded-lg cursor-pointer hover:bg-[#f05e84]"
                          >
                            {lang === 'en' ? 'Yes' : 'បាទ/ចាស'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-[#FDDEEC] text-[#2F6F8F] font-bold rounded-lg cursor-pointer"
                          >
                            {lang === 'en' ? 'No' : 'ទេ'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(record.id)}
                          className="flex items-center space-x-1 text-[#FA6B90] hover:text-[#d9486f] font-bold cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t.deleteRecord}</span>
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. LIGHTBOX MODAL FOR FULL-SCREEN DOCUMENT PREVIEW */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-[#2F6F8F]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
          id="records-full-lightbox"
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-full cursor-pointer transition-all shadow-xl"
            id="btn-close-lightbox-full"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="max-w-full max-h-[85vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl bg-black flex items-center justify-center">
            <img 
              src={lightboxImage} 
              alt="Medical Scan Full Record" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
          
          <p className="text-[#FEFAFB] text-xs mt-3 font-semibold font-heading">
            {lang === 'en' ? 'Digitized Medical Record Photo' : 'រូបថតឯកសារវេជ្ជសាស្ត្រឌីជីថល'}
          </p>
        </div>
      )}

    </div>
  );
}
