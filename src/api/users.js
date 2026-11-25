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

export async function updateUserRole(id, role) {
  const res = await apiFetch(`/users/${encodeURIComponent(id)}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw await readApiError(res, "Could not update the user role.");
  return res.json();
}
