import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { authService } from "../../../services";
import { useAuthStore } from "../../../store/authStore";
import { toast } from "../../../services/toast";
import { Loader } from "../../../components/Loader";

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "all",
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await authService.login(data.email, data.password);
      login(response.access_token, response.user);
      if (response.user.role === "admin") {
        navigate("/admin/employees");
      } else {
        navigate("/attendance");
      }
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F0F4F8] via-white to-[#D6E3FF]/50 relative overflow-hidden p-0 sm:p-8">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white sm:rounded-4xl shadow-2xl shadow-[#0038FF]/10 overflow-hidden sm:border border-[#D6E3FF]/60 min-h-screen sm:min-h-0 relative z-10">
        <div className="relative w-full h-[35vh] sm:h-80 md:h-auto md:w-[50%] lg:w-[55%] bg-[#F7F9FC]">
          <img
            src="/login_bg.jpg"
            alt="Workspace"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-[50%] lg:w-[45%] flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-white -mt-8 md:mt-0 rounded-t-[2.5rem] md:rounded-none relative z-10 grow">
          <div className="w-full max-w-sm mx-auto animate-slide-up">
            <div className="text-center mb-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0038FF] mb-2">
                WFH Attendance
              </h1>
              <p className="text-slate-500 text-sm">Sign in to your account</p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#0038FF] mb-1.5 uppercase tracking-wider">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email format",
                    },
                  })}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-gray-900 focus:ring-4 outline-none transition-all placeholder:text-gray-400 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-[#F0F4F8] focus:ring-[#D6E3FF]/50 focus:border-[#0038FF]"
                  }`}
                  placeholder="you@example.com"
                  autoFocus
                />
                <div className="h-5 mt-1">
                  <p
                    className={`text-red-500 text-xs font-medium transition-opacity ${errors.email ? "opacity-100" : "opacity-0"}`}
                  >
                    {(errors.email?.message as string) || " "}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0038FF] mb-1.5 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 bg-white text-gray-900 focus:ring-4 outline-none transition-all placeholder:text-gray-400 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-[#F0F4F8] focus:ring-[#D6E3FF]/50 focus:border-[#0038FF]"
                    }`}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-gray-400 hover:text-[#0038FF] transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="h-5 mt-1">
                  <p
                    className={`text-red-500 text-xs font-medium transition-opacity ${errors.password ? "opacity-100" : "opacity-0"}`}
                  >
                    {(errors.password?.message as string) || " "}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className={`w-full mt-4 py-3.5 px-4 font-bold rounded-xl transition-all flex justify-center items-center gap-2 ${
                  isSubmitting || !isValid
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-[#0038FF] hover:bg-blue-700 text-white shadow-lg shadow-[#0038FF]/30 active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? <Loader size="sm" /> : <span>Sign In</span>}
              </button>
            </form>

            <p className="text-center mt-10 text-xs font-medium text-slate-400">
              WFH Attendance System v1.0 &bull; Secure Login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
