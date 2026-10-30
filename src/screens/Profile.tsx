import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Heart, 
  MessageSquare, 
  BarChart3, 
  Pencil, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ShieldAlert, 
  Coins, 
  Layers, 
  PlusCircle,
  Camera,
  Image as ImageIcon,
  ExternalLink,
  LayoutGrid,
  List,
  UploadCloud,
  Check,
  Building2
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { api, mediaUrl, ApiProperty } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import PropertyCard from "@/components/PropertyCard";
import PropertyListCard from "@/components/PropertyListCard";
import { toSlug } from "./AgencyProfile";

const menuItems = [
  { icon: Home, label: "My Properties", path: "/my-properties", desc: "Manage your active, draft & sold listings" },
  { icon: Heart, label: "Saved Properties", path: "/saved", desc: "View properties you bookmarked" },
  { icon: MessageSquare, label: "My Enquiries", path: "/visitors-enquiries", desc: "Check incoming and outgoing enquiries" },
  { icon: BarChart3, label: "Visitors & Insights", path: "/visitors-enquiries", desc: "Track views and interested buyers" },
  { icon: Coins, label: "Credits & Top-ups", path: "/subscription", desc: "Top up enquiry tokens and listing slots" },
  { icon: Pencil, label: "Edit Profile", path: "/profile/edit", desc: "Update your name, contact details & photo" },
  { icon: Settings, label: "Settings", path: "/settings", desc: "Preferences, legal and security options" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, token, login, logout } = useAuth();
  const [switchStatus, setSwitchStatus] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState(false);
  const [myProperties, setMyProperties] = useState<ApiProperty[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [agencyViewMode, setAgencyViewMode] = useState<"grid" | "list">("grid");

  const isAgency = user?.role?.toLowerCase() === "agency";
  const agencySlug = user?.name ? toSlug(user.name) : "";

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (token) {
      api.fetchMyProfile()
        .then((updatedUser) => {
          login(token, updatedUser);
        })
        .catch((err) => console.error("Failed to refresh user profile:", err));
    }
  }, [token]);

  // If agency, fetch all properties uploaded by this agency
  useEffect(() => {
    if (isAgency && user?.id) {
      setPropertiesLoading(true);
      api.fetchProperties({ ownerId: String(user.id) })
        .then((props) => setMyProperties(props || []))
        .catch((err) => console.error("Failed to fetch agency properties:", err))
        .finally(() => setPropertiesLoading(false));
    }
  }, [isAgency, user?.id]);

  const [requestedRole, setRequestedRole] = useState<"Broker" | "Agency">("Broker");

  useEffect(() => {
    if (user?.role?.toLowerCase() === "broker") {
      setRequestedRole("Agency");
    } else {
      setRequestedRole("Broker");
    }
  }, [user]);

  useEffect(() => {
    if (user?.role && user?.role.toLowerCase() !== "user") {
      api.fetchRoleSwitchStatus()
        .then((data) => {
          if (data) {
            setSwitchStatus(data.status);
          }
        })
        .catch((err) => console.error("Failed to fetch upgrade request status:", err));
    }
  }, [user]);

  const handleRequestUpgrade = async () => {
    setRequesting(true);
    try {
      await api.requestRoleSwitch(requestedRole);
      setSwitchStatus("Pending");
      alert(`Role switch request to ${requestedRole} submitted to admin successfully!`);
    } catch (err: any) {
      alert(err.message || "Failed to submit upgrade request");
    } finally {
      setRequesting(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const updatedUser = await api.uploadAgencyBanner(file);
      if (token && updatedUser) {
        login(token, updatedUser);
      }
      setBannerSuccess(true);
      setTimeout(() => setBannerSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to upload agency banner");
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  // DESKTOP LAYOUT (>= 1000px)
  if (isDesktop) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col font-sans">
        <DesktopHeader />

        <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6 flex-1">
          {/* User Profile Overview Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/5 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
              {user?.avatarUrl ? (
                <img 
                  src={mediaUrl(user.avatarUrl)} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#59AD63]/30 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1F4C6B] text-white flex items-center justify-center text-2xl font-bold border-2 border-charcoal/10 shadow-md select-none uppercase">
                  {(user?.name || "U").charAt(0)}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="font-display font-black text-2xl text-ink">{user?.name || "Your Name"}</h1>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-600/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {user?.role?.toLowerCase() === "user" ? "Buyer" : user?.role || "Owner"}
                  </span>
                  {user?.subscriptionStatus === "active" && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-600/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate">{user?.phone || user?.email}</p>
                {user?.location && (
                  <p className="text-xs text-slate/70">📍 {user.location}</p>
                )}
                {isAgency && agencySlug && (
                  <button
                    onClick={() => navigate(`/${agencySlug}`)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 mt-1 cursor-pointer w-fit"
                  >
                    <ExternalLink size={13} /> View Public Agency Page
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {isAgency && agencySlug && (
                <button
                  onClick={() => navigate(`/${agencySlug}`)}
                  className="px-4 sm:px-5 py-2.5 rounded-xl border border-charcoal/15 bg-white hover:bg-slate-50 text-charcoal text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <ExternalLink size={14} /> Preview Page
                </button>
              )}
              <button
                onClick={() => navigate("/profile/edit")}
                className="px-4 sm:px-5 py-2.5 rounded-xl border border-charcoal/15 bg-white hover:bg-slate-50 text-charcoal text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="px-4 sm:px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-600 text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>

          {/* AGENCY BANNER MANAGEMENT (If Agency Role) */}
          {isAgency && (
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200/80 shadow-sm flex flex-col">
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />

              {/* Banner Live Preview with Overlaid Controls */}
              <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/90 shadow-inner group">
                {user?.agencyBannerUrl ? (
                  <img
                    src={mediaUrl(user.agencyBannerUrl)}
                    alt="Agency Banner"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-slate-100 to-emerald-50/40 text-gray-500">
                    <ImageIcon size={32} className="text-gray-400" />
                    <p className="text-xs font-medium">No custom banner uploaded yet. Click the edit button to add one.</p>
                  </div>
                )}

                {/* Over Banner: Top-Left Description Text */}
                <div className="absolute top-3.5 left-4 sm:top-5 sm:left-6 max-w-xl z-10 pointer-events-none">
                  <p className="text-xs sm:text-sm text-white font-medium drop-shadow-md select-none">
                    Upload your custom agency banner. This banner will be displayed on your independent agency page.
                  </p>
                </div>

                {/* Over Banner: Top-Right Edit / Change Banner Button */}
                <button
                  disabled={uploadingBanner}
                  onClick={() => bannerInputRef.current?.click()}
                  title={uploadingBanner ? "Uploading..." : (user?.agencyBannerUrl ? "Change Banner" : "Add Banner")}
                  className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 p-2 sm:p-2.5 bg-white/95 hover:bg-white text-gray-800 rounded-xl shadow-lg border border-gray-200/80 backdrop-blur-sm cursor-pointer transition active:scale-95 flex items-center justify-center"
                >
                  <Pencil size={18} className="text-gray-700" />
                </button>

                {/* Feedback message */}
                {bannerSuccess && (
                  <div className="absolute top-14 right-3.5 sm:top-16 sm:right-4 z-20 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg animate-fade-in">
                    <Check size={14} /> Banner updated!
                  </div>
                )}

                {/* Over Banner: Bottom-Left Public URL Pill */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 bg-black/75 backdrop-blur-xs text-white text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-xl shadow-sm select-none">
                  Public URL: {window.location.origin}/{agencySlug || "your-agency-name"}
                </div>
              </div>
            </div>
          )}

          {/* Upgrade request section for Locked Roles */}
          {user?.role && user?.role.toLowerCase() !== "user" && user?.role.toLowerCase() !== "agency" && (
            <div className="bg-white rounded-3xl p-6 border border-charcoal/5 shadow-sm flex flex-col gap-3 font-display">
              <span className="text-xs font-bold text-slate uppercase tracking-wider">Role Switch Request</span>
              {switchStatus === "Pending" ? (
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 rounded-xl p-3.5 border border-amber-600/10">
                  <ShieldAlert size={18} className="shrink-0" />
                  <p className="text-xs font-semibold">Switch request is currently pending Admin Approval.</p>
                </div>
              ) : switchStatus === "Approved" ? (
                <div className="bg-emerald-50 text-emerald-700 rounded-xl p-3.5 border border-emerald-600/10 text-xs font-semibold">
                  Your request was approved!
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate">Submit a switch request to change your current locked role to Broker or Agency.</p>
                    {user.role?.toLowerCase() === "owner" && (
                      <div className="flex items-center gap-3 mt-2">
                        <label className="text-xs font-bold text-charcoal">Request Change To:</label>
                        <select
                          value={requestedRole}
                          onChange={(e) => setRequestedRole(e.target.value as any)}
                          className="rounded-lg border border-charcoal/15 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal outline-none focus:border-black"
                        >
                          <option value="Broker">Broker</option>
                          <option value="Agency">Agency</option>
                        </select>
                      </div>
                    )}
                    {switchStatus === "Rejected" && (
                      <p className="text-xs font-bold text-rose-500 mt-1">Your previous request was rejected. You can apply again.</p>
                    )}
                  </div>
                  <button
                    disabled={requesting}
                    onClick={handleRequestUpgrade}
                    className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-ink hover:bg-black text-cream text-xs font-bold shadow-md cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 shrink-0"
                  >
                    {requesting ? "Submitting..." : `Request switch to ${requestedRole}`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Account Credit Balances Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal/5 shadow-sm flex flex-col gap-4 font-display">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Account Wallets & Concurrency</h2>
                <p className="text-xs text-slate">Active balance for unlocking owners and publishing listings</p>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-600/10 uppercase tracking-widest">
                No Expiry
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#FAF8F3] rounded-2xl p-4 border border-charcoal/5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/50">
                    <Coins size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate/70">Enquiry Tokens</span>
                    <p className="text-2xl font-black text-ink">{user?.enquiryCreditsLeft ?? 0}</p>
                    <p className="text-[11px] text-slate/80">Unlocks direct owner/broker contact numbers</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FAF8F3] rounded-2xl p-4 border border-charcoal/5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-forest flex items-center justify-center shrink-0 border border-emerald-200/50">
                    <Layers size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate/70">Listing Slots</span>
                    <p className="text-2xl font-black text-ink">{user?.listingSlotsLeft ?? 0}</p>
                    <p className="text-[11px] text-slate/80">Active listing concurrency (reusable on delete/sold)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => navigate("/subscription")}
                className="py-3 px-6 bg-[#59AD63] hover:bg-[#469550] text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                <PlusCircle size={15} />
                <span>Top Up Tokens & Slots</span>
              </button>
            </div>
          </div>

          {/* Quick Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map(({ icon: Icon, label, path, desc }) => {
              return (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="bg-white rounded-2xl p-5 border border-charcoal/5 shadow-sm hover:shadow-md hover:border-[#59AD63]/40 transition-all text-left flex items-start gap-4 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-[#59AD63]/10 text-ink group-hover:text-[#59AD63] flex items-center justify-center shrink-0 transition-colors">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-charcoal group-hover:text-black">{label}</span>
                      <ChevronRight size={16} className="text-slate/40 group-hover:text-[#59AD63] transition-colors" />
                    </div>
                    {desc && <p className="text-xs text-slate/70 mt-0.5 line-clamp-1">{desc}</p>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ALL PROPERTIES UPLOADED BY AGENCY (Grid & List View) */}
          {isAgency && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm flex flex-col gap-6 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-gray-900 tracking-tight">
                    All Properties Uploaded by {user?.name || "Agency"} ({myProperties.length})
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    View all your listings in grid or list view format
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                    <button
                      onClick={() => setAgencyViewMode("grid")}
                      className={`p-2 rounded-lg transition cursor-pointer ${
                        agencyViewMode === "grid"
                          ? "bg-white text-emerald-600 shadow-xs font-bold"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAgencyViewMode("list")}
                      className={`p-2 rounded-lg transition cursor-pointer ${
                        agencyViewMode === "list"
                          ? "bg-white text-emerald-600 shadow-xs font-bold"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate("/add-property")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle size={14} /> Add Property
                  </button>
                </div>
              </div>

              {propertiesLoading ? (
                <div className="p-8 text-center text-xs font-semibold text-gray-400">Loading listings...</div>
              ) : myProperties.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-medium">
                  No properties uploaded yet. Click "Add Property" to create your first listing!
                </div>
              ) : agencyViewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {myProperties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myProperties.map((p) => (
                    <PropertyListCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        <DesktopFooter />
      </div>
    );
  }

  // MOBILE LAYOUT (< 1000px)
  return (
    <div className="min-h-screen pb-28 bg-cream text-left">
      <header className="px-4 pt-6 pb-5 flex items-center gap-4 bg-white border-b border-charcoal/5">
        {user?.avatarUrl ? (
          <img 
            src={mediaUrl(user.avatarUrl)} 
            alt="Profile" 
            className="w-16 h-16 rounded-full object-cover border border-charcoal/10 shadow-md"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#1F4C6B] text-white flex items-center justify-center text-xl font-bold border border-charcoal/10 shadow-md select-none uppercase">
            {(user?.name || "U").charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-lg text-ink truncate">{user?.name || "Your Name"}</p>
          <p className="text-xs text-slate mt-0.5 truncate">{user?.phone || user?.email}</p>
          <div className="flex gap-2 items-center mt-1.5 flex-wrap">
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-600/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {user?.role?.toLowerCase() === "user" ? "Buyer" : user?.role || "Owner"}
            </span>
            {user?.subscriptionStatus === "active" && (
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-600/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Premium
              </span>
            )}
          </div>
          {isAgency && agencySlug && (
            <button
              onClick={() => navigate(`/${agencySlug}`)}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline mt-1.5 cursor-pointer"
            >
              <ExternalLink size={12} /> View Public Agency Page
            </button>
          )}
        </div>
      </header>

      {/* AGENCY BANNER OPTION (Mobile) */}
      {isAgency && (
        <div className="mx-4 mt-4 bg-white rounded-3xl p-3 border border-gray-200/80 shadow-sm flex flex-col">
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerUpload}
          />

          <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            {user?.agencyBannerUrl ? (
              <img
                src={mediaUrl(user.agencyBannerUrl)}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">
                Tap edit icon to upload banner
              </div>
            )}

            {/* Top-Left text */}
            <div className="absolute top-2.5 left-3 right-12 z-10 pointer-events-none">
              <p className="text-[10px] text-white font-medium drop-shadow-md line-clamp-2">
                Upload your custom agency banner. This banner will be displayed on your independent agency page.
              </p>
            </div>

            {/* Top-Right button */}
            <button
              disabled={uploadingBanner}
              onClick={() => bannerInputRef.current?.click()}
              title="Change Banner"
              className="absolute top-2 right-2 z-10 p-1.5 bg-white/95 hover:bg-white text-gray-800 rounded-lg shadow-md border border-gray-200 cursor-pointer"
            >
              <Pencil size={15} className="text-gray-700" />
            </button>

            {/* Bottom-Left Public URL */}
            <div className="absolute bottom-2 left-2 z-10 bg-black/75 text-white text-[9px] font-semibold px-2 py-0.5 rounded-md shadow-sm">
              Public URL: {window.location.origin}/{agencySlug || "your-agency-name"}
            </div>
          </div>

          {bannerSuccess && (
            <div className="mt-2 p-2 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-xl flex items-center gap-1.5 border border-emerald-200">
              <Check size={14} /> Banner updated successfully!
            </div>
          )}
        </div>
      )}

      {/* Upgrade request section for Locked Roles */}
      {user?.role && user?.role.toLowerCase() !== "user" && user?.role.toLowerCase() !== "agency" && (
        <div className="mx-4 mt-4 bg-white rounded-3xl p-4 border border-charcoal/5 shadow-sm flex flex-col gap-2.5 font-display">
          <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Role Switch Request</span>
          {switchStatus === "Pending" ? (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 rounded-xl p-3 border border-amber-600/10">
              <ShieldAlert size={16} className="shrink-0" />
              <p className="text-xs font-semibold">Switch request is pending Admin Approval.</p>
            </div>
          ) : switchStatus === "Approved" ? (
            <div className="bg-emerald-50 text-emerald-700 rounded-xl p-3 border border-emerald-600/10 text-xs font-semibold">
              Your request was approved!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate">Submit a switch request to change your current locked role to Broker or Agency.</p>
              
              {user.role?.toLowerCase() === "owner" && (
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-charcoal">Request Change To:</label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value as any)}
                    className="rounded-lg border border-charcoal/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-charcoal outline-none focus:border-black"
                  >
                    <option value="Broker">Broker</option>
                    <option value="Agency">Agency</option>
                  </select>
                </div>
              )}
              
              {switchStatus === "Rejected" && (
                <p className="text-xs font-bold text-rose-500">Your previous request was rejected. You can apply again.</p>
              )}
              <button
                disabled={requesting}
                onClick={handleRequestUpgrade}
                className="w-full py-2.5 px-4 rounded-xl bg-ink hover:bg-black text-cream text-xs font-bold shadow-md cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {requesting ? "Submitting..." : `Request switch to ${requestedRole}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Account Credit Balances Card */}
      <div className="mx-4 mt-4 bg-white rounded-3xl p-4 border border-charcoal/5 shadow-sm flex flex-col gap-3 font-display">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Credit Balances</span>
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-600/10 uppercase tracking-widest">
            No Expiry
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-[#FAF8F3] rounded-2xl p-3 border border-charcoal/5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-700">
              <Coins size={15} />
              <span className="text-[10px] font-extrabold uppercase tracking-wide">Enquiry Tokens</span>
            </div>
            <p className="text-xl font-black text-ink">{user?.enquiryCreditsLeft ?? 0}</p>
            <p className="text-[10px] text-slate/80 leading-tight">Unlocks direct owner/broker contact numbers</p>
          </div>

          <div className="bg-[#FAF8F3] rounded-2xl p-3 border border-charcoal/5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-forest">
              <Layers size={15} />
              <span className="text-[10px] font-extrabold uppercase tracking-wide">Listing Slots</span>
            </div>
            <p className="text-xl font-black text-ink">{user?.listingSlotsLeft ?? 0}</p>
            <p className="text-[10px] text-slate/80 leading-tight">Active listing concurrency (reusable)</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/subscription")}
          className="w-full mt-1 py-2.5 px-4 bg-ink hover:bg-black text-cream rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <PlusCircle size={14} className="text-emerald-400" />
          <span>Top Up Tokens & Slots</span>
        </button>
      </div>

      {/* Menu list */}
      <div className="px-4 mt-5 flex flex-col gap-2">
        {menuItems.map(({ icon: Icon, label, path }) => {
          const isSubscriptionItem = label === "Subscription" || label === "Credits & Subscription";
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex items-center justify-between bg-white rounded-2xl shadow-card px-4 py-3.5 cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
              <span className="flex items-center gap-3 text-charcoal font-medium text-[15px]">
                <Icon size={18} className="text-ink" /> {label}
              </span>
              <div className="flex items-center gap-2">
                {isSubscriptionItem && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-600/10">
                    {user?.enquiryCreditsLeft ?? 0} Tokens • {user?.listingSlotsLeft ?? 0} Slots
                  </span>
                )}
                <ChevronRight size={16} className="text-slate" />
              </div>
            </button>
          );
        })}

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center gap-3 text-coral font-medium text-[15px] px-4 py-3.5 mt-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* ALL PROPERTIES UPLOADED BY AGENCY (Mobile Grid / List View) */}
      {isAgency && (
        <div className="mx-4 mt-6 bg-white rounded-3xl p-4 border border-charcoal/5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-ink">
                My Properties ({myProperties.length})
              </h3>
              <p className="text-[10px] text-slate">Uploaded by your agency</p>
            </div>

            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => setAgencyViewMode("grid")}
                className={`p-1.5 rounded-md transition ${agencyViewMode === "grid" ? "bg-white text-emerald-600 shadow-xs" : "text-gray-500"}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setAgencyViewMode("list")}
                className={`p-1.5 rounded-md transition ${agencyViewMode === "list" ? "bg-white text-emerald-600 shadow-xs" : "text-gray-500"}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>

          {propertiesLoading ? (
            <div className="py-6 text-center text-xs text-gray-400">Loading properties...</div>
          ) : myProperties.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">No properties uploaded yet.</div>
          ) : agencyViewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-2.5">
              {myProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {myProperties.map((p) => (
                <PropertyListCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
