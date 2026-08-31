import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminService, masterDataService } from "../../../services";
import { toast } from "../../../services/toast";
import { PageLoader, Loader } from "../../../components/Loader";
import { SearchableSelect } from "../../../components/SearchableSelect";

export const EmployeeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [divisions, setDivisions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    position: "",
    departmentId: "",
    divisionId: "",
    employmentStatus: "permanent",
    role: "employee",
  });

  useEffect(() => {
    loadDivisions();
    if (isEdit && id) {
      loadEmployee(id);
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (formData.divisionId) {
      loadDepartments(formData.divisionId);
    } else {
      setDepartments([]);
      setFormData((prev) => ({ ...prev, departmentId: "" }));
    }
  }, [formData.divisionId]);

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

  const loadEmployee = async (empId: string) => {
    try {
      const data = await adminService.getEmployee(empId);
      setFormData({
        name: data.name,
        email: data.email,
        password: "",
        phone: data.phone || "",
        position: data.position || "",
        departmentId: data.department?.id || "",
        divisionId: data.division?.id || "",
        employmentStatus: data.employmentStatus || "permanent",
        role: data.role,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employee data");
      navigate("/admin/employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || (!isEdit && !formData.password)) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const payload: any = { ...formData };
      if (isEdit && !payload.password) {
        delete payload.password;
      }
      if (!payload.departmentId) delete payload.departmentId;
      if (!payload.divisionId) delete payload.divisionId;

      if (isEdit) {
        await adminService.updateEmployee(id!, payload);
        toast.success("Employee updated successfully");
      } else {
        await adminService.createEmployee(payload);
        toast.success("Employee created successfully");
      }
      navigate("/admin/employees");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto animate-slide-up pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl md:text-xl sm:text-2xl lg:text-2xl font-bold text-slate-800 tracking-tight truncate">
            {isEdit ? "Edit Employee" : "Add New Employee"}
          </h1>
          <p className="text-slate-500 font-medium mt-1 truncate">
            {isEdit
              ? "Update employee profile details"
              : "Register a new member to the system"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-4xl shadow-sm border border-[#D6E3FF]/60 p-6 sm:p-8 relative">
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 truncate">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base bg-[#F0F4F8]/60 border-2 border-[#D6E3FF]/60 rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:bg-white outline-none transition-all placeholder:text-slate-400 placeholder:font-medium truncate placeholder:truncate"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 truncate">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={isEdit}
                className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base bg-[#F0F4F8]/60 border-2 rounded-xl text-slate-800 font-bold outline-none transition-all placeholder:text-slate-400 placeholder:font-medium ${isEdit ? "opacity-60 cursor-not-allowed border-[#D6E3FF]/30" : "border-[#D6E3FF]/60 focus:border-[#0038FF] focus:bg-white"}`}
                placeholder="john@company.com"
              />
            </div>

            <div>
              <label className="block text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 truncate">
                Password {isEdit ? "(Optional)" : "*"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base bg-[#F0F4F8]/60 border-2 border-[#D6E3FF]/60 rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:bg-white outline-none transition-all placeholder:text-slate-400 placeholder:font-medium truncate placeholder:truncate"
                placeholder={
                  isEdit ? "Leave blank to keep current" : "••••••••"
                }
              />
            </div>

            <div>
              <label className="block text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 truncate">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base bg-[#F0F4F8]/60 border-2 border-[#D6E3FF]/60 rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:bg-white outline-none transition-all placeholder:text-slate-400 placeholder:font-medium truncate placeholder:truncate"
                placeholder="+62..."
              />
            </div>

            <div>
              <label className="block text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 truncate">
                System Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base bg-[#F0F4F8]/60 border-2 border-[#D6E3FF]/60 rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:bg-white outline-none transition-all"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="md:col-span-2 mt-4 pt-4 border-t border-[#D6E3FF]/40">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[#0038FF]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 truncate">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base bg-[#F0F4F8]/60 border-2 border-[#D6E3FF]/60 rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:bg-white outline-none transition-all placeholder:text-slate-400 placeholder:font-medium truncate placeholder:truncate"
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] md:text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 truncate">
                    Employment Status
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentStatus: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base placeholder:text-sm sm:placeholder:text-base bg-[#F0F4F8]/60 border-2 border-[#D6E3FF]/60 rounded-xl text-slate-800 font-bold focus:border-[#0038FF] focus:bg-white outline-none transition-all"
                  >
                    <option value="permanent">Permanent</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>

                <div className="relative z-20">
                  <SearchableSelect
                    label="Divisi"
                    placeholder="Pilih Divisi..."
                    options={divisions}
                    value={formData.divisionId}
                    onChange={(val) =>
                      setFormData({ ...formData, divisionId: val })
                    }
                  />
                </div>

                <div className="relative z-10">
                  <SearchableSelect
                    label="Departemen"
                    placeholder="Pilih Departemen..."
                    options={departments}
                    value={formData.departmentId}
                    onChange={(val) =>
                      setFormData({ ...formData, departmentId: val })
                    }
                    disabled={!formData.divisionId}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/employees")}
              className="flex-1 py-2.5 px-3 sm:py-3 sm:px-4 md:py-3.5 md:px-5 lg:py-4 lg:px-6 text-xs sm:text-sm md:text-base bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-3 sm:py-3 sm:px-4 md:py-3.5 md:px-5 lg:py-4 lg:px-6 text-xs sm:text-sm md:text-base bg-[#0038FF] hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader size="sm" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
