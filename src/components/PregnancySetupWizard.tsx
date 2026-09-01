/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Calendar, Scale, Ruler, HelpCircle, Activity, Heart, ArrowRight, Flower2 } from 'lucide-react';
import { PassportProfile } from '../types';
import { TRANSLATIONS } from '../data';

interface PregnancySetupWizardProps {
  lang: 'en' | 'kh';
  onComplete: (setupData: {
    weeks: number;
    height: number;
    weight: number;
    gravida: number;
    para: number;
    bloodType: string;
  }) => void;
  motherName: string;
}

export default function PregnancySetupWizard({ lang, onComplete, motherName }: PregnancySetupWizardProps) {
  const t = TRANSLATIONS[lang];
  
  // Step tracker
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Form states
  const [gestationalWeeks, setGestationalWeeks] = useState<number>(12);
  const [height, setHeight] = useState<string>('158');
  const [weight, setWeight] = useState<string>('52');
  const [gravida, setGravida] = useState<number>(1);
  const [para, setPara] = useState<number>(0);
  const [bloodType, setBloodType] = useState<string>('O+');

  // Submit handler
  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Validate inputs
      const parsedHeight = parseFloat(height) || 158;
      const parsedWeight = parseFloat(weight) || 52;
      onComplete({
        weeks: gestationalWeeks,
        height: parsedHeight,
        weight: parsedWeight,
        gravida,
        para,
        bloodType
      });
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // UI wording in English and Khmer
  const wizardWording = {
    en: {
      welcome: "Welcome, Sophy!",
      subtitle: "Let's personalize your maternal journey tracker.",
      stepLabel: "Step",
      of: "of",
      next: "Continue",
      back: "Back",
      finish: "Customize My App",
      
      step1Title: "How far along are you?",
      step1Desc: "Select your current gestational week. If you're not sure, an average is 12 weeks (end of 1st trimester).",
      weekCount: "Weeks Pregnant",
      trimesterStatus: "Estimated Trimester",

      step2Title: "Your Body Metrics",
      step2Desc: "Enter your height and pre-pregnancy weight. We'll use these to estimate your weight gain targets and your baby's weight profile.",
      heightLabel: "Mother's Height (cm)",
      weightLabel: "Mother's Pre-Pregnancy Weight (kg)",

      step3Title: "Pregnancy & Medical History",
      step3Desc: "This clinical history allows FlowErs to generate safer midwives guidelines tailored to your profile.",
      gravidaLabel: "Gravida (Total pregnancies, including this one)",
      paraLabel: "Para (Number of completed births > 20 weeks)",
      bloodTypeLabel: "Mother's Blood Type",
      isFirstPregnancy: "Is this your first pregnancy?"
    },
    kh: {
      welcome: "ស្វាគមន៍មាតា ៖ ស្រីលក្ខណ៍!",
      subtitle: "សូមរៀបចំការតាមដានការមានផ្ទៃពោះផ្ទាល់ខ្លួនរបស់អ្នក។",
      stepLabel: "ជំហានទី",
      of: "នៃ",
      next: "បន្តទៅមុខ",
      back: "ត្រឡប់ក្រោយ",
      finish: "រៀបចំកម្មវិធីរបស់ខ្ញុំ",

      step1Title: "តើអ្នកមានផ្ទៃពោះបានប៉ុន្មានសប្តាហ៍ហើយ?",
      step1Desc: "សូមជ្រើសរើសសប្តាហ៍ផ្ទៃពោះបច្ចុប្បន្នរបស់អ្នក។ ប្រសិនបើមិនប្រាកដ សប្តាហ៍មធ្យមគឺសប្តាហ៍ទី១២ (ចុងត្រីមាសទី១)។",
      weekCount: "សប្តាហ៍មានផ្ទៃពោះ",
      trimesterStatus: "ត្រីមាសគណនា",

      step2Title: "រង្វាស់រាងកាយមាតា",
      step2Desc: "បញ្ចូលកម្ពស់ និងទម្ងន់មុនពេលមានផ្ទៃពោះ។ យើងនឹងប្រើប្រាស់វាដើម្បីគណនាទម្ងន់កូន និងកម្រិតគីឡូសមស្របរបស់អ្នក។",
      heightLabel: "កម្ពស់មាតា (សង់ទីម៉ែត្រ)",
      weightLabel: "ទម្ងន់មុនមានផ្ទៃពោះ (គីឡូក្រាម)",

      step3Title: "ប្រវត្តិផ្ទៃពោះ និងប្រវត្តិវេជ្ជសាស្ត្រ",
      step3Desc: "ព័ត៌មាននេះអនុញ្ញាតឱ្យកម្មវិធី FlowErs ផ្តល់នូវការណែនាំពីឆ្មបដែលសមស្របនឹងស្ថានភាពរបស់អ្នក។",
      gravidaLabel: "Gravida (ចំនួនមានផ្ទៃពោះសរុប រាប់ទាំងលើកនេះ)",
      paraLabel: "Para (ចំនួនសម្រាលដែលគ្រប់អាយុ > ២០សប្តាហ៍)",
      bloodTypeLabel: "ក្រុមឈាមមាតា",
      isFirstPregnancy: "តើនេះជាការមានផ្ទៃពោះលើកដំបូងរបស់អ្នកមែនទេ?"
    }
  };

  const currentWording = wizardWording[lang];

  // Trimester helper
  const getTrimester = (w: number) => {
    if (w <= 13) return 1;
    if (w <= 26) return 2;
    return 3;
  };

  return (
    <div className={`min-h-screen bg-[#FEFAFB] flex flex-col justify-center items-center px-4 py-8 font-sans ${lang === 'kh' ? 'lang-kh' : ''}`} id="pregnancy-wizard-container">
      <div className="w-full max-w-lg bg-white rounded-[32px] border border-[#FDDEEC] p-8 shadow-3xs space-y-6 relative overflow-hidden">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-[#FDDEEC] pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#FDDEEC] text-[#FA6B90] flex items-center justify-center font-black text-xs font-mono">
              {step}
            </div>
            <span className="text-xs font-black text-[#2F6F8F]/70 uppercase tracking-wider font-heading">
              {currentWording.stepLabel} {step} {currentWording.of} {totalSteps}
            </span>
          </div>
          {/* Visual Progress Bar */}
          <div className="w-24 h-1.5 bg-[#FDDEEC] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] transition-all duration-300" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Welcome message on Step 1 */}
        {step === 1 && (
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#2F6F8F] tracking-tight font-heading">
              {lang === 'en' ? `Welcome, ${motherName}! 👋` : `ស្វាគមន៍មាតា ${motherName}! 👋`}
            </h2>
            <p className="text-xs text-[#2F6F8F]/75 font-semibold leading-relaxed">
              {currentWording.subtitle}
            </p>
          </div>
        )}

        {/* STEP 1: GESTATIONAL WEEKS SELECTOR */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#2F6F8F] flex items-center space-x-2 font-heading">
                <Calendar className="w-5 h-5 text-[#FA6B90]" />
                <span>{currentWording.step1Title}</span>
              </h3>
              <p className="text-xs text-[#2F6F8F]/75 font-medium leading-normal">
                {currentWording.step1Desc}
              </p>
            </div>

            {/* Week Display Slider Badge */}
            <div className="bg-[#FEFAFB] border border-[#FDDEEC] rounded-2xl p-6 flex flex-col items-center space-y-4 shadow-3xs">
              <div className="text-center">
                <span className="text-4xl font-black text-[#2F6F8F] block font-mono">
                  {gestationalWeeks}
                </span>
                <span className="text-[10px] font-black text-[#FA6B90] uppercase tracking-widest mt-0.5 block">
                  {currentWording.weekCount}
                </span>
              </div>

              {/* Slider */}
              <input 
                type="range" 
                min="1" 
                max="40" 
                value={gestationalWeeks}
                onChange={(e) => setGestationalWeeks(parseInt(e.target.value))}
                className="w-full accent-[#FA6B90] cursor-pointer"
                id="weeks-slider"
              />

              <div className="flex justify-between w-full text-[10px] text-[#2F6F8F]/60 font-bold">
                <span>Week 1 (LMP)</span>
                <span>Week 20 (Midpoint)</span>
                <span>Week 40 (Birth)</span>
              </div>

              {/* Informative calculated trimester badge */}
              <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#AEE3D8]/35 text-[#2F6F8F] border border-[#AEE3D8] rounded-full text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-[#2F6F8F] fill-[#2F6F8F]" />
                <span>
                  {currentWording.trimesterStatus}: {getTrimester(gestationalWeeks)} {lang === 'en' ? 'Trimester' : 'ត្រីមាស'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BODY METRICS */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#2F6F8F] flex items-center space-x-2 font-heading">
                <Scale className="w-5 h-5 text-[#FA6B90]" />
                <span>{currentWording.step2Title}</span>
              </h3>
              <p className="text-xs text-[#2F6F8F]/75 font-medium leading-normal">
                {currentWording.step2Desc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Height Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wider font-heading">
                  {currentWording.heightLabel} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#CFADB9]">
                    <Ruler className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    min="120"
                    max="220"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] font-bold"
                    id="wizard-height-input"
                  />
                </div>
              </div>

              {/* Weight Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wider font-heading">
                  {currentWording.weightLabel} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#CFADB9]">
                    <Scale className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="150"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] font-bold"
                    id="wizard-weight-input"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Clinical BMI Box (Mint health element) */}
            {height && weight && (
              <div className="bg-[#AEE3D8]/20 border border-[#AEE3D8] rounded-2xl p-4 space-y-1 text-xs text-[#2F6F8F]">
                <div className="flex items-center justify-between font-black">
                  <span>Pre-pregnancy Body Mass Index (BMI)</span>
                  <span className="text-sm font-mono bg-white px-2 py-0.5 rounded-lg border border-[#AEE3D8]">
                    {((parseFloat(weight) || 52) / Math.pow((parseFloat(height) || 158) / 100, 2)).toFixed(1)}
                  </span>
                </div>
                <p className="text-[10px] text-[#2F6F8F]/85 leading-normal font-medium mt-1">
                  💡 This BMI determines your personalized ideal gestational weight gain targets over the full 40 weeks (normally 11.5 - 16 kg for a normal BMI).
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PREGNANCY & MEDICAL HISTORY */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#2F6F8F] flex items-center space-x-2 font-heading">
                <Activity className="w-5 h-5 text-[#FA6B90]" />
                <span>{currentWording.step3Title}</span>
              </h3>
              <p className="text-xs text-[#2F6F8F]/75 font-medium leading-normal">
                {currentWording.step3Desc}
              </p>
            </div>

            <div className="space-y-4">
              {/* First Pregnancy Quick Select */}
              <div className="space-y-2">
                <span className="block text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wider font-heading">
                  {currentWording.isFirstPregnancy}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setGravida(1);
                      setPara(0);
                    }}
                    className={`py-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      gravida === 1 && para === 0
                        ? 'bg-[#FDDEEC] border-[#FA6B90] text-[#2F6F8F] font-black'
                        : 'bg-white border-[#FDDEEC] text-[#2F6F8F]/70 hover:bg-[#FFF7E9]'
                    }`}
                  >
                    {lang === 'en' ? 'Yes (First Baby)' : 'បាទ/ចាស (កូនដំបូង)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGravida(2);
                      setPara(1);
                    }}
                    className={`py-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      !(gravida === 1 && para === 0)
                        ? 'bg-[#FDDEEC] border-[#FA6B90] text-[#2F6F8F] font-black'
                        : 'bg-white border-[#FDDEEC] text-[#2F6F8F]/70 hover:bg-[#FFF7E9]'
                    }`}
                  >
                    {lang === 'en' ? 'No (Have children)' : 'ទេ (ធ្លាប់មានកូនរួចហើយ)'}
                  </button>
                </div>
              </div>

              {/* Blood Type Selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[#2F6F8F]/70 uppercase tracking-wider pl-1 font-heading">
                  {currentWording.bloodTypeLabel} *
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] bg-[#FEFAFB] text-xs font-bold text-[#2F6F8F]"
                  id="wizard-bloodtype-select"
                >
                  {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
                <p className="text-[10px] text-[#2F6F8F]/60 leading-normal font-medium pl-1">
                  💡 Note: Knowing Rh negative blood status is crucial for preventative prenatal immunology advice.
                </p>
              </div>

              {/* Gravida / Para detailed fields (only shown if not first pregnancy) */}
              {!(gravida === 1 && para === 0) && (
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#FEFAFB] rounded-2xl border border-[#FDDEEC] animate-in slide-in-from-top-3 duration-200">
                  <div>
                    <label className="block text-[9px] font-black text-[#2F6F8F]/70 uppercase">Gravida</label>
                    <input
                      type="number"
                      min="2"
                      value={gravida}
                      onChange={(e) => setGravida(Math.max(2, parseInt(e.target.value) || 2))}
                      className="w-full p-2 bg-white rounded-lg border border-[#FDDEEC] font-bold text-xs mt-1 text-[#2F6F8F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-[#2F6F8F]/70 uppercase">Para</label>
                    <input
                      type="number"
                      min="1"
                      value={para}
                      onChange={(e) => setPara(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2 bg-white rounded-lg border border-[#FDDEEC] font-bold text-xs mt-1 text-[#2F6F8F]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions Button Bar */}
        <div className="flex items-center space-x-3 pt-4 border-t border-[#FDDEEC]">
          {step > 1 && (
            <button
              onClick={handlePrevStep}
              className="px-5 py-3.5 border border-[#F6E5C3] bg-[#FFF7E9] hover:bg-[#F6E5C3] text-[#2F6F8F] font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              id="wizard-back-btn"
            >
              {currentWording.back}
            </button>
          )}

          <button
            onClick={handleNextStep}
            className="flex-1 py-3.5 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-3xs flex items-center justify-center space-x-2"
            id="wizard-continue-btn"
          >
            {step === totalSteps ? (
              <>
                <Flower2 className="w-4 h-4 text-white" />
                <span>{currentWording.finish}</span>
              </>
            ) : (
              <>
                <span>{currentWording.next}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
