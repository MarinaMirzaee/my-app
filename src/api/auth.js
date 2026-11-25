const SESSION_KEY = "projectHubSession";
import { apiFetch, readApiError } from "./client.js";

export function getSavedSession() {
  if (typeof localStorage === "undefined") return null;
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return session?.token && session?.user ? session.user : null;
  } catch {
    return null;
  }
}

export async function createAccount({ name, email, password }) {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  }, false);

  if (!res.ok) throw await readApiError(res, "Could not create the account.");
  return res.json();
}

export async function authenticateAccount({ email, password }) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  }, false);

  if (!res.ok) throw await readApiError(res, "Invalid email or password.");
  return res.json();
}

export function saveSession({ user, token }) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
}

export function clearSession() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export async function updateAccount(id, { name, email }) {
  const res = await apiFetch(`/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email }),
  });

  if (!res.ok) throw await readApiError(res, "Could not update the account.");
  return res.json();
}
