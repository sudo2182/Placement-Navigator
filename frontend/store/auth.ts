import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
  id: number;
  email: string;
  role: string;
  profile_data: any;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    // Bypass backend authentication: accept any credentials and proceed
    const dummyUser: User = {
      id: Date.now(),
      email,
      role: 'student',
      profile_data: {}
    };
    localStorage.setItem('token', 'dev-bypass');
    set({ user: dummyUser, isLoading: false });
  },
  
  register: async (email: string, password: string, role: string) => {
    set({ isLoading: true });
    try {
      const response = await api.auth.register({
        email,
        password,
        role,
        profile_data: {}
      });
      const { access_token, user } = response.data as AuthResponse;
      
      localStorage.setItem('token', access_token);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },
  
  setUser: (user: User | null) => set({ user }),
}));