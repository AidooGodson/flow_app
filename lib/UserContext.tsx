import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { tokenStore } from './tokenStore';
import type { User } from './types';

const STORE_KEY = 'flow_session';

interface StoredSession {
  user: User;
  accessToken: string;
}

interface UserContextValue {
  user: User | null;
  loading: boolean;
  setUser: (u: User, accessToken: string) => Promise<void>;
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
          const { user: u, accessToken } = JSON.parse(raw) as StoredSession;
          tokenStore.set(accessToken);
          setUserState(u);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function setUser(u: User, accessToken: string) {
    const session: StoredSession = { user: u, accessToken };
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(session));
    tokenStore.set(accessToken);
    setUserState(u);
  }

  async function clearUser() {
    await SecureStore.deleteItemAsync(STORE_KEY);
    tokenStore.set(null);
    setUserState(null);
  }

  useEffect(() => {
    tokenStore.onUnauthorized(clearUser);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
