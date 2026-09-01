/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, Camera, UploadCloud, FileText, Check, AlertCircle,
  Tag, Calendar, Building, User, Info, Plus, Trash2, Eye, Flower2 
} from 'lucide-react';
import { MedicalRecord, RecordCategory } from '../types';
import { TRANSLATIONS } from '../data';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (record: MedicalRecord) => void;
  lang: 'en' | 'kh';
  currentCalculatedWeek: number;
}

const CATEGORY_OPTIONS: { id: RecordCategory; labelEn: string; labelKh: string; icon: string }[] = [
  { id: 'ultrasound', labelEn: 'Ultrasound / Scan', labelKh: 'អេកូស្កេន', icon: '🩺' },
  { id: 'lab_test', labelEn: 'Lab / Blood Test', labelKh: 'តេស្តមន្ទីរពិសោធន៍', icon: '🧪' },
  { id: 'prescription', labelEn: 'Prescription / Meds', labelKh: 'វេជ្ជបញ្ជា & ថ្នាំ', icon: '💊' },
  { id: 'vaccine', labelEn: 'Vaccine / Injection', labelKh: 'វ៉ាក់សាំង & ចាក់ថ្នាំ', icon: '💉' },
  { id: 'doctor_note', labelEn: 'Doctor / Visit Note', labelKh: 'កំណត់ត្រាគ្រូពេទ្យ', icon: '📝' },
  { id: 'other', labelEn: 'Other Document', labelKh: 'ឯកសារផ្សេងៗ', icon: '📁' }
];

export default function AddRecordModal({
  isOpen,
  onClose,
  onSaveRecord,
  lang,
  currentCalculatedWeek
}: AddRecordModalProps) {
  const t = TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecordCategory>('ultrasound');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [week, setWeek] = useState<number>(currentCalculatedWeek);
  const [facility, setFacility] = useState('');
  const [doctor, setDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Normal' | 'Follow-up Needed' | 'Completed' | 'Pending'>('Normal');
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  // Trimester computation based on week
  const trimester: 1 | 2 | 3 = week <= 12 ? 1 : week <= 27 ? 2 : 3;

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageAttachment(event.target.result as string);

        // Smart preset defaults if title is empty
        if (!title) {
          if (category === 'ultrasound') setTitle(`Week ${week} Ultrasound Scan`);
          else if (category === 'lab_test') setTitle(`Prenatal Laboratory Test Result`);
          else if (category === 'prescription') setTitle(`Doctor Prescription & Vitamins`);
          else if (category === 'vaccine') setTitle(`Maternal Immunization Record`);
          else if (category === 'doctor_note') setTitle(`Clinical Consultation Summary`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      title: title.trim(),
      category,
      date,
      week: Number(week) || currentCalculatedWeek,
      trimester,
      facility: facility.trim() || (lang === 'en' ? 'Maternity Clinic' : 'មន្ទីរពេទ្យសម្ភព'),
      doctor: doctor.trim() || (lang === 'en' ? 'Attending Physician' : 'គ្រូពេទ្យព្យាបាល'),
      notes: notes.trim(),
      status,
      imageAttachment: imageAttachment || undefined,
      tags: [
        category.replace('_', ' ').toUpperCase(),
        `Week ${week}`,
        `T${trimester}`
      ]
    };

    onSaveRecord(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#2F6F8F]/65 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Tap backdrop to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      <div 
        className="w-full sm:max-w-lg bg-[#FEFAFB] rounded-t-[32px] sm:rounded-[28px] border-t sm:border border-[#FDDEEC] shadow-2xl relative z-10 p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-6 duration-200"
        id="add-record-modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#FDDEEC]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#FDDEEC] text-[#FA6B90] flex items-center justify-center">
              <Flower2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#2F6F8F] leading-tight font-heading">
                {t.newRecordTitle}
              </h3>
              <p className="text-[10px] text-[#2F6F8F]/75 font-semibold">
                {lang === 'en' 
                  ? 'Digitize and store your paper reports into the secure vault' 
                  : 'រក្សាទុកឯកសារក្រដាសរបស់អ្នកទៅក្នុងឃ្លាំងឌីជីថលសុវត្ថិភាព'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-[#FFF7E9] hover:bg-[#F6E5C3] rounded-full cursor-pointer text-[#2F6F8F] transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#2F6F8F]">
          {/* 1. DOCUMENT SCAN / UPLOAD AREA */}
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase text-[#2F6F8F] tracking-wide">
              {t.docUploadLabel}
            </label>

            {imageAttachment ? (
              <div className="relative rounded-2xl border border-[#FA6B90] bg-[#FDDEEC]/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-[#AEE3D8] text-[#2F6F8F] font-black flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-[11px] font-black text-[#2F6F8F]">
                      {lang === 'en' ? 'Document Attached & Scanned' : 'ឯកសារត្រូវបានស្កេនភ្ជាប់'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageAttachment(null)}
                    className="text-[10px] font-black text-[#FA6B90] hover:text-[#d9486f] uppercase cursor-pointer"
                  >
                    {lang === 'en' ? 'Remove' : 'លុបចេញ'}
                  </button>
                </div>
                <div className="h-36 rounded-xl overflow-hidden bg-black/5 border border-[#FDDEEC] flex items-center justify-center">
                  <img 
                    src={imageAttachment} 
                    alt="Document scan preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-[#FA6B90] bg-[#FDDEEC]/50'
                      : 'border-[#FDDEEC] hover:border-[#FA6B90] hover:bg-[#FFF7E9]'
                  }`}
                >
                  <UploadCloud className="w-8 h-8 text-[#FA6B90] mx-auto mb-2" />
                  <p className="text-xs font-black text-[#2F6F8F] font-heading">
                    {t.dragDropText}
                  </p>
                  <p className="text-[10px] text-[#2F6F8F]/70 font-semibold mt-0.5">
                    {lang === 'en' ? 'Supports JPG, PNG, WebP scans & clinic photos' : 'គាំទ្ររូបភាព JPG, PNG, WebP គ្រប់ទម្រង់'}
                  </p>
                </div>

                {/* Direct Camera Button */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-[#FA6B90] hover:bg-[#f05e84] text-white rounded-xl font-black text-xs uppercase tracking-wide cursor-pointer transition-all shadow-3xs"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <span>{t.useCameraText}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-[#AEE3D8]/35 hover:bg-[#AEE3D8]/70 text-[#2F6F8F] rounded-xl font-black text-xs uppercase tracking-wide cursor-pointer transition-all border border-[#AEE3D8]"
                  >
                    <FileText className="w-4 h-4 text-[#2F6F8F]" />
                    <span>{lang === 'en' ? 'Choose Image File' : 'ជ្រើសរើសឯកសារ'}</span>
                  </button>
                </div>

                {/* Hidden Inputs */}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileInputChange} 
                  className="hidden" 
                />
                <input 
                  ref={cameraInputRef}
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleFileInputChange} 
                  className="hidden" 
                />
              </div>
            )}
          </div>

          {/* 2. CATEGORY SELECTOR */}
          <div>
            <label className="block text-[11px] font-black uppercase text-[#2F6F8F] mb-1.5 tracking-wide">
              {t.docCategoryLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    if (!title) {
                      if (cat.id === 'ultrasound') setTitle(`Week ${week} Ultrasound Scan`);
                      else if (cat.id === 'lab_test') setTitle(`Prenatal Lab Test Result`);
                      else if (cat.id === 'prescription') setTitle(`Prescription & Supplements`);
                      else if (cat.id === 'vaccine') setTitle(`Tetanus Vaccine Record`);
                      else if (cat.id === 'doctor_note') setTitle(`Doctor Clinical Note`);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between space-y-1 transition-all cursor-pointer ${
                    category === cat.id
                      ? 'border-[#FA6B90] bg-[#FDDEEC] ring-1 ring-[#FA6B90]/40'
                      : 'border-[#FDDEEC] bg-white hover:bg-[#FFF7E9] text-[#2F6F8F]'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className={`text-[10.5px] font-black block leading-tight ${category === cat.id ? 'text-[#2F6F8F]' : 'text-[#2F6F8F]/80'}`}>
                    {lang === 'en' ? cat.labelEn : cat.labelKh}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. DOCUMENT TITLE */}
          <div>
            <label className="block text-[11px] font-black uppercase text-[#2F6F8F] mb-1 tracking-wide">
              {t.docTitleLabel}
            </label>
            <input 
              type="text" 
              required
              placeholder={t.docTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-xs font-semibold text-[#2F6F8F]"
            />
          </div>

          {/* 4. DATE AND WEEK */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-[#2F6F8F] mb-1 tracking-wide">
                {t.docDateLabel}
              </label>
              <input 
                type="date" 
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-xs font-mono font-semibold text-[#2F6F8F]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-[#2F6F8F] mb-1 tracking-wide">
                {t.docWeekLabel}
              </label>
              <input 
                type="number" 
                min="1" 
                max="42"
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-xs font-mono font-semibold text-[#2F6F8F]"
              />
            </div>
          </div>

          {/* 5. CLINIC & DOCTOR */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-[#2F6F8F] mb-1 tracking-wide">
                {t.docFacilityLabel}
              </label>
              <input 
                type="text" 
                placeholder={t.docFacilityPlaceholder}
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-xs text-[#2F6F8F]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-[#2F6F8F] mb-1 tracking-wide">
                {t.docDoctorLabel}
              </label>
              <input 
                type="text" 
                placeholder={t.docDoctorPlaceholder}
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-xs text-[#2F6F8F]"
              />
            </div>
          </div>

          {/* 6. CLINICAL FINDINGS / NOTES */}
          <div>
            <label className="block text-[11px] font-black uppercase text-[#2F6F8F] mb-1 tracking-wide">
              {t.docNotesLabel}
            </label>
            <textarea 
              rows={2}
              placeholder={t.docNotesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-xs text-[#2F6F8F]"
            />
          </div>

          {/* 7. STATUS */}
          <div>
            <label className="block text-[11px] font-black uppercase text-[#2F6F8F] mb-1 tracking-wide">
              {t.docStatusLabel}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'Normal', labelEn: 'Normal', labelKh: 'ធម្មតា', color: 'text-[#2F6F8F] bg-[#AEE3D8]/50 border-[#AEE3D8]' },
                { id: 'Follow-up Needed', labelEn: 'Follow-up', labelKh: 'តាមដាន', color: 'text-[#FA6B90] bg-[#FFF7E9] border-[#FA6B90]/40' },
                { id: 'Completed', labelEn: 'Done', labelKh: 'រួចរាល់', color: 'text-[#2F6F8F] bg-[#D5D1F1] border-[#BFBEE9]' },
                { id: 'Pending', labelEn: 'Pending', labelKh: 'រង់ចាំ', color: 'text-[#CFADB9] bg-[#FFF7E9] border-[#F6E5C3]' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id as any)}
                  className={`py-2 px-1 text-center rounded-xl border text-[10px] font-black uppercase transition-all cursor-pointer ${
                    status === s.id
                      ? `${s.color} ring-2 ring-[#2F6F8F]/15 font-black`
                      : 'border-[#FDDEEC] bg-white text-[#CFADB9] hover:bg-[#FFF7E9]'
                  }`}
                >
                  {lang === 'en' ? s.labelEn : s.labelKh}
                </button>
              ))}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2 flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-[#FFF7E9] hover:bg-[#F6E5C3] text-[#2F6F8F] border border-[#F6E5C3] rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] text-white rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-3xs flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t.saveRecordBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
