import { create } from "zustand";

type User = {
  email: string;
  full_name: string;
  phone: string;
  photo: string | null; // Add the photo field here
};

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (status: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user }),
  setIsAuthenticated: (status) => set({ isAuthenticated: status }),
}));
