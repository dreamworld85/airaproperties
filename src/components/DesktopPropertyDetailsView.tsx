import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Share2, 
  Printer, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize, 
  Building, 
  Calendar, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Image as ImageIcon,
  Check,
  Send,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Coins,
  Zap,
  Copy,
  Lock,
  Unlock,
  MessageSquare,
  User,
  Trees,
  Compass,
  Tag,
  Layers,
  CheckCircle2
} from "lucide-react";
import { ApiPropertyDetail, mediaUrl, api, isLandProperty, getLandAreaDetails, formatArea } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import DesktopHeader from "./DesktopHeader";
import DesktopFooter from "./DesktopFooter";
import SubscriptionPaywallModal from "./SubscriptionPaywallModal";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80";

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

interface DesktopPropertyDetailsViewProps {
  property: ApiPropertyDetail;
  onToggleSave?: () => void;
  saving?: boolean;
  onPropertyUpdate?: (updated: ApiPropertyDetail) => void;
}

export default function DesktopPropertyDetailsView({
  property,
  onToggleSave,
  saving = false,
  onPropertyUpdate
}: DesktopPropertyDetailsViewProps) {
  const navigate = useNavigate();
  const { user, login, token } = useAuth();
  const [localProperty, setLocalProperty] = useState<ApiPropertyDetail>(property);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    setLocalProperty(property);
  }, [property]);

  const isLand = isLandProperty(property.propertyType);
  const landArea = getLandAreaDetails(property.areaSqft, property.price);

  // Inquiry Form state
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactMessage, setContactMessage] = useState(`Hi, I am interested in ${property.title}. Please contact me with more details.`);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // Build unified media items array (images + videos) with deduplication
  const allMedia: Array<{ type: "image" | "video"; url: string }> = [];
  const seenUrls = new Set<string>();

  if (property.images && property.images.length > 0) {
    property.images.forEach((img: string) => {
      if (img) {
        const resolved = img.startsWith("/uploads/") ? mediaUrl(img) : img;
        if (!seenUrls.has(resolved)) {
          seenUrls.add(resolved);
          allMedia.push({
            type: "image",
            url: resolved
          });
        }
      }
    });
  }

  if (property.videos && property.videos.length > 0) {
    property.videos.forEach((vid: string) => {
      if (vid) {
        const resolved = vid.startsWith("/uploads/") ? mediaUrl(vid) : vid;
        if (!seenUrls.has(resolved)) {
          seenUrls.add(resolved);
          allMedia.push({
            type: "video",
            url: resolved
          });
        }
      }
    });
  }

  if (allMedia.length === 0) {
    allMedia.push({ type: "image", url: FALLBACK_IMAGE });
  }

  const totalMedia = allMedia.length;
  const mainMedia = allMedia[0];

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!showGalleryModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowGalleryModal(false);
      } else if (e.key === "ArrowLeft") {
        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : totalMedia - 1));
      } else if (e.key === "ArrowRight") {
        setActivePhotoIdx((prev) => (prev < totalMedia - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showGalleryModal, totalMedia]);

  // Initialize OpenStreetMap (Leaflet) for Property Location
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const initMap = () => {
      const lat = property.latitude ? parseFloat(String(property.latitude)) : 10.850516;
      const lng = property.longitude ? parseFloat(String(property.longitude)) : 76.271080;

      if (window.L && mapContainerRef.current) {
        if (mapRef.current && typeof mapRef.current.remove === "function") {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = window.L.map(mapContainerRef.current).setView([lat, lng], 13);
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap"
        }).addTo(map);
        mapRef.current = map;

        const customIcon = window.L.divIcon({
          className: "custom-leaflet-detail-marker",
          html: `<div style="background:#1B5E4F; color:#ffffff; padding:6px 12px; border-radius:20px; font-weight:500; font-size:13px; border:2px solid #ffffff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.3); white-space:nowrap;">📍 ${property.title}</div>`,
          iconSize: null,
        });

        window.L.marker([lat, lng], { icon: customIcon }).addTo(map);
      } else {
        timer = setTimeout(initMap, 300);
      }
    };
    initMap();
    return () => clearTimeout(timer);
  }, [property]);

  const hasAccess = Boolean(localProperty.contactAccess);
  const userTokens = user?.enquiryCreditsLeft ?? 0;
  const isOwner = Boolean(user && user.id === localProperty.ownerId);

  const priceFormatted = formatPrice(localProperty.price);
  const locationFormatted = [localProperty.address, localProperty.district, localProperty.state].filter(Boolean).join(", ");
  const waText = `Hi, I am interested in "${localProperty.title}" (ID: #${localProperty.id}) listed on Aira Properties.\nPrice: ${priceFormatted}\nLocation: ${locationFormatted}\n\nPlease share more details.`;
  const waEncoded = encodeURIComponent(waText);

  const handleContactAction = async (type: "Call" | "WhatsApp" | "Unlock") => {
    if (!token) {
      localStorage.setItem("pending_deep_link", `/property/${localProperty.id}`);
      navigate("/login");
      return;
    }

    if (hasAccess || isOwner) {
      if (type === "Call") {
        const phone = localProperty.contactNumber || localProperty.ownerPhone;
        window.open(`tel:${phone}`, "_self");
      } else if (type === "WhatsApp") {
        const phone = (localProperty.whatsappNumber || localProperty.ownerPhone || "").replace(/\D/g, "");
        window.open(`https://wa.me/91${phone}?text=${waEncoded}`, "_blank");
      }
      return;
    }

    if (userTokens <= 0) {
      setShowPaywall(true);
      return;
    }

    try {
      setUnlocking(true);
      const res = await api.recordClickInquiry(localProperty.id);
      const fresh = await api.fetchProperty(localProperty.id);
      setLocalProperty(fresh);
      if (onPropertyUpdate) onPropertyUpdate(fresh);

      if (res && res.enquiryCreditsLeft !== undefined && user) {
        login(localStorage.getItem("kr_token") || "", {
          ...user,
          enquiryCreditsLeft: res.enquiryCreditsLeft,
        });
      }

      const activePhone = fresh.contactNumber || fresh.ownerPhone || res.contactNumber || res.contact;
      const activeWa = fresh.whatsappNumber || fresh.ownerPhone || res.whatsappNumber || res.whatsapp;

      if (type === "Call" && activePhone) {
        window.open(`tel:${activePhone}`, "_self");
      } else if (type === "WhatsApp" && activeWa) {
        window.open(`https://wa.me/91${activeWa.replace(/\D/g, "")}?text=${waEncoded}`, "_blank");
      }
    } catch (err: any) {
      if (err?.requiresTopUp || err?.message?.includes("0 enquiry tokens")) {
        setShowPaywall(true);
      } else {
        alert(err.message || "Failed to unlock contact details.");
      }
    } finally {
      setUnlocking(false);
    }
  };

  const handleCopyNumber = () => {
    const num = localProperty.contactNumber || localProperty.ownerPhone || "";
    if (num && !num.includes("XXXXX")) {
      navigator.clipboard.writeText(num);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      localStorage.setItem("pending_deep_link", `/property/${localProperty.id}`);
      navigate("/login");
      return;
    }
    setInquiryLoading(true);
    try {
      await api.sendEnquiry(localProperty.id, {
        message: contactMessage,
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
      });
      setInquirySent(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit enquiry.");
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: property.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] w-full flex flex-col font-sans">
      {/* Top Header */}
      <DesktopHeader />

      {/* Main Content Container matching Image 2 */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
        {/* Title Bar Section */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="text-[1.4rem] font-semibold text-gray-900 tracking-tight font-display">
              {property.title}
            </h1>

            {/* Sub-bar Specs & Address */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 font-medium mt-3">
              <div className="flex items-center gap-4 bg-white px-3.5 py-1.5 rounded-full border border-gray-200 text-xs shadow-2xs">
                {isLand ? (
                  <>
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                      <Trees className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Land: {landArea.fullDisplay}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      {property.purpose || "For Sale"}
                    </span>
                    {landArea.pricePerCent !== "N/A" && (
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <Layers className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {landArea.pricePerCent}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {property.bedrooms !== undefined && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-gray-400" />
                        Beds: {property.bedrooms}
                      </span>
                    )}
                    {property.bathrooms !== undefined && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-gray-400" />
                        Baths: {property.bathrooms}
                      </span>
                    )}
                    {property.areaSqft && (
                      <span className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5 text-gray-400" />
                        Sqft: {property.areaSqft}
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{property.address}, {property.district}</span>
              </div>
            </div>
          </div>

          {/* Right Action Icons & Price */}
          <div className="flex flex-col items-end gap-3">
            <div className="text-3xl font-extrabold text-gray-900 font-heading">
              {formatPrice(property.price)}
              <span className="text-xs text-gray-500 font-normal ml-1">
                {property.purpose === "For Rent" ? "/month" : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleSave}
                disabled={saving}
                className={`p-2.5 rounded-full border transition ${
                  property.isSaved
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                title="Save Property"
              >
                <Heart className={`w-4 h-4 ${property.isSaved ? "fill-current" : ""}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition"
                title="Share Property"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => window.print()}
                className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition"
                title="Print Listing"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Photo Gallery Hero Grid (Zero Repetition) */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm bg-gray-100">
          {totalMedia === 1 ? (
            /* 1 Media: Full-width hero */
            <div 
              onClick={() => {
                setActivePhotoIdx(0);
                setShowGalleryModal(true);
              }}
              className="relative w-full h-[440px] group bg-gray-900 cursor-pointer overflow-hidden flex items-center justify-center"
            >
              {mainMedia.type === "video" ? (
                <div className="relative w-full h-full">
                  <video src={mainMedia.url} className="w-full h-full object-cover" muted playsInline />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <Play className="w-7 h-7 fill-gray-900 text-gray-900 ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={mainMedia.url}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
          ) : totalMedia === 2 ? (
            /* 2 Media: Clean 2-column side-by-side split (Main on left, Second on right) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[440px]">
              <div 
                onClick={() => {
                  setActivePhotoIdx(0);
                  setShowGalleryModal(true);
                }}
                className="lg:col-span-7 relative h-full group bg-gray-900 cursor-pointer overflow-hidden"
              >
                {mainMedia.type === "video" ? (
                  <div className="relative w-full h-full">
                    <video src={mainMedia.url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                        <Play className="w-6 h-6 fill-gray-900 text-gray-900 ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={mainMedia.url}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>

              <div 
                onClick={() => {
                  setActivePhotoIdx(1);
                  setShowGalleryModal(true);
                }}
                className="lg:col-span-5 relative h-full group bg-gray-900 cursor-pointer overflow-hidden rounded-2xl"
              >
                {allMedia[1].type === "video" ? (
                  <div className="relative w-full h-full">
                    <video src={allMedia[1].url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                        <Play className="w-6 h-6 fill-gray-900 text-gray-900 ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={allMedia[1].url}
                    alt={`${property.title} - photo 2`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
            </div>
          ) : totalMedia === 3 ? (
            /* 3 Media: 1 Main on left (7 cols), 2 Stacked on right (5 cols) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[440px]">
              <div 
                onClick={() => {
                  setActivePhotoIdx(0);
                  setShowGalleryModal(true);
                }}
                className="lg:col-span-7 relative h-full group bg-gray-900 cursor-pointer overflow-hidden"
              >
                {mainMedia.type === "video" ? (
                  <div className="relative w-full h-full">
                    <video src={mainMedia.url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                        <Play className="w-6 h-6 fill-gray-900 text-gray-900 ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={mainMedia.url}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>

              <div className="lg:col-span-5 grid grid-rows-2 gap-4 h-full">
                {[1, 2].map((idx) => {
                  const item = allMedia[idx];
                  return (
                    <div
                      key={`media-3-${idx}`}
                      onClick={() => {
                        setActivePhotoIdx(idx);
                        setShowGalleryModal(true);
                      }}
                      className="relative h-full bg-gray-900 rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      {item.type === "video" ? (
                        <div className="relative w-full h-full">
                          <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                              <Play className="w-4 h-4 fill-gray-900 text-gray-900 ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={`${property.title} - photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : totalMedia === 4 ? (
            /* 4 Media: 1 Main on left (7 cols), 3 on right (2 top, 1 bottom spanning both) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[440px]">
              <div 
                onClick={() => {
                  setActivePhotoIdx(0);
                  setShowGalleryModal(true);
                }}
                className="lg:col-span-7 relative h-full group bg-gray-900 cursor-pointer overflow-hidden"
              >
                {mainMedia.type === "video" ? (
                  <div className="relative w-full h-full">
                    <video src={mainMedia.url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                        <Play className="w-6 h-6 fill-gray-900 text-gray-900 ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={mainMedia.url}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-4 h-full">
                {[1, 2].map((idx) => {
                  const item = allMedia[idx];
                  return (
                    <div
                      key={`media-4-${idx}`}
                      onClick={() => {
                        setActivePhotoIdx(idx);
                        setShowGalleryModal(true);
                      }}
                      className="relative h-full bg-gray-900 rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      {item.type === "video" ? (
                        <div className="relative w-full h-full">
                          <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                              <Play className="w-4 h-4 fill-gray-900 text-gray-900 ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={`${property.title} - photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                  );
                })}
                <div
                  onClick={() => {
                    setActivePhotoIdx(3);
                    setShowGalleryModal(true);
                  }}
                  className="col-span-2 relative h-full bg-gray-900 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  {allMedia[3].type === "video" ? (
                    <div className="relative w-full h-full">
                      <video src={allMedia[3].url} className="w-full h-full object-cover" muted playsInline />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                          <Play className="w-4 h-4 fill-gray-900 text-gray-900 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={allMedia[3].url}
                      alt={`${property.title} - photo 4`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* 5+ Media: 1 Main on left (7 cols), 4 (2x2) on right (5 cols) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[440px]">
              <div 
                onClick={() => {
                  setActivePhotoIdx(0);
                  setShowGalleryModal(true);
                }}
                className="lg:col-span-7 relative h-full group bg-gray-900 cursor-pointer overflow-hidden"
              >
                {mainMedia.type === "video" ? (
                  <div className="relative w-full h-full">
                    <video src={mainMedia.url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                        <Play className="w-6 h-6 fill-gray-900 text-gray-900 ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={mainMedia.url}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-4 h-full">
                {[1, 2, 3, 4].map((idx) => {
                  const item = allMedia[idx];
                  return (
                    <div
                      key={`media-5-${idx}`}
                      onClick={() => {
                        setActivePhotoIdx(idx);
                        setShowGalleryModal(true);
                      }}
                      className="relative h-full bg-gray-900 rounded-2xl overflow-hidden group cursor-pointer"
                    >
                      {item.type === "video" ? (
                        <div className="relative w-full h-full">
                          <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                              <Play className="w-4 h-4 fill-gray-900 text-gray-900 ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={`${property.title} - photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Floating View All Photos Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActivePhotoIdx(0);
              setShowGalleryModal(true);
            }}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-full shadow-xl transition-all cursor-pointer z-20 hover:scale-105 active:scale-95"
          >
            <ImageIcon className="w-4 h-4" />
            <span>View All Photos ({totalMedia})</span>
          </button>
        </div>

        {/* Main Body Split Section matching Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
          {/* Left Main Content Column (8 Columns wide) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Description Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">Description</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p className={isDescExpanded ? "" : "line-clamp-4"}>
                  {property.description || "Located in a prime location in Kerala, this property offers excellent access to local transportation, shopping hubs, and educational institutions. Featuring modern architecture, ample natural lighting, and premium building materials throughout."}
                </p>
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-blue-600 font-bold text-xs hover:underline mt-2 inline-block"
                >
                  {isDescExpanded ? "View Less" : "View More"}
                </button>
              </div>
            </div>

            {/* Overview Grid Card (8 Icon items matching Image 2) */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-display">Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {isLand ? (
                  <>
                    {/* 1. ID */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-xs">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">ID</span>
                        <span className="text-xs font-extrabold text-gray-900">#{property.id}</span>
                      </div>
                    </div>

                    {/* 2. Property Type */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-xs">
                        <Trees className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Type</span>
                        <span className="text-xs font-extrabold text-gray-900 truncate block">{property.propertyType}</span>
                      </div>
                    </div>

                    {/* 3. Total Land Area */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-xs">
                        <Maximize className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Land Area</span>
                        <span className="text-xs font-extrabold text-emerald-700">{landArea.primary}</span>
                      </div>
                    </div>

                    {/* 4. Measure in Cents / Equivalent */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-xs">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">In Cents</span>
                        <span className="text-xs font-extrabold text-gray-900">{landArea.secondary}</span>
                      </div>
                    </div>

                    {/* 5. Rate / Cent */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-xs">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Rate / Cent</span>
                        <span className="text-xs font-extrabold text-gray-900">{landArea.pricePerCent}</span>
                      </div>
                    </div>

                    {/* 6. Purpose */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-xs">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Purpose</span>
                        <span className="text-xs font-extrabold text-gray-900">{property.purpose || "For Sale"}</span>
                      </div>
                    </div>

                    {/* 7. Facing / Road Access */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-xs">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Facing</span>
                        <span className="text-xs font-extrabold text-gray-900">{property.facing || "Road Facing"}</span>
                      </div>
                    </div>

                    {/* 8. Possession / Status */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-emerald-600 shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Possession</span>
                        <span className="text-xs font-extrabold text-gray-900">{property.propertyAge || "Immediate"}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 1. ID */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-xs">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">ID</span>
                        <span className="text-xs font-extrabold text-gray-900">#{property.id}</span>
                      </div>
                    </div>

                    {/* 2. Type */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-xs">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Type</span>
                        <span className="text-xs font-extrabold text-gray-900">{property.propertyType}</span>
                      </div>
                    </div>

                    {/* 3. Garages / Furnishing */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-xs">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Furnishing</span>
                        <span className="text-xs font-extrabold text-gray-900">{property.furnishing || "Unfurnished"}</span>
                      </div>
                    </div>

                    {/* 4. Bedrooms */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-xs">
                        <BedDouble className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Bedrooms</span>
                        <span className="text-xs font-extrabold text-gray-900">{property.bedrooms || 0} Rooms</span>
                      </div>
                    </div>

                    {/* 5. Bathrooms */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-xs">
                        <Bath className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Bathrooms</span>
                        <span className="text-xs font-extrabold text-gray-900">{property.bathrooms || 0} Rooms</span>
                      </div>
                    </div>

                    {/* 6. Built-up Area */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-xs">
                        <Maximize className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Super Built-up</span>
                        <span className="text-xs font-extrabold text-gray-900">{property.areaSqft} SqFt</span>
                      </div>
                    </div>

                    {/* 7. Property Age */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-xs">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Property Age</span>
                        <span className="text-xs font-extrabold text-gray-900">{property.propertyAge || "New"}</span>
                      </div>
                    </div>

                    {/* 8. Carpet Area */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-xs">
                        <Maximize className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Carpet Area</span>
                        <span className="text-xs font-extrabold text-gray-900">{property.areaSqft} SqFt</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Embedded Location Map Section */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-xs flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-900 font-display">Location</h2>
              <div ref={mapContainerRef} className="w-full h-80 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden"></div>
            </div>
          </div>

          {/* Right Sticky Contact Seller Column (4 Columns wide matching Image 2) */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-lg flex flex-col gap-6">
              <h2 className="text-xl font-bold text-gray-900 font-display">Contact Sellers</h2>

              {/* Seller Avatar & Information */}
              <div 
                onClick={() => {
                  if (property.ownerId) {
                    navigate(`/agency/${property.ownerId}`);
                  }
                }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 cursor-pointer transition-colors group select-none"
              >
                {property.ownerAvatarUrl || property.agencyLogoUrl ? (
                  <img
                    src={mediaUrl(property.ownerAvatarUrl || property.agencyLogoUrl!)}
                    alt="Seller Avatar"
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xl flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    {property.ownerName ? property.ownerName.charAt(0).toUpperCase() : "S"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-base text-gray-900 group-hover:text-[#34a853] transition-colors truncate">
                    {property.ownerName || property.agencyName || property.brokerName || "Seller"}
                  </h3>
                  <p className="text-[11px] font-semibold text-blue-600 hover:underline mt-0.5">
                    View profile & all listings →
                  </p>
                </div>
              </div>

              {/* Direct Seller Contact Options (Phone & WhatsApp with Tokens) */}
              <div className="bg-[#FAF8F3] rounded-2xl p-5 border border-gray-200/80 flex flex-col gap-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 font-display flex items-center gap-1.5">
                    <Phone size={13} className="text-[#1B5E4F]" />
                    <span>Seller Contact Options</span>
                  </span>
                  {hasAccess || isOwner ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <Check size={11} className="stroke-[3]" /> Unlocked
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      userTokens > 0 
                        ? "text-amber-800 bg-amber-100/80 border border-amber-200" 
                        : "text-rose-700 bg-rose-100/80 border border-rose-200"
                    }`}>
                      <Coins size={11} /> {userTokens > 0 ? `${userTokens} Tokens Available` : "0 Tokens"}
                    </span>
                  )}
                </div>

                {/* Case 1: Unlocked / Owner -> Show real Phone and WhatsApp buttons */}
                {hasAccess || isOwner ? (
                  <div className="flex flex-col gap-2.5">
                    {/* Call Button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleContactAction("Call")}
                        className="flex-1 py-3 px-4 bg-[#1B5E4F] hover:bg-[#14483d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Phone size={16} />
                        <span>Call: {localProperty.contactNumber || localProperty.ownerPhone}</span>
                      </button>
                      <button
                        onClick={handleCopyNumber}
                        title="Copy phone number"
                        className="p-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl transition cursor-pointer shrink-0"
                      >
                        {copiedPhone ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      </button>
                    </div>

                    {/* WhatsApp Button */}
                    <button
                      onClick={() => handleContactAction("WhatsApp")}
                      className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.806-9.799.002-2.618-1.016-5.08-2.868-6.932C16.357 2.022 13.899.98 11.282.98c-5.405 0-9.807 4.397-9.81 9.802-.001 1.636.406 3.23 1.18 4.613l-.97 3.548 3.635-.953zm11.752-6.52c-.3-.15-1.77-.874-2.046-.973-.275-.1-.475-.15-.675.15-.2.3-.77.973-.946 1.173-.175.2-.35.225-.65.075-.3-.15-1.263-.465-2.403-1.485-.888-.79-1.487-1.77-1.663-2.07-.176-.3-.019-.462.13-.61.136-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.52-.174-.01-.374-.012-.574-.012-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.025 2.9 1.175 3.1c.15.2 2.021 3.085 4.898 4.32 1.05.45 1.8.725 2.4 1 .975.3 1.85.25 2.55.15.775-.113 2.375-.975 2.712-1.925.337-.95.337-1.763.238-1.925-.1-.163-.35-.263-.65-.413z" />
                      </svg>
                      <span>Chat on WhatsApp</span>
                    </button>
                    <p className="text-[11px] text-gray-500 text-center font-medium">
                      Direct contact unlocked. You have permanent access to this seller.
                    </p>
                  </div>
                ) : userTokens > 0 ? (
                  /* Case 2: User or Broker HAS Tokens -> Show direct Contact Options! */
                  <div className="flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleContactAction("Call")}
                        disabled={unlocking}
                        className="py-3 px-3 bg-[#1B5E4F] hover:bg-[#14483d] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Phone size={15} />
                        <span>Call (1 Token)</span>
                      </button>
                      <button
                        onClick={() => handleContactAction("WhatsApp")}
                        disabled={unlocking}
                        className="py-3 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.806-9.799.002-2.618-1.016-5.08-2.868-6.932C16.357 2.022 13.899.98 11.282.98c-5.405 0-9.807 4.397-9.81 9.802-.001 1.636.406 3.23 1.18 4.613l-.97 3.548 3.635-.953zm11.752-6.52c-.3-.15-1.77-.874-2.046-.973-.275-.1-.475-.15-.675.15-.2.3-.77.973-.946 1.173-.175.2-.35.225-.65.075-.3-.15-1.263-.465-2.403-1.485-.888-.79-1.487-1.77-1.663-2.07-.176-.3-.019-.462.13-.61.136-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.52-.174-.01-.374-.012-.574-.012-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.025 2.9 1.175 3.1c.15.2 2.021 3.085 4.898 4.32 1.05.45 1.8.725 2.4 1 .975.3 1.85.25 2.55.15.775-.113 2.375-.975 2.712-1.925.337-.95.337-1.763.238-1.925-.1-.163-.35-.263-.65-.413z" />
                        </svg>
                        <span>WhatsApp (1 Token)</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleContactAction("Unlock")}
                      disabled={unlocking}
                      className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Zap size={14} className="text-amber-500" />
                      <span>{unlocking ? "Unlocking Details..." : "Reveal Numbers Without Calling (1 Token)"}</span>
                    </button>

                    <p className="text-[11px] text-gray-500 text-center font-medium">
                      Uses 1 of your {userTokens} tokens. Once unlocked, access is permanent.
                    </p>
                  </div>
                ) : (
                  /* Case 3: 0 Tokens -> Show Unlock Prompt that triggers Paywall */
                  <div className="flex flex-col gap-2.5">
                    <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col gap-1 text-center">
                      <span className="text-xs font-bold text-gray-400">Phone: +91 XXXXX XXXXX</span>
                      <span className="text-xs font-bold text-gray-400">WhatsApp: +91 XXXXX XXXXX</span>
                    </div>

                    <button
                      onClick={() => setShowPaywall(true)}
                      className="w-full py-3 px-4 bg-[#1B5E4F] hover:bg-[#14483d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Coins size={16} className="text-amber-300" />
                      <span>Unlock Contact Details</span>
                    </button>

                    <p className="text-[11px] text-gray-500 text-center font-medium">
                      You have 0 enquiry tokens remaining. Top up tokens to view seller contact numbers.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Input Section */}
              <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider font-display flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[#1B5E4F]" />
                    <span>Send An Enquiry</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Delivered to seller</span>
                </div>

                {inquirySent ? (
                  <div className="p-5 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl text-center flex flex-col items-center gap-2 animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <h4 className="font-extrabold text-sm text-emerald-950">Enquiry Sent Successfully!</h4>
                    <p className="text-xs text-emerald-700/90 leading-relaxed max-w-xs">
                      The seller has received your message and contact details in their dashboard and will reach out shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setInquirySent(false)}
                      className="mt-2 text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="flex flex-col gap-3">
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#1B5E4F] rounded-xl text-xs sm:text-sm outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1B5E4F]/10"
                      />
                    </div>

                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#1B5E4F] rounded-xl text-xs sm:text-sm outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1B5E4F]/10"
                      />
                    </div>

                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#1B5E4F] rounded-xl text-xs sm:text-sm outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1B5E4F]/10"
                      />
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        required
                        placeholder="Your Message"
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full p-3 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#1B5E4F] rounded-xl text-xs sm:text-sm outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400 resize-none focus:ring-2 focus:ring-[#1B5E4F]/10 leading-relaxed"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={inquiryLoading}
                      className="w-full py-3 px-4 bg-[#1B5E4F] hover:bg-[#14483d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {inquiryLoading ? (
                        <span>Sending Enquiry...</span>
                      ) : (
                        <>
                          <span>Send Enquiry</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
          </div>
        </div>
      </div>
    </main>

      {/* Gallery Lightbox Modal */}
      {showGalleryModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between items-center py-6 px-4 select-none animate-fade-in"
          onClick={() => setShowGalleryModal(false)}
        >
          {/* Top Actions: Counter & Close */}
          <div 
            className="w-full max-w-5xl px-4 flex justify-between items-center text-white/90 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-mono text-xs font-bold uppercase bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              {activePhotoIdx + 1} / {totalMedia}
            </span>
            <button
              onClick={() => setShowGalleryModal(false)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Media Preview Area with Navigation Arrows */}
          <div 
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center p-2 my-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Arrow Button */}
            {totalMedia > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : totalMedia - 1));
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all active:scale-95 cursor-pointer shadow-xl"
                aria-label="Previous Media"
              >
                <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
              </button>
            )}

            {/* Media Content */}
            <div className="w-full h-full flex items-center justify-center">
              {(() => {
                const current = allMedia[activePhotoIdx] || allMedia[0];
                if (current.type === "video") {
                  return (
                    <video
                      src={current.url}
                      controls
                      autoPlay
                      className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl"
                    />
                  );
                } else {
                  return (
                    <img
                      src={current.url}
                      alt={`Gallery view ${activePhotoIdx + 1}`}
                      className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
                    />
                  );
                }
              })()}
            </div>

            {/* Right Navigation Arrow */}
            {totalMedia > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIdx((prev) => (prev < totalMedia - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all active:scale-95 cursor-pointer shadow-xl"
                aria-label="Next Media"
              >
                <ChevronRight className="w-7 h-7 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div 
            className="w-full max-w-5xl px-4 overflow-x-auto no-scrollbar flex gap-2.5 justify-center py-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {allMedia.map((item, idx) => (
              <button
                key={`lightbox-thumb-${idx}`}
                onClick={() => setActivePhotoIdx(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 relative transition-all cursor-pointer ${
                  activePhotoIdx === idx
                    ? "border-blue-500 scale-105 shadow-md"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                {item.type === "video" ? (
                  <>
                    <video src={item.url} className="w-full h-full object-cover brightness-[0.6]" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                  </>
                ) : (
                  <img src={item.url} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subscription / Token Paywall Modal */}
      {showPaywall && (
        <SubscriptionPaywallModal
          targetRole={user?.role || "user"}
          initialPlanType="enquiry_pack"
          onClose={() => setShowPaywall(false)}
          onSuccess={async () => {
            setShowPaywall(false);
            if (token) {
              try {
                const refreshed = await api.getProfile();
                login(token, refreshed);
                const freshProp = await api.fetchProperty(localProperty.id);
                setLocalProperty(freshProp);
                if (onPropertyUpdate) onPropertyUpdate(freshProp);
              } catch (e) {
                console.error("Failed to refresh user profile or property:", e);
              }
            }
          }}
        />
      )}

      {/* Desktop Footer matching user mockup media_1788721045135.png */}
      <DesktopFooter />
    </div>
  );
}
