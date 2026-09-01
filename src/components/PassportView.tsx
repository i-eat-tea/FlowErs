/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield, QrCode, Phone, User, Calendar, Heart, AlertTriangle,
  FileText, Check, Edit3, X, Droplets, Flower2, ExternalLink
} from 'lucide-react';
import { PassportProfile } from '../types';
import { TRANSLATIONS } from '../data';

interface PassportViewProps {
  profile: PassportProfile;
  onUpdateProfile: (updated: PassportProfile) => void;
  onOpenSummaryReport: () => void;
  lang: 'en' | 'kh';
  calculatedWeeks: number;
  calculatedTrimester: number;
}

export default function PassportView({
  profile,
  onUpdateProfile,
  onOpenSummaryReport,
  lang,
  calculatedWeeks,
  calculatedTrimester
}: PassportViewProps) {
  const t = TRANSLATIONS[lang];

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<PassportProfile>(profile);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4.5 animate-in fade-in duration-200" id="passport-view-container">
      
      {/* 1. OFFICIAL PASSPORT HEADER BANNER (MINT BACKGROUND WITH DEEP BLUE TEXT) */}
      <div className="bg-gradient-to-br from-[#AEE3D8] via-[#BCECE3] to-[#9CDFD2] rounded-[26px] p-5 text-[#2F6F8F] relative overflow-hidden shadow-sm border-2 border-[#7ECBBF]">
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-[#2F6F8F]/10 pointer-events-none">
          <Shield className="w-44 h-44" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#2F6F8F] shadow-2xs border border-[#7ECBBF]">
                <Flower2 className="w-4 h-4 text-[#2F6F8F]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2F6F8F]">
                KINGDOM OF CAMBODIA • MATERNAL HEALTH
              </span>
            </div>

            <button
              onClick={() => setShowQRModal(true)}
              className="p-1.5 bg-white/70 hover:bg-white rounded-xl text-[#2F6F8F] cursor-pointer transition-all border border-[#7ECBBF] shadow-3xs"
              title="View Emergency QR"
            >
              <QrCode className="w-4.5 h-4.5" />
            </button>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#2F6F8F] leading-tight font-heading">
              {profile.personal.name || 'Mother'}
            </h3>
            <p className="text-[11px] text-[#2F6F8F]/85 font-mono mt-0.5">
              PASSPORT ID: <span className="text-[#2F6F8F] font-black">MHP-2026-{profile.personal.phone?.slice(-4) || '8899'}</span>
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#7ECBBF]/60 text-center">
            <div className="bg-white/80 backdrop-blur-3xs rounded-xl p-2 border border-[#7ECBBF]/50">
              <span className="text-[8.5px] uppercase font-black text-[#2F6F8F] block">
                {lang === 'en' ? 'Gestational Age' : 'អាយុគភ៌'}
              </span>
              <span className="text-xs font-black text-[#2F6F8F] font-mono mt-0.5 block">
                Wk {calculatedWeeks} (T{calculatedTrimester})
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-3xs rounded-xl p-2 border border-[#7ECBBF]/50">
              <span className="text-[8.5px] uppercase font-black text-[#2F6F8F] block">
                {t.bloodType}
              </span>
              <span className="text-xs font-black text-[#FA6B90] font-mono mt-0.5 block">
                {profile.medical.bloodType}
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-3xs rounded-xl p-2 border border-[#7ECBBF]/50">
              <span className="text-[8.5px] uppercase font-black text-[#2F6F8F] block">
                {t.gravidaPara}
              </span>
              <span className="text-xs font-black text-[#2F6F8F] font-mono mt-0.5 block">
                G{profile.pregnancy.gravida} P{profile.pregnancy.para}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTION CONTROLS (EDIT PASSPORT + SUMMARY REPORT) */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setEditData(profile);
            setIsEditing(true);
          }}
          className="flex-1 py-2.5 px-3 bg-white hover:bg-[#AEE3D8]/20 border border-[#AEE3D8] text-[#2F6F8F] rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer transition-all shadow-3xs flex items-center justify-center space-x-1.5"
          id="btn-edit-passport"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#2F6F8F]" />
          <span>{t.editPassportBtn}</span>
        </button>

        <button
          onClick={onOpenSummaryReport}
          className="flex-1 py-2.5 px-3 bg-[#FDDEEC] hover:bg-[#FEC7DF] border border-[#F4A6B5] text-[#FA6B90] rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer transition-all shadow-3xs flex items-center justify-center space-x-1.5"
          id="btn-view-maternal-summary"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t.exportSummaryBtn}</span>
        </button>
      </div>

      {/* 3. SECTION: MOTHER'S PERSONAL INFORMATION */}
      <div className="bg-white rounded-2xl border border-[#FDDEEC] p-4.5 space-y-3 shadow-3xs">
        <div className="flex items-center space-x-2 pb-2 border-b-2 border-[#AEE3D8]">
          <div className="w-6 h-6 rounded-lg bg-[#AEE3D8]/30 text-[#2F6F8F] flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#2F6F8F] font-heading">
            {t.personalInfo}
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{t.fullName}</span>
            <span className="font-extrabold text-[#2F6F8F] block mt-0.5">{profile.personal.name}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{t.phone}</span>
            <span className="font-extrabold text-[#2F6F8F] font-mono block mt-0.5">{profile.personal.phone}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{t.dob} / {t.age}</span>
            <span className="font-extrabold text-[#2F6F8F] font-mono block mt-0.5">{profile.personal.dob} ({profile.personal.age} yrs)</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{lang === 'en' ? 'Height / Pre-weight' : 'កម្ពស់ / ទម្ងន់មុនពពោះ'}</span>
            <span className="font-extrabold text-[#2F6F8F] font-mono block mt-0.5">{profile.personal.height || 158} cm / {profile.personal.weight || 54} kg</span>
          </div>
        </div>
      </div>

      {/* 4. SECTION: PREGNANCY PROFILE */}
      <div className="bg-white rounded-2xl border border-[#FDDEEC] p-4.5 space-y-3 shadow-3xs">
        <div className="flex items-center space-x-2 pb-2 border-b-2 border-[#AEE3D8]">
          <div className="w-6 h-6 rounded-lg bg-[#FDDEEC] text-[#FA6B90] flex items-center justify-center">
            <Heart className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#2F6F8F] font-heading">
            {t.pregnancyInfo}
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{t.edd}</span>
            <span className="font-black text-[#FA6B90] font-mono block mt-0.5">{profile.pregnancy.edd}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{lang === 'en' ? 'Last Menstrual Period (LMP)' : 'រដូវចុងក្រោយ'}</span>
            <span className="font-extrabold text-[#2F6F8F] font-mono block mt-0.5">{profile.pregnancy.lmp || '2026-01-08'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{lang === 'en' ? 'Total Pregnancies (Gravida)' : 'ចំនួនពពោះសរុប (G)'}</span>
            <span className="font-extrabold text-[#2F6F8F] font-mono block mt-0.5">{profile.pregnancy.gravida}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{lang === 'en' ? 'Previous Deliveries (Para)' : 'ចំនួនសម្រាលកន្លងមក (P)'}</span>
            <span className="font-extrabold text-[#2F6F8F] font-mono block mt-0.5">{profile.pregnancy.para}</span>
          </div>
        </div>
      </div>

      {/* 5. SECTION: CRITICAL MEDICAL INFORMATION */}
      <div className="bg-white rounded-2xl border border-[#FDDEEC] p-4.5 space-y-3 shadow-3xs">
        <div className="flex items-center space-x-2 pb-2 border-b-2 border-[#AEE3D8]">
          <div className="w-6 h-6 rounded-lg bg-[#AEE3D8]/30 text-[#2F6F8F] flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#2F6F8F] font-heading">
            {t.medicalHistory}
          </h4>
        </div>

        <div className="space-y-3 text-xs">
          {/* Blood Type Badge */}
          <div className="flex items-center justify-between p-2.5 bg-[#AEE3D8]/20 rounded-xl border border-[#AEE3D8]">
            <span className="text-[11px] font-black text-[#2F6F8F]">{t.bloodType}</span>
            <span className="text-sm font-black text-[#2F6F8F] font-mono bg-white px-2.5 py-0.5 rounded-lg border border-[#AEE3D8] shadow-3xs">
              {profile.medical.bloodType}
            </span>
          </div>

          {/* Allergies Alert */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{t.allergies}</span>
            <div className="p-2.5 bg-[#FDDEEC] rounded-xl border border-[#F4A6B5] text-[#FA6B90] font-black text-[11px]">
              {profile.medical.allergies || (lang === 'en' ? 'No known drug allergies' : 'គ្មានប្រវត្តិប្រតិកម្មថ្នាំ')}
            </div>
          </div>

          {/* Pre-existing Conditions */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{t.existingConditions}</span>
            <p className="text-[11px] font-semibold text-[#2F6F8F]/90 pl-0.5">
              {profile.medical.existingConditions || (lang === 'en' ? 'None reported' : 'គ្មាន')}
            </p>
          </div>

          {/* Current Medications & Supplements */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#2F6F8F]/70 block">{t.currentMedications}</span>
            <p className="text-[11px] font-semibold text-[#2F6F8F]/90 pl-0.5 leading-relaxed">
              {profile.medical.currentMedications || (lang === 'en' ? 'Prenatal Vitamins' : 'វីតាមីនពពោះ')}
            </p>
          </div>
        </div>
      </div>

      {/* 6. SECTION: EMERGENCY CONTACT */}
      <div className="bg-white rounded-2xl border border-[#FDDEEC] p-4.5 space-y-2.5 shadow-3xs">
        <div className="flex items-center space-x-2 pb-2 border-b border-[#FDDEEC]">
          <div className="w-6 h-6 rounded-lg bg-[#FFF7E9] text-[#2F6F8F] flex items-center justify-center">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-[#2F6F8F] font-heading">
            {t.emergencyContact}
          </h4>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-extrabold text-[#2F6F8F] block">
              {profile.medical.emergencyContactName} ({profile.medical.emergencyContactRelation})
            </span>
            <span className="text-[11px] font-mono text-[#FA6B90] font-bold block mt-0.5">
              {profile.medical.emergencyContactPhone}
            </span>
          </div>

          <a 
            href={`tel:${profile.medical.emergencyContactPhone}`}
            className="p-2.5 bg-[#FA6B90] hover:bg-[#f05e84] text-white rounded-xl shadow-3xs cursor-pointer transition-all"
            title="Call Emergency Contact"
          >
            <Phone className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>

      {/* 7. EDIT PASSPORT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-[#2F6F8F]/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0" onClick={() => setIsEditing(false)} />

          <div className="w-full sm:max-w-lg bg-[#FEFAFB] rounded-t-[32px] sm:rounded-[28px] border-t sm:border border-[#FDDEEC] shadow-2xl relative z-10 p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#FDDEEC]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#FDDEEC] text-[#FA6B90] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-[#2F6F8F] font-heading">
                  {t.editPassportBtn}
                </h3>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1.5 bg-[#FFF7E9] hover:bg-[#F6E5C3] rounded-full cursor-pointer text-[#2F6F8F]"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs text-[#2F6F8F]">
              {/* Mother Name & Phone */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">{t.fullName}</label>
                  <input 
                    type="text" 
                    required
                    value={editData.personal.name}
                    onChange={(e) => setEditData({
                      ...editData,
                      personal: { ...editData.personal, name: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs font-bold text-[#2F6F8F] focus:border-[#FA6B90] focus:ring-2 focus:ring-[#FA6B90]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">{t.phone}</label>
                  <input 
                    type="text" 
                    value={editData.personal.phone}
                    onChange={(e) => setEditData({
                      ...editData,
                      personal: { ...editData.personal, phone: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs font-mono font-bold text-[#2F6F8F] focus:border-[#FA6B90] focus:ring-2 focus:ring-[#FA6B90]"
                  />
                </div>
              </div>

              {/* EDD & Blood Type */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">{t.edd}</label>
                  <input 
                    type="date" 
                    required
                    value={editData.pregnancy.edd}
                    onChange={(e) => setEditData({
                      ...editData,
                      pregnancy: { ...editData.pregnancy, edd: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs font-mono font-bold text-[#2F6F8F] focus:border-[#FA6B90] focus:ring-2 focus:ring-[#FA6B90]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">{t.bloodType}</label>
                  <input 
                    type="text" 
                    value={editData.medical.bloodType}
                    onChange={(e) => setEditData({
                      ...editData,
                      medical: { ...editData.medical, bloodType: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs font-mono font-bold text-[#2F6F8F] focus:border-[#FA6B90] focus:ring-2 focus:ring-[#FA6B90]"
                  />
                </div>
              </div>

              {/* Gravida & Para */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">Gravida (G)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={editData.pregnancy.gravida}
                    onChange={(e) => setEditData({
                      ...editData,
                      pregnancy: { ...editData.pregnancy, gravida: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs font-mono text-[#2F6F8F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">Para (P)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={editData.pregnancy.para}
                    onChange={(e) => setEditData({
                      ...editData,
                      pregnancy: { ...editData.pregnancy, para: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs font-mono text-[#2F6F8F]"
                  />
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">{t.allergies}</label>
                <input 
                  type="text" 
                  value={editData.medical.allergies}
                  onChange={(e) => setEditData({
                    ...editData,
                    medical: { ...editData.medical, allergies: e.target.value }
                  })}
                  className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs text-[#2F6F8F]"
                />
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">{t.currentMedications}</label>
                <textarea 
                  rows={2}
                  value={editData.medical.currentMedications}
                  onChange={(e) => setEditData({
                    ...editData,
                    medical: { ...editData.medical, currentMedications: e.target.value }
                  })}
                  className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs text-[#2F6F8F]"
                />
              </div>

              {/* Emergency Contact */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">{t.emergencyContact}</label>
                  <input 
                    type="text" 
                    value={editData.medical.emergencyContactName}
                    onChange={(e) => setEditData({
                      ...editData,
                      medical: { ...editData.medical, emergencyContactName: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs text-[#2F6F8F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">{t.emergencyPhone}</label>
                  <input 
                    type="text" 
                    value={editData.medical.emergencyContactPhone}
                    onChange={(e) => setEditData({
                      ...editData,
                      medical: { ...editData.medical, emergencyContactPhone: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-[#FDDEEC] bg-white text-xs font-mono text-[#2F6F8F]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-3 bg-[#FFF7E9] hover:bg-[#F6E5C3] text-[#2F6F8F] border border-[#F6E5C3] rounded-2xl font-black text-xs uppercase cursor-pointer"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] text-white rounded-2xl font-black text-xs uppercase cursor-pointer shadow-3xs flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t.savePassportBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. QR CODE FULL PREVIEW MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-[#2F6F8F]/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FEFAFB] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-[#FDDEEC] animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#2F6F8F] font-heading">
                {t.qrTitle}
              </span>
              <button 
                onClick={() => setShowQRModal(false)}
                className="p-1.5 bg-[#FFF7E9] hover:bg-[#F6E5C3] rounded-full text-[#2F6F8F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#FDDEEC] inline-block shadow-xs">
              <QrCode className="w-40 h-40 text-[#2F6F8F] mx-auto" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-[#2F6F8F] font-heading">
                {profile.personal.name} • {profile.medical.bloodType}
              </h4>
              <p className="text-[11px] text-[#2F6F8F]/75 font-semibold">
                {t.qrSubtitle}
              </p>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 bg-[#AEE3D8] hover:bg-[#96D6C9] text-[#2F6F8F] border border-[#7ECBBF] rounded-xl text-xs font-black uppercase cursor-pointer shadow-3xs transition-colors"
            >
              {lang === 'en' ? 'Close' : 'បិទ'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
