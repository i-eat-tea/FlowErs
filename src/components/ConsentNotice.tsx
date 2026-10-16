/**
 * @license SPDX-License-Identifier: Apache-2.0
 * ConsentNotice — bilingual EN/KH fixed text, shown at sign-up and in ConsentGate.
 */
export default function ConsentNotice({ lang }: { lang: 'en' | 'kh' }) {
  const isEn = lang === 'en';
  return (
    <div className="bg-[#FEFAFB] border border-[#FDDEEC] rounded-2xl p-4 space-y-2 text-xs leading-snug">
      <h3 className="font-black text-[#2F6F8F] text-sm">{isEn ? 'Activity tracking & your consent' : 'ការតាមដanisម និងការយល់ពr�'}</h3>
      <p className="text-[#2F6F8F]/80 font-medium">{isEn ? 'To improve FlowErs and understand how it is used, we record which screens and buttons you use (for example: opening a tab, saving a record or appointment, opening our Telegram bot or information center), the time, and your language. These records are linked to your account. We never record what is inside your records, notes, photos or health values, and never your name, phone number or other personal text. A small cookie keeps one visit together.' : 'ដเพื่อកel improve FlowErs ឃrecord screens/buttons time lang. Never health/personal.'}</p>
      <p className="font-black text-[#FA6B90]">{isEn ? 'I understand and agree.' : 'ខ្ញុំយល់ និងយល់ព�.'}</p>
      <p className="text-[10px] text-[#2F6F8F]/60">{isEn ? 'You need to agree to continue.' : 'អ្នកត្រូវយ�់ព��ដ�ល�ប�nt�.'}</p>
    </div>
  );
}
