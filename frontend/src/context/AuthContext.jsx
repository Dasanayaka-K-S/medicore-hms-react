import { createContext, useContext, useMemo, useState } from 'react';
import api, { storeSession, clearSession, getStoredToken, getStoredUser } from '../services/api.js';
import { canAccess } from '../config/modules.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());

  async function login(username, password, remember = false) {
    const { data } = await api.post('/auth/login', { username, password });
    storeSession(data.token, data.user, remember);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      can: (moduleKey) => (user ? canAccess(user.role_name, moduleKey) : false),
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
