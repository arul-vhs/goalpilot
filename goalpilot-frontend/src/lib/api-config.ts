export const API_URL = import.meta.env.VITE_API_URL || "https://goalpilot-1.onrender.com";

export function getApiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || "https://goalpilot-1.onrender.com";
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  const url = `${cleanBase}/${cleanPath}`;

  if (import.meta.env.DEV) {
    console.log(`[API Call] ${url}`);
  }

  return url;
}
