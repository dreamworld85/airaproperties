import { useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, Lock, Eye, EyeOff, ShieldCheck, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { api, mediaUrl } from "@/lib/api";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { INDIAN_STATES, STATE_DISTRICTS_MAP } from "@/lib/indiaLocationData";

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, login, token, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");

  // Determine initial state, district, and address
  const initialLocation = useMemo(() => {
    let s = user?.state || "Kerala";
    let d = user?.district || "";
    let a = user?.address || "";

    if (!d && user?.location) {
      const locStr = user.location;
      const keralaList = STATE_DISTRICTS_MAP["Kerala"] || [];
      const match = keralaList.find((dist) => locStr.toLowerCase().includes(dist.toLowerCase()));
      if (match) {
        s = "Kerala";
        d = match;
      } else {
        for (const [st, dList] of Object.entries(STATE_DISTRICTS_MAP)) {
          const m = dList.find((dist) => locStr.toLowerCase().includes(dist.toLowerCase()));
          if (m) {
            s = st;
            d = m;
            break;
          }
        }
      }
    }
    return { s, d, a };
  }, [user]);

  const [state, setState] = useState(initialLocation.s);
  const [district, setDistrict] = useState(initialLocation.d);
  const [address, setAddress] = useState(initialLocation.a);

  const availableDistricts = useMemo(() => {
    return (state && STATE_DISTRICTS_MAP[state]) || [];
  }, [state]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const districtsForNewState = STATE_DISTRICTS_MAP[newState] || [];
    if (!districtsForNewState.includes(district)) {
      setDistrict("");
    }
  };

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
    if (!state || !state.trim()) {
      setError("Please select your State.");
      setSaving(false);
      return;
    }
    if (!district || !district.trim()) {
      setError("Please select your District.");
      setSaving(false);
      return;
    }
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
      const combinedLocation = [district.trim(), state.trim()].filter(Boolean).join(", ");
      const updated = await api.updateMyProfile({
        name,
        phone,
        email,
        state: state.trim(),
        district: district.trim(),
        address: address.trim(),
        location: combinedLocation,
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

      <div className="px-5 pt-3 flex flex-col gap-3.5 flex-1 max-w-xl mx-auto w-full">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center gap-1 py-0.5">
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
              className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-md cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <img 
                src={mediaUrl(user.avatarUrl)} 
                alt="Profile" 
                className="w-20 h-20 object-cover"
              />
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-md cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Camera size={32} className="text-slate-500" />
            </div>
          )}
          <button 
            type="button"
            disabled={avatarUploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-[12.5px] font-medium text-black hover:underline disabled:opacity-50 transition-all active:scale-95 cursor-pointer mt-0.5"
          >
            {avatarUploading ? "Uploading..." : "change photo"}
          </button>
        </div>

        {/* Form Inputs */}
        {isNewSignup && (
          <div className="bg-emerald-50 border border-emerald-500/20 text-emerald-800 text-xs font-semibold px-3.5 py-2.5 rounded-none flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Mobile verified successfully! Please enter your name, email, and set your password to finish.</span>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {/* Row 1: Full Name & Phone No */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-charcoal/80 pl-0.5">Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded-none border border-slate-200/80 bg-white px-3.5 text-[13.5px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_1px_4px_rgba(0,0,0,0.02)] focus:border-[#59AD63] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-charcoal/80 pl-0.5">User Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 rounded-none border border-slate-200/80 bg-white px-3.5 text-[13.5px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_1px_4px_rgba(0,0,0,0.02)] focus:border-[#59AD63] transition-all"
              />
            </div>
          </div>

          {/* Row 2: Email */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-charcoal/80 pl-0.5">Email</label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 rounded-none border border-slate-200/80 bg-white px-3.5 text-[13.5px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_1px_4px_rgba(0,0,0,0.02)] focus:border-[#59AD63] transition-all"
            />
          </div>

          {/* Row 3: State & District */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-charcoal/80 pl-0.5">
                State <span className="text-emerald-600 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full h-10 rounded-none border border-slate-200/80 bg-white px-3 pr-8 text-[13.5px] font-medium text-charcoal outline-none shadow-[0_1px_4px_rgba(0,0,0,0.02)] focus:border-[#59AD63] transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-charcoal/80 pl-0.5">
                District <span className="text-emerald-600 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!state || availableDistricts.length === 0}
                  className="w-full h-10 rounded-none border border-slate-200/80 bg-white px-3 pr-8 text-[13.5px] font-medium text-charcoal outline-none shadow-[0_1px_4px_rgba(0,0,0,0.02)] focus:border-[#59AD63] transition-all appearance-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">{state ? "Select District" : "Select State First"}</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 4: Full Address */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-charcoal/80 pl-0.5">Full Address</label>
            <textarea
              rows={2}
              placeholder="Enter full address, street, building (optional)..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full min-h-[46px] max-h-[72px] rounded-none border border-slate-200/80 bg-white px-3 py-1.5 text-[13.5px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_1px_4px_rgba(0,0,0,0.02)] focus:border-[#59AD63] transition-all resize-none leading-snug"
            />
          </div>

          {/* Row 5: Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-charcoal/80 pl-0.5 flex items-center gap-1.5">
                <Lock size={13} className="text-slate-400" />
                <span>Set Password {isNewSignup && <span className="text-emerald-600 font-bold">*</span>}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isNewSignup ? "Create password (min 6 chars)" : "Enter new password (optional)"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 rounded-none border border-slate-200/80 bg-white px-3.5 pr-10 text-[13.5px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_1px_4px_rgba(0,0,0,0.02)] focus:border-[#59AD63] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-charcoal cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-charcoal/80 pl-0.5 flex items-center gap-1.5">
                <Lock size={13} className="text-slate-400" />
                <span>Confirm Password</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 rounded-none border border-slate-200/80 bg-white px-3.5 pr-10 text-[13.5px] font-medium text-charcoal placeholder:text-slate/40 outline-none shadow-[0_1px_4px_rgba(0,0,0,0.02)] focus:border-[#59AD63] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-400 hover:text-charcoal cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {successMsg && <p className="text-sm text-emerald-600 font-semibold pl-0.5 bg-emerald-50 p-2.5 rounded-none border border-emerald-500/20">{successMsg}</p>}
        {error && <p className="text-sm text-coral pl-0.5">{error}</p>}

        {/* Buttons (Save & Cancel) */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          <button
            type="button"
            disabled={saving || deleting}
            onClick={handleSave}
            className="w-full h-10 bg-[#59AD63] hover:bg-[#3F8F4B] text-white rounded-none text-[13.5px] font-medium transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="w-full h-10 bg-white hover:bg-slate-50 border border-slate-300 text-charcoal rounded-none text-[13.5px] font-medium transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center shadow-sm"
          >
            Skip to Home
          </button>
        </div>

        {/* Delete Account */}
        <div className="mt-2 flex flex-col items-center">
          <button 
            type="button"
            disabled={saving || deleting} 
            onClick={handleDeleteAccount}
            className="w-[240px] h-9 bg-white hover:bg-rose-50 border border-rose-400 text-rose-600 rounded-none text-[13px] font-medium transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <span>Delete Account</span>
            <span className="text-[14px] font-medium">→</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
