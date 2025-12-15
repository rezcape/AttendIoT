import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  studentId?: string;
}

import api from '@/lib/api';

// ... (interfaces remain the same)

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshProfile = async () => {
    try {
        const response = await api.get('/auth/profile');
        const userData = response.data.data;
        
        const userObj: User = {
            id: userData._id || userData.id, // Handle both cases
            name: userData.name,
            email: userData.email,
            role: userData.role,
            studentId: userData.studentId
        };
        
        setUser(userObj);
        
        // Update storage if it exists
        if (localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(userObj));
        }
        if (sessionStorage.getItem('user')) {
            sessionStorage.setItem('user', JSON.stringify(userObj));
        }
    } catch (error) {
        console.error("Failed to refresh profile", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (token && storedUser) {
        // Optionally verify token validity here with an API call like /auth/profile
        // For now, we'll trust the stored user but maybe clear it on 401 later
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Failed to parse stored user", e);
            // Fallback/Logout logic could go here
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, data: userData } = response.data;
      
      const userObj: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        // studentId might be in userData if the backend sends it, adapt if needed
        studentId: userData.studentId 
      };

      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userObj));
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(userObj));
      }

      setUser(userObj);
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userObj.name}!`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      let message = 'Invalid email or password';
      if (error) {
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.message) {
          message = error.message;
        }
      }
      
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      
      const { token, data: userData } = response.data;

      const userObj: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        studentId: userData.studentId
      };

      // Default to localStorage for registration flow usually, or match login behavior
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));

      setUser(userObj);
      
      toast({
        title: 'Registration successful',
        description: `Welcome, ${userObj.name}!`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      let message = 'An error occurred during registration';
      if (error) {
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.message) {
          message = error.message;
        }
      }

      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });

    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, refreshProfile }}>
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
