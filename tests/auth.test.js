import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import test from "node:test";
import {
  authenticateAccount,
  clearSession,
  createAccount,
  getSavedSession,
  saveSession,
  updateAccount,
} from "../src/api/auth.js";

test("accounts can sign up, sign in, update profile, and persist/logout sessions", async () => {
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const values = new Map();
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: webcrypto,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  });

  try {
    const account = await createAccount({
      name: " Marina ",
      email: "MARINA@example.com",
      password: "passphrase-123",
    });

    assert.equal(account.name, "Marina");
    assert.equal(account.email, "marina@example.com");
    assert.equal(
      (await authenticateAccount({
        email: "Marina@example.com",
        password: "passphrase-123",
      })).id,
      account.id,
    );

    await assert.rejects(
      createAccount({
        name: "Another user",
        email: "marina@example.com",
        password: "different-password",
      }),
      /already exists/,
    );
    await assert.rejects(
      authenticateAccount({
        email: account.email,
        password: "wrong-password",
      }),
      /Invalid email or password/,
    );

    saveSession(account);
    assert.equal(getSavedSession().id, account.id);

    const updated = updateAccount(account.id, {
      name: "Marina Mirzaee",
      email: "marina.m@example.com",
    });
    assert.equal(updated.name, "Marina Mirzaee");
    assert.equal(
      (await authenticateAccount({
        email: "marina.m@example.com",
        password: "passphrase-123",
      })).id,
      account.id,
    );

    clearSession();
    assert.equal(getSavedSession(), null);
  } finally {
    if (originalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalStorage);
    } else {
      delete globalThis.localStorage;
    }
    if (originalCrypto) {
      Object.defineProperty(globalThis, "crypto", originalCrypto);
    } else {
      delete globalThis.crypto;
    }
  }
});
