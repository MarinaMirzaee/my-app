const ACCOUNTS_KEY = "projectHubAccounts";
const SESSION_KEY = "projectHubSession";
const HASH_ITERATIONS = 210_000;

function readAccounts() {
  const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  if (!Array.isArray(accounts)) {
    throw new Error("Stored account data is invalid.");
  }
  return accounts;
}

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

function publicAccount(account) {
  return { id: account.id, name: account.name, email: account.email };
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getSavedSession() {
  const value = localStorage.getItem(SESSION_KEY);
  return value ? JSON.parse(value) : null;
}

export async function createAccount({ name, email, password }) {
  const accounts = readAccounts();
  const normalizedEmail = email.trim().toLocaleLowerCase();
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const account = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordSalt: salt,
    passwordHash: await hashPassword(password, salt),
  };
  saveAccounts([...accounts, account]);
  return publicAccount(account);
}

export async function authenticateAccount({ email, password }) {
  const normalizedEmail = email.trim().toLocaleLowerCase();
  const account = readAccounts().find(
    (candidate) => candidate.email === normalizedEmail,
  );
  if (!account) throw new Error("Invalid email or password.");

  const passwordHash = await hashPassword(password, account.passwordSalt);
  if (passwordHash !== account.passwordHash) {
    throw new Error("Invalid email or password.");
  }
  return publicAccount(account);
}

export function saveSession(account) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(account));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function updateAccount(id, { name, email }) {
  const accounts = readAccounts();
  const normalizedEmail = email.trim().toLocaleLowerCase();
  const duplicate = accounts.find(
    (account) => account.id !== id && account.email === normalizedEmail,
  );
  if (duplicate) throw new Error("An account with this email already exists.");

  const index = accounts.findIndex((account) => account.id === id);
  if (index < 0) throw new Error("The current account could not be found.");

  const updated = {
    ...accounts[index],
    name: name.trim(),
    email: normalizedEmail,
  };
  accounts[index] = updated;
  saveAccounts(accounts);
  return publicAccount(updated);
}