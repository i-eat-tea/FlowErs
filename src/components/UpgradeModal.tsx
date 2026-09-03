/**
 * Upgrade Prompt — Freemium tier gate
 */
import React from 'react';
import { X, Crown, Zap, Check } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  lang: 'en' | 'kh';
  feature: string;
}

export default function UpgradeModal({ isOpen, onClose, onUpgrade, lang, feature }: UpgradeModalProps) {
  if (!isOpen) return null;
  const t = lang === 'en' ? {
    title: 'Upgrade to Premium',
    subtitle: `Unlock ${feature}`,
    features: ['Unlimited medical records', 'Family member access', 'Secure hospital sharing', 'Cloud backup', 'Emergency profile'],
    cta: 'Upgrade Now',
    cancel: 'Maybe Later',
  } : {
    title: '升级到高级版',
    subtitle: `解锁 ${feature}`,
    features: ['无限医疗记录', '家庭成员访问', '医院安全共享', '云备份', '紧急档案'],
    cta: '立即升级',
    cancel: '稍后再说',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F6F8F]/60 backdrop-blur-xs">
      <div className="bg-white rounded-[28px] shadow-2xl max-w-sm w-full p-6 space-y-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 hover:bg-[#FFF7E9] rounded-full transition-colors"><X className="w-5 h-5 text-[#2F6F8F]" /></button>
        <div className="w-14 h-14 bg-gradient-to-br from-[#F6E5C3] to-[#FDDEEC] rounded-2xl flex items-center justify-center mx-auto"><Crown className="w-7 h-7 text-[#FA6B90]" /></div>
        <h2 className="text-xl font-black text-center text-[#2F6F8F] font-heading">{t.title}</h2>
        <p className="text-xs text-center text-[#2F6F8F]/70 font-mono">{t.subtitle}</p>
        <ul className="space-y-2">
          {t.features.map(f => (
            <li key={f} className="flex items-center space-x-2 text-xs font-bold text-[#2F6F8F]"><Check className="w-3.5 h-3.5 text-[#2D7A4F]" /><span>{f}</span></li>
          ))}
        </ul>
        <div className="flex space-x-2 pt-2">
          <button onClick={onClose} className="flex-1 py-3 bg-[#FFF7E9] hover:bg-[#F6E5C3] text-[#2F6F8F] rounded-2xl font-black text-xs uppercase cursor-pointer border border-[#F6E5C3]">{t.cancel}</button>
          <button onClick={onUpgrade} className="flex-1 py-3 bg-gradient-to-r from-[#FA6B90] to-[#FDDEEC] hover:from-[#f05a7e] hover:to-[#fbccd5] text-white rounded-2xl font-black text-xs uppercase cursor-pointer shadow-3xs flex items-center justify-center space-x-1"><Zap className="w-4 h-4" /><span>{t.cta}</span></button>
        </div>
      </div>
    </div>
  );
}
