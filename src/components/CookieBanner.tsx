/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Cookie Consent Banner — appears at bottom when no consent choice exists.
 */

import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { consentExists, setConsentCookie } from '../lib/consent';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsVisible(!consentExists());
  }, []);

  if (!isVisible) return null;

  async function handleChoice(choice: 'accepted' | 'declined') {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice })
      });
      if (res.ok) {
        setConsentCookie(choice);
        setIsVisible(false);
      }
    } catch (err) {
      console.error('Consent submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#AEE3D8] shadow-2xl p-4"
      style={{ bottom: '72px' }} // Above bottom nav
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start space-x-3">
          <Cookie className="w-5 h-5 text-[#FA6B90] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            {/* English text */}
            <p className="text-xs font-bold text-[#2F6F8F] leading-relaxed">
              FlowErs uses a cookie to remember your choice and to count which features are used, so we can improve the app. We never record your health information in it.
            </p>
            {/* Khmer text */}
            <p className="text-xs font-bold text-[#2F6F8F]/80 leading-relaxed">
              FlowErs ប្រើខូគី (cookie) ដើម្បីចងចាំជម្រើសរបស់អ្នក និងរាប់ថាមុខងារណាត្រូវបានប្រើ ដើម្បីកែលម្អកម្មវិធី។ យើងមិនកត់ត្រាទិន្នន័យសុខភាពរបស់អ្នកក្នុងនោះទេ។
            </p>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => handleChoice('accepted')}
                disabled={isSubmitting}
                className="flex-1 py-2 px-3 bg-[#FA6B90] hover:bg-[#f05e84] text-white rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer transition-all shadow-3xs disabled:opacity-50"
              >
                Accept / ទទួលយក
              </button>
              <button
                onClick={() => handleChoice('declined')}
                disabled={isSubmitting}
                className="flex-1 py-2 px-3 bg-white hover:bg-[#FDDEEC]/40 text-[#2F6F8F] border border-[#AEE3D8] rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer transition-all disabled:opacity-50"
              >
                Decline / បដិសេធ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
