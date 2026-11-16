import { useState } from "react";
import { AuthContext } from "./authContextValue";

import {
  authenticateAccount,
  clearSession,
  createAccount,
  getSavedSession,
  saveSession,
  updateAccount as updateStoredAccount,
} from "../api/auth";
import { getAccessToken } from "../api/client";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedSession);

  async function signUp(accountData) {
    const session = await createAccount(accountData);

    saveSession(session);
    setUser(session.user);

    return session.user;
  }

  async function login(credentials) {
    const session = await authenticateAccount(credentials);

    saveSession(session);
    setUser(session.user);

    return session.user;
  }

  async function updateAccount(accountData) {
    if (!user) {
      throw new Error("You must be signed in to update your account.");
    }

    const account = await updateStoredAccount(user.id, accountData);
    saveSession({ user: account, token: getAccessToken() });
    setUser(account);

    return account;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signUp,
        login,
        updateAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
