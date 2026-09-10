/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flower2, Globe, LogOut } from 'lucide-react';
import { TRANSLATIONS } from '../data';

interface HeaderProps {
  lang: 'en' | 'kh';
  setLang: (lang: 'en' | 'kh') => void;
  onOpenEmergency: () => void;
  onLogout: () => void;
}

export default function Header({ lang, setLang, onOpenEmergency, onLogout }: HeaderProps) {
  const t = TRANSLATIONS[lang];

  return (
    <>
      {/* Sticky Brand Header */}
      <header className="sticky top-0 z-35 bg-[#FEFAFB]/95 backdrop-blur-md border-b border-[#AEE3D8] px-3 py-2 shadow-xs">
        <div className="w-full max-w-md mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 bg-gradient-to-tr from-[#F4A6B5] to-[#FA6B90] rounded-xl flex items-center justify-center text-white shadow-xs shrink-0">
              <Flower2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1">
                <h1 className="text-sm font-black tracking-tight text-[#2F6F8F] leading-none font-heading truncate">{t.appName}</h1>
                <span className="text-[9px] shrink-0">❀</span>
              </div>
              <p className="text-[8px] text-[#2F6F8F]/75 font-bold mt-0.5 truncate max-w-[150px]">{t.tagline}</p>
            </div>
          </div>

          {/* Header actions — language + SOS stay here; logout moves to bottom strip */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setLang(lang === 'en' ? 'kh' : 'en')}
              className="flex items-center gap-0.5 px-2 py-1 rounded-full text-[9px] font-bold bg-[#AEE3D8]/30 hover:bg-[#AEE3D8]/60 text-[#2F6F8F] transition-colors cursor-pointer border border-[#AEE3D8]"
              title="Switch Language"
            >
              <Globe className="w-2.5 h-2.5 text-[#2F6F8F]" />
              <span>{lang === 'en' ? 'KH' : 'EN'}</span>
            </button>
            <button
              onClick={onOpenEmergency}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold bg-[#FDDEEC] border border-[#F4A6B5] text-[#FA6B90] hover:bg-[#FEC7DF] transition-colors cursor-pointer"
              id="btn-emergency-trigger"
            >
              <div className="w-1.5 h-1.5 bg-[#FA6B90] rounded-full animate-pulse" />
              <span>{lang === 'en' ? 'SOS' : 'ស救'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Quick-Action Strip — easy-access for KH / SOS / Logout */}
      <div className="fixed bottom-[72px] left-0 right-0 z-40 bg-[#FEFAFB]/95 backdrop-blur-md border-t-2 border-[#AEE3D8]/50 grid grid-cols-3 gap-2 py-2 px-3 shadow-xs md:hidden">
        <button
          onClick={() => setLang(lang === 'en' ? 'kh' : 'en')}
          className="flex items-center justify-center gap-1 py-2 rounded-full text-xs font-black bg-[#AEE3D8]/30 text-[#2F6F8F] border border-[#AEE3D8] transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === 'en' ? 'KH' : 'EN'}
        </button>
        <button
          onClick={onOpenEmergency}
          className="flex items-center justify-center gap-1 py-2 rounded-full text-xs font-black bg-[#FDDEEC] text-[#FA6B90] border border-[#FA6B90] shadow-3xs transition-colors"
        >
          <div className="w-2 h-2 bg-[#FA6B90] rounded-full animate-pulse" />
          {lang === 'en' ? 'SOS' : '救急'}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-1 py-2 rounded-full text-xs font-black bg-[#FDDEEC] text-[#FA6B90] border border-[#FA6B90] shadow-3xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          {lang === 'en' ? 'Logout' : 'ログアウト'}
        </button>
      </div>
    </>
  );
}
