/**
 * Feature Walkthrough — guided onboarding. Fixed per PATCH 4.
 */
import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, X, CheckCircle2 } from 'lucide-react';
import { trackFeature } from '../lib/usage';

interface FeatureWalkthroughProps {
  lang: 'en' | 'kh';
  variant?: 'mother' | 'doctor';
  userId?: string;
  onNavigate?: (tab: string) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  onReplayWalkthrough?: () => void;
}

const MOTHER_STEPS_EN = [
  { title: 'Welcome to FlowErs 🌸', body: "Your pregnancy records in one safe place, ready for any hospital. Here's a one-minute tour.", tab: null },
  { title: 'Home', body: "See your pregnancy week and what's next. Use the quick buttons to scan a record or open your calendar.", tab: 'home' },
  { title: 'My Records', body: 'Keep ultrasounds, lab results and prescriptions together. Tap + or Scan to add one. Free accounts can store up to 5 records.', tab: 'records' },
  { title: 'Calendar', body: 'Add checkups and appointments, and write notes for any day, so you never miss one.', tab: 'calendar' },
  { title: 'Info', body: 'Read trusted pregnancy information and chat with our Telegram bot.', tab: 'info' },
  { title: 'Passport', body: 'Your profile, medical info and Emergency QR code for doctors, all in one place. You can also create a journey summary report.', tab: 'passport' },
  { title: 'SOS', body: 'In an emergency, tap SOS to show your emergency profile and QR code right away.', tab: 'home' },
  { title: 'Language', body: "Switch between Khmer and English anytime with the KH / EN button.", tab: 'home' },
  { title: "You're all set!", body: 'You can replay this tour anytime from the Info tab.', tab: 'home' },
];

const MOTHER_STEPS_KH = [
  { title: 'សូមស្វាគមន៍មកកាន់ FlowErs 🌸', body: 'កំណត់ត្រាមាតារបស់អ្នកក្នុងកន្លែងតែមួយដែលមានសុវត្ថិភាព ហើយរួចរាល់សម្រាប់មន្ទីរពេទ្យណាមួយ។ តោះមើលការណែនាំរយៈពេលមួយនាទី។', tab: null },
  { title: 'ទំព័រដើម', body: 'មើលសប្តាហ៍ផ្ទៃពោះរបស់អ្នក និងអ្វីដែលត្រូវធ្វើបន្ទាប់។ ប្រើប៊ូតុងរហ័សដើម្បីស្កែនកំណត់ត្រា ឬបើកប្រតិទិន។', tab: 'home' },
  { title: 'កំណត់ត្រាខ្ញុំ', body: 'រក្សាទុកលទ្ធផលអ៊ុលត្រាសោន ការធ្វើតេស្តឈាម និងវេជ្ជបញ្ជាទុកជាមួយគ្នា។ ចុច + ឬ ស្កែន ដើម្បីបន្ថែម។ គណនីឥតគិតថ្លៃអាចរក្សាទុកបានរហូតដល់ 5 កំណត់ត្រា។', tab: 'records' },
  { title: 'ប្រតិទិន', body: 'បន្ថែមការពិនិត្យ និងការណាត់ជួបពេទ្យ ហើយសរសេរកំណត់ចំណាំសម្រាប់ថ្ងៃណាមួយ កុំឱ្យភ្លេចណាមួយ។', tab: 'calendar' },
  { title: 'ព័ត៌មាន', body: 'អានព័ត៌មានអំពីការមានផ្ទៃពោះដែលអាចទុកចិត្តបាន និងជជែកជាមួយ Telegram bot របស់យើង។', tab: 'info' },
  { title: 'លិខិតឆ្លងដែន', body: 'ប្រវត្តិរូប ព័ត៌មានវេជ្ជសាស្ត្រ និង QR code សង្គ្រោះបន្ទាន់សម្រាប់គ្រូពេទ្យ នៅកន្លែងតែមួយ។ អ្នកក៏អាចបង្កើតរបាយការណ៍សង្ខេបដំណើរផ្ទៃពោះបានដែរ។', tab: 'passport' },
  { title: 'ប៊ូតុងសង្គ្រោះ', body: 'ពេលមានអាសន្ន សូមចុចប៊ូតុង «សង្គ្រោះ» ដើម្បីបង្ហាញប្រវត្តិរូបសង្គ្រោះបន្ទាន់ និង QR code ភ្លាមៗ។', tab: 'home' },
  { title: 'ភាសា', body: 'ប្តូររវាងភាសាខ្មែរ និងអង់គ្លេសបានគ្រប់ពេលដោយប៊ូតុង KH / EN។', tab: 'home' },
  { title: 'រួចរាល់ហើយ!', body: 'អ្នកអាចមើលការណែនាំនេះម្តងទៀតបានគ្រប់ពេលពីផ្ទាំងព័ត៌មាន។', tab: 'home' },
];

const DOCTOR_STEPS_EN = [
  { title: 'Welcome, Doctor', body: 'A quick look at how FlowErs helps you review your patients\' pregnancy records.', tab: null },
  { title: 'Patient list', body: 'Your dashboard lists your patients. Tap a patient to open her file.', tab: null },
  { title: 'Patient file', body: 'Review her records and appointments in one place.', tab: null },
  { title: 'Clinical notes', body: 'Add a note to any record so it stays with her history.', tab: null },
];

export default function FeatureWalkthrough({ lang, variant = 'mother', userId, onNavigate, onComplete, onSkip }: FeatureWalkthroughProps) {
  const steps = variant === 'mother' ? (lang === 'en' ? MOTHER_STEPS_EN : MOTHER_STEPS_KH) : DOCTOR_STEPS_EN;
  const total = steps.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Start tracking when mounted
    trackFeature('walkthrough', 'start', { step: 1, total_steps: total, variant, lang });
  }, []);

  const current = steps[stepIndex];

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(i => i - 1);
    }
  };

  const handleNext = () => {
    if (current.tab && onNavigate) {
      onNavigate(current.tab);
    }
    if (stepIndex < total - 1) {
      setStepIndex(i => i + 1);
      trackFeature('walkthrough', 'step', { step: stepIndex + 2, total_steps: total, variant, lang });
    } else {
      handleDone();
    }
  };

  const handleSkip = () => {
    setVisible(false);
    const id = userId || 'unknown';
    const seenKey = 'walkthrough_seen:' + id;
    localStorage.setItem(seenKey, '1');
    trackFeature('walkthrough', 'skip', { step: stepIndex + 1, total_steps: total, variant, lang });
    onSkip?.();
  };

  const handleDone = () => {
    setVisible(false);
    const id = userId || 'unknown';
    const seenKey = 'walkthrough_seen:' + id;
    localStorage.setItem(seenKey, '1');
    trackFeature('walkthrough', 'complete', { step: total, total_steps: total, variant, lang });
    onComplete?.();
  };

  if (!visible) return null;

  const backText = lang === 'en' ? 'Back' : 'ត្រឡប់ក្រោយ';
  const nextText = lang === 'en' ? (stepIndex === total - 1 ? 'Done' : 'Next') : (stepIndex === total - 1 ? 'បញ្ចប់' : 'បន្ទាប់');
  const skipText = lang === 'en' ? 'Skip' : 'រំលង';
  const doneText = lang === 'en' ? 'Done' : 'បញ្ចប់';

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
              <h2 className="text-sm font-black text-[#2F6F8F] leading-none font-heading">{lang === 'en' ? 'Quick Tour' : 'ការណែនាំរហ័ស'}</h2>
              <p className="text-[10px] text-[#2F6F8F]/60 font-semibold">{stepIndex + 1} / {total}</p>
            </div>
          </div>
          <button onClick={handleSkip} className="p-1.5 hover:bg-[#FDDEEC] rounded-full text-[#CFADB9] cursor-pointer transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress dots */}
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

        {/* Illustration */}
        <div className="flex justify-center py-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#AEE3D8] to-[#FDDEEC] flex items-center justify-center shadow-inner border-2 border-[#7ECBBF]">
            <Sparkles className="w-12 h-12 text-[#FA6B90]" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {stepIndex > 0 && (
            <button onClick={handleBack} className="px-3 py-2.5 rounded-xl bg-[#FEFAFB] hover:bg-[#FDDEEC] border border-[#FDDEEC] text-[#2F6F8F] font-black text-xs uppercase transition-colors cursor-pointer" aria-label="Back">
              {backText}
            </button>
          )}
          <button onClick={handleNext} className="flex-1 py-2.5 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] text-white rounded-xl font-black text-xs uppercase shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2" id="walkthrough-next-btn">
            <span>{nextText}</span>
            {stepIndex < total - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
          <button onClick={handleSkip} className="px-3 py-2.5 rounded-xl bg-[#FFF7E9] hover:bg-[#F6E5C3] border border-[#F6E5C3] text-[#2F6F8F] font-black text-xs uppercase transition-colors cursor-pointer" aria-label="Skip">
            {skipText}
          </button>
        </div>
      </div>
    </div>
  );
}
