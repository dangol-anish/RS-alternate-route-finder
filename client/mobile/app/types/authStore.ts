import { User } from "./user";

export type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (status: boolean) => void;
  saveSession: (session: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  loadSession: () => Promise<void>;
  clearSession: () => Promise<void>;
};
