'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'landlord' | 'tenant' | 'admin';
  avatarUrl?: string;
  verificationStatus?: {
    status: 'pending' | 'approved' | 'rejected';
    idVerified: boolean;
    faceMatched: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('leasemate_token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken) as any;
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          setToken(storedToken);
          // Fetch user data
          fetchUserData(storedToken);
        } else {
          localStorage.removeItem('leasemate_token');
        }
      } catch (error) {
        localStorage.removeItem('leasemate_token');
      }
    }
    setIsLoading(false);
  }, []);

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('leasemate_token');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('leasemate_token');
    }
  };

  const login = (authToken: string) => {
    localStorage.setItem('leasemate_token', authToken);
    setToken(authToken);
    fetchUserData(authToken);
  };

  const logout = () => {
    localStorage.removeItem('leasemate_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}; 