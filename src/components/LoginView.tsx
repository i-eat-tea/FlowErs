/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Flower2,
  Lock,
  User,
  Globe,
  Sparkles,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface LoginViewProps {
  lang: "en" | "kh";
  setLang: (lang: "en" | "kh") => void;
  onLoginSuccess: (name: string) => void;
}

export default function LoginView({
  lang,
  setLang,
  onLoginSuccess,
}: LoginViewProps) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(
        lang === "en" ? "Please enter your name." : "សូមបញ្ចូលឈ្មោះរបស់អ្នក។",
      );
      return;
    }

    if (pin.length < 4) {
      setError(
        lang === "en"
          ? "Access PIN must be at least 4 digits."
          : "លេខកូដ PIN ត្រូវតែមានយ៉ាងហោចណាស់ ៤ខ្ទង់។",
      );
      return;
    }

    // Any 4 digit pin or '1234' is accepted for local ease-of-use and high fidelity
    setError("");
    onLoginSuccess(name.trim());
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

        {/* Security badge info bar (Mint wellness element) */}
        <div className="bg-[#AEE3D8]/20 border border-[#AEE3D8] rounded-2xl p-3 flex items-start space-x-2.5">
          <ShieldCheck className="w-4.5 h-4.5 text-[#2F6F8F] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#2F6F8F]/90 font-bold leading-normal">
            {lang === "en"
              ? "All health data is protected and stored securely inside your browser's private local sandboxed database."
              : "រាល់ទិន្នន័យសុខភាពទាំងអស់ត្រូវបានការពារ និងរក្សាទុកដោយសុវត្ថិភាពនៅក្នុងកម្មវិធីរុករករបស់អ្នក។"}
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

          {/* Full Name input */}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === "en" ? "e.g. Sophy Cheat" : "ឧ. ជាត សុភី"}
                className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-bold transition-all"
                id="login-name-input"
              />
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-[#2F6F8F] uppercase tracking-wider pl-1 font-heading">
              {lang === "en" ? "4-Digit Access PIN" : "លេខកូដសម្ងាត់ ៤ខ្ទង់"} *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#CFADB9]">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                required
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-full pl-10 pr-4 py-3 bg-[#FEFAFB] rounded-xl border border-[#FDDEEC] focus:ring-2 focus:ring-[#FA6B90] focus:border-[#FA6B90] text-sm text-[#2F6F8F] placeholder-[#CFADB9] font-mono tracking-widest text-center font-black transition-all"
                id="login-pin-input"
              />
            </div>
            <p className="text-[10px] text-[#2F6F8F]/60 pl-1 font-medium">
              {lang === "en"
                ? "💡 Enter any 4-digit code (e.g. 1234) to create or unlock your passport."
                : "💡 វាយបញ្ចូលលេខ ៤ខ្ទង់ណាមួយ (ឧ. ១២៣៤) ដើម្បីបង្កើត ឬបើកដំណើរការ។"}
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#FA6B90] to-[#F4A6B5] hover:from-[#f05e84] hover:to-[#eb95a5] active:scale-[0.99] text-white font-black rounded-xl text-sm transition-all cursor-pointer shadow-3xs flex items-center justify-center space-x-2 mt-2"
            id="login-submit-btn"
          >
            <Sparkles className="w-4.5 h-4.5 text-white" />
            <span>
              {lang === "en"
                ? "Unlock Personal Passport"
                : "បើកគណនីលិខិតឆ្លងដែន"}
            </span>
          </button>
        </form>

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
