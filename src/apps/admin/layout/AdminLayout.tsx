import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { useNotificationStore } from "../../../store/notificationStore";
import { toast } from "../../../services/toast";

const navItems = [
  {
    to: "/admin/employees",
    label: "Employees",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    to: "/admin/attendances",
    label: "Attendances",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
  },
];

export const AdminLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.body.style.setProperty(
      "--sidebar-width",
      isSidebarCollapsed ? "80px" : "256px",
    );
    return () => {
      document.body.style.removeProperty("--sidebar-width");
    };
  }, [isSidebarCollapsed]);

  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markAllRead } = useNotificationStore();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen flex bg-[#F0F4F8] font-sans overflow-x-hidden pb-20 lg:pb-0">
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 ${isSidebarCollapsed ? "w-20" : "w-64"} bg-white border-r border-[#D6E3FF]/50 flex-col transition-all duration-300`}
      >
        <div className="relative p-6 pt-8 h-32 flex items-center overflow-hidden ">
          <div className="absolute top-0 right-0 w-[150%] h-full bg-linear-to-r from-[#D6E3FF]/30 to-[#0038FF]/10 rounded-bl-[100%] transform rotate-12 origin-top-right -translate-y-4 pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0038FF] flex items-center justify-center shrink-0 shadow-lg shadow-[#0038FF]/20 transition-all">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div
              className={`transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
            >
              <p className="font-bold text-lg text-slate-800 leading-tight tracking-wide whitespace-nowrap">
                WFH
              </p>
              <p className="text-sm text-slate-500 tracking-wider whitespace-nowrap">
                Attendance
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <div
            className={`transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? "w-0 opacity-0 h-0 mb-0" : "w-auto opacity-100 h-auto mb-4"}`}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-lg text-[10px] font-bold bg-[#D6E3FF]/50 text-[#0038FF] tracking-wide uppercase w-max">
              Admin Portal
            </div>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "gap-4 px-4"} py-3.5 rounded-xl transition-all font-medium text-[15px] ${
                  isActive
                    ? "bg-[#0038FF] text-white shadow-lg shadow-[#0038FF]/30"
                    : "text-slate-500 hover:text-[#0038FF] hover:bg-[#F0F4F8]"
                }`
              }
            >
              {item.icon}
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-12 w-6 h-6 bg-white border border-[#D6E3FF] rounded-full flex items-center justify-center text-slate-400 hover:text-[#0038FF] hover:border-[#0038FF] transition-colors shadow-sm z-50"
        >
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="p-4 border-t border-[#D6E3FF]/50">
          <button
            onClick={handleLogout}
            className={`flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "gap-4 px-4"} py-3 w-full rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all font-medium text-[15px]`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span
              className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      <div
        className={`flex-1 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"} flex flex-col min-h-screen transition-all duration-300 min-w-0 max-w-full overflow-x-hidden`}
      >
        <div className="bg-white relative overflow-visible lg:overflow-hidden pb-36">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-[#D6E3FF]/40 to-transparent pointer-events-none hidden lg:block"></div>

          <header className="relative z-30 flex flex-col lg:flex-row lg:items-center justify-between px-6 pt-8 pb-4 gap-6">
            <div className="flex-1 flex justify-between items-start lg:items-center">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  {getGreeting()},{" "}
                  <span className="text-[#0038FF]">
                    {user?.name?.split(" ")[0]}
                  </span>
                </h1>
                <p className="text-slate-500 font-medium text-sm mt-1 mb-4 lg:mb-0">
                  Here's what's going on today
                </p>

                <div className="lg:hidden flex items-center justify-between gap-4 w-full mt-2">
                  <div className="flex items-center gap-3 bg-[#F0F4F8] border border-[#D6E3FF]/50 rounded-2xl py-2 px-4 shadow-sm w-fit">
                    <div className="w-10 h-10 rounded-full bg-linear-to-tr from-[#0038FF] to-[#D6E3FF] flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden">
                      {user?.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.name?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                        {user?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        Admin Portal
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="lg:hidden flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => {
                        setNotifOpen(!notifOpen);
                        if (!notifOpen) markAllRead();
                      }}
                      className="relative p-2 rounded-xl text-slate-400 hover:text-[#0038FF] hover:bg-blue-50 transition-colors bg-white shadow-sm border border-slate-100"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 top-12 w-80 bg-white border border-[#D6E3FF] rounded-2xl shadow-xl z-50 animate-slide-up overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <p className="font-bold text-sm text-slate-800">
                            Notifications
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D6E3FF] text-[#0038FF]">
                            {notifications.length} total
                          </span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-8 font-medium">
                              No notifications yet
                            </p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative ${!n.read ? "bg-blue-50/30" : ""}`}
                              >
                                {!n.read && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0038FF]"></div>
                                )}
                                <p className="text-sm text-slate-700 font-bold">
                                  {n.message}
                                </p>
                                <p className="text-xs text-slate-400 mt-1 font-medium">
                                  Fields: {n.changedFields?.join(", ")}{" "}
                                  {new Date(n.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-white shadow-sm border border-slate-100"
                    title="Sign Out"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    if (!notifOpen) markAllRead();
                  }}
                  className="relative p-2.5 rounded-full text-slate-400 hover:text-[#0038FF] hover:bg-blue-50 transition-colors bg-white/80 backdrop-blur shadow-sm border border-[#D6E3FF]"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-14 w-80 bg-white border border-[#D6E3FF] rounded-2xl shadow-xl shadow-blue-900/5 z-50 animate-slide-up overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <p className="font-bold text-sm text-slate-800">
                        Notifications
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D6E3FF] text-[#0038FF]">
                        {notifications.length} total
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8 font-medium">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative ${!n.read ? "bg-blue-50/30" : ""}`}
                          >
                            {!n.read && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0038FF]"></div>
                            )}
                            <p className="text-sm text-slate-700 font-bold">
                              {n.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 font-medium">
                              Fields: {n.changedFields?.join(", ")}{" "}
                              {new Date(n.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 bg-white border border-[#D6E3FF] rounded-full py-1.5 px-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#0038FF] to-[#D6E3FF] flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden">
                  {user?.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="pr-2 text-left">
                  <p className="text-sm font-bold text-slate-800 leading-none">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">
                    Admin Portal
                  </p>
                </div>
              </div>
            </div>
          </header>
        </div>

        <main className="flex-1 px-4 sm:px-8 -mt-28 relative z-20 pb-10 w-full">
          <Outlet />
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#D6E3FF]/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-around pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full py-3 gap-1 transition-all ${
                isActive
                  ? "text-[#0038FF]"
                  : "text-slate-400 hover:text-slate-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-xl transition-all ${isActive ? "bg-[#0038FF]/10" : ""}`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wide ${isActive ? "text-[#0038FF]" : "text-slate-500"}`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
