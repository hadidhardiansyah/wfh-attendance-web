import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState } from "../types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token, user) => {
        localStorage.setItem("access_token", token);
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("access_token");
        set({ token: null, user: null, isAuthenticated: false });
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "wfh-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
