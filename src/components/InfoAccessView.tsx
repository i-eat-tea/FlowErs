/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Information Access — links to the FlowErs Telegram bot and the information portal,
 * plus the Telegram bot QR picture (public/telegrambot.jpg, falls back to a generated QR).
 */

import React, { useState } from 'react';
import { Info, Send, Globe, ExternalLink, Copy, Check } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const TELEGRAM_BOT_URL = 'https://t.me/FlowErs168bot';
const INFO_PORTAL_URL = 'https://mae-app-byflowers.vercel.app/';
// Put the picture at public/telegrambot.jpg (file name is case-sensitive on Render).
const TELEGRAM_QR_IMAGE = '/telegrambot.jpg';

interface InfoAccessViewProps {
  lang: 'en' | 'kh';
}

const COPY = {
  en: {
    title: 'Information Access',
    subtitle: 'Chat with our Telegram bot and read health information',
    botTitle: 'Telegram Bot',
    botDesc: 'Chat with the FlowErs Telegram bot.',
    portalTitle: 'Information Portal',
    portalDesc: 'Open the FlowErs information website.',
    open: 'Open',
    copy: 'Copy link',
    copied: 'Copied',
    scan: 'Scan with your phone camera to open the bot',
    qrAlt: 'QR code for the FlowErs Telegram bot',
  },
  kh: {
    title: 'ចូលប្រើព័ត៌មាន',
    subtitle: 'ជជែកជាមួយ Telegram Bot និងអានព័ត៌មានសុខភាព',
    botTitle: 'Telegram Bot',
    botDesc: 'ជជែកជាមួយ FlowErs Telegram Bot។',
    portalTitle: 'វេបសាយព័ត៌មាន',
    portalDesc: 'បើកវេបសាយព័ត៌មាន FlowErs។',
    open: 'បើក',
    copy: 'ចម្លងតំណ',
    copied: 'បានចម្លង',
    scan: 'ស្កេនដោយកាមេរ៉ាទូរសព្ទ ដើម្បីបើក Bot',
    qrAlt: 'កូដ QR របស់ FlowErs Telegram Bot',
  },
} as const;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function LinkActions({ url, lang }: { url: string; lang: 'en' | 'kh' }) {
  const c = COPY[lang];
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (await copyText(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-2.5 bg-[#FA6B90] hover:bg-[#f05e84] text-white rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer transition-all shadow-3xs flex items-center justify-center space-x-1.5"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>{c.open}</span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="flex-1 py-2.5 bg-white hover:bg-[#FDDEEC]/40 text-[#2F6F8F] border border-[#AEE3D8] rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center space-x-1.5"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#2D7A4F]" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? c.copied : c.copy}</span>
      </button>
    </div>
  );
}

export default function InfoAccessView({ lang }: InfoAccessViewProps) {
  const c = COPY[lang];
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#AEE3D8] via-[#BCECE3] to-[#9CDFD2] rounded-[26px] p-5 text-[#2F6F8F] shadow-sm border-2 border-[#7ECBBF]">
        <h2 className="text-xl font-black tracking-tight font-heading flex items-center space-x-2">
          <Info className="w-5 h-5" />
          <span>{c.title}</span>
        </h2>
        <p className="text-[11px] mt-0.5 opacity-80">{c.subtitle}</p>
      </div>

      {/* Telegram bot: link + QR picture */}
      <div className="bg-white rounded-2xl border border-[#AEE3D8]/60 p-4 space-y-3 shadow-3xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#AEE3D8]/30 text-[#2F6F8F] flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-[#2F6F8F] font-heading">{c.botTitle}</p>
            <p className="text-[11px] text-[#2F6F8F]/70">{c.botDesc}</p>
          </div>
        </div>

        <p className="text-[11px] font-mono text-[#2F6F8F]/80 break-all bg-[#FEFAFB] border border-[#FDDEEC] rounded-lg px-2.5 py-1.5">
          {TELEGRAM_BOT_URL}
        </p>

        <div className="flex flex-col items-center space-y-2">
          <div className="bg-[#FEFAFB] rounded-2xl border border-[#FDDEEC] p-3 shadow-inner">
            {imgFailed ? (
              <QRCodeCanvas
                value={TELEGRAM_BOT_URL}
                size={176}
                level="M"
                includeMargin={true}
                bgColor="#FEFAFB"
                fgColor="#2F6F8F"
              />
            ) : (
              <img
                src={TELEGRAM_QR_IMAGE}
                alt={c.qrAlt}
                onError={() => setImgFailed(true)}
                className="w-44 h-44 object-contain rounded-lg"
              />
            )}
          </div>
          <p className="text-[10px] text-[#CFADB9] font-medium text-center">{c.scan}</p>
        </div>

        <LinkActions url={TELEGRAM_BOT_URL} lang={lang} />
      </div>

      {/* Information portal */}
      <div className="bg-white rounded-2xl border border-[#AEE3D8]/60 p-4 space-y-3 shadow-3xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#FDDEEC]/60 text-[#FA6B90] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-[#2F6F8F] font-heading">{c.portalTitle}</p>
            <p className="text-[11px] text-[#2F6F8F]/70">{c.portalDesc}</p>
          </div>
        </div>

        <p className="text-[11px] font-mono text-[#2F6F8F]/80 break-all bg-[#FEFAFB] border border-[#FDDEEC] rounded-lg px-2.5 py-1.5">
          {INFO_PORTAL_URL}
        </p>

        <LinkActions url={INFO_PORTAL_URL} lang={lang} />
      </div>
    </div>
  );
}
