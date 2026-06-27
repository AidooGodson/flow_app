import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { User } from './types';

const STORE_KEY = 'flow_user';

interface UserContextValue {
  user: User | null;
  loading: boolean;
  setUser: (u: User) => Promise<void>;
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
        if (raw) setUserState(JSON.parse(raw) as User);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function setUser(u: User) {
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(u));
    setUserState(u);
  }

  async function clearUser() {
    await SecureStore.deleteItemAsync(STORE_KEY);
    setUserState(null);
  }

  return (
    <UserContext.Provider value={{ user, loading, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
