// Ruta:Joyeria-Diana-Laura/Frontend/src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  email: string;
  nombre: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nombre: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay usuario en localStorage al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('diana_laura_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('diana_laura_user', JSON.stringify(userData));
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const register = async (email: string, password: string, nombre: string) => {
    try {
      const response = await authAPI.register(email, password, nombre);
      
      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al registrar usuario');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('diana_laura_user');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};