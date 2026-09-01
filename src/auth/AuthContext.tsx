import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserPersona } from '../types';
import { loginRequest, pinSession } from '../services/api';

const SESSION_KEY = 'omnia.session';

interface StoredSession {
  personaId: string;
}

interface AuthContextType {
  user: UserPersona | null;
  /** True during the initial localStorage rehydrate — routes should wait for this. */
  isHydrating: boolean;
  /** True while a login request is in flight. */
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; user?: UserPersona }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed && parsed.personaId ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable — session simply won't persist */
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPersona | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (!session) {
      setIsHydrating(false);
      return;
    }
    pinSession(session.personaId)
      .then(res => {
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          writeSession(null);
        }
      })
      .catch(() => writeSession(null))
      .finally(() => setIsHydrating(false));
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string; user?: UserPersona }> => {
    setIsAuthenticating(true);
    try {
      const res = await loginRequest(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        writeSession({ personaId: res.user.id });
        return { ok: true, user: res.user };
      }
      return { ok: false, error: res.error || 'Login failed. Please try again.' };
    } catch {
      return { ok: false, error: 'Could not reach the authentication service.' };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    writeSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isHydrating, isAuthenticating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
