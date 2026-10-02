import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Eye, 
  MessageSquare, 
  Heart, 
  Pencil, 
  Power, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Share2, 
  Star, 
  Sparkles, 
  X, 
  User, 
  Phone, 
  MessageCircle, 
  Play,
  Building,
  BedDouble,
  Bath,
  Maximize,
  Calendar,
  Compass,
  ShieldCheck,
  Layers,
  Copy,
  Check,
  MapPin,
  ExternalLink,
  Trees,
  Tag,
  CheckCircle2
} from "lucide-react";
import { api, ApiPropertyDetail, mediaUrl, formatArea, isLandProperty, getLandAreaDetails } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import { useAddProperty } from "@/lib/AddPropertyContext";
import { useAuth } from "@/lib/AuthContext";
import PropertyViewersModal from "@/components/PropertyViewersModal";
import PropertyActivationModal from "@/components/PropertyActivationModal";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80";

const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Wayanad: { lat: 11.6854, lng: 76.1320 },
  Kozhikode: { lat: 11.2588, lng: 75.7804 },
  Kannur: { lat: 11.8745, lng: 75.3704 },
  Kasaragod: { lat: 12.5102, lng: 74.9852 },
  Malappuram: { lat: 11.0735, lng: 76.0740 },
  Palakkad: { lat: 10.7867, lng: 76.6547 },
  Thrissur: { lat: 10.5276, lng: 76.2144 },
  Ernakulam: { lat: 9.9816, lng: 76.2999 },
  Idukki: { lat: 9.9189, lng: 77.1025 },
  Kottayam: { lat: 9.5916, lng: 76.5221 },
  Alappuzha: { lat: 9.4981, lng: 76.3388 },
  Pathanamthitta: { lat: 9.2648, lng: 76.7870 },
  Kollam: { lat: 8.8932, lng: 76.6141 },
  Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 }
};

function PropertyLocationMap({ latitude, longitude, title, address, district }: { latitude?: number | string | null; longitude?: number | string | null; title: string; address: string; district: string }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const lat = latitude ? parseFloat(String(latitude)) : (DISTRICT_COORDINATES[district]?.lat || 10.850516);
  const lng = longitude ? parseFloat(String(longitude)) : (DISTRICT_COORDINATES[district]?.lng || 76.271080);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const initMap = () => {
      if (window.L && mapContainerRef.current) {
        if (mapRef.current && typeof mapRef.current.remove === "function") {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = window.L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 13,
          zoomControl: false,
        });

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap"
        }).addTo(map);

        const customIcon = window.L.divIcon({
          className: "custom-leaflet-owner-detail-pin",
          html: `<div style="
            background: #1B5E4F;
            color: #ffffff;
            padding: 5px 12px;
            border-radius: 20px;
            font-weight: 800;
            font-size: 11px;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            white-space: nowrap;
          ">📍 ${title.slice(0, 22)}</div>`,
          iconSize: null,
        });

        window.L.marker([lat, lng], { icon: customIcon }).addTo(map);
        mapRef.current = map;
      } else {
        timer = setTimeout(initMap, 200);
      }
    };

    initMap();
    return () => clearTimeout(timer);
  }, [lat, lng, title]);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="bg-white rounded-2xl border border-charcoal/5 p-4 sm:p-6 shadow-sm flex flex-col gap-3 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-extrabold text-xs sm:text-sm text-ink uppercase tracking-wider">
            Property Location Map
          </h3>
          <p className="text-[11px] text-slate font-semibold mt-0.5">
            {[address, district].filter(Boolean).join(", ")}
          </p>
        </div>
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-xl border border-emerald-500/15 transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>Open Directions</span>
          <ExternalLink size={11} />
        </a>
      </div>

      <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden border border-charcoal/8 bg-slate-100 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

function getYoutubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

export default function OwnerPropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startEditing } = useAddProperty();
  const [property, setProperty] = useState<ApiPropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [showActivationChoice, setShowActivationChoice] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featuredData, setFeaturedData] = useState<any>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleThumbnailClick = (idx: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: carouselRef.current.clientWidth * idx,
        behavior: "smooth"
      });
    }
    setActiveIdx(idx);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.fetchProperty(id),
      api.fetchFeaturedStatus().catch(() => null)
    ])
      .then(([prop, feat]) => {
        setProperty(prop);
        setFeaturedData(feat);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleToggleActive() {
    if (!property) return;
    setBusy(true);
    try {
      const nextStatus = property.status === "Active" ? "Inactive" : "Active";
      await api.updatePropertyStatus(property.id, nextStatus);
      setProperty({ ...property, status: nextStatus });
    } catch (err: any) {
      if (err.requiresActivationChoice) {
        setShowActivationChoice(true);
      } else {
        alert(err.message || "Failed to update property status.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleActivateFree() {
    if (!property) return;
    setShowActivationChoice(false);
    setBusy(true);
    try {
      await api.updatePropertyStatus(property.id, "Active", true);
      setProperty({ ...property, status: "Active" });
      setTimeout(() => {
        alert("Property activated successfully under Admin Number fallback!");
      }, 100);
    } catch (err: any) {
      alert(err.message || "Failed to activate property.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!property) return;
    if (!window.confirm("Are you sure you want to permanently delete this listing?")) return;
    setBusy(true);
    try {
      await api.deleteProperty(property.id);
      navigate("/my-properties");
    } finally {
      setBusy(false);
    }
  }

  const handleCopyPhone = (num?: string | null) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#1B5E4F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading property management dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md shadow-xs">
          <p className="text-sm text-rose-600 font-bold mb-4">{error || "Property not found."}</p>
          <button
            onClick={() => navigate("/my-properties")}
            className="px-4 py-2 bg-[#1B5E4F] text-white text-xs font-bold rounded-xl"
          >
            Back to My Properties
          </button>
        </div>
      </div>
    );
  }

  // Unified media items list
  const mediaItems: Array<{ type: "image" | "video"; url: string }> = [
    ...(property.images || []).map((img) => ({ type: "image" as const, url: img })),
    ...(property.videos || []).map((vid) => ({ type: "video" as const, url: vid }))
  ];
  if (mediaItems.length === 0) {
    mediaItems.push({ type: "image", url: FALLBACK_IMAGE });
  }

  const isLand = isLandProperty(property.propertyType);
  const landArea = getLandAreaDetails(property.areaSqft, property.price);

  // DESKTOP LAYOUT (Screen Width >= 1000px)
  if (isDesktop) {
    const currentMedia = mediaItems[activeIdx] || mediaItems[0];

    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col font-sans">
        <DesktopHeader />

        <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
          {/* Top Breadcrumbs & Actions Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-5 mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/my-properties")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition cursor-pointer active:scale-95"
              >
                <ChevronLeft size={16} />
                <span>My Properties</span>
              </button>
              <div className="h-4 w-[1px] bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900 tracking-tight font-display truncate max-w-md">
                {property.title}
              </h1>
              <StatusBadge status={property.status} />
              {property.isFeatured && (
                <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <Star size={12} className="fill-amber-500 text-amber-500" /> Featured
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate(`/property/${property.id}`)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-2xs transition cursor-pointer"
                title="View how buyers see this listing"
              >
                <ExternalLink size={13} className="text-blue-600" />
                <span>Public View</span>
              </button>

              <button
                onClick={() => {
                  if (property) {
                    startEditing(property);
                    navigate("/add-property/details");
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1B5E4F] hover:bg-[#14483d] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer active:scale-95"
              >
                <Pencil size={13} />
                <span>Edit Listing Details</span>
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/property/${property.id}`;
                  if (navigator.share) {
                    navigator.share({ title: property.title, url }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(url);
                    alert("Listing link copied to clipboard!");
                  }
                }}
                className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 transition cursor-pointer"
                title="Share link"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Main 2-Column Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT 8 COLUMNS: Media Showcase, Details, Description, Location */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Media Gallery Showcase */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex flex-col gap-4">
                {/* Main Media Display */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-gray-200 shadow-inner flex items-center justify-center">
                  {currentMedia.type === "video" ? (
                    <video
                      src={mediaUrl(currentMedia.url)}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={mediaUrl(currentMedia.url)}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Left / Right Arrow Switchers */}
                  {mediaItems.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-md"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setActiveIdx((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-md"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg select-none">
                        {activeIdx + 1} / {mediaItems.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails Row */}
                {mediaItems.length > 1 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                    {mediaItems.map((item, idx) => {
                      const isActive = activeIdx === idx;
                      return (
                        <button
                          key={`thumb-desktop-${idx}`}
                          onClick={() => setActiveIdx(idx)}
                          className={`w-20 h-20 rounded-xl overflow-hidden border-2 relative shrink-0 transition-all cursor-pointer ${
                            isActive
                              ? "border-[#1B5E4F] scale-105 shadow-sm ring-2 ring-[#1B5E4F]/20"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          {item.type === "video" ? (
                            <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
                              <video
                                src={mediaUrl(item.url)}
                                className="w-full h-full object-cover brightness-[0.7]"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Play size={14} className="fill-white text-white stroke-[2.5]" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={mediaUrl(item.url)}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Property Details & Overview Grid */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-6">
                <div>
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">
                      {formatPrice(property.price)}
                    </span>
                    {property.isPriceNegotiable && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Negotiable
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 font-display">{property.title}</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                    <MapPin size={13} className="text-gray-400" />
                    <span>{[property.address, property.district, property.state].filter(Boolean).join(", ")}</span>
                  </p>
                </div>

                {/* 8-Box Overview Grid */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 font-display">
                    Property Overview
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {isLand ? (
                      <>
                        {/* 1. ID */}
                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-2xs">
                            <Building size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">ID</span>
                            <span className="text-xs font-extrabold text-gray-900 truncate block">#{property.id}</span>
                          </div>
                        </div>

                        {/* 2. Type */}
                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-2xs">
                            <Trees size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Type</span>
                            <span className="text-xs font-extrabold text-gray-900 truncate block">{property.propertyType}</span>
                          </div>
                        </div>

                        {/* 3. Total Land Area */}
                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-2xs">
                            <Maximize size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Land Area</span>
                            <span className="text-xs font-extrabold text-emerald-700 truncate block">{landArea.primary}</span>
                          </div>
                        </div>

                        {/* 4. In Cents */}
                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-2xs">
                            <Layers size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">In Cents</span>
                            <span className="text-xs font-extrabold text-gray-900 truncate block">{landArea.secondary}</span>
                          </div>
                        </div>

                        {/* 5. Rate / Cent */}
                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-2xs">
                            <Tag size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Rate / Cent</span>
                            <span className="text-xs font-extrabold text-gray-900 truncate block">{landArea.pricePerCent}</span>
                          </div>
                        </div>

                        {/* 6. Purpose */}
                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-2xs">
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Purpose</span>
                            <span className="text-xs font-extrabold text-gray-900 truncate block">{property.purpose || "For Sale"}</span>
                          </div>
                        </div>

                        {/* 7. Facing */}
                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-2xs">
                            <Compass size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Facing</span>
                            <span className="text-xs font-extrabold text-gray-900 truncate block">{property.facing || "Road Facing"}</span>
                          </div>
                        </div>

                        {/* 8. Possession */}
                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-2xs">
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Possession</span>
                            <span className="text-xs font-extrabold text-gray-900 truncate block">{property.propertyAge || "Immediate"}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-[#1B5E4F] shadow-2xs">
                            <Building size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Type</span>
                            <span className="text-xs font-extrabold text-gray-900 truncate block">{property.propertyType}</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-[#1B5E4F] shadow-2xs">
                            <BedDouble size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Bedrooms</span>
                            <span className="text-xs font-extrabold text-gray-900">{property.bedrooms || 0} Beds</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-[#1B5E4F] shadow-2xs">
                            <Bath size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Bathrooms</span>
                            <span className="text-xs font-extrabold text-gray-900">{property.bathrooms || 0} Baths</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-[#1B5E4F] shadow-2xs">
                            <Maximize size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Area</span>
                            <span className="text-xs font-extrabold text-gray-900">{property.areaSqft} SqFt</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-[#1B5E4F] shadow-2xs">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Age</span>
                            <span className="text-xs font-extrabold text-gray-900">{property.propertyAge || "New"}</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-[#1B5E4F] shadow-2xs">
                            <Compass size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Facing</span>
                            <span className="text-xs font-extrabold text-gray-900">{property.facing || "N/A"}</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-[#1B5E4F] shadow-2xs">
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Furnishing</span>
                            <span className="text-xs font-extrabold text-gray-900 truncate block">{property.furnishing || "Unfurnished"}</span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl text-[#1B5E4F] shadow-2xs">
                            <Layers size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Purpose</span>
                            <span className="text-xs font-extrabold text-gray-900">{property.purpose || "For Sale"}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Card */}
              {property.description && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-3">
                  <h3 className="text-base font-bold text-gray-900 font-display">Property Description</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Location Map */}
              <PropertyLocationMap
                latitude={property.latitude}
                longitude={property.longitude}
                title={property.title}
                address={property.address}
                district={property.district}
              />

              {/* Video Tour (If YouTube provided) */}
              {property.youtubeUrl && getYoutubeEmbedUrl(property.youtubeUrl) && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-3">
                  <h3 className="text-base font-bold text-gray-900 font-display">Video Tour</h3>
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <iframe
                      src={getYoutubeEmbedUrl(property.youtubeUrl)!}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT 4 COLUMNS: Sticky Action Controls, Analytics, Contact Info */}
            <div className="lg:col-span-4 sticky top-20 flex flex-col gap-6">
              {/* Card 1: Performance Analytics */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 font-display">Listing Performance</h3>
                  <span className="text-[10px] text-gray-400 font-medium">Real-time stats</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setShowViewersModal(true)}
                    className="p-3 rounded-2xl bg-sky-50/70 hover:bg-sky-50 border border-sky-100 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group active:scale-95 text-center"
                    title="Click to view visitors list"
                  >
                    <Eye size={18} className="text-sky-600 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-lg text-sky-950">{property.views}</span>
                    <span className="text-[9px] font-bold text-sky-600 uppercase tracking-wider">Views</span>
                  </button>

                  <button
                    onClick={() => navigate("/visitors-enquiries")}
                    className="p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group active:scale-95 text-center"
                    title="Click to view inquiries"
                  >
                    <MessageSquare size={18} className="text-[#1B5E4F] group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-lg text-emerald-950">{property.enquiryCount}</span>
                    <span className="text-[9px] font-bold text-[#1B5E4F] uppercase tracking-wider">Enquiries</span>
                  </button>

                  <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 flex flex-col items-center justify-center gap-1 text-center">
                    <Heart size={18} className="text-rose-500" />
                    <span className="font-extrabold text-lg text-rose-950">{property.saveCount}</span>
                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">Saves</span>
                  </div>
                </div>

                {Boolean(property.avgRating && property.avgRating > 0) && (
                  <button
                    onClick={() => navigate(`/property/${property.id}/reviews`)}
                    className="flex items-center justify-between p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 font-bold hover:bg-amber-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                      <span>{property.avgRating?.toFixed(1)} / 5.0</span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-normal">
                      {property.ratingCount || 0} reviews →
                    </span>
                  </button>
                )}
              </div>

              {/* Card 2: Listing Management Controls */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 font-display">Listing Management</h3>
                  <StatusBadge status={property.status} />
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      if (property) {
                        startEditing(property);
                        navigate("/add-property/details");
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#1B5E4F] hover:bg-[#14483d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Pencil size={14} />
                    <span>Edit Listing Details</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={busy}
                      onClick={handleToggleActive}
                      className="py-2.5 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <Power size={13} className="text-amber-600" />
                      <span>{property.status === "Active" ? "Deactivate" : "Activate"}</span>
                    </button>

                    <button
                      disabled={busy}
                      onClick={handleDelete}
                      className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Promote to Featured Banner */}
                {property.status === "Active" && !property.isFeatured && (
                  <div className="mt-1 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex flex-col gap-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Star size={13} className="fill-amber-500 text-amber-500" />
                        <span>Feature Your Listing</span>
                      </h4>
                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                        Pin your listing to the top of home feed and search results to get up to 10x more buyer leads.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowFeatureModal(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={12} />
                      <span>Promote to Featured ({featuredData?.isEligibleForFree ? "Free Trial" : `₹${featuredData?.featuredPrice || 299}`})</span>
                    </button>
                  </div>
                )}

                {/* Restore Contact Info (If using admin contact) */}
                {property.useAdminContact && user?.subscriptionStatus === "active" && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col gap-2.5">
                    <p className="text-[11px] text-emerald-800 leading-normal">
                      ✨ Currently displaying Admin contact fallback. Click below to restore your personal number.
                    </p>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Restore your contact number to this listing?")) return;
                        setBusy(true);
                        try {
                          await api.restorePropertyContact(property.id);
                          const updated = await api.fetchProperty(property.id);
                          setProperty(updated);
                          alert("Successfully restored your contact details!");
                        } catch (err: any) {
                          alert(err.message || "Failed to update contact details.");
                        } finally {
                          setBusy(false);
                        }
                      }}
                      disabled={busy}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Restore My Number
                    </button>
                  </div>
                )}
              </div>

              {/* Card 3: Contact Info in Post */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col gap-3.5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 font-display">
                    Contact Info in Post
                  </h3>
                  <span className="text-[10px] font-black text-[#1B5E4F] bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100">
                    {property.listingRole}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Person */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-gray-600 shrink-0">
                      <User size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Listing Person</span>
                      <span className="text-xs font-bold text-gray-900 truncate block mt-0.5">
                        {property.listingRole === "Agency"
                          ? (property.agencyName || "Agency")
                          : property.listingRole === "Broker"
                          ? (property.brokerName || "Broker")
                          : (property.ownerName || "Owner")}
                      </span>
                    </div>
                  </div>

                  {/* Phone */}
                  {property.contactNumber && (
                    <div className="flex items-center justify-between gap-2 p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-gray-600 shrink-0">
                          <Phone size={14} className="text-[#1B5E4F]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">
                            Contact Number {property.useAdminContact && <span className="text-amber-600">(admin's)</span>}
                          </span>
                          <span className="text-xs font-bold text-gray-900 block mt-0.5">{property.contactNumber}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopyPhone(property.contactNumber)}
                          className="p-2 hover:bg-white text-gray-500 rounded-lg transition"
                          title="Copy phone"
                        >
                          {copiedPhone ? <Check size={13} className="text-emerald-600 stroke-[3]" /> : <Copy size={13} />}
                        </button>
                        <a
                          href={`tel:${property.contactNumber}`}
                          className="px-3 py-1.5 bg-[#1B5E4F] hover:bg-[#14483d] text-white rounded-lg text-xs font-bold transition shadow-2xs"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {property.whatsappNumber && (
                    <div className="flex items-center justify-between gap-2 p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-emerald-600 shrink-0">
                          <MessageCircle size={15} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">
                            WhatsApp {property.useAdminContact && <span className="text-amber-600">(admin's)</span>}
                          </span>
                          <span className="text-xs font-bold text-gray-900 block mt-0.5">{property.whatsappNumber}</span>
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/${property.whatsappNumber.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-bold transition shadow-2xs shrink-0"
                      >
                        Chat
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <DesktopFooter />

        {/* Modals */}
        {showViewersModal && (
          <PropertyViewersModal 
            propertyId={property.id}
            propertyTitle={property.title}
            onClose={() => setShowViewersModal(false)}
          />
        )}
        {showActivationChoice && (
          <PropertyActivationModal
            onClose={() => setShowActivationChoice(false)}
            onUpgrade={() => {
              setShowActivationChoice(false);
              navigate("/subscription");
            }}
            onContinueFree={handleActivateFree}
          />
        )}
        {showFeatureModal && (
          <FeatureListingModal
            propertyId={property.id}
            featuredData={featuredData}
            onClose={() => setShowFeatureModal(false)}
            onSuccess={() => {
              setProperty(prev => prev ? { ...prev, isFeatured: true } : null);
            }}
          />
        )}
      </div>
    );
  }

  // MOBILE LAYOUT (Screen Width < 1000px)
  return (
    <div className="min-h-screen pb-28 bg-slate-50">
      <div className="relative">
        <div 
          ref={carouselRef}
          onScroll={(e) => {
            const container = e.currentTarget;
            const scrollPos = container.scrollLeft;
            const width = container.offsetWidth;
            if (width > 0) {
              setActiveIdx(Math.round(scrollPos / width));
            }
          }}
          className="flex w-full h-64 overflow-x-auto snap-x snap-mandatory no-scrollbar bg-slate-100"
        >
          {property.images && property.images.length > 0 ? (
            <>
              {property.images.map((img, idx) => (
                <div key={`img-${idx}`} className="w-full h-full flex-shrink-0 snap-start">
                  <img
                    src={mediaUrl(img)}
                    alt={`${property.title} - image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {property.videos && property.videos.map((vid, idx) => (
                <div key={`vid-${idx}`} className="w-full h-full flex-shrink-0 snap-start bg-black flex items-center justify-center">
                  <video
                    src={mediaUrl(vid)}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="w-full h-full flex-shrink-0 snap-start">
              <img
                src={FALLBACK_IMAGE}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        
        {/* Thumbnails Row */}
        {property.images && (property.images.length + (property.videos?.length || 0)) > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-transparent px-2 py-1.5 flex items-center gap-1.5 max-w-[90%] overflow-x-auto no-scrollbar z-20">
            {mediaItems.slice(0, 5).map((item, idx) => {
              const isActive = activeIdx === idx;
              return (
                <button
                  key={`thumb-${idx}`}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`w-[3.25rem] h-[3.25rem] rounded-[0.4rem] overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    isActive ? "border-white scale-105 shadow-md" : "border-white/50 opacity-80 hover:opacity-100"
                  }`}
                >
                  {item.type === "image" ? (
                    <img
                      src={mediaUrl(item.url)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
                      <video
                        src={mediaUrl(item.url)}
                        className="w-full h-full object-cover brightness-[0.7]"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play size={10} className="fill-white text-white stroke-[2.5]" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 hover:bg-white rounded-full p-2 z-10 shadow-sm transition-all cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeft size={20} className="text-ink" />
        </button>
        <button 
          onClick={() => {
            const url = `${window.location.origin}/property/${property.id}`;
            if (navigator.share) {
              navigator.share({ title: property.title, url }).catch(() => {});
            } else {
              navigator.clipboard.writeText(url);
              alert("Link copied!");
            }
          }}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 z-10 shadow-sm transition-all cursor-pointer"
        >
          <Share2 size={18} className="text-ink" />
        </button>
      </div>

      <div className="px-6 pt-5 flex flex-col gap-4">
        <div className="bg-white border border-charcoal/5 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={property.status} />
            {property.isFeatured && (
              <span className="bg-gold/15 text-gold text-[10px] font-extrabold px-2 py-0.5 rounded border border-gold/30 uppercase tracking-wider flex items-center gap-1">
                <Star size={10} className="fill-gold text-gold" /> Featured
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold text-[18px] text-ink leading-tight">
                {formatPrice(property.price)}
              </p>
              {property.isPriceNegotiable && (
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  Negotiable
                </span>
              )}
            </div>
            <p className="font-display font-medium text-charcoal mt-1 text-[14px]">{property.title}</p>
            <p className="text-xs text-slate mt-0.5">{formatArea(property.areaSqft, property.propertyType)} &middot; {[property.address, property.district, property.state].filter(Boolean).join(", ")}</p>
          </div>
          
          <div className="flex items-center gap-1.5 border-t border-charcoal/5 pt-2">
            <button 
              onClick={() => navigate(`/property/${property.id}/reviews`)}
              className="flex items-center gap-1 bg-amber/10 hover:bg-amber/20 text-amber px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer animate-fade-in"
            >
              <Star size={12} className="fill-gold text-gold" />
              <span>{property.avgRating ? property.avgRating.toFixed(1) : "0.0"}</span>
              <span className="text-slate/75 font-semibold">({property.ratingCount || 0} reviews)</span>
            </button>
          </div>
        </div>

        {property.description && (
          <div className="bg-white border border-charcoal/5 p-4 rounded-2xl shadow-sm flex flex-col gap-1.5">
            <p className="text-[10px] font-bold text-slate uppercase tracking-wider pl-0.5">Description</p>
            <p className="text-xs text-slate leading-relaxed">{property.description}</p>
          </div>
        )}

        {/* Property Location Map Card */}
        <PropertyLocationMap
          latitude={property.latitude}
          longitude={property.longitude}
          title={property.title}
          address={property.address}
          district={property.district}
        />

        {property.youtubeUrl && getYoutubeEmbedUrl(property.youtubeUrl) && (
          <div className="bg-white border border-charcoal/5 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
            <p className="text-[10px] font-bold text-slate uppercase tracking-wider pl-0.5">Video Tour</p>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-charcoal/8 shadow-sm">
              <iframe
                src={getYoutubeEmbedUrl(property.youtubeUrl)!}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setShowViewersModal(true)}
            className="bg-sky-50/30 border border-sky-100 rounded-2xl p-3 flex flex-col items-center gap-1 hover:bg-sky-50 transition-colors active:scale-95 cursor-pointer w-full text-center"
          >
            <Eye size={18} className="text-sky-600" />
            <p className="font-display font-extrabold text-base text-sky-700">{property.views}</p>
            <p className="text-[9px] font-bold text-sky-600/90 uppercase tracking-wider">Views</p>
          </button>
          <button
            onClick={() => navigate("/visitors-enquiries")}
            className="bg-white border border-charcoal/5 rounded-2xl p-3 flex flex-col items-center gap-1 justify-center hover:bg-gray-50 transition cursor-pointer"
          >
            <MessageSquare size={18} className="text-forest" />
            <p className="font-display font-extrabold text-base text-ink">{property.enquiryCount}</p>
            <p className="text-[9px] font-bold text-slate/80 uppercase tracking-wider">Enquiries</p>
          </button>
          <div className="bg-white border border-charcoal/5 rounded-2xl p-3 flex flex-col items-center gap-1 justify-center">
            <Heart size={18} className="text-coral" />
            <p className="font-display font-extrabold text-base text-ink">{property.saveCount}</p>
            <p className="text-[9px] font-bold text-slate/80 uppercase tracking-wider">Saves</p>
          </div>
        </div>

        {/* Restore Contact Info Option for Subscribed Users */}
        {property.useAdminContact && user?.subscriptionStatus === "active" && (
          <div className="bg-emerald-50 border border-emerald-200/40 rounded-2xl p-4 shadow-sm flex flex-col gap-3 font-display animate-fade-in">
            <div className="flex items-start gap-2.5">
              <span className="text-base leading-none">✨</span>
              <div className="flex-1">
                <h4 className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider">Active Subscription!</h4>
                <p className="text-[10px] text-emerald-800 leading-normal mt-0.5">
                  Currently displaying Admin contact. Click below to restore your own details.
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (!window.confirm("Restore your contact number to this listing?")) return;
                setBusy(true);
                try {
                  await api.restorePropertyContact(property.id);
                  const updated = await api.fetchProperty(property.id);
                  setProperty(updated);
                  alert("Successfully restored your contact details!");
                } catch (err: any) {
                  alert(err.message || "Failed to update contact details.");
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold text-center transition-all shadow-md cursor-pointer"
            >
              Restore My Number
            </button>
          </div>
        )}

        {/* Contact Info Added in the Post */}
        <div className="bg-white rounded-2xl border border-charcoal/5 p-4 shadow-sm flex flex-col gap-3 font-display">
          <div className="flex items-center justify-between border-b border-charcoal/5 pb-2">
            <h3 className="font-bold text-[10px] text-slate uppercase tracking-wider">Contact Info in Post</h3>
            <span className="text-[9px] font-extrabold text-forest bg-forest/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {property.listingRole}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Person */}
            <div className="flex items-center gap-3 p-2.5 bg-slate-50/50 rounded-xl border border-charcoal/5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate shrink-0">
                <User size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate/75 uppercase tracking-wide leading-none">Listing Person</p>
                <p className="text-xs font-bold text-ink mt-1 truncate">
                  {property.listingRole === "Agency"
                    ? (property.agencyName || "Agency")
                    : property.listingRole === "Broker"
                    ? (property.brokerName || "Broker")
                    : (property.ownerName || "Owner")}
                </p>
              </div>
            </div>

            {/* Phone */}
            {property.contactNumber && (
              <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-charcoal/5 hover:border-forest/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-forest/5 flex items-center justify-center text-forest shrink-0">
                    <Phone size={13} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate/75 uppercase tracking-wide leading-none">
                      Contact Number {property.useAdminContact && <span className="text-amber-600 font-bold"> (admin's)</span>}
                    </p>
                    <p className="text-xs font-bold text-ink mt-1">{property.contactNumber}</p>
                  </div>
                </div>
                <a 
                  href={`tel:${property.contactNumber}`}
                  className="px-2.5 py-1 bg-ink text-cream hover:bg-black rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  Call
                </a>
              </div>
            )}

            {/* WhatsApp */}
            {property.whatsappNumber && (
              <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-charcoal/5 hover:border-emerald-500/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <MessageCircle size={13} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate/75 uppercase tracking-wide leading-none">
                      WhatsApp Number {property.useAdminContact && <span className="text-emerald-600 font-bold"> (admin's)</span>}
                    </p>
                    <p className="text-xs font-bold text-ink mt-1">{property.whatsappNumber}</p>
                  </div>
                </div>
                <a 
                  href={`https://wa.me/${property.whatsappNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  Chat
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Card */}
        <div className="flex flex-col gap-2.5 mt-2">
          <button 
            onClick={() => {
              if (property) {
                startEditing(property);
                navigate("/add-property/details");
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-xs shadow-md shadow-emerald-100 active:scale-[0.99] cursor-pointer"
          >
            <Pencil size={14} /> Edit Listing Details
          </button>
          <div className="flex gap-2.5">
            <button
              disabled={busy}
              onClick={handleToggleActive}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 border border-charcoal/15 bg-white hover:bg-slate-50 text-slate font-display font-bold text-xs shadow-sm cursor-pointer disabled:opacity-40"
            >
              <Power size={13} className="text-amber-600" /> {property.status === "Active" ? "Deactivate" : "Activate"}
            </button>
            <button
              disabled={busy}
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 border border-rose-200 bg-rose-50/20 hover:bg-rose-50 text-rose-600 font-display font-bold text-xs shadow-sm cursor-pointer disabled:opacity-40"
            >
              <Trash2 size={13} /> Delete Listing
            </button>
          </div>
        </div>

        {property.status === "Active" && !property.isFeatured && (
          <div className="mt-2 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/30 flex flex-col gap-2.5">
            <div>
              <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Star size={13} className="fill-gold text-gold" />
                Feature Your Listing
              </h4>
              <p className="text-[10px] text-slate mt-0.5 leading-relaxed">
                Pin your listing to the top of home feed and search results to get up to 10x more leads.
              </p>
            </div>
            <button
              onClick={() => setShowFeatureModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gold hover:bg-gold-500 text-white text-xs font-bold font-display shadow-md transition-all active:scale-[0.98] cursor-pointer animate-fade-in"
            >
              <Sparkles size={12} /> Promote to Featured ({featuredData?.isEligibleForFree ? "Free Trial" : `₹${featuredData?.featuredPrice || 299}`})
            </button>
          </div>
        )}
      </div>

      {showViewersModal && (
        <PropertyViewersModal 
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setShowViewersModal(false)}
        />
      )}
      {showActivationChoice && (
        <PropertyActivationModal
          onClose={() => setShowActivationChoice(false)}
          onUpgrade={() => {
            setShowActivationChoice(false);
            navigate("/subscription");
          }}
          onContinueFree={handleActivateFree}
        />
      )}
      {showFeatureModal && (
        <FeatureListingModal
          propertyId={property.id}
          featuredData={featuredData}
          onClose={() => setShowFeatureModal(false)}
          onSuccess={() => {
            setProperty(prev => prev ? { ...prev, isFeatured: true } : null);
          }}
        />
      )}
      <BottomNav />
    </div>
  );
}

interface FeatureListingModalProps {
  onClose: () => void;
  onSuccess: () => void;
  propertyId: number;
  featuredData: any;
}

function FeatureListingModal({ onClose, onSuccess, propertyId, featuredData }: FeatureListingModalProps) {
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const price = featuredData?.featuredPrice || 299;
  const isFree = !!featuredData?.isEligibleForFree;
  const promoText = featuredData?.featuredText || "Pinned to the top section of search results and homepage";

  const handlePay = async () => {
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      await api.featureProperty(propertyId);
      setStatus("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Featured upgrade activation failed");
      setStatus("error");
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-sm p-6 flex flex-col gap-6 animate-slide-up shadow-2xl border border-charcoal/5">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-bounce">
              <Sparkles size={30} />
            </div>
            <h3 className="font-display font-extrabold text-lg text-ink">
              {isFree ? "Activation Successful!" : "Payment Successful!"}
            </h3>
            <p className="text-xs text-slate max-w-[240px] leading-relaxed">
              {isFree 
                ? "Your property has been successfully featured for free under your active subscription trial!" 
                : "Your property is now featured. Pinned visibility has been enabled successfully!"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Premium Upgrade</span>
                <h3 className="font-display font-extrabold text-lg text-ink mt-0.5">Feature Your Listing</h3>
              </div>
              <button 
                onClick={onClose} 
                disabled={processing}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} className="text-slate" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 bg-slate-50 p-4 rounded-2xl border border-charcoal/5">
              <div className="flex items-start gap-2.5">
                <span className="text-sm shrink-0">⭐</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-ink">Priority Top Placement</span>
                  <span className="text-[10px] text-slate mt-0.5 leading-tight">{promoText}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-sm shrink-0">🎨</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-ink">Featured Golden Badge</span>
                  <span className="text-[10px] text-slate mt-0.5 leading-tight">Vibrant gold status label makes your listing pop visually</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-sm shrink-0">📈</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-ink">10x Views & Enquiries</span>
                  <span className="text-[10px] text-slate mt-0.5 leading-tight">Direct uploader listings gain maximum user interaction</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gold/5 p-4 rounded-2xl border border-gold/15">
              <span className="text-xs text-slate font-medium">Feature Promotion Fee:</span>
              <span className="font-display font-extrabold text-base text-gold">
                {isFree ? "₹0 (Free Trial)" : `₹${price}`}
              </span>
            </div>

            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-4 rounded-2xl bg-ink text-cream hover:bg-black text-xs font-bold font-display shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {processing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                  {isFree ? "Activating Free Promotion..." : "Processing Payment..."}
                </>
              ) : (
                isFree ? "Activate Free Featured Promotion" : `Pay ₹${price} to Activate`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
