const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SESSION_KEY = "projectHubSession";

export function getAccessToken() {
  if (typeof localStorage === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null")?.token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}, authenticated = true) {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();

  if (authenticated && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}

export async function readApiError(response, fallback) {
  const result = await response.json().catch(() => null);
  return new Error(result?.error || fallback);
}
