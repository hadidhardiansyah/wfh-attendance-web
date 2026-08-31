import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { toast } from "../../../services/toast";

const navItems = [
  {
    to: "/attendance",
    label: "Attendance",
    icon: (
      <svg
        className="w-6 h-6 lg:w-5 lg:h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
  },
  {
    to: "/summary",
    label: "Summary",
    icon: (
      <svg
        className="w-6 h-6 lg:w-5 lg:h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (
      <svg
        className="w-6 h-6 lg:w-5 lg:h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export const EmployeeLayout: React.FC = () => {
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
  const navigate = useNavigate();

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
        <div className="relative p-6 pt-8 h-32 flex items-center overflow-hidden border-b border-[#D6E3FF]/30">
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
        <div className="bg-white relative overflow-hidden pb-36">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-[#D6E3FF]/40 to-transparent pointer-events-none"></div>

          <header className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between px-6 pt-8 pb-4 gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between pr-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  {getGreeting()},{" "}
                  <span className="text-[#0038FF]">
                    {user?.name?.split(" ")[0]}
                  </span>
                </h1>
                <button
                  onClick={handleLogout}
                  className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
              <p className="text-slate-500 font-medium text-sm mt-1 mb-4 lg:mb-0">
                Here's what's going on today
              </p>

              <div className="lg:hidden flex items-center gap-3 bg-[#F0F4F8] border border-[#D6E3FF]/50 rounded-2xl py-2 px-4 shadow-sm w-fit mt-2">
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
                    NIK: {user?.nik || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 bg-white border border-[#D6E3FF] rounded-full py-1.5 px-3 shadow-sm">
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
                  NIK: {user?.nik || "N/A"}
                </p>
              </div>
            </div>
          </header>
        </div>

        <main className="flex-1 px-4 sm:px-8 -mt-28 relative z-20 pb-10">
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
