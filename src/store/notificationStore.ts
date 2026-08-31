import { create } from "zustand";
import type { Notification } from "../types";
import api from "../services/api";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "read">) => void;
  setNotifications: (n: Notification[]) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) =>
    set((state) => {
      const notification: Notification = {
        ...n,
        id: Date.now().toString(),
        read: false,
      };
      return {
        notifications: [notification, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      };
    }),
  setNotifications: (n) =>
    set({ notifications: n, unreadCount: n.filter((x) => !x.read).length }),
  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    api.patch("/notifications/read-all").catch(console.error);
  },
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
