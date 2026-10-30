import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  UploadCloud, 
  Check, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Eye, 
  PlusCircle, 
  ChevronLeft, 
  Image as ImageIcon,
  Search,
  AlertCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { api, ApiProperty, mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useAddProperty } from "@/lib/AddPropertyContext";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import StatusBadge from "@/components/StatusBadge";
import { toSlug, cleanAgencyAddress } from "./AgencyProfile";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80";

const DEFAULT_AGENCY_BANNER =
  "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600&auto=format&fit=crop&q=80";

function formatPrice(price: number, purpose?: string): string {
  let text = "";
  if (price >= 10000000) text = `₹${(price / 10000000).toFixed(2)} Cr`;
  else if (price >= 100000) text = `₹${(price / 100000).toFixed(1)} L`;
  else text = `₹${price.toLocaleString("en-IN")}`;

  if (purpose === "For Rent") {
    return `${text} / night`;
  }
  return text;
}

function formatPostedDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const clean = typeof dateStr === "string" && dateStr.includes(" ") && !dateStr.includes("T")
    ? dateStr.replace(" ", "T")
    : dateStr;
  const d = new Date(clean);
  if (isNaN(d.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

type Tab = "All" | "Active" | "Sold" | "Pending" | "Inactive" | "Draft";
const tabs: Tab[] = ["All", "Active", "Sold", "Pending", "Inactive", "Draft"];

export default function Settings() {
  const navigate = useNavigate();
  const { user, token, login, refreshUser } = useAuth();
  const { startEditing } = useAddProperty();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const agencySlug = user?.name ? toSlug(user.name) : (user?.id ? String(user.id) : "");

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function loadProperties() {
    setLoading(true);
    setError(null);
    api.fetchMyProperties()
      .then(setProperties)
      .catch((err) => setError(err.message || "Failed to load properties"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProperties();
    if (token) {
      api.fetchMyProfile()
        .then((updatedUser) => {
          login(token, updatedUser);
        })
        .catch((err) => console.error("Error refreshing profile:", err));
    }
  }, [token]);

  // Handle banner image upload
  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setBannerError("Please select an image file (JPG, PNG, WebP).");
      return;
    }

    setUploadingBanner(true);
    setBannerError(null);
    setBannerSuccess(false);

    try {
      const updatedUser = await api.uploadAgencyBanner(file);
      if (token && updatedUser) {
        login(token, updatedUser);
      }
      setBannerSuccess(true);
      setTimeout(() => setBannerSuccess(false), 3500);
    } catch (err: any) {
      setBannerError(err?.message || "Failed to upload banner. Please try again.");
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  }

  // Handle Edit property
  function handleEdit(p: ApiProperty) {
    startEditing(p);
    navigate("/add-property/details");
  }

  // Handle Delete property
  async function handleDelete(p: ApiProperty) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${p.title}"?\n\nThis will permanently remove the property along with all uploaded images and videos from the server.`
    );
    if (!confirmed) return;

    setBusyId(p.id);
    try {
      await api.deleteProperty(p.id);
      setProperties((prev) => prev.filter((item) => item.id !== p.id));
      await refreshUser();
    } catch (err: any) {
      alert(`Could not delete property: ${err?.message || "Internal server error"}`);
    } finally {
      setBusyId(null);
    }
  }

  // Filtered properties
  const filtered = properties.filter((p) => {
    const matchesTab = activeTab === "All" || p.status === activeTab;
    const matchesQuery = !searchQuery.trim() || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.propertyType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-left flex flex-col font-sans select-none">
      {isDesktop ? <DesktopHeader /> : <Header title="Settings" showBack />}

      <main className="flex-1 max-w-[1750px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8">
        {/* Navigation Breadcrumb / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/profile")}
                className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to Profile
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 tracking-tight mt-1.5">
              Settings & Property Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Manage your agency banner, customize settings, and edit or delete your uploaded properties.
            </p>
          </div>

          <button
            onClick={() => navigate("/add-property/role")}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle size={15} />
            <span>Add New Property</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* SECTION 1: AGENCY BANNER MANAGEMENT (Add / Edit Banner)    */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-600/15 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <ImageIcon size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display">
                    Agency Banner Settings
                  </h2>
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                    {user?.role?.toLowerCase() === "agency" ? "Verified Agency" : "Agency & Profile Banner"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 max-w-2xl">
                Upload or edit your agency banner. This banner appears as the hero image on your independent agency page (<span className="font-semibold text-gray-700">/{agencySlug}</span>) with your address, contact, and WhatsApp details overlaid.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
              <button
                disabled={uploadingBanner}
                onClick={() => bannerInputRef.current?.click()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud size={16} />
                <span>{uploadingBanner ? "Uploading Banner…" : (user?.agencyBannerUrl ? "Edit / Change Banner" : "Add Agency Banner")}</span>
              </button>

              {agencySlug && (
                <button
                  onClick={() => navigate(`/${agencySlug}`)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>View Public Agency Page</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback messages */}
          {bannerSuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2 border border-emerald-200">
              <Check size={16} />
              <span>Agency banner updated successfully and published live!</span>
            </div>
          )}

          {bannerError && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2 border border-rose-200">
              <AlertCircle size={16} />
              <span>{bannerError}</span>
            </div>
          )}

          {/* Banner Live Preview Box */}
          <div className="relative w-full h-44 sm:h-64 rounded-2xl overflow-hidden bg-slate-900 border border-gray-200/90 shadow-inner group">
            <img
              src={user?.agencyBannerUrl ? mediaUrl(user.agencyBannerUrl) : DEFAULT_AGENCY_BANNER}
              alt="Agency Banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AGENCY_BANNER;
              }}
            />

            {/* Overlaid Banner Badge and Details */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10 flex items-center gap-3.5 text-white drop-shadow-md">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-white/95 border-2 border-white/80 shadow-md flex items-center justify-center shrink-0">
                {user?.agencyLogoUrl ? (
                  <img src={mediaUrl(user.agencyLogoUrl)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={24} className="text-gray-700" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                  {user?.role?.toLowerCase() === "agency" ? "Agency" : "Profile"}
                </span>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-white drop-shadow-sm mt-0.5">
                  {user?.name || "Your Agency"}
                </h3>
                <p className="text-[11px] sm:text-xs text-white/80">
                  {cleanAgencyAddress(user?.agencyAddress || user?.location, user?.name, user?.agencyDistrict || user?.location)}
                </p>
              </div>
            </div>

            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-[11px] font-semibold backdrop-blur-md transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Pencil size={12} />
                <span>{user?.agencyBannerUrl ? "Change Image" : "Add Image"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: ALL PROPERTIES WITH EDIT & DELETE BUTTONS      */}
        {/* Display exactly 5 properties per row on wide screens       */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-900 tracking-tight">
                  All Properties
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-200/80 text-gray-700 font-bold text-xs">
                  {properties.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                View, edit, or delete listings uploaded under your account. Shown 5 properties per row.
              </p>
            </div>

            {/* Search & Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search properties…"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600 transition shadow-2xs"
                />
              </div>

              {/* Status tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-gray-100 p-1 rounded-xl">
                {tabs.map((tab) => {
                  const count = tab === "All"
                    ? properties.length
                    : properties.filter((p) => p.status === tab).length;
                  const active = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        active
                          ? "bg-white text-emerald-700 shadow-xs font-bold"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Properties Grid: Exactly 5 properties per row on wide desktop (min-[1300px]) */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-200/80">
              <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-gray-500">Loading properties…</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center">
              <p className="text-sm font-semibold text-rose-600">{error}</p>
              <button
                onClick={loadProperties}
                className="mt-3 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 bg-white rounded-3xl border border-gray-200/80 text-center p-8 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                <Building2 size={28} />
              </div>
              <h3 className="font-display font-bold text-base text-gray-800">
                No properties found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                {searchQuery ? `No listings match "${searchQuery}".` : `You don't have any properties in "${activeTab}" status.`}
              </p>
              <button
                onClick={() => navigate("/add-property/role")}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle size={14} /> Add Property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-[1350px]:grid-cols-5 gap-4.5">
              {filtered.map((p) => {
                const firstImg = p.images && p.images[0] ? p.images[0] : null;
                const imgUrl = firstImg ? mediaUrl(firstImg) : FALLBACK_IMAGE;
                const isSold = p.status === "Sold" || (p.status as string) === "";
                const postedDate = formatPostedDate(p.createdAt || (p as any).created_at);

                return (
                  <div
                    key={p.id}
                    className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden text-left"
                  >
                    {/* Property Image Container */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                      <img
                        src={imgUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />

                      {/* Top Left Tag: Sold Out (Red) / Purpose */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                        {isSold ? (
                          <span className="px-2.5 py-0.5 bg-red-600 text-white font-bold text-[11px] rounded-md shadow-md tracking-wide">
                            Sold Out
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-white/95 text-gray-900 font-bold text-[10px] rounded-md shadow-xs backdrop-blur-xs">
                            {p.purpose === "For Rent" ? "For Rent" : "For Sale"}
                          </span>
                        )}
                      </div>

                      {/* Top Right Status Badge */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <StatusBadge status={p.status} />
                      </div>

                      {/* Bottom Overlay: White gradient with Posted Date */}
                      {postedDate && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/60 to-transparent pt-6 pb-1.5 px-2.5 z-10 flex items-end">
                          <span className="text-gray-900 font-bold italic text-[11px] tracking-tight">
                            Posted Date: {postedDate}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        {/* Price & Property Type */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-base font-extrabold text-gray-900 font-display tracking-tight">
                            {formatPrice(p.price, p.purpose)}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {p.propertyType}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 
                          onClick={() => navigate(`/property/${p.id}`)}
                          className="font-display font-bold text-xs sm:text-sm text-gray-900 mt-1 line-clamp-1 group-hover:text-emerald-700 transition cursor-pointer"
                          title={p.title}
                        >
                          {p.title}
                        </h4>

                        {/* Location */}
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                          {p.address ? `${p.address}, ` : ""}{p.district}
                        </p>
                      </div>

                      {/* EDIT & DELETE Action Buttons */}
                      <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5">
                        {/* View Button */}
                        <button
                          onClick={() => navigate(`/property/${p.id}`)}
                          title="View property details"
                          className="p-2 rounded-xl text-gray-600 hover:text-black hover:bg-gray-100 transition cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit Property Button */}
                        <button
                          onClick={() => handleEdit(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>

                        {/* Delete Property Button */}
                        <button
                          disabled={busyId === p.id}
                          onClick={() => handleDelete(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-600 text-xs font-bold transition cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
                        >
                          <Trash2 size={13} />
                          <span>{busyId === p.id ? "Deleting…" : "Delete"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {isDesktop ? <DesktopFooter /> : <BottomNav />}
    </div>
  );
}
