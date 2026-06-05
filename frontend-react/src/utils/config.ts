// Vite exposes env variables via import.meta.env
// In dev, the Vite proxy forwards /api requests to http://localhost:5000
// So we use relative paths in dev (empty string = same origin)
const API_URL = (import.meta as any).env?.VITE_API_URL ?? '';

export const config = {
  apiBase: `${API_URL}/api`,
} as const;
