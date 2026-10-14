diff --git a/src/App.tsx b/src/App.tsx
index 934d267..beae331 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -4,7 +4,7 @@
  */
 
 import React, { useState, useMemo, useEffect, useCallback } from 'react';
-import { Home, FileText, Calendar, User, Plus, Camera, Flower2, LogOut, Users } from 'lucide-react';
+import { Home, FileText, Calendar, User, Plus, Camera, Flower2, LogOut, Info } from 'lucide-react';
 
 // Data and Types
 import { PassportProfile, MedicalRecord, Appointment, UserRole, MotherProfile, PregnancyProfile, MedicalRecord as NewMedicalRecord, PatientSummary, SubscriptionTier, DocumentFolder } from './types';
@@ -26,7 +26,7 @@ import AddRecordModal from './components/AddRecordModal';
 import JourneySummaryReport from './components/JourneySummaryReport';
 import LoginView from './components/LoginView';
 import PregnancySetupWizard from './components/PregnancySetupWizard';
-import FamilyAccessView from './components/FamilyAccessView';
+import InfoAccessView from './components/InfoAccessView';
 import UpgradeModal from './components/UpgradeModal';
 
 // Components — Doctor
@@ -145,7 +145,7 @@ export default function App() {
   const [isDoctorDataLoaded, setIsDoctorDataLoaded] = useState(false);
 
   // Active Tab: 4 MVP tabs strictly
-  const [activeTab, setActiveTab] = useState<'home' | 'records' | 'calendar' | 'passport' | 'family'>('home');
+  const [activeTab, setActiveTab] = useState<'home' | 'records' | 'calendar' | 'passport' | 'info'>('home');
 
   // Modal Overlays
   const [emergencyOpen, setEmergencyOpen] = useState(false);
@@ -817,29 +817,8 @@ export default function App() {
           />
         )}
 
-        {activeTab === 'family' && (
-          <FamilyAccessView
-            motherProfileId={userId || 'mother-001'}
-            lang={lang}
-            onAdd={async (member) => {
-              await fetch('/api/family-members', {
-                method: 'POST',
-                headers: { 'Content-Type': 'application/json' },
-                body: JSON.stringify(member)
-              });
-            }}
-            onUpdate={async (m) => {
-              await fetch(`/api/family-members/${m.id}`, {
-                method: 'PUT',
-                headers: { 'Content-Type': 'application/json' },
-                body: JSON.stringify({ name: m.name, phone: m.phone, relation: m.relation, canEdit: m.canEdit })
-              });
-            }}
-            onDelete={async (id) => {
-              await fetch(`/api/family-members/${id}`, { method: 'DELETE' });
-            }}
-          />
-        )}
+        {/* TAB: INFORMATION ACCESS (Telegram bot + information portal) */}
+        {activeTab === 'info' && <InfoAccessView lang={lang} />}
 
         {/* TAB 4: ⚘ PASSPORT (UNIFIED PROFILE & MATERNAL PASSPORT) */}
         {activeTab === 'passport' && (
@@ -913,23 +892,20 @@ export default function App() {
             </span>
           </button>
 
-          {/* Family Tab */}
+          {/* Information Tab */}
           <button
-            onClick={() => {
-              if (subscriptionTier === 'free') { setShowUpgradeModal(true); return; }
-              setActiveTab('family');
-            }}
+            onClick={() => setActiveTab('info')}
             className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
-              activeTab === 'family' ? 'text-[#2F6F8F]' : 'text-[#CFADB9] hover:text-[#2F6F8F]'
+              activeTab === 'info' ? 'text-[#2F6F8F]' : 'text-[#CFADB9] hover:text-[#2F6F8F]'
             }`}
             style={{ minHeight: '42px' }}
-            id="tab-family"
+            id="tab-info"
           >
-            <div className={`p-1 rounded-full transition-all ${activeTab === 'family' ? 'bg-[#AEE3D8] shadow-3xs' : ''}`}>
-              <Users className={`w-5 h-5 ${activeTab === 'family' ? 'text-[#2F6F8F] stroke-[2.5]' : ''}`} />
+            <div className={`p-1 rounded-full transition-all ${activeTab === 'info' ? 'bg-[#AEE3D8] shadow-3xs' : ''}`}>
+              <Info className={`w-5 h-5 ${activeTab === 'info' ? 'text-[#2F6F8F] stroke-[2.5]' : ''}`} />
             </div>
-            <span className={`text-[8px] mt-0.5 uppercase tracking-tight ${activeTab === 'family' ? 'font-black text-[#2F6F8F]' : 'font-semibold'}`}>
-              {t.family}
+            <span className={`text-[8px] mt-0.5 uppercase tracking-tight ${activeTab === 'info' ? 'font-black text-[#2F6F8F]' : 'font-semibold'}`}>
+              {t.info}
             </span>
           </button>
 
diff --git a/src/components/InfoAccessView.tsx b/src/components/InfoAccessView.tsx
new file mode 100644
index 0000000..ce38a23
--- /dev/null
+++ b/src/components/InfoAccessView.tsx
@@ -0,0 +1,183 @@
+/**
+ * @license
+ * SPDX-License-Identifier: Apache-2.0
+ *
+ * Information Access — links to the FlowErs Telegram bot and the information portal,
+ * plus the Telegram bot QR picture (public/telegrambot.jpg, falls back to a generated QR).
+ */
+
+import React, { useState } from 'react';
+import { Info, Send, Globe, ExternalLink, Copy, Check } from 'lucide-react';
+import { QRCodeCanvas } from 'qrcode.react';
+
+const TELEGRAM_BOT_URL = 'https://t.me/FlowErs168bot';
+const INFO_PORTAL_URL = 'https://mae-app-byflowers.vercel.app/';
+// Put the picture at public/telegrambot.jpg (file name is case-sensitive on Render).
+const TELEGRAM_QR_IMAGE = '/telegrambot.jpg';
+
+interface InfoAccessViewProps {
+  lang: 'en' | 'kh';
+}
+
+const COPY = {
+  en: {
+    title: 'Information Access',
+    subtitle: 'Chat with our Telegram bot and read health information',
+    botTitle: 'Telegram Bot',
+    botDesc: 'Chat with the FlowErs Telegram bot.',
+    portalTitle: 'Information Portal',
+    portalDesc: 'Open the FlowErs information website.',
+    open: 'Open',
+    copy: 'Copy link',
+    copied: 'Copied',
+    scan: 'Scan with your phone camera to open the bot',
+    qrAlt: 'QR code for the FlowErs Telegram bot',
+  },
+  kh: {
+    title: 'ចូលប្រើព័ត៌មាន',
+    subtitle: 'ជជែកជាមួយ Telegram Bot និងអានព័ត៌មានសុខភាព',
+    botTitle: 'Telegram Bot',
+    botDesc: 'ជជែកជាមួយ FlowErs Telegram Bot។',
+    portalTitle: 'វេបសាយព័ត៌មាន',
+    portalDesc: 'បើកវេបសាយព័ត៌មាន FlowErs។',
+    open: 'បើក',
+    copy: 'ចម្លងតំណ',
+    copied: 'បានចម្លង',
+    scan: 'ស្កេនដោយកាមេរ៉ាទូរសព្ទ ដើម្បីបើក Bot',
+    qrAlt: 'កូដ QR របស់ FlowErs Telegram Bot',
+  },
+} as const;
+
+async function copyText(text: string): Promise<boolean> {
+  try {
+    await navigator.clipboard.writeText(text);
+    return true;
+  } catch {
+    try {
+      const ta = document.createElement('textarea');
+      ta.value = text;
+      ta.style.position = 'fixed';
+      ta.style.opacity = '0';
+      document.body.appendChild(ta);
+      ta.select();
+      const ok = document.execCommand('copy');
+      document.body.removeChild(ta);
+      return ok;
+    } catch {
+      return false;
+    }
+  }
+}
+
+function LinkActions({ url, lang }: { url: string; lang: 'en' | 'kh' }) {
+  const c = COPY[lang];
+  const [copied, setCopied] = useState(false);
+
+  async function handleCopy() {
+    if (await copyText(url)) {
+      setCopied(true);
+      setTimeout(() => setCopied(false), 1800);
+    }
+  }
+
+  return (
+    <div className="flex items-center space-x-2">
+      <a
+        href={url}
+        target="_blank"
+        rel="noopener noreferrer"
+        className="flex-1 py-2.5 bg-[#FA6B90] hover:bg-[#f05e84] text-white rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer transition-all shadow-3xs flex items-center justify-center space-x-1.5"
+      >
+        <ExternalLink className="w-3.5 h-3.5" />
+        <span>{c.open}</span>
+      </a>
+      <button
+        type="button"
+        onClick={handleCopy}
+        className="flex-1 py-2.5 bg-white hover:bg-[#FDDEEC]/40 text-[#2F6F8F] border border-[#AEE3D8] rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer transition-all flex items-center justify-center space-x-1.5"
+      >
+        {copied ? <Check className="w-3.5 h-3.5 text-[#2D7A4F]" /> : <Copy className="w-3.5 h-3.5" />}
+        <span>{copied ? c.copied : c.copy}</span>
+      </button>
+    </div>
+  );
+}
+
+export default function InfoAccessView({ lang }: InfoAccessViewProps) {
+  const c = COPY[lang];
+  const [imgFailed, setImgFailed] = useState(false);
+
+  return (
+    <div className="space-y-4 animate-in fade-in duration-200">
+      {/* Header */}
+      <div className="bg-gradient-to-br from-[#AEE3D8] via-[#BCECE3] to-[#9CDFD2] rounded-[26px] p-5 text-[#2F6F8F] shadow-sm border-2 border-[#7ECBBF]">
+        <h2 className="text-xl font-black tracking-tight font-heading flex items-center space-x-2">
+          <Info className="w-5 h-5" />
+          <span>{c.title}</span>
+        </h2>
+        <p className="text-[11px] mt-0.5 opacity-80">{c.subtitle}</p>
+      </div>
+
+      {/* Telegram bot: link + QR picture */}
+      <div className="bg-white rounded-2xl border border-[#AEE3D8]/60 p-4 space-y-3 shadow-3xs">
+        <div className="flex items-center space-x-3">
+          <div className="w-10 h-10 rounded-full bg-[#AEE3D8]/30 text-[#2F6F8F] flex items-center justify-center shrink-0">
+            <Send className="w-5 h-5" />
+          </div>
+          <div className="min-w-0">
+            <p className="text-sm font-black text-[#2F6F8F] font-heading">{c.botTitle}</p>
+            <p className="text-[11px] text-[#2F6F8F]/70">{c.botDesc}</p>
+          </div>
+        </div>
+
+        <p className="text-[11px] font-mono text-[#2F6F8F]/80 break-all bg-[#FEFAFB] border border-[#FDDEEC] rounded-lg px-2.5 py-1.5">
+          {TELEGRAM_BOT_URL}
+        </p>
+
+        <div className="flex flex-col items-center space-y-2">
+          <div className="bg-[#FEFAFB] rounded-2xl border border-[#FDDEEC] p-3 shadow-inner">
+            {imgFailed ? (
+              <QRCodeCanvas
+                value={TELEGRAM_BOT_URL}
+                size={176}
+                level="M"
+                includeMargin={true}
+                bgColor="#FEFAFB"
+                fgColor="#2F6F8F"
+              />
+            ) : (
+              <img
+                src={TELEGRAM_QR_IMAGE}
+                alt={c.qrAlt}
+                onError={() => setImgFailed(true)}
+                className="w-44 h-44 object-contain rounded-lg"
+              />
+            )}
+          </div>
+          <p className="text-[10px] text-[#CFADB9] font-medium text-center">{c.scan}</p>
+        </div>
+
+        <LinkActions url={TELEGRAM_BOT_URL} lang={lang} />
+      </div>
+
+      {/* Information portal */}
+      <div className="bg-white rounded-2xl border border-[#AEE3D8]/60 p-4 space-y-3 shadow-3xs">
+        <div className="flex items-center space-x-3">
+          <div className="w-10 h-10 rounded-full bg-[#FDDEEC]/60 text-[#FA6B90] flex items-center justify-center shrink-0">
+            <Globe className="w-5 h-5" />
+          </div>
+          <div className="min-w-0">
+            <p className="text-sm font-black text-[#2F6F8F] font-heading">{c.portalTitle}</p>
+            <p className="text-[11px] text-[#2F6F8F]/70">{c.portalDesc}</p>
+          </div>
+        </div>
+
+        <p className="text-[11px] font-mono text-[#2F6F8F]/80 break-all bg-[#FEFAFB] border border-[#FDDEEC] rounded-lg px-2.5 py-1.5">
+          {INFO_PORTAL_URL}
+        </p>
+
+        <LinkActions url={INFO_PORTAL_URL} lang={lang} />
+      </div>
+    </div>
+  );
+}
diff --git a/src/components/UpgradeModal.tsx b/src/components/UpgradeModal.tsx
index 4c6117f..f926820 100644
--- a/src/components/UpgradeModal.tsx
+++ b/src/components/UpgradeModal.tsx
@@ -17,13 +17,13 @@ export default function UpgradeModal({ isOpen, onClose, onUpgrade, lang, feature
   const t = lang === 'en' ? {
     title: 'Upgrade to Premium',
     subtitle: `Unlock ${feature}`,
-    features: ['Unlimited medical records', 'Family member access', 'Secure hospital sharing', 'Cloud backup', 'Emergency profile'],
+    features: ['Unlimited medical records', 'Secure hospital sharing', 'Cloud backup', 'Emergency profile'],
     cta: 'Upgrade Now',
     cancel: 'Maybe Later',
   } : {
     title: '升级到高级版',
     subtitle: `解锁 ${feature}`,
-    features: ['无限医疗记录', '家庭成员访问', '医院安全共享', '云备份', '紧急档案'],
+    features: ['无限医疗记录', '医院安全共享', '云备份', '紧急档案'],
     cta: '立即升级',
     cancel: '稍后再说',
   };
diff --git a/src/data.ts b/src/data.ts
index 0dac5c0..41f9096 100644
--- a/src/data.ts
+++ b/src/data.ts
@@ -186,7 +186,7 @@ export const TRANSLATIONS = {
     home: "Home",
     records: "My Records",
     calendar: "Calendar",
-    family: "Family",
+    info: "Info",
     passport: "Passport",
     emergency: "SOS",
 
@@ -323,7 +323,7 @@ export const TRANSLATIONS = {
     home: "ទំព័រដើម",
     records: "កំណត់ត្រាខ្ញុំ",
     calendar: "ប្រតិទិន",
-    family: "គ្រួសារ",
+    info: "ព័ត៌មាន",
     passport: "លិខិតឆ្លងដែន",
     emergency: "សង្គ្រោះ",