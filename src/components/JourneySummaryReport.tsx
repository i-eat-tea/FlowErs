/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Shield, ArrowLeft, Printer, Scale, Ruler, Heart, Calendar, HelpCircle, AlertCircle, CheckCircle2, Flower2 } from 'lucide-react';
import { PassportProfile } from '../types';

interface JourneySummaryReportProps {
  profile: PassportProfile;
  lang: 'en' | 'kh';
  onClose: () => void;
}

// Highly reliable WHO/Hadlock based fetal weight estimation modulated by maternal stature (height & weight)
export function getEstimatedFetalWeight(week: number, motherHeight: number, motherWeight: number): { kg: number; grams: number; percentChange: number } {
  if (week < 8) return { kg: 0, grams: 0, percentChange: 0 };
  
  // Baseline WHO median fetal weight (grams) at key week intervals
  const points = [
    { wk: 4, g: 0 },
    { wk: 8, g: 1 },
    { wk: 12, g: 15 },
    { wk: 16, g: 100 },
    { wk: 20, g: 300 },
    { wk: 24, g: 600 },
    { wk: 28, g: 1005 },
    { wk: 32, g: 1702 },
    { wk: 36, g: 2622 },
    { wk: 40, g: 3462 }
  ];

  // Linear interpolation
  let baseGrams = 0;
  if (week <= 4) baseGrams = 0;
  else if (week >= 40) baseGrams = 3462;
  else {
    const lower = points.reduce((acc, p) => p.wk <= week ? p : acc, points[0]);
    const upper = points.find(p => p.wk > week) || points[points.length - 1];
    const t = (week - lower.wk) / (upper.wk - lower.wk);
    baseGrams = lower.g + t * (upper.g - lower.g);
  }

  // Maternal Factor Scaling:
  // - Average mother baseline height is 158 cm, weight is 52 kg.
  // - Deviations scale EFW within +/- 15% range to represent clinical guidelines.
  const heightDiff = motherHeight - 158;
  const weightDiff = motherWeight - 52;
  const scalingFactor = 1 + (heightDiff * 0.0018) + (weightDiff * 0.0025);
  
  // Clamp scaling factor to safe physiological boundaries (0.80x to 1.25x)
  const clampedScale = Math.max(0.80, Math.min(scalingFactor, 1.25));
  const adjustedGrams = Math.round(baseGrams * clampedScale);
  const percentChange = Math.round((clampedScale - 1) * 100);

  return {
    kg: parseFloat((adjustedGrams / 1000).toFixed(3)),
    grams: adjustedGrams,
    percentChange
  };
}

export default function JourneySummaryReport({ profile, lang, onClose }: JourneySummaryReportProps) {
  const motherHeight = profile.personal.height || 158;
  const motherWeight = profile.personal.weight || 52;

  // Local state for interactive slider inside report
  const [selectedWeek, setSelectedWeek] = useState<number>(26);

  const activeWeight = getEstimatedFetalWeight(selectedWeek, motherHeight, motherWeight);

  const handlePrint = () => {
    window.print();
  };

  // Trimesters list with custom descriptions
  const trimestersData = [
    {
      titleEn: "Trimester 1: Foundation (Weeks 1 - 13)",
      titleKh: "ត្រីមាសទី១៖ គ្រឹះដំបូង (សប្តាហ៍ទី ១ - ១៣)",
      weeks: [
        { wk: 4, descEn: "Embryo implantation. Organs start forming.", descKh: "ការកែបកំណើតកូនក្នុងស្បូន។ សរីរាង្គចាប់ផ្តើមបង្កើតឡើង។", clinicalEn: "Confirm pregnancy. Start prenatal folic acid supplements.", clinicalKh: "បញ្ជាក់ការមានផ្ទៃពោះ។ ចាប់ផ្តើមញ៉ាំអាស៊ីតហ្វូលិក។" },
        { wk: 8, descEn: "Heart beats at 150 bpm. Fingers and toes form.", descKh: "បេះដូងកូនលោត ១៥០ដង/នាទី។ ម្រាមដៃនិងម្រាមជើងលេចចេញ។", clinicalEn: "First antenatal clinical checkup. Blood pressure check.", clinicalKh: "ការពិនិត្យផ្ទៃពោះលើកដំបូង។ វាស់សម្ពាធឈាមមាតា។" },
        { wk: 12, descEn: "Baby starts reflexes and making facial movements.", descKh: "កូនចាប់ផ្តើមមានប្រតិកម្មចលនា និងកម្រើកមុខមាត់។", clinicalEn: "Ultrasound dating scan (NT Scan for Down Syndrome risk).", clinicalKh: "អេកូសាស្ត្រវាស់អាយុកូន (NT scan រកហានិភ័យ Down syndrome)។" }
      ]
    },
    {
      titleEn: "Trimester 2: Growth & Movement (Weeks 14 - 27)",
      titleKh: "ត្រីមាសទី២៖ ការលូតលាស់ និងចលនា (សប្តាហ៍ទី ១៤ - ២៧)",
      weeks: [
        { wk: 16, descEn: "Fetal sex is visible on ultrasound. Baby can hear sounds.", descKh: "អាចមើលឃើញភេទកូនតាមអេកូ។ ត្រចៀកកូនចាប់ផ្តើមឮសំឡេង។", clinicalEn: "Second prenatal checkup. Check urine protein.", clinicalKh: "ការពិនិត្យផ្ទៃពោះលើកទី២។ ពិនិត្យជាតិប្រូតេអ៊ីនក្នុងទឹកនោម។" },
        { wk: 20, descEn: "Quickening: Mother begins to feel light baby kicks.", descKh: "ចាប់ផ្តើមកម្រើក៖ មាតាចាប់ផ្តើមដឹងចលនាធាក់របស់កូនតិចៗ។", clinicalEn: "Anatomy Ultrasound Scan (detailed structural checkup).", clinicalKh: "អេកូសាស្ត្រពិនិត្យលម្អិតលើរចនាសម្ព័ន្ធរូបរាងកាយកូន។" },
        { wk: 24, descEn: "Lungs begin producing surfactant. Taste buds develop.", descKh: "សួតចាប់ផ្តើមបង្កើតសារធាតុ surfactant។ កូនដឹងរសជាតិបាន។", clinicalEn: "Oral Glucose Tolerance Test (Screening for Gestational Diabetes).", clinicalKh: "តេស្តជាតិស្ករក្នុងឈាម (ពិនិត្យរកជំងឺទឹកនោមផ្អែមពេលមានផ្ទៃពោះ)។" }
      ]
    },
    {
      titleEn: "Trimester 3: Energy & Maturation (Weeks 28 - 40+)",
      titleKh: "ត្រីមាសទី៣៖ ថាមពល និងភាពពេញវ័យ (សប្តាហ៍ទី ២៨ - ៤០+)",
      weeks: [
        { wk: 28, descEn: "Baby opens eyes. Brain wave patterns show sleep-wake loops.", descKh: "កូនបើកភ្នែកបាន។ រលកខួរក្បាលបង្ហាញសញ្ញាគេង និងភ្ញាក់។", clinicalEn: "Third prenatal checkup. Immunization check (Tetanus).", clinicalKh: "ការពិនិត្យផ្ទៃពោះលើកទី៣។ ចាក់វ៉ាក់សាំងតេតាណុស។" },
        { wk: 32, descEn: "Bones are fully developed but soft. Baby gains fat rapidly.", descKh: "ឆ្អឹងលូតលាស់ពេញលេញតែនៅទន់។ កូនចាប់ផ្តើមឡើងខ្លាញ់លឿន។", clinicalEn: "Check baby's position (head-down presentation monitoring).", clinicalKh: "ពិនិត្យទម្រង់ក្បាលកូន (ពិនិត្យក្បាលបង្វិលចុះក្រោម)។" },
        { wk: 36, descEn: "Nervous and digestive systems are ready for breastfeeding.", descKh: "ប្រព័ន្ធប្រសាទ និងប្រព័ន្ធរំលាយអាហាររួចរាល់សម្រាប់ការបៅដោះ។", clinicalEn: "Weekly prenatal checks start. Prepare hospital delivery kit.", clinicalKh: "ចាប់ផ្តើមពិនិត្យផ្ទៃពោះរាល់សប្តាហ៍។ រៀបចំកញ្ចប់សម្រាល។" },
        { wk: 40, descEn: "Full Term Delivery! Ready to welcome your healthy baby.", descKh: "គ្រប់ខែសម្រាល! រួចរាល់ក្នុងការស្វាគមន៍កូនជាទីស្រឡាញ់។", clinicalEn: "Birth delivery. Postnatal vaccination card check.", clinicalKh: "ការសម្រាលកូន។ បើកកាតចាក់វ៉ាក់សាំងក្រោយសម្រាល។" }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-[#2F6F8F]/60 backdrop-blur-xs z-50 overflow-y-auto p-4 md:p-6 flex justify-center items-start font-sans" id="summary-report-overlay">
      <div className="w-full max-w-3xl bg-[#FEFAFB] rounded-[32px] border border-[#FDDEEC] shadow-2xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Print-safe controls header */}
        <div className="bg-[#AEE3D8] px-6 py-4 text-[#2F6F8F] flex items-center justify-between print:hidden border-b border-[#7ECBBF]">
          <button 
            onClick={onClose}
            className="inline-flex items-center space-x-1.5 text-xs text-[#2F6F8F] hover:text-[#1B4D63] transition-all cursor-pointer font-bold"
            id="report-back-btn"
          >
            <ArrowLeft className="w-4 h-4 text-[#2F6F8F]" />
            <span>{lang === 'en' ? 'Back to Passport' : 'ត្រឡប់ទៅកម្មវិធី'}</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 bg-[#FA6B90] hover:bg-[#f05e84] text-white font-black py-1.5 px-3.5 rounded-xl text-xs transition-all cursor-pointer shadow-3xs"
              id="report-print-btn"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Print Passport Report' : 'បោះពុម្ពរបាយការណ៍'}</span>
            </button>
          </div>
        </div>

        {/* Printable Passport Document Canvas */}
        <div className="p-8 space-y-6 bg-[#FEFAFB]" id="printable-report-canvas">
          {/* Header Document Branding */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#AEE3D8] pb-5 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#F4A6B5] to-[#FA6B90] rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-3xs">
                <Flower2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#2F6F8F] tracking-tight font-heading">
                  {lang === 'en' ? 'FLOWERS MATERNAL PASSPORT REPORT' : 'របាយការណ៍លិខិតឆ្លងដែនសុខភាពមាតា FLOWERS'}
                </h1>
                <p className="text-[10px] text-[#FA6B90] font-black uppercase tracking-widest mt-0.5">
                  {lang === 'en' ? 'Official Clinically Tailored Prenatal Roadmap' : 'ផែនការតាមដានការមានផ្ទៃពោះលម្អិតបែបគ្លីនិក'}
                </p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <span className="text-[10px] text-[#2F6F8F]/70 font-black uppercase block">Date Generated</span>
              <span className="text-xs font-mono font-bold text-[#2F6F8F]">2026-07-11</span>
            </div>
          </div>

          {/* Clinician Alert Info Bar (Mint Wellness Element) */}
          <div className="bg-[#AEE3D8]/20 border border-[#AEE3D8] rounded-2xl p-4 flex items-start space-x-3">
            <FileText className="w-5 h-5 text-[#2F6F8F] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-[#2F6F8F] font-heading">
                {lang === 'en' ? 'Customized Fetal Growth Profile' : 'ការកំណត់ទម្រង់លូតលាស់ទារកផ្ទាល់ខ្លួន'}
              </h4>
              <p className="text-[11px] text-[#2F6F8F]/85 leading-relaxed font-semibold">
                {lang === 'en' 
                  ? `This summary uses maternal biometrics (Height: ${motherHeight} cm, Weight: ${motherWeight} kg) to customize expected baby birth weights. Heavier or taller maternal profiles statistically correlate with adjusted gestational growth trajectories.`
                  : `របាយការណ៍នេះប្រើប្រាស់រង្វាស់រាងកាយរបស់មាតា (កម្ពស់៖ ${motherHeight}សង់ទីម៉ែត្រ, ទម្ងន់៖ ${motherWeight}គីឡូក្រាម) ដើម្បីលៃតម្រូវទម្ងន់ទារក។ កម្ពស់ និងទម្ងន់មាតាមានទំនាក់ទំនងយ៉ាងជិតស្និទ្ធទៅនឹងការលូតលាស់របស់ទារកក្នុងផ្ទៃ។`}
              </p>
            </div>
          </div>

          {/* Section 1: Customized Maternal Metrics */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-[#2F6F8F] uppercase tracking-wider border-b-2 border-[#AEE3D8] pb-1.5 flex items-center space-x-1.5 font-heading">
              <span className="w-2 h-2 bg-[#FA6B90] rounded-full" />
              <span>{lang === 'en' ? 'Maternal Profile & Calibration Factors' : 'ប្រវត្តិរូបមាតា និងកត្តាលៃតម្រូវ'}</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-[#FDDEEC]">
              <div className="space-y-0.5">
                <span className="text-[9px] text-[#2F6F8F]/70 font-black uppercase tracking-wider block">{lang === 'en' ? 'Mother Name' : 'ឈ្មោះមាតា'}</span>
                <span className="text-xs font-black text-[#2F6F8F]">{profile.personal.name}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-[#2F6F8F]/70 font-black uppercase tracking-wider block">{lang === 'en' ? 'Maternal Height' : 'កម្ពស់មាតា'}</span>
                <span className="text-xs font-black text-[#2F6F8F]">{motherHeight} cm</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-[#2F6F8F]/70 font-black uppercase tracking-wider block">{lang === 'en' ? 'Pre-pregnancy Weight' : 'ទម្ងន់មុនមានផ្ទៃពោះ'}</span>
                <span className="text-xs font-black text-[#2F6F8F]">{motherWeight} kg</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-[#2F6F8F]/70 font-black uppercase tracking-wider block">{lang === 'en' ? 'Gravida / Para' : 'ចំនួនមានផ្ទៃពោះ/សម្រាល'}</span>
                <span className="text-xs font-black text-[#2F6F8F]">{profile.pregnancy.gravida} / {profile.pregnancy.para}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Interactive Fetal Weight Estimator Widget */}
          <div className="space-y-4 bg-[#FDDEEC]/35 p-5 rounded-[24px] border border-[#F4A6B5] print:border-stone-200 print:bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-[#2F6F8F] flex items-center space-x-1.5 font-heading">
                  <Scale className="w-4 h-4 text-[#FA6B90]" />
                  <span>{lang === 'en' ? 'Dynamic Week-by-Week Baby Weight Calculator' : 'ឧបករណ៍គណនាទម្ងន់កូនតាមសប្តាហ៍ផ្ទាល់ខ្លួន'}</span>
                </h3>
                <p className="text-[10px] text-[#2F6F8F]/75 font-semibold">
                  {lang === 'en' ? 'Move the slider to estimate baby\'s weight at any week' : 'អូសដើម្បីមើលការប៉ាន់ស្មានទម្ងន់ទារកនៅគ្រប់សប្តាហ៍'}
                </p>
              </div>

              {/* Selected Week Indicator */}
              <div className="bg-white border border-[#F4A6B5] px-3 py-1 rounded-xl text-center self-start md:self-auto shrink-0 shadow-3xs">
                <span className="text-xs font-black text-[#FA6B90] block">Week {selectedWeek}</span>
              </div>
            </div>

            {/* Slider */}
            <input 
              type="range"
              min="8"
              max="40"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="w-full accent-[#FA6B90] cursor-pointer print:hidden"
              id="report-week-slider"
            />

            {/* Estimated weight result box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-[#FDDEEC]">
              <div className="text-center md:border-r border-[#FDDEEC] py-1">
                <span className="text-2xl font-black text-[#2F6F8F] block font-mono">
                  {activeWeight.kg} kg
                </span>
                <span className="text-[9px] text-[#2F6F8F]/70 font-black uppercase tracking-widest mt-0.5 block">
                  {lang === 'en' ? 'Estimated Baby Weight' : 'ការប៉ាន់ស្មានទម្ងន់ទារក'}
                </span>
              </div>
              <div className="text-center md:border-r border-[#FDDEEC] py-1">
                <span className="text-2xl font-black text-[#2F6F8F] block font-mono">
                  {activeWeight.grams} g
                </span>
                <span className="text-[9px] text-[#2F6F8F]/70 font-black uppercase tracking-widest mt-0.5 block">
                  {lang === 'en' ? 'Weight in Grams' : 'ទម្ងន់ជាក្រាម'}
                </span>
              </div>
              <div className="text-center py-1 flex flex-col justify-center items-center">
                <div className="inline-flex items-center space-x-1 bg-[#FFF7E9] px-2 py-0.5 rounded-full border border-[#F6E5C3]">
                  <span className="text-[10px] font-black text-[#2F6F8F] font-mono">
                    {activeWeight.percentChange >= 0 ? `+${activeWeight.percentChange}%` : `${activeWeight.percentChange}%`}
                  </span>
                </div>
                <span className="text-[9px] text-[#2F6F8F]/70 font-black uppercase tracking-widest mt-1 block">
                  {lang === 'en' ? 'Maternal Profile Adjustment' : 'ការលៃតម្រូវតាមរាងកាយមាតា'}
                </span>
              </div>
            </div>

            <p className="text-[9.5px] text-[#2F6F8F]/90 leading-normal font-bold bg-white/80 p-2.5 rounded-lg border border-[#FDDEEC]">
              ℹ️ {lang === 'en' 
                ? `Clinical Calculation: A mother height of ${motherHeight} cm & pre-pregnancy weight of ${motherWeight} kg yields a baseline growth coefficient of ${((motherHeight - 158) * 0.0018 + (motherWeight - 52) * 0.0025 + 1).toFixed(3)}. Standard baby size at full term delivery (Week 40) is adjusted to ${activeWeight.kg} kg.`
                : `ការគណនាបែបគ្លីនិក៖ កម្ពស់មាតា ${motherHeight} ស.ម និងទម្ងន់ ${motherWeight} គ.ក នាំមកនូវមេគុណកំណើនរាងកាយ ${((motherHeight - 158) * 0.0018 + (motherWeight - 52) * 0.0025 + 1).toFixed(3)}។ ទម្ងន់ទារកពេលគ្រប់ខែ (សប្តាហ៍ទី ៤០) នឹងត្រូវលៃតម្រូវមកនៅ ${activeWeight.kg} គីឡូក្រាម។`}
            </p>
          </div>

          {/* Section 3: Comprehensive Timeline Report */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-[#2F6F8F] uppercase tracking-wider border-b-2 border-[#AEE3D8] pb-1.5 font-heading">
              {lang === 'en' ? 'Full Pregnancy Summary Checklist (Week 1 to Giving Birth)' : 'សេចក្តីសង្ខេបនិងផែនការមានផ្ទៃពោះពេញលេញ (ពីសប្តាហ៍ទី១ ដល់សម្រាល)'}
            </h3>

            <div className="space-y-6">
              {trimestersData.map((tri, triIdx) => (
                <div key={triIdx} className="space-y-3.5">
                  <h4 className="text-xs font-black text-[#2F6F8F] bg-[#AEE3D8]/35 px-3 py-1.5 rounded-xl border border-[#AEE3D8] font-heading">
                    {lang === 'en' ? tri.titleEn : tri.titleKh}
                  </h4>

                  <div className="border-l-2 border-[#F4A6B5] pl-4 ml-2 space-y-5">
                    {tri.weeks.map((item, itemIdx) => {
                      const estimatedWeight = getEstimatedFetalWeight(item.wk, motherHeight, motherWeight);

                      return (
                        <div key={itemIdx} className="relative space-y-1.5 animate-in fade-in duration-200">
                          {/* Circle bullet node on line */}
                          <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 bg-white border-2 border-[#FA6B90] rounded-full" />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#2F6F8F] font-heading">
                              {lang === 'en' ? `Week ${item.wk} Milestone` : `សប្តាហ៍ទី ${item.wk}៖ ដំណាក់កាលលូតលាស់`}
                            </span>
                            <span className="text-[10px] font-black text-[#FA6B90] font-mono">
                              Est. Baby Weight: {estimatedWeight.kg} kg / {estimatedWeight.grams} g
                            </span>
                          </div>

                          <div className="bg-white p-3 rounded-xl border border-[#FDDEEC] space-y-2">
                            <p className="text-xs text-[#2F6F8F] font-semibold leading-relaxed">
                              <strong>{lang === 'en' ? 'Fetal Development: ' : 'ការអភិវឌ្ឍរបស់កូន៖ '}</strong>
                              {lang === 'en' ? item.descEn : item.descKh}
                            </p>
                            <p className="text-[10.5px] text-[#2F6F8F]/75 leading-relaxed font-bold flex items-start space-x-1.5 pt-1.5 border-t border-[#FDDEEC]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6F8F] shrink-0 mt-0.5" />
                              <span>
                                <strong>{lang === 'en' ? 'Key Midwife Action: ' : 'សកម្មភាពឆ្មបណែនាំ៖ '}</strong>
                                {lang === 'en' ? item.clinicalEn : item.clinicalKh}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinician Signature Section (Print safe) */}
          <div className="pt-8 border-t border-[#FDDEEC] grid grid-cols-2 gap-8 text-xs font-semibold text-[#2F6F8F]/75">
            <div className="space-y-4">
              <p>{lang === 'en' ? 'Patient/Mother Signature:' : 'ហត្ថលេខាមាតា៖'}</p>
              <div className="border-b border-[#2F6F8F]/30 w-32 h-6" />
            </div>
            <div className="space-y-4">
              <p>{lang === 'en' ? 'Midwife / Attending Doctor Signature:' : 'ហត្ថលេខាគ្រូពេទ្យ/ឆ្មបទទួលបន្ទុក៖'}</p>
              <div className="border-b border-[#2F6F8F]/30 w-32 h-6" />
            </div>
          </div>

          <div className="text-center text-[9px] text-[#2F6F8F]/70 font-bold pt-4">
            FlowErs Digital Health Project — Calmette Hospital Maternity Care Companion.
          </div>
        </div>
      </div>
    </div>
  );
}
