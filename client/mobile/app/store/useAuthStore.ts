import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { AuthStore } from "../types/authStore";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user }),
  setIsAuthenticated: (status) => set({ isAuthenticated: status }),

  saveSession: async ({ user, accessToken, refreshToken }) => {
    await SecureStore.setItemAsync("user", JSON.stringify(user));
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    set({ user, isAuthenticated: true });
  },

  loadSession: async () => {
    const userStr = await SecureStore.getItemAsync("user");
    const accessToken = await SecureStore.getItemAsync("accessToken");
    const refreshToken = await SecureStore.getItemAsync("refreshToken");

    if (userStr && accessToken && refreshToken) {
      const user = JSON.parse(userStr);
      set({ user, isAuthenticated: true });
    }
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    set({ user: null, isAuthenticated: false });
  },
}));
