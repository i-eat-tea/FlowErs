/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Consent cookies utility — reads/writes the two "flowers_" cookies.
 */

type ConsentChoice = 'accepted' | 'declined' | null;

/** Returns the current consent choice from the cookie (null if missing or other). */
export function getConsentFromCookie(): ConsentChoice {
  const match = document.cookie.match(/flowers_consent=([^;]+)/);
  if (!match) return null;
  const value = match[1];
  return value === 'accepted' || value === 'declined' ? (value as ConsentChoice) : null;
}

/** Sets a consent choice cookie, also clears session ID if declined. */
export function setConsentCookie(choice: 'accepted' | 'declined'): void {
  // expiration in 180 days (180 * 24 * 60 * 60 seconds)
  const maxAge = 180 * 24 * 60 * 60;
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  document.cookie = `flowers_consent=${choice}; path=/; expires=${expires}; SameSite=Lax` +
    (import.meta.env.PROD ? '; Secure' : '');
  if (choice === 'declined') {
    // Clear session ID if present (httpOnly not accessible to JS, but we clear anyway)
    document.cookie = `flowers_sid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax` +
      (import.meta.env.PROD ? '; Secure' : '');
  }
}

/** Convenience — does a consent choice already exist in the cookie? */
export function consentExists(): boolean {
  return document.cookie.includes('flowers_consent=');
}