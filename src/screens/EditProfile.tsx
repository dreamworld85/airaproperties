import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { api, mediaUrl } from "@/lib/api";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, login, token, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [location, setLocation] = useState(user?.location || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locationState = useLocation();
  const isNewSignup = !!(locationState.state as any)?.isNewUser;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    if (password) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setSaving(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please re-enter.");
        setSaving(false);
        return;
      }
    }
    try {
      const updated = await api.updateMyProfile({
        name,
        phone,
        email,
        location,
        password: password.trim() ? password.trim() : undefined,
      });
      if (token) login(token, updated);
      setSuccessMsg("Profile details saved successfully!");
      setTimeout(() => {
        navigate("/home");
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    try {
      const updatedUser = await api.uploadAvatar(file);
      if (token) {
        login(token, updatedUser);
      }
      alert("Profile photo updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account?\n\nThis will wipe out all your properties, media uploads, subscriptions, and logs. This action is permanent and cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      await api.deleteAccount();
      logout();
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-28 bg-[#FAF8F3] font-display select-none">
      <Header title="edit profile" showBack />

      <div className="px-6 pt-4 flex flex-col gap-5 flex-1">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center gap-1.5 py-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            className="hidden" 
            accept="image/*"
          />
          {user?.avatarUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full overflow-hidden border border-slate-200 shadow-md cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <img 
                src={mediaUrl(user.avatarUrl)} 
                alt="Profile" 
                className="w-24 h-24 object-cover"
              />
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-md cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Camera size={36} className="text-slate-500" />
            </div>
          )}
          <button 
            type="button"
            disabled={avatarUploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-[13px] font-medium text-black hover:underline disabled:opacity-50 transition-all active:scale-95 cursor-pointer mt-1"
          >
            {avatarUploading ? "Uploading..." : "change photo"}
          </button>
        </div>

        {/* Form Inputs */}
        {isNewSignup && (
          <div className="bg-emerald-50 border border-emerald-500/20 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <span>Mobile verified successfully! Please enter your name, email, and set your password to finish.</span>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {/* Row 1: Full Name & Phone No */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13.5px] font-medium text-charcoal/80 pl-0.5">Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200/80 bg-white px-4 text-[14px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_2px_6px_rgba(0,0,0,0.03)] focus:border-[#59AD63] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13.5px] font-medium text-charcoal/80 pl-0.5">User Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200/80 bg-white px-4 text-[14px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_2px_6px_rgba(0,0,0,0.03)] focus:border-[#59AD63] transition-all"
              />
            </div>
          </div>

          {/* Row 2: Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13.5px] font-medium text-charcoal/80 pl-0.5">Email</label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200/80 bg-white px-4 text-[14px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_2px_6px_rgba(0,0,0,0.03)] focus:border-[#59AD63] transition-all"
            />
          </div>

          {/* Row 3: Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13.5px] font-medium text-charcoal/80 pl-0.5">Location</label>
            <input
              type="text"
              placeholder="e.g. Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200/80 bg-white px-4 text-[14px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_2px_6px_rgba(0,0,0,0.03)] focus:border-[#59AD63] transition-all"
            />
          </div>

          {/* Row 4: Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13.5px] font-medium text-charcoal/80 pl-0.5 flex items-center gap-1.5">
                <Lock size={14} className="text-slate-400" />
                <span>Set Password {isNewSignup && <span className="text-emerald-600 font-bold">*</span>}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isNewSignup ? "Create password (min 6 chars)" : "Enter new password (optional)"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200/80 bg-white px-4 pr-11 text-[14px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_2px_6px_rgba(0,0,0,0.03)] focus:border-[#59AD63] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-charcoal cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13.5px] font-medium text-charcoal/80 pl-0.5 flex items-center gap-1.5">
                <Lock size={14} className="text-slate-400" />
                <span>Confirm Password</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200/80 bg-white px-4 pr-11 text-[14px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_2px_6px_rgba(0,0,0,0.03)] focus:border-[#59AD63] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-charcoal cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {successMsg && <p className="text-sm text-emerald-600 font-semibold pl-0.5 bg-emerald-50 p-2.5 rounded-lg border border-emerald-500/20">{successMsg}</p>}
        {error && <p className="text-sm text-coral pl-0.5">{error}</p>}

        {/* Row 4: Buttons (Save & Cancel) */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            type="button"
            disabled={saving || deleting}
            onClick={handleSave}
            className="w-full h-11 bg-[#59AD63] hover:bg-[#3F8F4B] text-white rounded-xl text-[14px] font-medium transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-300 text-charcoal rounded-xl text-[14px] font-medium transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center shadow-sm"
          >
            Skip to Home
          </button>
        </div>

        {/* Row 5: Delete Account */}
        <div className="mt-4 flex flex-col items-center">
          <button 
            type="button"
            disabled={saving || deleting} 
            onClick={handleDeleteAccount}
            className="w-[260px] h-10 bg-white hover:bg-rose-50 border border-rose-400 text-rose-600 rounded-xl text-[13.5px] font-medium transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <span>Delete Account</span>
            <span className="text-[15px] font-medium">→</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
