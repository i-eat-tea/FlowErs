/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Doctor/Nurse Login View
 * Role selector (Mother | Doctor | Hospital Admin) + credential entry
 */

import React, { useState } from 'react';
import { Flower2, Lock, Mail, Globe, Sparkles, AlertCircle, ShieldCheck, Stethoscope, Building2, ArrowLeft, User, UserPlus, LogIn } from 'lucide-react';

interface DoctorLoginViewProps {
  lang: 'en' | 'kh';
  setLang: (lang: 'en' | 'kh') => void;
  onLoginSuccess: (email: string, role: 'doctor' | 'hospital_admin') => void;
  onSwitchToMotherLogin: () => void;
}

export default function DoctorLoginView({
  lang,
  setLang,
  onLoginSuccess,
  onSwitchToMotherLogin
}: DoctorLoginViewProps) {
  // Auth mode: Sign In vs Create Account
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'hospital_admin' | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setError('');
  };

  const wording = {
    en: {
      title: 'FlowErs Professional Portal',
      subtitle: 'Healthcare Provider & Hospital Access',
      selectRole: 'Who are you?',
      doctorBtn: "I'm a Doctor / Midwife",
      hospitalBtn: "I'm a Hospital Admin",
      emailLabel: 'Professional Email Address',
      emailPlaceholder: 'dr.sophy@hospital.com',
      passwordLabel: 'Password',
      passwordHint: 'Use your registered account password',
      loginBtn: 'Access Patient Records',
      security: 'Healthcare data is encrypted end-to-end and patient-consent gated.',
      backBtn: 'Back to Mother Login',
      validationEmail: 'Please enter a valid email address.',
      validationPassword: 'Password is required.'
    },
    kh: {
      title: 'វាលឯកទេសផ្នែកសុខាភិបាល',
      subtitle: 'ការស្វាគមន៍ឯកទេសវេជ្ជសាស្ត្រ និងឆ្នាក់ថ្នាក់មន្ទីរពេទ្យ',
      selectRole: 'តើអ្នកជាលោក / លោកស្រី?',
      doctorBtn: 'ខ្ញុំជាវេជ្ជបណ្ឌិត / ឆ្មប',
      hospitalBtn: 'ខ្ញុំជាអ្នកគ្រប់គ្រងមន្ទីរពេទ្យ',
      emailLabel: 'អាសយដ្ឋានអ៊ីមែលឯកទេស',
      emailPlaceholder: 'dr.sophy@hospital.com',
      passwordLabel: 'ពាក្យសម្ងាត់',
      passwordHint: 'ប្រើពាក្យសម្ងាត់គណនីដែលបានចុះឈ្មោះ',
      loginBtn: 'ចូលប្រើប្រាស់កំណត់ត្រាអ្នកជម្ងឺ',
      security: 'ទិន្នន័យសុខភាពត្រូវបានឆ្នាំងក្នុង និងមានការផ្ទៀងផ្ទាត់ការយល់ព្រម។',
      backBtn: 'ត្រឡប់ទៅការចូលលើកដ្ឋាននៃមាតា',
      validationEmail: 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលដែលត្រឹមត្រូវ។',
      validationPassword: 'ត្រូវការពាក្យសម្ងាត់។'
    }
  };

  const t = wording[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Role required for login mode, not needed for register mode
    if (authMode === 'login' && !selectedRole) {
      setError(lang === 'en' ? 'Please select your role.' : 'សូមជ្រើសរើសតួនាទីរបស់អ្នក។');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError(t.validationEmail);
      return;
    }

    if (!password.trim()) {
      setError(t.validationPassword);
      return;
    }

    if (authMode === 'register') {
      if (!fullName.trim()) {
        setError(lang === 'en' ? 'Please enter your full name.' : 'សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក។');
        return;
      }
      if (!selectedRole) {
        setError(lang === 'en' ? 'Please select your role.' : 'សូមជ្រើសរើសតួនាទីរបស់អ្នក។');
        return;
      }
      if (password !== confirmPassword) {
        setError(lang === 'en' ? 'Passwords do not match.' : 'ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password,
            role: selectedRole
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Verify the role matches what the user selected
          if (data.user.role !== selectedRole) {
            setError(
              lang === 'en'
                ? `This account is registered as a ${data.user.role}, not ${selectedRole}.`
                : `គណនីនេះចុះឈ្មោះជា ${data.user.role} មិនមែន ${selectedRole} ទេ។`
            );
            setIsLoading(false);
            return;
          }

          // Store token and user data
          localStorage.setItem('flowers_auth_token', data.token);
          localStorage.setItem('flowers_user_id', data.user.id);
          localStorage.setItem('flowers_user_email', data.user.email);
          localStorage.setItem('flowers_user_role', data.user.role);

          onLoginSuccess(email.trim(), selectedRole);
        } else {
          setError(
            lang === 'en'
              ? data.error || 'Login failed. Please check your credentials.'
              : 'ការចូលបរាជ័យ។ សូមពិនិត្យអ៊ីមែល និងពាក្យសម្ងាត់របស់អ្នក។'
          );
        }
      } else {
        // Register mode
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password,
            role: selectedRole,
            fullName: fullName.trim()
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('flowers_auth_token', data.token);
          localStorage.setItem('flowers_user_id', data.user.id);
          localStorage.setItem('flowers_user_email', data.user.email);
          localStorage.setItem('flowers_user_role', selectedRole);

          onLoginSuccess(email.trim(), selectedRole);
        } else {
          setError(
            lang === 'en'
              ? data.error || 'Registration failed. Please try again.'
              : 'ការចុះឈ្មោះបរាជ័យ។ សូមព្យាយាមម្តងទៀត។'
          );
        }
      }
    } catch (err) {
      console.error('Doctor auth error:', err);
      setError(
        lang === 'en'
          ? 'Unable to connect to server. Please try again.'
          : 'មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ។ សូមព្យាយាមម្តងទៀត។'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#FEFAFB] flex flex-col justify-center items-center px-4 py-8 font-sans ${lang === 'kh' ? 'lang-kh' : ''}`}
      id="doctor-login-container"
    >
      {/* Language Bar */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <button
          onClick={() => setLang(lang === 'en' ? 'kh' : 'en')}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-black bg-[#AEE3D8]/30 hover:bg-[#AEE3D8]/60 text-[#2F6F8F] transition-all cursor-pointer border border-[#AEE3D8] shadow-3xs"
          id="doctor-lang-toggle"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'KH' : 'EN'}</span>
        </button>

        {/* Back to Mother Button */}
        <button
          onClick={onSwitchToMotherLogin}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-black bg-[#FFF7E9] hover:bg-[#F6E5C3] text-[#2F6F8F] transition-all cursor-pointer border border-[#F6E5C3] shadow-3xs"
          title={t.backBtn}
          id="back-to-mother-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.backBtn}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-[32px] border border-[#FDDEEC] p-8 shadow-3xs space-y-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -left-12 -top-12 w-32 h-32 bg-[#AEE3D8]/30 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-[#FDDEEC]/40 rounded-full blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#2F6F8F] to-[#4A8BAF] rounded-3xl flex items-center justify-center text-white shadow-3xs">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#2F6F8F] tracking-tight font-heading">
              {lang === 'en' ? 'FlowErs' : 'ហ្វ្លូវ័រ'} 👨‍⚕️
            </h1>
            <p className="text-xs font-black text-[#2F6F8F] tracking-widest uppercase mt-1">
              {t.title}
            </p>
            <p className="text-xs text-[#2F6F8F]/75 font-medium mt-2 max-w-[280px] mx-auto">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Role Selection Bar — Always visible above auth mode tabs */}
        <div className="flex items-center justify-between bg-[#FDDEEC]/30 rounded-xl p-3 border border-[#FDDEEC] mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-black text-[#2F6F8F] uppercase tracking-wider font-heading">{t.selectRole}</span>
          </div>
          <div className="flex space-x-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedRole(selectedRole === 'doctor' ? null : 'doctor');
                setError('');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                selectedRole === 'doctor'
                  ? 'bg-[#FA6B90] text-white border-[#FA6B90] shadow-3xs'
                  : 'bg-white text-[#2F6F8F] border-[#FDDEEC] hover:bg-[#FEFAFB]'
              }`}
              id="role-btn-doctor"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t.doctorBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole(selectedRole === 'hospital_admin' ? null : 'hospital_admin');
                setError('');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                selectedRole === 'hospital_admin'
                  ? 'bg-[#AEE3D8] text-[#2F6F8F] border-[#AEE3D8] shadow-3xs'
                  : 'bg-white text-[#2F6F8F] border-[#FDDEEC] hover:bg-[#FEFAFB]'
              }`}
              id="role-btn-hospital"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.hospitalBtn}</span>
            </button>
          </div>
        </div>

        {/* Auth Mode Tabs (Sign In / Create Account) */}
        <div className="flex bg-[#FEFAFB] p-1 rounded-2xl border border-[#FDDEEC]">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-[#2F6F8F] to-[#4A8BAF] text-white shadow-3xs'
                : 'bg-white text-[#2F6F8F]/60 hover:bg-[#FEFAFB] hover:text-[#2F6F8F] border border-[#FDDEEC]/30'
            }`}
            id="doc-tab-mode-login"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Sign In' : 'ចូលប្រើ'}</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-[#2F6F8F] to-[#4A8BAF] text-white shadow-3xs'
                : 'bg-white text-[#2F6F8F]/60 hover:bg-[#FEFAFB] hover:text-[#2F6F8F] border border-[#FDDEEC]/30'
            }`}
            id="doc-tab-mode-register"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Create Account' : 'ចុះឈ្មោះថ្មី'}</span>
          </button>
        </div>

        {authMode === 'register' ? (
          <>
            {/* Register Form Header */}
            <div className="text-center mb-2">
              <h3 className="text-sm font-black text-[#2F6F8F] font-heading">
                {selectedRole === 'doctor'
                  ? `${t.doctorBtn}`
                  : t.hospitalBtn}
              </h3>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4" id="doctor-register-form">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
                  {lang === 'en' ? "Full Name *" : "ឈ្មោះពេញ *"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#CFADB9]">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Dr. Sophy Lim' : 'ឧ. វេជ្ជបណ្ឌិត សុភី លីម'}
                    className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-bold transition-all"
                    id="doctor-register-name-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start space-x-2 bg-[#FDDEEC] border border-[#F4A6B5] p-3.5 rounded-xl text-xs text-[#FA6B90] font-bold">
                  <AlertCircle className="w-4 h-4 text-[#FA6B90] shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
                  {t.emailLabel} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#CFADB9]">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-bold transition-all"
                    id="doctor-register-email-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
                  {lang === 'en' ? 'Create Password (min 4 chars)' : 'បង្កើតពាក្យសម្ងាត់ (យ៉ាងតិច ៤តួ)'} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#CFADB9]">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-mono tracking-wide font-bold transition-all"
                    id="doctor-register-password-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
                  {lang === 'en' ? 'Confirm Password' : 'ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់'} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#CFADB9]">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-mono tracking-wide font-bold transition-all"
                    id="doctor-register-confirm-password-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] active:scale-[0.99] text-white font-black rounded-xl text-sm transition-all cursor-pointer shadow-3xs flex items-center justify-center space-x-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                id="doctor-register-submit-btn"
              >
                <UserPlus className="w-4.5 h-4.5 text-white" />
                <span>
                  {isLoading
                    ? (lang === 'en' ? 'Creating Account...' : 'កំពុងបង្កើតគណនី...')
                    : (lang === 'en' ? 'Create Account' : 'បង្កើតគណនី')}
                </span>
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" id="doctor-login-form">
              {error && (
                <div className="flex items-start space-x-2 bg-[#FDDEEC] border border-[#F4A6B5] p-3.5 rounded-xl text-xs text-[#FA6B90] font-bold animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-[#FA6B90] shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
                  {t.emailLabel} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#CFADB9]">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-bold transition-all"
                    id="doctor-email-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
                  {t.passwordLabel} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#CFADB9]">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-mono tracking-wide font-bold transition-all"
                    id="doctor-password-input"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-[10px] text-[#2F6F8F]/60 pl-1 font-medium">
                  💡 {t.passwordHint}
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#2F6F8F] to-[#4A8BAF] hover:from-[#1d5572] hover:to-[#3d7a9e] active:scale-[0.99] text-white font-black rounded-xl text-sm transition-all cursor-pointer shadow-3xs flex items-center justify-center space-x-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                id="doctor-login-submit-btn"
              >
                <Sparkles className="w-4.5 h-4.5 text-white" />
                <span>
                  {isLoading
                    ? (lang === 'en' ? 'Signing in...' : 'កំពុងចូល...')
                    : t.loginBtn}
                </span>
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-[9px] text-[#2F6F8F]/60 font-bold">
            FlowErs Professional Portal • Secure & HIPAA-Compliant
          </p>
        </div>
      </div>
    </div>
  );
}
