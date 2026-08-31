import React, { useState } from "react";
import { profileService } from "../../../services";
import { useAuthStore } from "../../../store/authStore";
import { Loader } from "../../../components/Loader";
import { Modal } from "../../../components/Modal";
import { toast } from "../../../services/toast";

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [editType, setEditType] = useState<
    "phone" | "password" | "emergencyContact" | null
  >(null);
  const [emergencyName, setEmergencyName] = useState(
    user?.emergencyContactName || "",
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    user?.emergencyContactPhone || "",
  );
  const [phone, setPhone] = useState(user?.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      editType === "password" &&
      newPassword &&
      newPassword !== confirmPassword
    ) {
      return toast.error(
        "Oops! The passwords you entered don't match. Let's try again.",
      );
    }

    const payload: Record<string, string> = {};
    if (editType === "phone" && phone !== user?.phone) payload.phone = phone;
    if (editType === "emergencyContact") {
      if (emergencyName !== user?.emergencyContactName)
        payload.emergencyContactName = emergencyName;
      if (emergencyPhone !== user?.emergencyContactPhone)
        payload.emergencyContactPhone = emergencyPhone;
    }
    if (editType === "emergencyContact") {
      if (emergencyName !== user?.emergencyContactName)
        payload.emergencyContactName = emergencyName;
      if (emergencyPhone !== user?.emergencyContactPhone)
        payload.emergencyContactPhone = emergencyPhone;
    }
    if (editType === "password" && newPassword) payload.password = newPassword;

    if (Object.keys(payload).length === 0) {
      toast.info("No changes were made to save.");
      return;
    }

    setSaving(true);
    try {
      const updated = await profileService.updateProfile(payload);
      updateUser({ ...updated, ...payload });
      toast.success("Awesome! Your profile has been updated.");
      setEditType(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "We couldn't update your profile right now. Please try again.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await profileService.uploadPhoto(file);
      updateUser({ photoUrl: updated.photoUrl });
      toast.success("Looking great! Your profile photo is updated.");
    } catch {
      toast.error("We couldn't upload your photo. Please try another file.");
    } finally {
      setUploading(false);
    }
  };

  const formatJoinDate = (d?: string) => {
    if (!d) return "N/A";
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const avatarUrl = user?.photoUrl;

  return (
    <div className="max-w-2xl mx-auto animate-slide-up pb-8 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 mb-8 sm:mb-10">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            User Profile
          </h2>
          <p className="text-slate-500 text-[13px] sm:text-sm mt-1">
            Manage your personal information and preferences.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-4xl p-8 shadow-sm border border-[#D6E3FF]/60 relative overflow-hidden flex flex-col items-center text-center mb-8">
        <div className="absolute top-0 right-0 w-full h-32 bg-linear-to-b from-[#D6E3FF]/40 to-transparent pointer-events-none"></div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="relative group mx-auto mb-4 w-max">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[6px] border-white shadow-xl bg-linear-to-tr from-[#0038FF] to-[#D6E3FF]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white text-[#0038FF] flex items-center justify-center hover:bg-slate-50 transition-all shadow-lg border border-[#D6E3FF] active:scale-95"
              title="Update your photo"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-[#0038FF] border-t-transparent rounded-full animate-spin" />
              ) : (
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            {user?.name}
          </h1>
          <p className="text-[#0038FF] font-semibold text-[15px] mt-1">
            {user?.position || "Employee"}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#D6E3FF] text-[#0038FF] uppercase tracking-wide">
              {user?.role}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide border border-slate-200">
              NIK: {user?.nik || "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">
          Account Settings
        </h3>

        <div className="bg-white rounded-4xl shadow-sm border border-[#D6E3FF]/60 overflow-hidden divide-y divide-[#D6E3FF]/30">
          <div className="flex items-center justify-between p-5 hover:bg-[#F0F4F8]/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0038FF]/10 text-[#0038FF] flex items-center justify-center">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Email Address
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              </div>
            </div>
          </div>

          <div
            className="flex items-center justify-between p-5 hover:bg-[#F0F4F8]/50 transition-colors cursor-pointer group"
            onClick={() => {
              setPhone(user?.phone || "");
              setEditType("phone");
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Phone Number</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user?.phone || "Not set"}
                </p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-[#0038FF] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          <div
            className="flex items-center justify-between p-5 hover:bg-[#F0F4F8]/50 transition-colors cursor-pointer group"
            onClick={() => setEditType("emergencyContact")}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
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
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Emergency Contact
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user?.emergencyContactName
                    ? `${user.emergencyContactName} (${user.emergencyContactPhone})`
                    : "Not provided"}
                </p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-[#0038FF] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          <div
            className="flex items-center justify-between p-5 hover:bg-[#F0F4F8]/50 transition-colors cursor-pointer group"
            onClick={() => {
              setNewPassword("");
              setConfirmPassword("");
              setEditType("password");
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Security & Password
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Change your login credentials
                </p>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-[#0038FF] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      <Modal
        isOpen={editType !== null}
        onClose={() => setEditType(null)}
        title={
          editType === "phone"
            ? "Update Phone Number"
            : editType === "emergencyContact"
              ? "Emergency Contact"
              : "Change Password"
        }
      >
        <form onSubmit={handleSave} className="flex flex-col gap-5 sm:p-2">
          {editType === "phone" && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <input
                  className="w-full pl-11 pr-4 py-3.5 bg-[#F0F4F8] border border-[#D6E3FF] rounded-2xl text-slate-800 text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-[#0038FF]/10 focus:border-[#0038FF] transition-all"
                  type="tel"
                  placeholder="+62 812 3456 7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {editType === "emergencyContact" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0038FF] focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-medium text-slate-800"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#0038FF] focus:bg-white rounded-xl px-4 py-3 outline-none transition-all font-medium text-slate-800"
                  placeholder="e.g. 08123456789"
                />
              </div>
            </div>
          )}

          {editType === "password" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F0F4F8] border border-[#D6E3FF] rounded-2xl text-slate-800 text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-[#0038FF]/10 focus:border-[#0038FF] transition-all"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F0F4F8] border border-[#D6E3FF] rounded-2xl text-slate-800 text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-[#0038FF]/10 focus:border-[#0038FF] transition-all"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-2 pb-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 px-4 bg-[#0038FF] hover:bg-blue-700 active:scale-[0.98] text-white text-[15px] font-bold rounded-2xl shadow-xl shadow-[#0038FF]/20 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {saving ? <Loader size="sm" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
