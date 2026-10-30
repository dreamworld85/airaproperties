import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Phone, 
  MessageCircle, 
  Building2, 
  ChevronLeft, 
  MapPin, 
  LayoutGrid, 
  List, 
  Share2, 
  Check, 
  Camera, 
  ExternalLink 
} from "lucide-react";
import { api, ApiPublicProfile, ApiProperty, mediaUrl } from "@/lib/api";
import PropertyCard from "@/components/PropertyCard";
import PropertyListCard from "@/components/PropertyListCard";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import { useAuth } from "@/lib/AuthContext";

export function toSlug(str: string): string {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function cleanAgencyAddress(
  rawAddr?: string | null,
  agencyName?: string | null,
  district?: string | null
): string {
  if (!rawAddr || !rawAddr.trim()) {
    return district?.trim() || "Kerala, India";
  }

  let addr = rawAddr.trim();

  // Strip agency name or close match from beginning of address
  if (agencyName) {
    const normName = agencyName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const parts = addr.split(",");
    if (parts.length > 1) {
      const normFirst = parts[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      if (
        normFirst &&
        normName &&
        (normFirst === normName ||
          normName.includes(normFirst) ||
          normFirst.includes(normName))
      ) {
        addr = parts.slice(1).join(",").trim();
      }
    }
  }

  // Remove leading commas, dashes, dots, spaces
  addr = addr.replace(/^[\s,.-]+/, "").trim();

  return addr || district?.trim() || "Kerala, India";
}

const DEFAULT_AGENCY_BANNER =
  "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600&auto=format&fit=crop&q=80";

export default function AgencyProfile() {
  const { id, slug } = useParams();
  const agencyIdentifier = slug || id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ApiPublicProfile | null>(null);
  const [listings, setListings] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copied, setCopied] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!agencyIdentifier) return;
    setLoading(true);

    api.fetchPublicProfile(agencyIdentifier)
      .then(async (p) => {
        setProfile(p);
        // Fetch listings by ownerId
        const l = await api.fetchProperties({ ownerId: String(p.id) });
        setListings(l || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [agencyIdentifier]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
        {isDesktop && <DesktopHeader />}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Loading agency profile…</p>
          </div>
        </div>
        {isDesktop && <DesktopFooter />}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col">
        {isDesktop && <DesktopHeader />}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-200/80 text-center max-w-md shadow-xs">
            <p className="text-sm font-semibold text-rose-500">{error || "Agency profile not found."}</p>
            <button
              onClick={() => navigate("/home")}
              className="mt-4 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-neutral-800"
            >
              Back to Home
            </button>
          </div>
        </div>
        {isDesktop && <DesktopFooter />}
      </div>
    );
  }

  const whatsappVal = profile.whatsappNumber || profile.phone || "";
  const cleanWhatsapp = whatsappVal.replace(/\D/g, "");
  const whatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp.startsWith("91") ? cleanWhatsapp : `91${cleanWhatsapp}`}`
    : undefined;

  const bannerImg = profile.agencyBannerUrl ? mediaUrl(profile.agencyBannerUrl) : DEFAULT_AGENCY_BANNER;
  const logoImg = profile.agencyLogoUrl
    ? mediaUrl(profile.agencyLogoUrl)
    : profile.avatarUrl
    ? mediaUrl(profile.avatarUrl)
    : null;

  const agencyAddressText = cleanAgencyAddress(
    profile.agencyAddress || profile.location,
    profile.name,
    profile.agencyDistrict || profile.location
  );
  const isOwnerAgency = user && user.id === profile.id;

  // DESKTOP LAYOUT (>= 1000px)
  if (isDesktop) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] w-full flex flex-col font-sans select-none relative">
        <DesktopHeader />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 text-left">
          {/* Top navigation actions */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition-colors w-fit cursor-pointer"
            >
              <ChevronLeft size={16} /> Back
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                <span>{copied ? "Link Copied!" : "Share Agency Link"}</span>
              </button>

              {isOwnerAgency && (
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100/60 shadow-xs cursor-pointer"
                >
                  <Camera size={14} /> Edit Banner in Profile
                </button>
              )}
            </div>
          </div>

          {/* Independent Agency Banner Card with Overlaid Details */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-md border border-gray-200/80 bg-slate-900 min-h-[340px] flex flex-col justify-end">
            {/* Banner Background Image */}
            <img
              src={bannerImg}
              alt={`${profile.name} banner`}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AGENCY_BANNER;
              }}
            />

            {/* Dark & Glass Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 backdrop-blur-[1px]" />

            {/* Content Over Banner */}
            <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 text-white">
              {/* Agency Logo & Core Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white/95 border-2 border-white/80 shadow-xl flex items-center justify-center shrink-0">
                  {logoImg ? (
                    <img
                      src={logoImg}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 size={42} className="text-gray-700" />
                  )}
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                      {profile.role || "Verified Agency"}
                    </span>
                    {profile.subscriptionStatus === "active" && (
                      <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400 text-gray-900 shadow-xs">
                        Premium
                      </span>
                    )}
                  </div>

                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white drop-shadow-sm tracking-tight mt-1">
                    {profile.name}
                  </h1>

                  {/* Over Banner: Address Details (Only clean address without duplicate agency name) */}
                  <p className="text-xs sm:text-sm text-white/90 flex items-center gap-1.5 font-medium drop-shadow-sm">
                    <MapPin size={15} className="text-emerald-400 shrink-0" />
                    <span>{agencyAddressText}</span>
                  </p>
                </div>
              </div>

              {/* Over Banner: Contact Details & WhatsApp Button */}
              <div className="flex flex-wrap items-center gap-3">
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="flex items-center gap-2 rounded-2xl px-5 py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer active:scale-95"
                  >
                    <Phone size={15} className="text-emerald-600" />
                    <span>{profile.phone}</span>
                  </a>
                )}

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-2xl px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer active:scale-95"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Properties Header & Grid / List View Toggle */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
              <div>
                <h2 className="font-display font-bold text-xl sm:text-2xl text-gray-900 tracking-tight">
                  Properties by {profile.name}
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Showing {listings.length} properties listed by this agency
                </p>
              </div>

              {/* Grid / List View Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-semibold text-gray-500 mr-1">View:</span>
                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white text-emerald-600 shadow-xs font-bold"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white text-emerald-600 shadow-xs font-bold"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Properties Listings */}
            {listings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center text-gray-500 font-medium text-sm shadow-xs">
                No properties posted yet by this agency.
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((p) => (
                  <PropertyListCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </div>
        </main>

        <DesktopFooter />
      </div>
    );
  }

  // MOBILE LAYOUT (< 1000px)
  return (
    <div className="min-h-screen pb-28 bg-[#FAF8F3] text-left">
      <Header title={profile.name || "Agency"} showBack />

      <div className="px-4 pt-3 flex flex-col gap-4 animate-fade-in">
        {/* Banner with Overlaid Details */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-slate-900 min-h-[260px] flex flex-col justify-end">
          <img
            src={bannerImg}
            alt={profile.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_AGENCY_BANNER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/25" />

          <div className="relative z-10 p-4 flex flex-col gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/95 border border-white/60 shadow-md flex items-center justify-center shrink-0">
                {logoImg ? (
                  <img src={logoImg} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={26} className="text-gray-700" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  {profile.role || "Agency"}
                </span>
                <h2 className="font-display font-extrabold text-lg text-white mt-1 truncate">
                  {profile.name}
                </h2>
                <p className="text-[11px] text-white/90 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{agencyAddressText}</span>
                </p>
              </div>
            </div>

            {/* Over Banner: Contact & WhatsApp */}
            <div className="flex gap-2 pt-1">
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-gray-900 text-xs font-bold shadow-md cursor-pointer active:scale-95"
                >
                  <Phone size={13} className="text-emerald-600" />
                  <span>Call</span>
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Toggle Bar */}
        <div className="flex items-center justify-between pt-1 px-1">
          <span className="font-display font-bold text-sm text-gray-900">
            Properties ({listings.length})
          </span>
          <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-white text-emerald-600 shadow-xs" : "text-gray-500"}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white text-emerald-600 shadow-xs" : "text-gray-500"}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Listings Section */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-charcoal/5 p-8 text-center text-slate font-medium text-xs shadow-sm">
            No properties posted yet.
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3">
            {listings.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {listings.map((p) => (
              <PropertyListCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
