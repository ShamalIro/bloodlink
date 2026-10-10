import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, USER_KEY, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [pairs] = await Promise.all([
        AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]),
        new Promise((r) => setTimeout(r, 1200)), // keep splash visible briefly
      ]);
      const savedToken = pairs[0][1];
      const savedUser = pairs[1][1];
      if (!mounted) return;
      setToken(savedToken);
      setUser(savedUser ? JSON.parse(savedUser) : null);
      setBooting(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      setToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      booting,
      signIn: async (newToken, newUser) => {
        await AsyncStorage.multiSet([
          [TOKEN_KEY, newToken],
          [USER_KEY, JSON.stringify(newUser ?? null)],
        ]);
        setToken(newToken);
        setUser(newUser ?? null);
      },
      signOut: async () => {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);