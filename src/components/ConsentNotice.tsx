/**
 * @license SPDX-License-Identifier: Apache-2.0
 * ConsentNotice — compact title + body + checkbox for sign-up forms.
 * Uses exact bilingual text from patch.md §2.2.
 */
import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ConsentNotice({ lang, onConsentChange }: { lang: 'en' | 'kh'; onConsentChange: (accepted: boolean) => void }) {
  const [checked, setChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    onConsentChange(e.target.checked);
  };

  const isEn = lang === 'en';

  return (
    <label className="flex items-start space-x-3 p-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] cursor-pointer w-full">
      <input type="checkbox" checked={checked} onChange={handleChange} className="mt-0.5 w-4 h-4 accent-[#FA6B90]" />
      <div className="flex-1">
        <p className="text-xs font-bold text-[#2F6F8F] mb-1">
          {isEn ? 'Activity tracking & your consent' : 'ការតាមដានសកម្មភាព និងការយល់ព្រម'}
        </p>
        <p className="text-xs text-[#2F6F8F]/80 leading-relaxed">
          {isEn
            ? 'To improve FlowErs and understand how it is used, we record which screens and buttons you use (for example: opening a tab, saving a record or appointment, opening our Telegram bot or information center), the time, and your language. These records are linked to your account. We never record what is inside your records, notes, photos or health values, and never your name, phone number or other personal text. A small cookie keeps one visit together.'
            : 'ដើម្បីកែលម្អ FlowErs និងយល់ពីរបៀបដែលវាត្រូវបានប្រើ យើងកត់ត្រាថាអ្នកប្រើអេក្រង់ និងប៊ូតុងណាខ្លះ (ឧទាហរណ៍៖ បើកផ្ទាំង រក្សាទុកកំណត់ត្រា ឬការណាត់ជួប បើក Telegram bot ឬមជ្ឈមណ្ឌលព័ត៌មានរបស់យើង) ពេលវេលា និងភាសារបស់អ្នក។ កំណត់ត្រាទាំងនេះត្រូវបានភ្ជាប់ទៅនឹងគណនីរបស់អ្នក។ យើងមិនកត់ត្រាខ្លឹមសារក្នុងកំណត់ត្រា កំណត់ចំណាំ រូបថត ឬតម្លៃសុខភាពរបស់អ្នកទេ ហើយក៏មិនកត់ត្រាឈ្មោះ លេខទូរស័ព្ទ ឬអត្ថបទផ្ទាល់ខ្លួនផ្សេងទៀតដែរ។ ខូគីតូចមួយជួយភ្ជាប់សកម្មភាពក្នុងការចូលមួយលើក។'
          }
        </p>
      </div>
    </label>
  );
}