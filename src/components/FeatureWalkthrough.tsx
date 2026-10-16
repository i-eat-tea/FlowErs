/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Feature Walkthrough — guided onboarding for first-time users.
 * Respects consent; does not replay if user has seen it (localStorage key).
 * Fixed text in EN/KH; interactive flow with next/skip/complete.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, X, CheckCircle2 } from 'lucide-react';
import { trackFeature } from '../lib/usage';

const WALKTHROUGH_KEY = 'flowers_walkthrough_seen';

interface FeatureWalkthroughProps {
  lang: 'en' | 'kh';
  onComplete?: () => void;
  onSkip?: () => void;
}

const STEPS = {
  en: [
    { title: 'Welcome to FlowErs', body: 'Your digital maternal health passport. Organize scans, track appointments, and share safely with doctors.' },
    { title: 'Scan & Save Records', body: 'Tap the camera to digitize ultrasounds, lab results, and prescriptions directly into your secure vault.' },
    { title: 'Calendar & Reminders', body: 'Schedule prenatal visits, get reminders, and view your pregnancy timeline in one place.' },
    { title: 'Emergency Passport', body: 'Your emergency profile with blood type and contacts is always available — even offline.' },
  ],
  kh: [
    { title: 'ស welcome FlowErs', body: 'ជPasseport សhealth សmaternal សdigital។ រ整理 scans ថ tracking appointments ថ share safely។' },
    { title: 'Scan & Save Records', body: 'ច Click camera ដ digitize ultrasounds ថ lab results ថ prescriptions ដ vault។' },
    { title: 'Calendar & Reminders', body: 'Schedule prenatal visits ត reminders ត pregnancy timeline ដ place។' },
    { title: 'Emergency Passport', body: 'Profile emergency ថ blood type ថ contacts ស always available ដ offline។' },
  ],
};

export default function FeatureWalkthrough({ lang, onComplete, onSkip }: FeatureWalkthroughProps) {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Only show if consent accepted and not seen before
    const consent = document.cookie.match(/flowers_consent=([^;]+)/)?.[1];
    if (consent === 'accepted' && !localStorage.getItem(WALKTHROUGH_KEY)) {
      setVisible(true);
      trackFeature('walkthrough', 'start', { step: 1, lang });
    }
  }, [lang]);

  const steps = STEPS[lang];
  const current = steps[stepIndex];
  const total = steps.length;

  if (!visible) return null;

  const handleNext = () => {
    if (stepIndex < total - 1) {
      setStepIndex(i => i + 1);
      trackFeature('walkthrough', 'step', { step: stepIndex + 2, lang });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(i => i - 1);
      trackFeature('walkthrough', 'step', { step: stepIndex, lang, direction: 'back' });
    }
  };

  const handleSkip = () => {
    setVisible(false);
    localStorage.setItem(WALKTHROUGH_KEY, 'skipped');
    trackFeature('walkthrough', 'skip', { step: stepIndex + 1, lang });
    onSkip?.();
  };

  const handleComplete = () => {
    setVisible(false);
    localStorage.setItem(WALKTHROUGH_KEY, 'completed');
    trackFeature('walkthrough', 'complete', { total_steps: total, lang });
    onComplete?.();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#2F6F8F]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200" id="feature-walkthrough">
      <div className="fixed inset-0" onClick={handleSkip} />
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[28px] shadow-2xl border-2 border-[#AEE3D8] p-6 space-y-5 relative z-10 animate-in slide-in-from-bottom-6 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FA6B90] to-[#F4A6B5] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#2F6F8F] leading-none font-heading">{lang === 'en' ? 'Quick Tour' : 'ការប介绍 rápido'}</h2>
              <p className="text-[10px] text-[#2F6F8F]/60 font-semibold">{stepIndex + 1} / {total}</p>
            </div>
          </div>
          <button onClick={handleSkip} className="p-1.5 hover:bg-[#FDDEEC] rounded-full text-[#CFADB9] cursor-pointer transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex space-x-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= stepIndex ? 'bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5]' : 'bg-[#FDDEEC]'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-black text-[#2F6F8F] font-heading">{current.title}</h3>
          <p className="text-sm text-[#2F6F8F]/80 font-medium leading-relaxed">{current.body}</p>
        </div>

        {/* Illustration placeholder — uses fixed flower icon */}
        <div className="flex justify-center py-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#AEE3D8] to-[#FDDEEC] flex items-center justify-center shadow-inner border-2 border-[#7ECBBF]">
            <Sparkles className="w-12 h-12 text-[#FA6B90]" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {stepIndex > 0 && (
            <button onClick={handleBack} className="px-3 py-2.5 rounded-xl bg-[#FEFAFB] hover:bg-[#FDDEEC] border border-[#FDDEEC] text-[#2F6F8F] font-black text-xs uppercase transition-colors cursor-pointer" aria-label="Back">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <button onClick={handleNext} className="flex-1 py-2.5 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] text-white rounded-xl font-black text-xs uppercase shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2" id="walkthrough-next-btn">
            <span>{stepIndex === total - 1 ? (lang === 'en' ? 'Finish' : 'Finish') : (lang === 'en' ? 'Next' : 'Next')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={handleSkip} className="px-3 py-2.5 rounded-xl bg-[#FFF7E9] hover:bg-[#F6E5C3] border border-[#F6E5C3] text-[#2F6F8F] font-black text-xs uppercase transition-colors cursor-pointer" aria-label="Skip">
            {lang === 'en' ? 'Skip' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
}
