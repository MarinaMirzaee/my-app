import { apiFetch, readApiError } from "./client.js";

export async function getUsers() {
  const res = await apiFetch("/users");

  if (!res.ok) {
    throw await readApiError(res, "Failed to fetch users.");
  }

  return res.json();
}

export async function getUser(id) {
  const res = await apiFetch(`/users/${encodeURIComponent(id)}`);

  if (!res.ok) {
    throw await readApiError(res, "User not found.");
  }

  return res.json();
}
