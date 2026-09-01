/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Plus, Check, Trash2, MapPin, 
  User, CheckCircle2, AlertCircle, X, ChevronRight, ChevronLeft,
  Bell, Tag, Flower2, Filter, Info, Edit3
} from 'lucide-react';
import { Appointment } from '../types';
import { TRANSLATIONS } from '../data';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onAddAppointment: (appt: Appointment) => void;
  onToggleComplete: (id: string) => void;
  onDeleteAppointment: (id: string) => void;
  lang: 'en' | 'kh';
}

const APPOINTMENT_TYPES: { id: Appointment['type']; labelEn: string; labelKh: string; emoji: string; iconColor: string }[] = [
  { id: 'ANC', labelEn: 'Routine ANC Checkup', labelKh: 'ពិនិត្យផ្ទៃពោះប្រចាំខែ', emoji: '🩺', iconColor: '#2F6F8F' },
  { id: 'Ultrasound', labelEn: 'Ultrasound Scan', labelKh: 'អេកូស្កេន', emoji: '🌸', iconColor: '#FA6B90' },
  { id: 'Blood Test', labelEn: 'Lab / Blood Test', labelKh: 'តេស្តឈាម & ទឹកនោម', emoji: '🧪', iconColor: '#2F6F8F' },
  { id: 'Vaccine', labelEn: 'Vaccine Injection', labelKh: 'ចាក់វ៉ាក់សាំង', emoji: '💉', iconColor: '#FA6B90' },
  { id: 'Specialist', labelEn: 'Specialist Consultation', labelKh: 'ពិគ្រោះជាមួយគ្រូពេទ្យឯកទេស', emoji: '👩‍⚕️', iconColor: '#2F6F8F' },
  { id: 'Other', labelEn: 'Other Checkup', labelKh: 'ការពិនិត្យផ្សេងៗ', emoji: '📋', iconColor: '#2F6F8F' }
];

const REMINDER_OPTIONS: { id: NonNullable<Appointment['reminder']>; labelEn: string; labelKh: string }[] = [
  { id: '1_week', labelEn: '1 week before', labelKh: '១ សប្តាហ៍មុន' },
  { id: '3_days', labelEn: '3 days before', labelKh: '៣ ថ្ងៃមុន' },
  { id: '1_day', labelEn: '1 day before', labelKh: '១ ថ្ងៃមុន' },
  { id: 'same_day', labelEn: 'Morning of appointment', labelKh: 'ព្រឹកថ្ងៃណាត់ជួប' },
  { id: 'custom', labelEn: 'Custom reminder', labelKh: 'ការរំលឹកពិសេស' },
  { id: 'none', labelEn: 'No reminder', labelKh: 'មិនបាច់រំលឹក' }
];

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_KH = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_KH = ['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ'];

// Helper to format Date as YYYY-MM-DD
function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convert numbers to Khmer numerals
function toKhmerNumber(num: number | string): string {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).replace(/\d/g, (d) => khmerDigits[parseInt(d, 10)]);
}

export default function AppointmentsView({
  appointments,
  onAddAppointment,
  onToggleComplete,
  onDeleteAppointment,
  lang
}: AppointmentsViewProps) {
  const t = TRANSLATIONS[lang];

  // Calendar View Mode: 'month' | 'week'
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Currently navigated Year/Month in Month View (default to September 2026 or current active date)
  const [currentDate, setCurrentDate] = useState(() => {
    // Check if there are appointments in Sept 2026, default around 2026-09-01
    return new Date(2026, 8, 1); // September 2026
  });

  // Selected single date for inspecting appointments (default to 2026-09-04 or today)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-04');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApptId, setEditingApptId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('2026-09-04');
  const [formTime, setFormTime] = useState('09:00');
  const [formHospital, setHospital] = useState('');
  const [formDoctor, setDoctor] = useState('');
  const [formType, setType] = useState<Appointment['type']>('ANC');
  const [formNotes, setNotes] = useState('');
  const [formReminder, setFormReminder] = useState<Appointment['reminder']>('1_day');

  // Today Date string
  const todayStr = useMemo(() => formatDateToISO(new Date(2026, 8, 1)), []);

  // Quick helper: appointments mapped by date string
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const appt of appointments) {
      if (!map[appt.date]) {
        map[appt.date] = [];
      }
      map[appt.date].push(appt);
    }
    return map;
  }, [appointments]);

  // Upcoming vs Completed
  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter(a => !a.completed)
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime());
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments
      .filter(a => a.completed)
      .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());
  }, [appointments]);

  // Appointments on currently selected date
  const selectedDateAppointments = useMemo(() => {
    return appointmentsByDate[selectedDateStr] || [];
  }, [appointmentsByDate, selectedDateStr]);

  // Month navigation
  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIdx - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIdx + 1, 1));
  };

  const handleGoToToday = () => {
    const d = new Date(2026, 8, 4); // September 4, 2026 demo anchor
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelectedDateStr(formatDateToISO(d));
  };

  // Week navigation
  const startOfWeek = useMemo(() => {
    const ref = new Date(selectedDateStr || '2026-09-04');
    const day = ref.getDay(); // 0 is Sun, 1 is Mon
    const diff = (day === 0 ? -6 : 1) - day; // Adjust to Monday
    const mon = new Date(ref);
    mon.setDate(ref.getDate() + diff);
    return mon;
  }, [selectedDateStr]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [startOfWeek]);

  const handlePrevWeek = () => {
    const prev = new Date(startOfWeek);
    prev.setDate(prev.getDate() - 7);
    setSelectedDateStr(formatDateToISO(prev));
    setCurrentDate(new Date(prev.getFullYear(), prev.getMonth(), 1));
  };

  const handleNextWeek = () => {
    const next = new Date(startOfWeek);
    next.setDate(next.getDate() + 7);
    setSelectedDateStr(formatDateToISO(next));
    setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  // Compute Days for Monthly Grid (Monday start)
  const calendarMonthGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonthIdx + 1, 0);
    
    // Day of week: 0=Sun, 1=Mon, ..., 6=Sat
    // We want Monday as col 0 (Mon=0, Tue=1, ..., Sun=6)
    let startDayCol = firstDayOfMonth.getDay() - 1;
    if (startDayCol < 0) startDayCol = 6; // Sunday becomes 6

    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Preceding days from previous month
    const prevMonthLastDate = new Date(currentYear, currentMonthIdx, 0).getDate();
    for (let i = startDayCol - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDate - i;
      const d = new Date(currentYear, currentMonthIdx - 1, dayNum);
      days.push({
        date: d,
        dateStr: formatDateToISO(d),
        isCurrentMonth: false
      });
    }

    // Days in current month
    const totalDays = lastDayOfMonth.getDate();
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(currentYear, currentMonthIdx, i);
      days.push({
        date: d,
        dateStr: formatDateToISO(d),
        isCurrentMonth: true
      });
    }

    // Trailing days from next month to complete standard 35 or 42 grid
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(currentYear, currentMonthIdx + 1, i);
        days.push({
          date: d,
          dateStr: formatDateToISO(d),
          isCurrentMonth: false
        });
      }
    }

    return days;
  }, [currentYear, currentMonthIdx]);

  // Open Modal for New Appointment
  const handleOpenAddModal = (presetDate?: string) => {
    setEditingApptId(null);
    setFormTitle('');
    setFormDate(presetDate || selectedDateStr || formatDateToISO(new Date(2026, 8, 4)));
    setFormTime('09:00');
    setHospital('');
    setDoctor('');
    setType('ANC');
    setNotes('');
    setFormReminder('1_day');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (appt: Appointment) => {
    setEditingApptId(appt.id);
    setFormTitle(appt.title || '');
    setFormDate(appt.date);
    setFormTime(appt.time || '09:00');
    setHospital(appt.hospital);
    setDoctor(appt.doctor || '');
    setType(appt.type);
    setNotes(appt.notes || '');
    setFormReminder(appt.reminder || '1_day');
    setIsModalOpen(true);
  };

  // Save or Update Appointment
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHospital.trim()) return;

    const defaultTitle = APPOINTMENT_TYPES.find(t => t.id === formType)?.[lang === 'en' ? 'labelEn' : 'labelKh'] || 'Prenatal Checkup';

    if (editingApptId) {
      // Edit existing
      onDeleteAppointment(editingApptId);
      const updatedAppt: Appointment = {
        id: editingApptId,
        title: formTitle.trim() || defaultTitle,
        date: formDate,
        time: formTime,
        hospital: formHospital.trim(),
        doctor: formDoctor.trim() || (lang === 'en' ? 'Attending Healthcare Provider' : 'គ្រូពេទ្យពិនិត្យ'),
        notes: formNotes.trim(),
        completed: false,
        type: formType,
        reminder: formReminder
      };
      onAddAppointment(updatedAppt);
    } else {
      // Create new
      const newAppt: Appointment = {
        id: `appt-${Date.now()}`,
        title: formTitle.trim() || defaultTitle,
        date: formDate,
        time: formTime,
        hospital: formHospital.trim(),
        doctor: formDoctor.trim() || (lang === 'en' ? 'Attending Healthcare Provider' : 'គ្រូពេទ្យពិនិត្យ'),
        notes: formNotes.trim(),
        completed: false,
        type: formType,
        reminder: formReminder
      };
      onAddAppointment(newAppt);
    }

    // Set selected date to the appointment date so the user immediately sees it
    setSelectedDateStr(formDate);
    const dateObj = new Date(formDate);
    setCurrentDate(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));

    setIsModalOpen(false);
  };

  // Friendly Date string formatted for details banner
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDateStr) return '';
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = (dateObj.getDay() + 6) % 7; // Mon=0, Sun=6

    if (lang === 'kh') {
      return `ថ្ងៃ${WEEKDAYS_KH[dayOfWeek]} ទី ${toKhmerNumber(d)} ខែ ${MONTHS_KH[m - 1]} ឆ្នាំ ${toKhmerNumber(y)}`;
    }
    return `${WEEKDAYS_EN[dayOfWeek]}, ${MONTHS_EN[m - 1]} ${d}, ${y}`;
  }, [selectedDateStr, lang]);

  // Week range label
  const weekRangeLabel = useMemo(() => {
    if (!weekDays.length) return '';
    const first = weekDays[0];
    const last = weekDays[6];

    if (lang === 'kh') {
      return `${toKhmerNumber(first.getDate())} ${MONTHS_KH[first.getMonth()]} – ${toKhmerNumber(last.getDate())} ${MONTHS_KH[last.getMonth()]} ${toKhmerNumber(last.getFullYear())}`;
    }
    const m1 = MONTHS_EN[first.getMonth()].slice(0, 3);
    const m2 = MONTHS_EN[last.getMonth()].slice(0, 3);
    if (m1 === m2) {
      return `${m1} ${first.getDate()} – ${last.getDate()}, ${last.getFullYear()}`;
    }
    return `${m1} ${first.getDate()} – ${m2} ${last.getDate()}, ${last.getFullYear()}`;
  }, [weekDays, lang]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200" id="appointments-calendar-container">
      
      
      {/* 1. TOP HEADER & PRIMARY ACTION */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3.5 rounded-[20px] border border-[#FDDEEC] shadow-3xs">

  <div className="space-y-0.5 min-w-0">
    <div className="flex items-center space-x-2">
      <div className="w-7 h-7 rounded-lg bg-[#AEE3D8]/35 border border-[#7ECBBF] text-[#2F6F8F] flex items-center justify-center shrink-0">
        <CalendarIcon className="w-4 h-4" />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm sm:text-base font-black text-[#2F6F8F] tracking-tight font-heading truncate">
          {lang === 'en' ? 'Maternal Calendar & Schedule' : 'ប្រតិទិន និងកាលវិភាគពិនិត្យផ្ទៃពោះ'}
        </h3>

        <p className="text-[9px] text-[#2F6F8F]/70 font-semibold truncate">
          {lang === 'en'
            ? 'Interactive pregnancy journal for prenatal visits & reminders'
            : 'កំណត់ត្រាផ្ទាល់ខ្លួនសម្រាប់តាមដានការពិនិត្យផ្ទៃពោះ និងការរំលឹក'}
        </p>
      </div>
    </div>
  </div>

  {/* Compact Controls */}
  <div className="flex items-center gap-1.5 shrink-0">

    {/* Month / Week Toggle */}
    <div className="bg-[#FEFAFB] p-0.5 rounded-xl border border-[#AEE3D8] flex items-center">
      <button
        onClick={() => setViewMode('month')}
        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
          viewMode === 'month'
            ? 'bg-[#AEE3D8] text-[#2F6F8F] shadow-2xs border border-[#7ECBBF]'
            : 'text-[#2F6F8F]/70 hover:text-[#2F6F8F]'
        }`}
        id="btn-toggle-month-view"
      >
        {lang === 'en' ? 'Month' : 'ខែ'}
      </button>

      <button
        onClick={() => setViewMode('week')}
        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
          viewMode === 'week'
            ? 'bg-[#AEE3D8] text-[#2F6F8F] shadow-2xs border border-[#7ECBBF]'
            : 'text-[#2F6F8F]/65 hover:text-[#2F6F8F]'
        }`}
        id="btn-toggle-week-view"
      >
        {lang === 'en' ? 'Week' : 'សប្តាហ៍'}
      </button>
    </div>

    {/* Add Appointment */}
    <button
      onClick={() => handleOpenAddModal(selectedDateStr)}
      className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[8px] font-bold bg-[#FA6B90] hover:bg-[#f05e84] text-white shadow-3xs transition-colors cursor-pointer shrink-0"
      id="btn-add-appointment"
    >
      <Plus className="w-3.5 h-3.5 stroke-[3]" />
      <span>{lang === 'en' ? 'Add Checkup' : 'បន្ថែមការណាត់'}</span>
    </button>

  </div>
</div>

      {/* 2. MAIN CALENDAR CARD (MONTHLY OR WEEKLY) */}
      <div className="bg-white rounded-[24px] border-2 border-[#AEE3D8] p-3 sm:p-4 shadow-2xs space-y-3.5">
        
        {/* Navigation Bar: Month/Week Header + Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-[#FDDEEC]">
          <div className="flex items-center space-x-2">
            <h4 className="text-base sm:text-base font-black text-[#2F6F8F] font-heading tracking-tight flex items-center space-x-1.5">
              <Flower2 className="w-4 h-4 text-[#FA6B90]" />
              <span>
                {viewMode === 'month'
                  ? (lang === 'en' 
                      ? `${MONTHS_EN[currentMonthIdx]} ${currentYear}`
                      : `ខែ ${MONTHS_KH[currentMonthIdx]} ឆ្នាំ ${toKhmerNumber(currentYear)}`)
                  : weekRangeLabel
                }
              </span>
            </h4>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleGoToToday}
              className="px-2.5 py-1 text-[10px] font-black text-[#2F6F8F] bg-[#AEE3D8]/30 hover:bg-[#AEE3D8]/60 border border-[#AEE3D8] rounded-xl cursor-pointer transition-colors"
              title="Jump to Today"
              id="btn-calendar-today"
            >
              {lang === 'en' ? 'Today' : 'ថ្ងៃនេះ'}
            </button>

            <button
              onClick={viewMode === 'month' ? handlePrevMonth : handlePrevWeek}
              className="p-1.5 rounded-xl bg-[#FEFAFB] hover:bg-[#AEE3D8]/30 border border-[#FDDEEC] text-[#2F6F8F] cursor-pointer transition-colors"
              title={viewMode === 'month' ? 'Previous Month' : 'Previous Week'}
              id="btn-calendar-prev"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={viewMode === 'month' ? handleNextMonth : handleNextWeek}
              className="p-1.5 rounded-xl bg-[#FEFAFB] hover:bg-[#AEE3D8]/30 border border-[#FDDEEC] text-[#2F6F8F] cursor-pointer transition-colors"
              title={viewMode === 'month' ? 'Next Month' : 'Next Week'}
              id="btn-calendar-next"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* VIEW MODE A: MONTHLY VIEW */}
        {viewMode === 'month' && (
          <div className="space-y-2">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-heading font-black text-[11px] sm:text-xs text-[#2F6F8F]/80 pb-1">
              {(lang === 'en' ? WEEKDAYS_EN : WEEKDAYS_KH).map((day, idx) => (
                <div key={idx} className="py-1">
                  <span className={idx >= 5 ? 'text-[#FA6B90]' : ''}>{day}</span>
                </div>
              ))}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarMonthGrid.map((cell, idx) => {
                const isSelected = cell.dateStr === selectedDateStr;
                const isToday = cell.dateStr === todayStr;
                const apptsOnDate = appointmentsByDate[cell.dateStr] || [];
                const hasAppt = apptsOnDate.length > 0;
                const hasUltrasound = apptsOnDate.some(a => a.type === 'Ultrasound');
                const hasANC = apptsOnDate.some(a => a.type === 'ANC');

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`min-h-[48px] sm:min-h-[58px] p-1 rounded-xl flex flex-col justify-between items-center transition-all cursor-pointer relative border ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#FA6B90] to-[#F4A6B5] text-white border-[#FA6B90] shadow-sm scale-[1.02] z-10'
                        : isToday
                        ? 'bg-[#AEE3D8]/25 border-2 border-[#7ECBBF] text-[#2F6F8F]'
                        : cell.isCurrentMonth
                        ? 'bg-[#FEFAFB] hover:bg-[#FDDEEC]/40 border-[#FDDEEC] text-[#2F6F8F]'
                        : 'bg-gray-50/40 text-gray-300 border-transparent hover:bg-gray-50'
                    }`}
                    id={`cal-date-${cell.dateStr}`}
                  >
                    {/* Top Row: Date Number */}
                    <div className="w-full flex items-center justify-between px-1">
                      <span className={`text-xs sm:text-sm font-black font-mono leading-none ${
                        isSelected 
                          ? 'text-white font-bold' 
                          : isToday 
                          ? 'text-[#2F6F8F] font-black' 
                          : cell.isCurrentMonth 
                          ? 'text-[#2F6F8F]' 
                          : 'text-[#CFADB9]'
                      }`}>
                        {lang === 'kh' ? toKhmerNumber(cell.date.getDate()) : cell.date.getDate()}
                      </span>

                      {isToday && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7ECBBF]" title="Today" />
                      )}
                    </div>

                    {/* Bottom Indicator for Appointments */}
                    <div className="w-full flex items-center justify-center gap-1 min-h-[20px]">
                      {hasAppt && (
                        <div className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isSelected
                            ? 'bg-white/30 text-white backdrop-blur-2xs'
                            : 'bg-[#FFF7E9] text-[#FA6B90] border border-[#F4A6B5] shadow-3xs'
                        }`}>
                          <span className="text-[11px] leading-none">
                            {hasUltrasound ? '🌸' : hasANC ? '🩺' : '📅'}
                          </span>
                          {apptsOnDate.length > 1 && (
                            <span className="text-[9px] font-mono leading-none">
                              {apptsOnDate.length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW MODE B: WEEKLY VIEW WITH TIME-BASED LAYOUT */}
        {viewMode === 'week' && (
          <div className="space-y-4">
            {/* 7-Day Quick Strip */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {weekDays.map((d, idx) => {
                const dateStr = formatDateToISO(d);
                const isSelected = dateStr === selectedDateStr;
                const isToday = dateStr === todayStr;
                const appts = appointmentsByDate[dateStr] || [];

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`py-2 px-1 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                      isSelected
                        ? 'bg-[#FA6B90] text-white border-[#FA6B90] shadow-sm'
                        : isToday
                        ? 'bg-[#AEE3D8]/30 text-[#2F6F8F] border-2 border-[#7ECBBF]'
                        : 'bg-[#FEFAFB] hover:bg-[#FDDEEC]/40 text-[#2F6F8F] border-[#FDDEEC]'
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-85">
                      {lang === 'en' ? WEEKDAYS_EN[idx] : WEEKDAYS_KH[idx]}
                    </span>
                    <span className="text-sm sm:text-base font-black font-mono">
                      {lang === 'kh' ? toKhmerNumber(d.getDate()) : d.getDate()}
                    </span>
                    <div className="h-4 flex items-center justify-center">
                      {appts.length > 0 && (
                        <span className="text-xs">
                          {appts.some(a => a.type === 'Ultrasound') ? '🌸' : '🩺'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Time-based layout for the selected week */}
            <div className="bg-[#FEFAFB] rounded-2xl border border-[#FDDEEC] p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#FDDEEC]">
                <span className="text-xs font-black text-[#2F6F8F] font-heading flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FA6B90]" />
                  <span>{lang === 'en' ? 'Time-Based Schedule' : 'កាលវិភាគតាមពេលវេលា'}</span>
                </span>
                <span className="text-[10px] text-[#2F6F8F]/75 font-semibold">
                  {selectedDateFormatted}
                </span>
              </div>

              {/* Time Slots (08:00 to 17:00) */}
              <div className="space-y-2">
                {[
                  '08:00', '09:00', '10:00', '11:00', '12:00', 
                  '13:00', '14:00', '15:00', '16:00', '17:00'
                ].map((hour) => {
                  // Find appointments around this hour on selected date
                  const matchingAppts = selectedDateAppointments.filter(a => {
                    const apptHour = (a.time || '09:00').split(':')[0];
                    return apptHour === hour.split(':')[0];
                  });

                  return (
                    <div key={hour} className="flex items-start space-x-3 py-1.5 border-b border-[#FDDEEC]/60 last:border-0">
                      <span className="w-12 text-[11px] font-mono font-bold text-[#2F6F8F]/70 pt-1 shrink-0">
                        {hour}
                      </span>

                      <div className="flex-1 min-h-[34px]">
                        {matchingAppts.length > 0 ? (
                          <div className="space-y-1.5">
                            {matchingAppts.map(appt => (
                              <div
                                key={appt.id}
                                className="bg-white border border-[#AEE3D8] hover:border-[#7ECBBF] rounded-xl p-2.5 flex items-center justify-between shadow-3xs"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">
                                    {appt.type === 'Ultrasound' ? '🌸' : appt.type === 'ANC' ? '🩺' : '🧪'}
                                  </span>
                                  <div>
                                    <h5 className="text-xs font-black text-[#2F6F8F]">
                                      {appt.title || appt.type}
                                    </h5>
                                    <p className="text-[10px] text-[#2F6F8F]/75 font-medium">
                                      {appt.time} • {appt.hospital}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleOpenEditModal(appt)}
                                  className="text-[10.5px] font-bold text-[#2F6F8F] hover:text-[#FA6B90] p-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setFormTime(hour);
                              handleOpenAddModal(selectedDateStr);
                            }}
                            className="h-8 rounded-xl border border-dashed border-[#FDDEEC] hover:border-[#AEE3D8] hover:bg-[#AEE3D8]/10 flex items-center justify-start px-2 text-[10px] text-[#CFADB9] hover:text-[#2F6F8F] cursor-pointer transition-colors"
                          >
                            <span>+ {lang === 'en' ? 'Add checkup at' : 'បន្ថែមការណាត់ម៉ោង'} {hour}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. SELECTED DATE APPOINTMENTS DETAIL CARD */}
      <div className="bg-white rounded-[26px] border border-[#FDDEEC] p-4.5 sm:p-5 shadow-3xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#AEE3D8]">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-[#FA6B90] text-white flex items-center justify-center text-xs">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#2F6F8F] font-heading">
                {lang === 'en' ? 'Selected Date Details' : 'ព័ត៌មានលម្អិតថ្ងៃបានជ្រើសរើស'}
              </h4>
              <p className="text-[11px] font-black text-[#FA6B90]">
                {selectedDateFormatted}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddModal(selectedDateStr)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#AEE3D8]/40 hover:bg-[#AEE3D8] text-[#2F6F8F] border border-[#7ECBBF] text-xs font-black cursor-pointer transition-all shadow-3xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Add for this day' : 'បន្ថែមសម្រាប់ថ្ងៃនេះ'}</span>
          </button>
        </div>

        {selectedDateAppointments.length === 0 ? (
          <div className="bg-[#FEFAFB] rounded-2xl border border-dashed border-[#F4A6B5]/60 p-5 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#FFF7E9] text-[#FA6B90] flex items-center justify-center text-lg">
              🌸
            </div>
            <p className="text-xs text-[#2F6F8F]/80 font-bold">
              {lang === 'en' 
                ? 'No checkups scheduled for this date.' 
                : 'មិនមានការណាត់ជួបសម្រាប់ថ្ងៃនេះឡើយ។'}
            </p>
            <p className="text-[11px] text-[#2F6F8F]/60 max-w-xs mx-auto">
              {lang === 'en'
                ? 'Tap the button above or "+ Add Checkup" to schedule your next ANC visit, ultrasound, or vaccine.'
                : 'ចុចប៊ូតុងខាងលើ ឬ "+ បន្ថែមការណាត់" ដើម្បីកំណត់កាលវិភាគពិនិត្យផ្ទៃពោះ អេកូស្កេន ឬចាក់វ៉ាក់សាំង។'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateAppointments.map(appt => {
              const reminderObj = REMINDER_OPTIONS.find(r => r.id === appt.reminder);
              const typeInfo = APPOINTMENT_TYPES.find(t => t.id === appt.type);

              return (
                <div 
                  key={appt.id}
                  className={`bg-[#FEFAFB] border rounded-2xl p-4 transition-all shadow-3xs space-y-3 ${
                    appt.completed 
                      ? 'border-gray-200 opacity-75' 
                      : 'border-[#AEE3D8] hover:border-[#7ECBBF]'
                  }`}
                  id={`selected-appt-${appt.id}`}
                >
                  {/* Card Header: Type Badge, Time, & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[9.5px] font-black uppercase bg-[#AEE3D8] text-[#2F6F8F] border border-[#7ECBBF] flex items-center space-x-1">
                          <span>{typeInfo?.emoji || '🌸'}</span>
                          <span>{appt.type}</span>
                        </span>
                        
                        <span className="text-[11px] font-mono font-black text-[#2F6F8F] flex items-center space-x-1 bg-white px-2 py-0.5 rounded-md border border-[#FDDEEC]">
                          <Clock className="w-3 h-3 text-[#FA6B90]" />
                          <span>{appt.time}</span>
                        </span>

                        {appt.reminder && appt.reminder !== 'none' && (
                          <span className="text-[9.5px] font-bold text-[#2F6F8F] bg-[#FFF7E9] border border-[#F6E5C3] px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <Bell className="w-2.5 h-2.5 text-[#FA6B90]" />
                            <span>{lang === 'en' ? reminderObj?.labelEn : reminderObj?.labelKh}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-[#2F6F8F] font-heading pt-0.5">
                        {appt.title || (typeInfo ? (lang === 'en' ? typeInfo.labelEn : typeInfo.labelKh) : appt.hospital)}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => onToggleComplete(appt.id)}
                        className={`flex items-center space-x-1 px-2 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-xs ${
                          appt.completed
                            ? 'bg-[#AEE3D8] text-[#2F6F8F] border border-[#7ECBBF]'
                            : 'bg-white hover:bg-[#AEE3D8]/20 text-[#2F6F8F] border border-[#AEE3D8]'
                        }`}
                        title={appt.completed ? 'Mark incomplete' : 'Mark completed'}
                      >
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>{appt.completed ? (lang === 'en' ? 'Done' : 'រួចរាល់') 
                        : (lang === 'en' ? 'Mark' : 'សម្គាល់')}
                        </span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(appt)}
                        className="p-1.25 bg-white hover:bg-[#FEFAFB] text-[#2F6F8F] border border-[#FDDEEC] rounded-xl cursor-pointer"
                        title="Edit Appointment"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onDeleteAppointment(appt.id)}
                        className="p-1.5 bg-white hover:bg-red-40 text-red-480 border border-red-100 rounded-xl cursor-pointer"
                        title="Delete Appointment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Facility & Doctor info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#2F6F8F]">
                    <div className="flex items-center space-x-1.5 bg-white p-2 rounded-xl border border-[#FDDEEC]">
                      <MapPin className="w-3.5 h-3.5 text-[#FA6B90] shrink-0" />
                      <span className="font-bold truncate">{appt.hospital}</span>
                    </div>

                    {appt.doctor && (
                      <div className="flex items-center space-x-1.5 bg-white p-2 rounded-xl border border-[#FDDEEC]">
                        <User className="w-3.5 h-3.5 text-[#2F6F8F] shrink-0" />
                        <span className="font-medium truncate">{appt.doctor}</span>
                      </div>
                    )}
                  </div>

                  {/* Clinical Notes & Questions */}
                  {appt.notes && (
                    <div className="bg-white p-3 rounded-xl border border-[#FDDEEC] text-[11px] text-[#2F6F8F]/90 font-medium space-y-0.5">
                      <span className="text-[9px] font-black uppercase text-[#FA6B90] tracking-wider block">
                        {lang === 'en' ? 'Notes & Preparation' : 'កំណត់ត្រា និងការត្រៀមខ្លួន'}
                      </span>
                      <p className="leading-relaxed">{appt.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ALL UPCOMING APPOINTMENTS LIST */}
      <div className="relative pl-6 space-y-4">
  {/* Timeline line */}
  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#DDE8E5]" />

  {upcomingAppointments.map(appt => (
    <div
      key={appt.id}
      onClick={() => {
        setSelectedDateStr(appt.date);
        const d = new Date(appt.date);
        setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }}
      className={`relative bg-white border rounded-xl p-3.5 transition-all cursor-pointer ${
        appt.date === selectedDateStr
          ? 'border-[#7BAE9B] ring-2 ring-[#7BAE9B]/15'
          : 'border-[#E5EDEB] hover:border-[#AEE3D8]'
      }`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute -left-[25px] top-5 w-3.5 h-3.5 rounded-full border-[3px] border-white ${
          appt.date === selectedDateStr
            ? 'bg-[#FA6B90]'
            : 'bg-[#AEE3D8]'
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#FA6B90]">
              {appt.date}
            </span>

            <span className="text-[10px] text-[#8A9A9F]">
              {appt.time}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-[#2F6F8F] font-heading line-clamp-1">
            {appt.title || appt.hospital}
          </h4>

          <div className="text-[10.5px] text-[#2F6F8F]/70 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-[#CFADB9] shrink-0" />
            <span className="truncate">{appt.hospital}</span>
          </div>
        </div>

        <span className="shrink-0 text-[9px] font-semibold text-[#7BAE9B] bg-[#F0F7F4] px-2 py-1 rounded-lg">
          {lang === 'en' ? 'Scheduled' : 'បានកំណត់'}
        </span>
      </div>
    </div>
  ))}
</div>


      {/* 5. PAST ATTENDED VISITS TIMELINE */}
      {completedAppointments.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-[#FDDEEC]">
          <div className="flex items-center space-x-1.5 text-xs font-black text-[#2F6F8F]/75 uppercase tracking-wider font-heading">
            <CheckCircle2 className="w-4 h-4 text-[#2F6F8F]" />
            <span>{t.completedCheckups}</span>
            <span className="ml-1 text-[10px] font-mono bg-[#AEE3D8] text-[#2F6F8F] px-2 py-0.2 rounded-full font-black">
              {completedAppointments.length}
            </span>
          </div>

          <div className="space-y-2">
            {completedAppointments.map(appt => (
              <div 
                key={appt.id}
                className="bg-white border border-[#FDDEEC] rounded-2xl p-3 flex items-center justify-between opacity-80 hover:opacity-90 transition-opacity shadow-3xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-black text-[#2F6F8F] bg-[#AEE3D8] px-1.5 py-0.2 rounded">
                      ✓ {lang === 'en' ? 'Attended' : 'បានពិនិត្យ'}
                    </span>
                    <span className="text-[10px] font-mono text-[#2F6F8F]/65">
                      {appt.date} • {appt.time}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-[#2F6F8F] truncate font-heading">
                    {appt.title || appt.hospital}
                  </h4>
                  <p className="text-[10px] text-[#2F6F8F]/70 font-medium truncate">
                    {appt.hospital} {appt.doctor ? `— ${appt.doctor}` : ''}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0 pl-2">
                  <button
                    onClick={() => onToggleComplete(appt.id)}
                    className="text-[10px] font-bold text-[#FA6B90] hover:underline cursor-pointer"
                  >
                    {t.markIncomplete}
                  </button>
                  <button
                    onClick={() => onDeleteAppointment(appt.id)}
                    className="text-[#CFADB9] hover:text-[#FA6B90] cursor-pointer p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      {/* 6. ADD / EDIT APPOINTMENT MODAL */}
  {isModalOpen && (
  <div className="fixed inset-0 bg-[#2F6F8F]/50 backdrop-blur-xs z-40 flex items-end sm:items-center justify-center p-0 sm:p-2 overflow-hidden">
    <div
      className="fixed inset-0"
      onClick={() => setIsModalOpen(false)}
    />

    <div className="w-full max-w-md mx-auto bg-[#FEFAFB] rounded-t-[26px] sm:rounded-[24px] border-t sm:border border-[#FDDEEC] shadow-2xl relative z-10 px-4 py-4 space-y-3 max-h-[88vh] overflow-y-auto overflow-x-hidden">

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#FDDEEC]">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-[#FDDEEC] text-[#FA6B90] flex items-center justify-center shrink-0">
            <Flower2 className="w-3 h-3" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-black text-[#2F6F8F] font-heading truncate">
              {editingApptId
                ? (lang === 'en' ? 'Edit Checkup' : 'កែប្រែការណាត់ជួប')
                : t.newApptTitle}
            </h3>

            <p className="text-[9px] text-[#2F6F8F]/70 font-semibold truncate">
              {lang === 'en'
                ? 'Personal Pregnancy Journal Schedule'
                : 'កាលវិភាគពិនិត្យផ្ទាល់ខ្លួន'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(false)}
          className="p-1.5 bg-[#FFF7E9] hover:bg-[#F6E5C3] rounded-full cursor-pointer text-[#2F6F8F] shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form
        onSubmit={handleSaveForm}
        className="space-y-2.5 text-xs text-[#2F6F8F] w-full"
      >

        {/* Type Selector */}
        <div>
          <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">
            {t.apptTypeLabel}
          </label>

          <div className="grid grid-cols-2 gap-1.5">
            {APPOINTMENT_TYPES.map(apt => (
              <button
                key={apt.id}
                type="button"
                onClick={() => setType(apt.id)}
                className={`min-w-0 p-1.5 rounded-lg border text-left flex items-center space-x-1.5 transition-all cursor-pointer ${
                  formType === apt.id
                    ? 'border-[#FA6B90] bg-[#FDDEEC] text-[#2F6F8F] font-black shadow-3xs'
                    : 'border-[#FDDEEC] bg-white text-[#2F6F8F]/80'
                }`}
              >
                <span className="text-xs shrink-0">{apt.emoji}</span>
                <span className="text-[9px] leading-tight truncate font-bold">
                  {lang === 'en' ? apt.labelEn : apt.labelKh}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title / Description */}
        <div>
          <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">
            {lang === 'en'
              ? 'Appointment Title / Topic'
              : 'ចំណងជើង ឬប្រធានបទពិនិត្យ'}
          </label>

          <input
            type="text"
            placeholder={lang === 'en'
              ? 'e.g., 34-Week Ultrasound Scan, Routine ANC #4'
              : 'ឧ. អេកូស្កេន ៣៤ សប្តាហ៍, ពិនិត្យផ្ទៃពោះលើកទី៤'}
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full min-w-0 p-2 rounded-lg border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-[10px] font-semibold text-[#2F6F8F]"
          />
        </div>

        {/* Hospital / Clinic */}
        <div>
          <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">
            {t.apptFacilityLabel}
          </label>

          <input
            type="text"
            required
            placeholder={lang === 'en'
              ? 'e.g., Calmette Hospital, Khema International Clinic'
              : 'ឧ. មន្ទីរពេទ្យកាល់ម៉ែត, គ្លីនិកឃេម៉ា'}
            value={formHospital}
            onChange={(e) => setHospital(e.target.value)}
            className="w-full min-w-0 p-2 rounded-lg border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-[10px] font-semibold text-[#2F6F8F]"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">
              {t.apptDateLabel}
            </label>

            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full min-w-0 p-2 rounded-lg border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-[10px] font-mono font-semibold text-[#2F6F8F]"
            />
          </div>

          <div className="min-w-0">
            <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">
              {t.apptTimeLabel}
            </label>

            <input
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              className="w-full min-w-0 p-2 rounded-lg border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-[10px] font-mono font-semibold text-[#2F6F8F]"
            />
          </div>
        </div>

        {/* Doctor */}
        <div>
          <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">
            {t.apptDoctorLabel}
          </label>

          <input
            type="text"
            placeholder={lang === 'en'
              ? 'e.g., Dr. Sophy Lim, Midwife Sokha'
              : 'ឧ. វេជ្ជបណ្ឌិត សុភី លីម'}
            value={formDoctor}
            onChange={(e) => setDoctor(e.target.value)}
            className="w-full min-w-0 p-2 rounded-lg border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-[10px] text-[#2F6F8F]"
          />
        </div>

        {/* Reminder Options */}
        <div>
          <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">
            {lang === 'en'
              ? 'Reminder Notification'
              : 'ការរំលឹកទុកជាមុន'}
          </label>

          <div className="grid grid-cols-2 gap-1.5">
            {REMINDER_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFormReminder(opt.id)}
                className={`min-w-0 p-1.5 rounded-lg border text-left flex items-center space-x-1.5 transition-all cursor-pointer ${
                  formReminder === opt.id
                    ? 'border-[#7ECBBF] bg-[#AEE3D8]/30 text-[#2F6F8F] font-black shadow-3xs'
                    : 'border-[#FDDEEC] bg-white text-[#2F6F8F]/75'
                }`}
              >
                <Bell
                  className={`w-3 h-3 shrink-0 ${
                    formReminder === opt.id
                      ? 'text-[#FA6B90]'
                      : 'text-[#CFADB9]'
                  }`}
                />

                <span className="text-[9px] leading-tight truncate font-bold">
                  {lang === 'en' ? opt.labelEn : opt.labelKh}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-black uppercase text-[#2F6F8F] mb-1">
            {t.apptNotesLabel}
          </label>

          <textarea
            rows={2}
            placeholder={lang === 'en'
              ? 'Questions for doctor, fasting instructions, symptoms to mention...'
              : 'សំណួរចង់សួរគ្រូពេទ្យ ការណែនាំពិសេស ឬរោគសញ្ញាដែលចង់ពិគ្រោះ'}
            value={formNotes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-w-0 p-2 rounded-lg border border-[#FDDEEC] bg-white focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-[10px] text-[#2F6F8F] resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="pt-1 flex gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-3 py-2 bg-[#FFF7E9] hover:bg-[#F6E5C3] text-[#2F6F8F] border border-[#F6E5C3] rounded-lg font-bold text-[9px] uppercase cursor-pointer shrink-0"
          >
            {t.cancelBtn}
          </button>

          <button
            type="submit"
            className="flex-1 min-w-0 py-2 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] text-white rounded-lg font-bold text-[9px] uppercase cursor-pointer shadow-3xs flex items-center justify-center space-x-1"
            id="btn-save-appointment-form"
          >
            <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />

            <span className="truncate">
              {editingApptId
                ? (lang === 'en'
                    ? 'Save Changes'
                    : 'រក្សាទុកការកែប្រែ')
                : t.saveApptBtn}
            </span>
          </button>
        </div>

            </form>
    </div>
    </div>
  )}
    </div>
  );
}