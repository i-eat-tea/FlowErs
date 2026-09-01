/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldAlert, Phone, Shield, AlertTriangle, QrCode } from 'lucide-react';
import { PassportProfile } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'kh';
  profile: PassportProfile;
  calculatedWeeks: number;
}

export default function EmergencyModal({ isOpen, onClose, lang, profile, calculatedWeeks }: EmergencyModalProps) {
  const [consentGated, setConsentGated] = useState(false);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2F6F8F]/75 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#FEFAFB] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FA6B90] animate-in fade-in zoom-in-95 duration-200 cursor-default"
        id="emergency-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent Warning Header */}
        <div className="bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] px-4 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight font-heading">
                {lang === 'en' ? 'Emergency Medical ID' : 'កាតព័ត៌មានសង្គ្រោះបន្ទាន់'}
              </h2>
              <p className="text-[11px] text-white/90 font-medium">
                {lang === 'en' ? 'For First Responders & Clinicians' : 'សម្រាប់បុគ្គលិកសង្គ្រោះបន្ទាន់ & គ្រូពេទ្យ'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            id="close-emergency-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Quick Stats Block */}
          <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-2xl border border-[#FDDEEC] shadow-3xs">
            <div className="p-2.5 bg-[#FFF7E9] rounded-xl border border-[#F6E5C3]">
              <span className="text-[10px] text-[#2F6F8F]/70 font-black block uppercase">
                {lang === 'en' ? 'Full Name' : 'ឈ្មោះពេញ'}
              </span>
              <span className="font-extrabold text-[#2F6F8F] text-sm block truncate font-heading">
                {profile.personal.name}
              </span>
            </div>
            <div className="p-2.5 bg-[#FDDEEC] rounded-xl border border-[#F4A6B5]">
              <span className="text-[10px] text-[#FA6B90] font-black block uppercase">
                {lang === 'en' ? 'Gestational Age' : 'អាយុគភ៌'}
              </span>
              <span className="font-black text-[#FA6B90] text-sm block font-mono">
                {calculatedWeeks} {lang === 'en' ? 'Weeks' : 'សប្តាហ៍'}
              </span>
            </div>
          </div>

          {/* Core Clinical Data */}
          <div className="bg-white rounded-2xl border border-[#FDDEEC] shadow-3xs overflow-hidden divide-y divide-[#FDDEEC]">
            {/* Blood Type */}
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FA6B90]" />
                <span className="text-xs font-black text-[#2F6F8F] uppercase">
                  {lang === 'en' ? 'Blood Type' : 'ក្រុមឈាម'}
                </span>
              </div>
              <span className="font-black text-[#FA6B90] bg-[#FDDEEC] border border-[#F4A6B5] px-3 py-1 rounded-lg text-base font-mono">
                {profile.medical.bloodType}
              </span>
            </div>

            {/* Drug Allergies */}
            <div className="p-3">
              <div className="flex items-center space-x-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FA6B90]" />
                <span className="text-xs font-black text-[#2F6F8F] uppercase">
                  {lang === 'en' ? 'Allergies' : 'អាឡែកស៊ី'}
                </span>
              </div>
              <p className="text-xs font-bold text-[#FA6B90] bg-[#FDDEEC] p-2 rounded-xl border border-[#F4A6B5]">
                {profile.medical.allergies || (lang === 'en' ? 'No Known Allergies' : 'គ្មានអាឡែកស៊ី')}
              </p>
            </div>

            {/* Conditions & Medications */}
            <div className="p-3 space-y-2">
              <div>
                <span className="text-[10px] font-black text-[#2F6F8F]/70 block uppercase">
                  {lang === 'en' ? 'Conditions' : 'ជំងឺប្រចាំកាយ'}
                </span>
                <span className="text-xs font-bold text-[#2F6F8F] block">
                  {profile.medical.existingConditions || (lang === 'en' ? 'None Reported' : 'គ្មាន')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black text-[#2F6F8F]/70 block uppercase">
                  {lang === 'en' ? 'Current Medications' : 'ថ្នាំកំពុងប្រើប្រាស់'}
                </span>
                <span className="text-xs text-[#2F6F8F] bg-[#FFF7E9] p-2 rounded-lg block border border-[#F6E5C3] font-mono">
                  {profile.medical.currentMedications || (lang === 'en' ? 'None Reported' : 'គ្មាន')}
                </span>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="p-3 bg-[#FEFAFB]">
              <span className="text-[10px] font-black text-[#2F6F8F] block uppercase mb-1.5">
                {lang === 'en' ? 'Emergency Contact' : 'ទំនាក់ទំនងសង្គ្រោះបន្ទាន់'}
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-[#2F6F8F]">{profile.medical.emergencyContactName}</p>
                  <p className="text-[10px] text-[#2F6F8F]/70 font-semibold">{profile.medical.emergencyContactRelation}</p>
                </div>
                <a 
                  href={`tel:${profile.medical.emergencyContactPhone}`}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#AEE3D8] hover:bg-[#96D6C9] text-[#2F6F8F] border border-[#7ECBBF] font-black text-xs shadow-3xs cursor-pointer transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#2F6F8F]" />
                  <span>{profile.medical.emergencyContactPhone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Hotline Dial */}
          <a
            href="tel:119"
            className="w-full flex items-center justify-center space-x-2 bg-[#FA6B90] hover:bg-[#f05e84] text-white py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>{lang === 'en' ? 'Call Ambulance (119)' : 'ហៅឡានពេទ្យសង្គ្រោះបន្ទាន់ (១១៩)'}</span>
          </a>

          {/* QR Code Sharing Consent Gate */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#FDDEEC] shadow-3xs space-y-3">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input 
                type="checkbox"
                checked={consentGated}
                onChange={(e) => setConsentGated(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#FA6B90] focus:ring-[#FA6B90] border-[#FDDEEC]"
                id="emergency-consent-checkbox"
              />
              <span className="text-[11px] text-[#2F6F8F]/80 font-semibold select-none leading-tight">
                {lang === 'en' 
                  ? 'Show Emergency QR code for on-site medical staff to scan'
                  : 'បង្ហាញ QR code សង្គ្រោះបន្ទាន់សម្រាប់គ្រូពេទ្យស្កេន'}
              </span>
            </label>

            {consentGated ? (
              <div className="pt-2 flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-200">
                <div className="relative bg-white p-3 rounded-2xl border-2 border-[#FA6B90] flex items-center justify-center shadow-3xs">
                  <div className="grid grid-cols-5 gap-1.5 w-24 h-24 p-1">
                    {Array.from({ length: 25 }).map((_, i) => {
                      const isCorner = (i < 3) || (i % 5 === 0 && i < 15) || (i % 5 === 4 && i < 15) || (i > 19);
                      const randomActive = (i * 7 + 13) % 2 === 0;
                      return (
                        <div 
                          key={i} 
                          className={`rounded-xs ${isCorner || randomActive ? 'bg-[#2F6F8F]' : 'bg-transparent'}`} 
                        />
                      );
                    })}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-[#FDDEEC] text-[#FA6B90] px-1 py-0.5 rounded text-[8px] font-black border border-[#F4A6B5]">
                        FLOWERS
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-[#2F6F8F]/70 text-center font-medium">
                  {lang === 'en' ? 'Scan to view instant patient emergency summary' : 'ស្កេនដើម្បីមើលទិន្នន័យសង្គ្រោះបន្ទាន់'}
                </p>
                <div className="flex items-center space-x-1 text-[10px] text-[#2F6F8F] font-bold bg-[#AEE3D8]/30 border border-[#AEE3D8] px-2.5 py-1 rounded-full">
                  <Shield className="w-3 h-3 text-[#2F6F8F]" />
                  <span>{lang === 'en' ? 'Local Encrypted Data' : 'ទិន្នន័យរក្សាទុកមានសុវត្ថិភាព'}</span>
                </div>
              </div>
            ) : (
              <div className="py-5 flex flex-col items-center justify-center bg-[#AEE3D8]/10 rounded-xl border border-dashed border-[#AEE3D8]">
                <QrCode className="w-10 h-10 text-[#2F6F8F]/50 stroke-1" />
                <span className="text-[11px] text-[#2F6F8F]/70 font-semibold mt-1">
                  {lang === 'en' ? 'QR Code Gated (Check box to view)' : 'សូមចុចធីកដើម្បីបង្ហាញ QR Code'}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#FFF7E9] hover:bg-[#F6E5C3] text-[#2F6F8F] border border-[#F6E5C3] font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-3xs"
            id="bottom-close-emergency-btn"
          >
            {lang === 'en' ? 'Close Emergency Card' : 'បិទកាតសង្គ្រោះបន្ទាន់'}
          </button>
        </div>
      </div>
    </div>
  );
}
