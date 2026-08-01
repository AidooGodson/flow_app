import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { tokenStore } from './tokenStore';
import type { User } from './types';

const STORE_KEY = 'flow_session';

interface StoredSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface UserContextValue {
  user: User | null;
  loading: boolean;
  setUser: (u: User, accessToken: string, refreshToken: string, expiresAt: number) => Promise<void>;
  clearUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  setUser: async () => {},
  clearUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(STORE_KEY)
      .then((raw) => {
        if (raw) {
          const { user: u, accessToken, refreshToken, expiresAt } = JSON.parse(raw) as StoredSession;
          tokenStore.set(accessToken, refreshToken, expiresAt);
          setUserState(u);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function setUser(u: User, accessToken: string, refreshToken: string, expiresAt: number) {
    const session: StoredSession = { user: u, accessToken, refreshToken, expiresAt };
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(session));
    tokenStore.set(accessToken, refreshToken, expiresAt);
    setUserState(u);
  }

  async function clearUser() {
    await SecureStore.deleteItemAsync(STORE_KEY);
    tokenStore.clear();
    setUserState(null);
  }

  // Persist refreshed tokens without changing the user object
  async function updateTokens(accessToken: string, refreshToken: string, expiresAt: number) {
    const raw = await SecureStore.getItemAsync(STORE_KEY);
    if (!raw) return;
    const session = JSON.parse(raw) as StoredSession;
    const updated: StoredSession = { ...session, accessToken, refreshToken, expiresAt };
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(updated));
    tokenStore.set(accessToken, refreshToken, expiresAt);
  }

  useEffect(() => {
    tokenStore.onUnauthorized(clearUser);
  }, []);

  // Expose updateTokens so api.ts can call it after a refresh
  tokenStore.onTokensRefreshed = updateTokens;

  return (
    <UserContext.Provider value={{ user, loading, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
