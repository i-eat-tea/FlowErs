/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Feature usage tracking — fire-and-forget POST to /api/usage.
 */

export type Feature =
  | 'signup' | 'login' | 'logout'
  | 'setup_wizard'
  | 'home_view' | 'records_view' | 'calendar_view' | 'info_view' | 'passport_view'
  | 'record_scan' | 'record_add'
  | 'appointment_add'
  | 'info_link'
  | 'emergency_modal' | 'emergency_qr'
  | 'journey_report'
  | 'language_switch'
  | 'upgrade_modal'
  | 'walkthrough'
  | 'doctor_dashboard' | 'patient_detail'
  | 'doctor_note' | 'reminder_set' | 'daily_note';

export type Action =
  | 'view' | 'open' | 'click' | 'copy' | 'create' | 'start' | 'step' | 'complete' | 'skip' | 'replay';

export interface UsageEvent {
  feature: Feature;
  action: Action;
  metadata?: Record<string, string | number>;
}

/** Debounce identical events within N milliseconds. */
const lastEventKey = new Map<string, number>();
const DEBOUNCE_MS = 2000;

function debounceEvent(feature: Feature, action: Action, metadata?: Record<string, string | number>): boolean {
  let key = `${feature}:${action}`;
  if (metadata) {
    const target = metadata.target;
    const tab = metadata.tab;
    if (target) key += `:${target}`;
    if (tab) key += `:${tab}`;
  }
  const now = Date.now();
  const last = lastEventKey.get(key) || 0;
  if (now - last < DEBOUNCE_MS) return true; // skip
  lastEventKey.set(key, now);
  return false;
}

/** Track a feature usage event. Fire and forget. */
export async function trackFeature(feature: Feature, action: Action, metadata?: Record<string, string | number>): Promise<void> {
  try {
    // Write even if no auth token (guest clicks still tracked; server will gate consent)
    const token = localStorage.getItem('flowers_auth_token');
    const userId = (window as any).__userId || localStorage.getItem('flowers_user_id') || undefined;

    // Skip if debounced
    if (debounceEvent(feature, action, metadata)) return;

    // Vocabulary-only metadata (drop unknown keys / bad values)
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-App-Lang': (window as any).__usageLang || 'en' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const allowed = {
      target: ['telegram_bot', 'data_center'],
      tab: ['home', 'records', 'calendar', 'info', 'passport'],
      category: ['ultrasound', 'lab_test', 'prescription', 'vaccine', 'doctor_note'],
      type: ['ANC', 'Ultrasound', 'Blood Test', 'Vaccine', 'Specialist', 'Other'],
      reminder: ['1_week', '3_days', '1_day', 'same_day', 'custom', 'none'],
      tier: ['free', 'premium'],
      variant: ['mother', 'doctor'],
      lang: ['en', 'kh'],
    };
    const cleanMeta: Record<string, string | number> = {};
    if (metadata) {
      for (const [k, v] of Object.entries(metadata)) {
        if (k === 'step' || k === 'total_steps') {
          if (typeof v === 'number' && v >= 1 && v <= 20) cleanMeta[k] = v;
        } else if (allowed[k as keyof typeof allowed]) {
          if (allowed[k as keyof typeof allowed].includes(String(v))) cleanMeta[k] = v;
        }
      }
    }
    await fetch('/api/usage', {
      method: 'POST',
      keepalive: true,
      headers,
      body: JSON.stringify({
        userId: userId || undefined,
        events: [{ feature, action, metadata: Object.keys(cleanMeta).length ? cleanMeta : undefined }]
      })
    });
  } catch {
    // swallow errors
  }
}

export function setUsageLang(lang: 'en'|'kh') { (window as any).__usageLang = lang; }
