import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../../../shared/types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickSwitchRole: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('bhoomi_setu_ai_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        if (token) {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
          } else {
            // Auto login default demo officer
            await quickSwitchRole('admin');
          }
        } else {
          await quickSwitchRole('admin');
        }
      } catch {
        // Fallback to default admin in memory
        setUser({
          id: 'admin-id',
          name: 'Dr. Rajeshwar Verma, IAS',
          email: 'admin@bhoomi.gov.in',
          role: 'admin',
          department: 'Revenue & Land Reforms Department',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          createdAt: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      localStorage.setItem('bhoomi_setu_ai_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const quickSwitchRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const data = await api.quickDemoLogin(role);
      localStorage.setItem('bhoomi_setu_ai_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } catch {
      // Offline fallback
      const roleNames: Record<UserRole, string> = {
        admin: 'Dr. Rajeshwar Verma, IAS',
        district_officer: 'Smt. Priya Sharma (District Collector)',
        verification_officer: 'Shri Manoj Patel (Verification Officer)',
        viewer: 'Ananya Deshmukh (Public Viewer)',
      };
      setUser({
        id: `mock-${role}`,
        name: roleNames[role],
        email: `${role}@bhoomi.gov.in`,
        role,
        department: 'Revenue & Land Administration',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bhoomi_setu_ai_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, quickSwitchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
