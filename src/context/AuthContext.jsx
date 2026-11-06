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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedSession);

  async function signUp(accountData) {
    const account = await createAccount(accountData);
    saveSession(account);
    setUser(account);
    return account;
  }

  async function login(credentials) {
    const account = await authenticateAccount(credentials);
    saveSession(account);
    setUser(account);
    return account;
  }

  function updateAccount(accountData) {
    if (!user) throw new Error("You must be signed in to update your account.");
    const account = updateStoredAccount(user.id, accountData);
    saveSession(account);
    setUser(account);
    return account;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signUp, login, updateAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}