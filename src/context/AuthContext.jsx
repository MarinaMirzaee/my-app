"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { createAccount, updateAccount as updateStoredAccount } from "../api/auth";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }) {
  const { data: session, status, update } = useSession();
  const user = session?.user || null;

  async function login(credentials) {
    const result = await signIn("credentials", { ...credentials, redirect: false });
    if (!result || result.error) throw new Error("Invalid email or password.");
    return (await update())?.user || user;
  }

  async function signUp(accountData) {
    await createAccount(accountData);
    return login({ email: accountData.email, password: accountData.password });
  }

  async function updateAccount(accountData) {
    if (!user) {
      throw new Error("You must be signed in to update your account.");
    }

    const account = await updateStoredAccount(user.id, accountData);
    await update({ user: account });

    return account;
  }

  async function logout() {
    await signOut({ redirect: false });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
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
