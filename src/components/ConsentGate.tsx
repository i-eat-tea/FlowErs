/**
 * @license SPDX-License-Identifier: Apache-2.0
 * ConsentGate — full-screen after sign-in when server says consent required.
 * Uses exact bilingual text from patch.md §2.2.
 */
import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ConsentGate({ lang, onAgree, onDecline }: { lang: 'en' | 'kh'; onAgree: () => void; onDecline: () => void }) {
  const [checked, setChecked] = useState(false);
  const [agreeError, setAgreeError] = useState('');
  const isEn = lang === 'en';
  const handleAgree = async () => {
    setAgreeError('');
    try {
      const token = localStorage.getItem('flowers_auth_token');
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-App-Lang': lang === 'kh' ? 'kh' : 'en',
        },
        body: JSON.stringify({ choice: 'accepted', lang }),
      });
      if (res.ok) {
        onAgree();
      } else {
        setAgreeError(isEn ? 'Failed to save consent. Please try again.' : 'ប failed ស save consent. ស try again.');
      }
    } catch {
      setAgreeError(isEn ? 'Network error. Please retry.' : 'Network error. ស try again.');
    }
  };

  const handleDecline = () => {
    // Clear session on decline (logout) — consent is not optional
    localStorage.removeItem('flowers_auth_token');
    localStorage.removeItem('flowers_user_id');
    localStorage.removeItem('flowers_is_logged_in');
    localStorage.removeItem('flowers_user_role');
    onDecline();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#2F6F8F]/70 backdrop-blur-md flex items-center justify-center p-4" id="consent-gate">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-[#AEE3D8] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#FA6B90]" />
          <h2 className="text-lg font-black text-[#2F6F8F]">{isEn ? 'Activity tracking & your consent' : 'ការត tracking & your consent'}</h2>
        </div>
        <p className="text-xs text-[#2F6F8F]/80 leading-relaxed">
          {isEn
            ? 'To improve FlowErs and understand how it is used, we record which screens and buttons you use (for example: opening a tab, saving a record or appointment, opening our Telegram bot or information center), the time, and your language. These records are linked to your account. We never record what is inside your records, notes, photos or health values, and never your name, phone number or other personal text. A small cookie keeps one visit together.'
            : 'ដើម្បីក Improve FlowErs យល់ពីរប how it is used, we record screens/buttons, time, lang. Linked to account. Never health/personal text. Cookie keeps visit together.'}
        </p>
        <label className="flex items-start space-x-3 p-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] cursor-pointer">
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#FA6B90]" />
          <span className="text-xs font-bold text-[#2F6F8F]">{isEn ? 'I understand and agree.' : 'ខ្ញុំយ Understand ស agree.'}</span>
        </label>
        <p className="text-[10px] text-[#2F6F8F]/60">{isEn ? 'You need to agree to continue.' : 'You need to agree to continue.'}</p>
        <div className="flex gap-2 pt-2">
          <button onClick={handleAgree} disabled={!checked} className="flex-1 py-2.5 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] text-white rounded-xl font-black text-xs disabled:opacity-50">{isEn ? 'Agree & continue' : 'Agree & continue'}</button>
          <button onClick={handleDecline} className="flex-1 py-2.5 bg-[#FDDEEC] text-[#2F6F8F] rounded-xl font-black text-xs">{isEn ? 'Decline' : 'Decline'}</button>
        </div>
        {agreeError && <p className="text-xs text-red-600 font-bold">{agreeError}</p>}
      </div>
    </div>
  );
}
