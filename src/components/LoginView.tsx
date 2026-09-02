/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Flower2, Lock, User, Globe, Sparkles, AlertCircle, ShieldCheck, Stethoscope, Phone, Mail, UserPlus, LogIn } from 'lucide-react';

interface LoginViewProps {
  lang: 'en' | 'kh';
  setLang: (lang: 'en' | 'kh') => void;
  onLoginSuccess: (name: string) => void;
  onSwitchToDoctorLogin: () => void;
}

export default function LoginView({ lang, setLang, onLoginSuccess, onSwitchToDoctorLogin }: LoginViewProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'register') {
      if (!fullName.trim()) {
        setError(lang === 'en' ? 'Please enter your full name.' : 'សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក។');
        return;
      }
    }

    if (!email.trim() || !email.includes('@')) {
      setError(
        lang === 'en' ? 'Please enter a valid email address.' : 'សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលដែលត្រឹមត្រូវ។'
      );
      return;
    }

    if (password.length < 4) {
      setError(
        lang === 'en'
          ? 'Password must be at least 4 characters.'
          : 'ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងហោចណាស់ ៤តួអក្សរ។'
      );
      return;
    }

    if (authMode === 'register' && password !== confirmPassword) {
      setError(
        lang === 'en'
          ? 'Passwords do not match.'
          : 'ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ។'
      );
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('flowers_auth_token', data.token);
          localStorage.setItem('flowers_user_id', data.user.id);
          localStorage.setItem('flowers_user_email', data.user.email);
          localStorage.setItem('flowers_user_role', data.user.role);

          const userName = data.user.fullName || data.user.email.split('@')[0];
          onLoginSuccess(userName);
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
            role: 'mother',
            fullName: fullName.trim(),
            phone: phone.trim()
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('flowers_auth_token', data.token);
          localStorage.setItem('flowers_user_id', data.user.id);
          localStorage.setItem('flowers_user_email', data.user.email);
          localStorage.setItem('flowers_user_role', data.user.role);
          // New mother account starts with pregnancy setup wizard
          localStorage.removeItem('flowers_pregnancy_setup_completed');

          const userName = data.user.fullName || fullName.trim() || data.user.email.split('@')[0];
          onLoginSuccess(userName);
        } else {
          setError(
            lang === 'en'
              ? data.error || 'Registration failed. Please try again.'
              : 'ការចុះឈ្មោះបរាជ័យ។ សូមព្យាយាមម្តងទៀត។'
          );
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
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
      className={`min-h-screen bg-[#FEFAFB] flex flex-col justify-center items-center px-4 py-8 font-sans ${lang === "kh" ? "lang-kh" : ""}`}
      id="login-container"
    >
      {/* Language Bar on Top Right of Login Page */}
      <div className="absolute top-4 right-4 z-10 flex items-center">
        <button
          onClick={() => setLang(lang === "en" ? "kh" : "en")}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-black bg-[#AEE3D8]/30 hover:bg-[#AEE3D8]/60 text-[#2F6F8F] transition-all cursor-pointer border border-[#AEE3D8] shadow-3xs"
          title="Switch Language / ផ្លាស់ប្តូរភាសា"
          id="login-lang-toggle"
        >
          <Globe className="w-3.5 h-3.5 text-[#2F6F8F]" />
          <span>{lang === "en" ? "KH" : "EN"}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-[32px] border border-[#FDDEEC] p-8 shadow-3xs space-y-6 relative overflow-hidden">
        {/* Decorative background visual elements */}
        <div className="absolute -left-12 -top-12 w-32 h-32 bg-[#AEE3D8]/30 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-[#FDDEEC]/40 rounded-full blur-xl pointer-events-none" />

        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#FA6B90] to-[#F4A6B5] rounded-3xl flex items-center justify-center text-white shadow-3xs">
            <Flower2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#2F6F8F] tracking-tight font-heading">
              {lang === "en" ? "FlowErs" : "ហ្វ្លូវ័រ"} 🌸
            </h1>
            <p className="text-xs font-black text-[#FA6B90] tracking-widest uppercase mt-1">
              {lang === "en"
                ? "Digital Maternal Health Passport & Vault"
                : "លិខិតឆ្លងដែនសុខភាពមាតា & ឃ្លាំងឯកសារ"}
            </p>
            <p className="text-xs text-[#2F6F8F]/75 font-medium mt-2 max-w-[280px] mx-auto">
              {lang === "en"
                ? "Digitize, organize, and access all your pregnancy medical records in one secure place."
                : "ឌីជីថលូបនីយកម្ម រៀបចំ និងរក្សាទុកឯកសារពិនិត្យផ្ទៃពោះរបស់អ្នកទាំងអស់នៅកន្លែងតែមួយ។"}
            </p>
          </div>
        </div>

        {/* Sign In / Sign Up Mode Switcher Tabs */}
        <div className="flex bg-[#FEFAFB] p-1 rounded-2xl border border-[#FDDEEC]">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] text-white shadow-3xs'
                : 'text-[#2F6F8F]/70 hover:text-[#2F6F8F]'
            }`}
            id="tab-mode-login"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Sign In' : 'ចូលប្រើ'}</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] text-white shadow-3xs'
                : 'text-[#2F6F8F]/70 hover:text-[#2F6F8F]'
            }`}
            id="tab-mode-register"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Create Account' : 'ចុះឈ្មោះថ្មី'}</span>
          </button>
        </div>

        {/* Security badge info bar */}
        <div className="bg-[#AEE3D8]/20 border border-[#AEE3D8] rounded-2xl p-3 flex items-start space-x-2.5">
          <ShieldCheck className="w-4.5 h-4.5 text-[#2F6F8F] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#2F6F8F]/90 font-bold leading-normal">
            {lang === "en"
              ? "All health data is encrypted and securely stored in your private maternal health vault."
              : "រាល់ទិន្នន័យសុខភាពទាំងអស់ត្រូវបានការពារ និងរក្សាទុកដោយសុវត្ថិភាពខ្ពស់។"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
          {error && (
            <div className="flex items-start space-x-2 bg-[#FDDEEC] border border-[#F4A6B5] p-3.5 rounded-xl text-xs text-[#FA6B90] font-bold animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-[#FA6B90] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name input (Register only) */}
          {authMode === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
                {lang === "en" ? "Mother's Full Name" : "ឈ្មោះពេញរបស់មាតា"} *
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
                  placeholder={lang === "en" ? "e.g. Sophy Cheat" : "ឧ. ជាត សុភី"}
                  className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-bold transition-all"
                  id="register-fullname-input"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
              {lang === "en" ? "Email Address" : "អាសយដ្ឋានអ៊ីមែល"} *
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
                placeholder={lang === "en" ? "your.email@example.com" : "អ៊ីមែលរបស់អ្នក@example.com"}
                className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-bold transition-all"
                id="login-email-input"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Phone input (Register only) */}
          {authMode === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
                {lang === "en" ? "Phone Number (Optional)" : "លេខទូរស័ព្ទ (ស្រេចចិត្ត)"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#CFADB9]">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={lang === "en" ? "+855 12 345 678" : "០១២ ៣៤៥ ៦៧៨"}
                  className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-bold transition-all"
                  id="register-phone-input"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
              {authMode === 'register'
                ? (lang === "en" ? "Create Password (min 4 chars)" : "បង្កើតពាក្យសម្ងាត់ (យ៉ាងតិច ៤តួ)")
                : (lang === "en" ? "Password" : "ពាក្យសម្ងាត់")} *
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
                className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-mono tracking-wide font-black transition-all"
                id="login-password-input"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Confirm Password Input (Register only) */}
          {authMode === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
                {lang === "en" ? "Confirm Password" : "ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់"} *
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
                  className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-mono tracking-wide font-black transition-all"
                  id="register-confirm-password-input"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] active:scale-[0.99] text-white font-black rounded-xl text-sm transition-all cursor-pointer shadow-3xs flex items-center justify-center space-x-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            id="login-submit-btn"
          >
            <Sparkles className="w-4.5 h-4.5 text-white" />
            <span>
              {isLoading
                ? (lang === "en" ? "Please wait..." : "សូមរង់ចាំ...")
                : authMode === 'login'
                ? (lang === "en" ? "Sign In to Passport" : "ចូលគណនីលិខិតឆ្លងដែន")
                : (lang === "en" ? "Create Account & Start" : "បង្កើតគណនី & ចាប់ផ្តើម")}
            </span>
          </button>
        </form>

        {/* Quick toggle link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => switchMode(authMode === 'login' ? 'register' : 'login')}
            className="text-xs font-bold text-[#FA6B90] hover:underline cursor-pointer"
          >
            {authMode === 'login'
              ? (lang === 'en' ? "Don't have an account? Sign Up" : "មិនទាន់មានគណនីមែនទេ? ចុះឈ្មោះនៅទីនេះ")
              : (lang === 'en' ? "Already have an account? Sign In" : "មានគណនីរួចហើយមែនទេ? ចូលប្រើនៅទីនេះ")}
          </button>
        </div>

        {/* Switch to Doctor Login */}
        <button
          type="button"
          onClick={onSwitchToDoctorLogin}
          className="w-full py-2.5 border-2 border-[#2F6F8F] hover:bg-[#AEE3D8]/20 text-[#2F6F8F] font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
          id="switch-to-doctor-btn"
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Doctor / Hospital Login' : 'ចូលសម្រាប់គ្រូពេទ្យ / មន្ទីរពេទ្យ'}</span>
        </button>

        {/* Footer info */}
        <div className="text-center pt-2">
          <p className="text-[9px] text-[#2F6F8F]/60 font-bold">
            FlowErs Digital Health Companion • Private & Secure
          </p>
        </div>
      </div>
    </div>
  );
}

