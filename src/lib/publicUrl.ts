export const PUBLIC_BASE_URL = (
  (import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined) || window.location.origin
).replace(/\/$/, '');
