/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Consent helpers — read-only (server sets cookies now; client only reads).
 */

export function getConsentFromCookie(): 'accepted' | 'declined' | null {
  const m = document.cookie.match(/flowers_consent=([^;]+)/);
  const v = m ? m[1] : null;
  return v === 'accepted' || v === 'declined' ? v : null;
}

export function consentExists(): boolean {
  return document.cookie.includes('flowers_consent=');
}
