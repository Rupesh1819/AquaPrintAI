import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuthenticated: (status: boolean) => void;
  setLoading: (status: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  error: null,
  setAuthenticated: (status) => set({ isAuthenticated: status, isLoading: false }),
  setLoading: (status) => set({ isLoading: status }),
  setError: (error) => set({ error }),
  logout: () => set({ isAuthenticated: false, error: null }),
}))
