import api from "./api";
import type { User } from "../types";

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },
};

export const profileService = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get("/profile");
    return data;
  },
  updateProfile: async (payload: { phone?: string; password?: string }) => {
    const { data } = await api.patch("/profile", payload);
    return data;
  },
  uploadPhoto: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/profile/photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export const attendanceService = {
  checkIn: async (reason?: string) => {
    const { data } = await api.post("/attendance/check-in", { reason });
    return data;
  },
  checkOut: async (reason?: string) => {
    const { data } = await api.post("/attendance/check-out", { reason });
    return data;
  },
  getTodayStatus: async () => {
    const { data } = await api.get("/attendance/status");
    return data;
  },
  getSummary: async (from?: string, to?: string) => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const { data } = await api.get("/attendance/summary", { params });
    return data;
  },
};

export const adminService = {
  getEmployees: async () => {
    const { data } = await api.get("/admin/employees");
    return data;
  },
  getEmployee: async (id: string) => {
    const { data } = await api.get(`/admin/employees/${id}`);
    return data;
  },
  createEmployee: async (payload: any) => {
    const { data } = await api.post("/admin/employees", payload);
    return data;
  },
  updateEmployee: async (id: string, payload: any) => {
    const { data } = await api.patch(`/admin/employees/${id}`, payload);
    return data;
  },
  deleteEmployee: async (id: string) => {
    const { data } = await api.delete(`/admin/employees/${id}`);
    return data;
  },

  getAllAttendances: async (from?: string, to?: string) => {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const { data } = await api.get("/admin/attendances", { params });
    return data;
  },
};

export const masterDataService = {
  getDivisions: async () => {
    const res = await api.get("/master-data/divisions");
    return res.data;
  },
  getDepartments: async (divisionId: string) => {
    const res = await api.get(
      `/master-data/divisions/${divisionId}/departments`,
    );
    return res.data;
  },
};
