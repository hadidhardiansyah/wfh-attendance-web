import { useDebounce } from "../../../hooks/useDebounce";
import React, { useEffect, useState } from "react";
import { adminService, masterDataService } from "../../../services";
import type { User } from "../../../types";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "../../../services/toast";
import { PageLoader } from "../../../components/Loader";
import { EmptyState } from "../../../components/EmptyState";
import { SearchableSelect } from "../../../components/SearchableSelect";
import { Chip, Table, Select, type ColumnDef } from "../../../components";

export const EmployeeListPage: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "suspended">(
    "all",
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFullyOpen, setIsFullyOpen] = useState(false);

  useEffect(() => {
    if (isFilterOpen) {
      const t = setTimeout(() => setIsFullyOpen(true), 300);
      return () => clearTimeout(t);
    } else {
      // eslint-disable-next-line react-compiler/react-compiler
      setIsFullyOpen(false);
    }
  }, [isFilterOpen]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const defaultFilters = {
    name: "",
    departmentId: "",
    divisionId: "",
    position: "",
    email: "",
    phone: "",
    employmentStatus: "",
  };

  const [filters, setFilters] = useState(defaultFilters);

  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (
      debouncedSearch.trim().length >= 3 ||
      debouncedSearch.trim().length === 0
    ) {
      setAppliedFilters((prev) => ({ ...prev, name: debouncedSearch.trim() }));
      setFilters((prev) => ({ ...prev, name: debouncedSearch.trim() }));
      setPage(1);
    }
  }, [debouncedSearch]);

  const navigate = useNavigate();
  const limit = 10;

  useEffect(() => {
    loadEmployees();
    loadDivisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filters.divisionId) {
      loadDepartments(filters.divisionId);
    } else {
      // eslint-disable-next-line react-compiler/react-compiler
      setDepartments([]);
      setFilters((prev) => ({ ...prev, departmentId: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.divisionId]);

  const loadDivisions = async () => {
    try {
      const data = await masterDataService.getDivisions();
      setDivisions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDepartments = async (divisionId: string) => {
    try {
      const data = await masterDataService.getDepartments(divisionId);
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await adminService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const advancedFiltered = employees.filter((emp) => {
    if (
      appliedFilters.name &&
      !emp.name.toLowerCase().includes(appliedFilters.name.toLowerCase())
    )
      return false;
    if (
      appliedFilters.departmentId &&
      emp.department?.id !== appliedFilters.departmentId
    )
      return false;
    if (
      appliedFilters.divisionId &&
      emp.division?.id !== appliedFilters.divisionId
    )
      return false;
    if (
      appliedFilters.position &&
      !(emp.position || "")
        .toLowerCase()
        .includes(appliedFilters.position.toLowerCase())
    )
      return false;
    if (
      appliedFilters.email &&
      !emp.email.toLowerCase().includes(appliedFilters.email.toLowerCase())
    )
      return false;
    if (
      appliedFilters.phone &&
      !(emp.phone || "")
        .toLowerCase()
        .includes(appliedFilters.phone.toLowerCase())
    )
      return false;
    if (
      appliedFilters.employmentStatus &&
      emp.employmentStatus !== appliedFilters.employmentStatus
    )
      return false;
    return true;
  });

  const fullyFiltered = advancedFiltered.filter((emp) => {
    if (activeTab === "active") return emp.isActive !== false;
    if (activeTab === "suspended") return emp.isActive === false;
    return true;
  });

  const activeFilterCount = Object.values(appliedFilters).filter(
    (v) => v !== "" && v !== appliedFilters.name,
  ).length;

  const totalPages = Math.ceil(fullyFiltered.length / limit) || 1;
  const currentData = fullyFiltered.slice((page - 1) * limit, page * limit);

  const columns: ColumnDef<User>[] = [
    {
      header: "Employee",
      key: "user",
      type: "profile",
      width: "w-[300px]",
      render: (rec) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0038FF] font-bold text-sm shrink-0 shadow-sm border border-blue-100">
            {rec.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">{rec.name}</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5 truncate">
              {rec.email}
            </p>
          </div>
        </div>
      ),
    },
    { header: "Email", key: "email", type: "text", hiddenOn: "md" },
    {
      header: "Phone",
      key: "phone",
      type: "text",
      hiddenOn: "lg",
      render: (rec) => rec.phone || "-",
    },
    {
      header: "Divisi / Departemen",
      key: "department",
      type: "text",
      hiddenOn: "lg",
      render: (rec) => (
        <div>
          <p className="font-bold text-slate-700">
            {rec.division?.name || "-"}
          </p>
          <p className="text-xs text-slate-400">
            {rec.department?.name || "-"}
          </p>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      type: "status",
      align: "center",
      render: (rec) => {
        if (rec.isActive === false)
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
              Suspended
            </span>
          );
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            Active
          </span>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      type: "action",
      align: "right",
      render: (rec) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/admin/employees/${rec.id}`}
            className="p-2 text-slate-400 hover:text-[#0038FF] hover:bg-blue-50 rounded-lg transition-colors"
            title="View details"
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </Link>
          <Link
            to={`/admin/employees/${rec.id}/edit`}
            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit employee"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>
        </div>
      ),
    },
  ];

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="w-full animate-slide-up pb-8 mt-6">
        <div className="flex flex-row justify-between items-center gap-4 pt-2 mb-12">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight truncate">
              Employee Directory
            </h1>
            <p className="text-slate-500 text-[11px] sm:text-sm mt-1 sm:mt-1.5 truncate">
              Manage company staff and their system access
            </p>
          </div>
          <Link
            to="/admin/employees/new"
            className="h-9 sm:h-11.5 px-3 sm:px-6 bg-[#0038FF] hover:bg-blue-700 active:scale-[0.98] text-white text-[12px] sm:text-base font-bold rounded-xl shadow-md sm:shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2 shrink-0"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Employee
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm mb-8">
          <div className="relative w-full sm:flex-1 sm:max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#F0F4F8]/60 border-2 border-[#D6E3FF]/60 rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:bg-white outline-none transition-all placeholder:text-slate-400 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setFilters((prev) => ({ ...prev, name: "" }));
                  setAppliedFilters((prev) => ({ ...prev, name: "" }));
                  setPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  const reset = {
                    ...defaultFilters,
                    name: appliedFilters.name,
                  };
                  setFilters(reset);
                  setAppliedFilters(reset);
                  setPage(1);
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-bold transition-all shrink-0 border border-rose-100"
                title="Clear Advanced Filters"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear Filters
              </button>
            )}
            <button
              onClick={() => {
                if (!isFilterOpen) setFilters(appliedFilters);
                setIsFilterOpen(!isFilterOpen);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 w-full sm:w-auto justify-center ${
                activeFilterCount > 0
                  ? "bg-[#0038FF]/10 text-[#0038FF] border border-[#0038FF]/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Advanced Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0038FF] text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div
          className={`grid transition-all duration-300 ease-in-out ${isFilterOpen ? "grid-rows-[1fr] opacity-100 mt-4 mb-6" : "grid-rows-[0fr] opacity-0 mt-0 mb-0"}`}
        >
          <div className={isFullyOpen ? "overflow-visible" : "overflow-hidden"}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 sm:p-6 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 shrink-0">
                <h2 className="text-lg font-bold text-slate-800">
                  Advanced Filter
                </h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Email
                  </label>
                  <input
                    type="text"
                    value={filters.email}
                    onChange={(e) =>
                      setFilters({ ...filters, email: e.target.value })
                    }
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base bg-[#F0F4F8]/60 border-2 border-[#D6E3FF]/60 rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g. john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={filters.phone}
                    onChange={(e) =>
                      setFilters({ ...filters, phone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base bg-[#F0F4F8]/60 border-2 border-[#D6E3FF]/60 rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    placeholder="+62..."
                  />
                </div>

                <div className="relative z-30">
                  <SearchableSelect
                    label="Divisi"
                    placeholder="Semua Divisi"
                    options={divisions}
                    value={filters.divisionId}
                    onChange={(val) =>
                      setFilters({ ...filters, divisionId: val })
                    }
                  />
                </div>

                <div className="relative z-20">
                  <SearchableSelect
                    label="Departemen"
                    placeholder="Semua Departemen"
                    options={departments}
                    value={filters.departmentId}
                    onChange={(val) =>
                      setFilters({ ...filters, departmentId: val })
                    }
                    disabled={!filters.divisionId}
                  />
                </div>

                <div className="relative z-10">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={filters.position}
                    onChange={(e) =>
                      setFilters({ ...filters, position: e.target.value })
                    }
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base bg-[#F0F4F8]/60 border-2 border-[#D6E3FF]/60 rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g. Manager"
                  />
                </div>

                <div className="relative z-0">
                  <Select
                    label="Employment Status"
                    placeholder="All Statuses"
                    options={[
                      { id: "", name: "All Statuses" },
                      { id: "permanent", name: "Permanent" },
                      { id: "contract", name: "Contract" },
                      { id: "intern", name: "Intern" },
                    ]}
                    value={filters.employmentStatus}
                    onChange={(val) =>
                      setFilters({ ...filters, employmentStatus: val })
                    }
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 flex justify-end gap-3 mt-6 pt-5 shrink-0">
                <button
                  onClick={() => {
                    const draftReset = {
                      ...defaultFilters,
                      name: appliedFilters.name,
                    };
                    setFilters(draftReset);
                  }}
                  className="py-2.5 px-4 sm:py-3 sm:px-6 text-sm sm:text-base bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
                >
                  Clear Form
                </button>
                <button
                  onClick={() => {
                    setAppliedFilters(filters);
                    setIsFilterOpen(false);
                    setPage(1);
                  }}
                  className="py-2.5 px-6 sm:py-3 sm:px-10 text-sm sm:text-base bg-[#0038FF] hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          <Chip
            label="All"
            count={advancedFiltered.length}
            active={activeTab === "all"}
            colorSchema="dark"
            onClick={() => {
              setActiveTab("all");
              setPage(1);
            }}
          />
          <Chip
            label="Active"
            count={advancedFiltered.filter((e) => e.isActive !== false).length}
            active={activeTab === "active"}
            colorSchema="emerald"
            onClick={() => {
              setActiveTab("active");
              setPage(1);
            }}
          />
          <Chip
            label="Suspended"
            count={advancedFiltered.filter((e) => e.isActive === false).length}
            active={activeTab === "suspended"}
            colorSchema="red"
            onClick={() => {
              setActiveTab("suspended");
              setPage(1);
            }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="hidden lg:block">
            <Table
              columns={columns}
              data={currentData}
              emptyState={
                <EmptyState
                  title={
                    activeFilterCount > 0 || appliedFilters.name
                      ? "No Matches Found"
                      : activeTab === "suspended"
                        ? "No Suspended Employees"
                        : activeTab === "active"
                          ? "No Active Employees"
                          : "No Employees Found"
                  }
                  description={
                    activeFilterCount > 0 || appliedFilters.name
                      ? "We couldn't find any employees matching your advanced search filters. Try adjusting them."
                      : activeTab === "suspended"
                        ? "You don't have any suspended employees at the moment."
                        : activeTab === "active"
                          ? "You don't have any active employees at the moment."
                          : "You haven't added any employees to the system yet."
                  }
                  images={[
                    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
                    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
                    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
                  ]}
                  secondaryAction={
                    activeFilterCount > 0 || appliedFilters.name
                      ? {
                          label: "Clear Filters",
                          onClick: () => {
                            setFilters(defaultFilters);
                            setAppliedFilters(defaultFilters);
                            setPage(1);
                          },
                        }
                      : undefined
                  }
                />
              }
              rowKey={(r) => r.id}
            />
          </div>

          <div className="lg:hidden p-4 space-y-4">
            {currentData.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  title={
                    activeFilterCount > 0 || appliedFilters.name
                      ? "No Matches Found"
                      : activeTab === "suspended"
                        ? "No Suspended Employees"
                        : activeTab === "active"
                          ? "No Active Employees"
                          : "No Employees Found"
                  }
                  description={
                    activeFilterCount > 0 || appliedFilters.name
                      ? "We couldn't find any employees matching your filters."
                      : "There are no employees to display here."
                  }
                  images={[
                    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
                    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
                  ]}
                />
              </div>
            ) : (
              currentData.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-white border border-slate-200/60 rounded-xl p-4 flex flex-col gap-4 shadow-sm relative"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0038FF] font-bold flex items-center justify-center shrink-0">
                      {emp.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-800 text-sm truncate">
                        {emp.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 truncate">
                        {emp.email}
                      </p>
                    </div>
                    {emp.isActive === false ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider whitespace-nowrap">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider whitespace-nowrap">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Active
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 bg-[#F0F4F8]/50 p-3 rounded-lg border border-[#D6E3FF]/30">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        Phone
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {emp.phone || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        Department
                      </span>
                      <span className="text-xs font-bold text-slate-700 truncate block">
                        {emp.department?.name || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => navigate(`/admin/employees/${emp.id}`)}
                      className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg text-sm hover:bg-slate-200 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin/employees/${emp.id}/edit`)
                      }
                      className="flex-1 py-2 bg-[#0038FF]/10 text-[#0038FF] font-bold rounded-lg text-sm hover:bg-[#0038FF]/20 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-sm font-bold text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
