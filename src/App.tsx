import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "./components/Toast/ToastContainer";
import { toast } from "./services/toast";
import { io } from "socket.io-client";
import api from "./services/api";

import { useAuthStore } from "./store/authStore";
import { useNotificationStore } from "./store/notificationStore";

import { LoginPage } from "./apps/employee/pages/LoginPage";
import { EmployeeLayout } from "./apps/employee/layout/EmployeeLayout";
import { ProfilePage } from "./apps/employee/pages/ProfilePage";
import { AttendancePage } from "./apps/employee/pages/AttendancePage";
import { SummaryPage } from "./apps/employee/pages/SummaryPage";

import { AdminLayout } from "./apps/admin/layout/AdminLayout";
import { EmployeeListPage } from "./apps/admin/pages/EmployeeListPage";
import { EmployeeFormPage } from "./apps/admin/pages/EmployeeFormPage";
import { EmployeeDetailPage } from "./apps/admin/pages/EmployeeDetailPage";
import { AttendanceMonitorPage } from "./apps/admin/pages/AttendanceMonitorPage";

const EmployeeGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/admin/employees" replace />;
  return <>{children}</>;
};

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/attendance" replace />;
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { addNotification, setNotifications } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") return;

    api
      .get("/notifications")
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error("Failed to fetch notifications:", err));

    const socket = io(
      (window as any).__ENV?.WS_BASE_URL ||
        "http://localhost:3001/notifications",
      {
        transports: ["websocket", "polling"],
      },
    );

    socket.on("connect", () => {
      console.log("[Socket.IO] Admin connected to notification channel");
    });

    socket.on(
      "profile_updated",
      (data: {
        message: string;
        userName: string;
        changedFields: string[];
        timestamp: string;
      }) => {
        addNotification({
          type: "PROFILE_UPDATED",
          message: data.message,
          userName: data.userName,
          changedFields: data.changedFields,
          timestamp: data.timestamp,
        });
        toast.info(`👤 ${data.userName} updated their profile`);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user?.role, addNotification, setNotifications]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          element={
            <EmployeeGuard>
              <EmployeeLayout />
            </EmployeeGuard>
          }
        >
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route path="/admin/employees" element={<EmployeeListPage />} />
          <Route path="/admin/employees/new" element={<EmployeeFormPage />} />
          <Route
            path="/admin/employees/:id/edit"
            element={<EmployeeFormPage />}
          />
          <Route path="/admin/employees/:id" element={<EmployeeDetailPage />} />
          <Route
            path="/admin/attendances"
            element={<AttendanceMonitorPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
