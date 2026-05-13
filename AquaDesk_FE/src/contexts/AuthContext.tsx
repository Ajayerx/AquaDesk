import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { LoginData } from '../services/authService';

interface User {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  companyId: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  accessRights: any[];
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  hasPermission: (formName: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [accessRights, setAccessRights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRights = localStorage.getItem('accessRights');

    if (storedToken && storedUser) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }

      setAccessRights(storedRights ? JSON.parse(storedRights) : []);
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    const response = await authService.login(data);
    const { token, user, accessRights } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessRights', JSON.stringify(accessRights));

    setToken(token);
    setUser(user);
    setAccessRights(accessRights);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accessRights');
    setToken(null);
    setUser(null);
    setAccessRights([]);
  };

  const hasPermission = (formName: string, action: string): boolean => {
    if (user?.role === 'Admin') return true;
    const right = accessRights.find((r) => r.FormName === formName);
    return right ? right[action] : false;
  };

  return (
    <AuthContext.Provider value={{ user, token, accessRights, login, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
