const BASE_URL = "http://localhost:3001";

const SESSION_KEY = "projectHubSession";

const HASH_ITERATIONS = 210_000;

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

async function hashPassword(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Secure password hashing is unavailable in this browser.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: Uint8Array.from(salt.match(/.{2}/g), (byte) =>
        Number.parseInt(byte, 16),
      ),
      iterations: HASH_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );

  return toHex(new Uint8Array(bits));
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function getStoredUsers() {
  const res = await fetch(`${BASE_URL}/users`);

  if (!res.ok) {
    throw new Error("Could not load users.");
  }

  return res.json();
}

export function getSavedSession() {
  const value = localStorage.getItem(SESSION_KEY);

  return value ? JSON.parse(value) : null;
}

export async function createAccount({ name, email, password }) {
  const users = await getStoredUsers();

  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    role: "user",
    passwordSalt: salt,
    passwordHash: await hashPassword(password, salt),
  };

  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    throw new Error("Could not create the account.");
  }

  return publicUser(user);
}

export async function authenticateAccount({ email, password }) {
  const users = await getStoredUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail,
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const passwordHash = await hashPassword(password, user.passwordSalt);

  if (passwordHash !== user.passwordHash) {
    throw new Error("Invalid email or password.");
  }

  return publicUser(user);
}

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function updateAccount(id, { name, email }) {
  const users = await getStoredUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const duplicate = users.find(
    (user) => user.id !== id && user.email.toLowerCase() === normalizedEmail,
  );

  if (duplicate) {
    throw new Error("An account with this email already exists.");
  }

  const currentUser = users.find((user) => user.id === id);

  if (!currentUser) {
    throw new Error("The current account could not be found.");
  }

  const updated = {
    ...currentUser,
    name: name.trim(),
    email: normalizedEmail,
  };

  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updated),
  });

  if (!res.ok) {
    throw new Error("Could not update the account.");
  }

  return publicUser(updated);
}
