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
  | 'view' | 'open' | 'click' | 'create' | 'start' | 'step' | 'complete' | 'skip' | 'replay';

export interface UsageEvent {
  feature: Feature;
  action: Action;
  metadata?: Record<string, string | number>;
}

/** Debounce identical events within N milliseconds. */
const lastEventKey = new Map<string, number>();
const DEBOUNCE_MS = 2000;

function debounceEvent(feature: Feature, action: Action): boolean {
  const key = `${feature}:${action}`;
  const now = Date.now();
  const last = lastEventKey.get(key) || 0;
  if (now - last < DEBOUNCE_MS) return true; // skip
  lastEventKey.set(key, now);
  return false;
}

/** Track a feature usage event. Fire and forget. */
export async function trackFeature(feature: Feature, action: Action, metadata?: Record<string, string | number>): Promise<void> {
  try {
    // Skip if no auth token (user is not signed in / session expired)
    const token = localStorage.getItem('flowers_auth_token');
    if (!token) return;

    // Skip if debounced
    if (debounceEvent(feature, action)) return;

    // JWT was already verified above; build headers
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-App-Lang': (window as any).__usageLang || 'en' };
    headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/usage', {
      method: 'POST',
      keepalive: true,
      headers,
      body: JSON.stringify({
        events: [{ feature, action, metadata }]
      })
    });
  } catch {
    // swallow errors
  }
}

export function setUsageLang(lang: 'en'|'kh') { (window as any).__usageLang = lang; }
