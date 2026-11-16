import assert from "node:assert/strict";
import test from "node:test";
import {
  clearSession,
  getSavedSession,
  saveSession,
} from "../src/api/auth.js";

test("sessions persist a public user and token, then clear on logout", () => {
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const values = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  });

  try {
    const user = { id: "u1", name: "Marina", email: "marina@example.com", role: "user" };
    saveSession({ user, token: "signed-token" });
    assert.deepEqual(getSavedSession(), user);

    values.set("projectHubSession", JSON.stringify(user));
    assert.equal(getSavedSession(), null);

    clearSession();
    assert.equal(getSavedSession(), null);
  } finally {
    if (originalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalStorage);
    } else {
      delete globalThis.localStorage;
    }
  }
});
