import { useState, useEffect, useRef } from "react";
import { Heart, Star } from "lucide-react";
import { ApiProperty, mediaUrl, thumbnailUrl, api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useBrand } from "@/lib/BrandContext";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80";

function formatPrice(price: number, purpose?: string): string {
  const num = Number(price);
  if (!num || isNaN(num)) return "₹0";
  const formatted = Math.round(num).toLocaleString("en-IN");

  let text = "";
  if (num >= 10000000) text = `₹${formatted} Cr`;
  else if (num >= 100000) text = `₹${formatted} L`;
  else if (num >= 1000) text = `₹${formatted} K`;
  else text = `₹${formatted}`;

  if (purpose === "For Rent") {
    return `${text} /month`;
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

export default function PropertyCard({ 
  property,
  onToggleSave,
  compact = false,
  onClick,
  index
}: { 
  property: ApiProperty;
  onToggleSave?: (id: number, isSaved: boolean) => void;
  compact?: boolean;
  onClick?: () => void;
  index?: number;
}) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { propertyLoadingIconUrl } = useBrand();
  const [saved, setSaved] = useState(property.isSaved || false);
  const [busy, setBusy] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isOwner = user && user.id === property.ownerId;

  // Viewport intersection observer for lazy loading and staggered entry
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "200px 0px", // Pre-load shortly before appearing in viewport
        threshold: 0.01,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setSaved(property.isSaved || false);
  }, [property.isSaved]);

  async function handleSaveClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.toggleSaveProperty(property.id);
      setSaved(res.saved);
      if (onToggleSave) {
        onToggleSave(property.id, res.saved);
      }
    } catch (err) {
      console.error("Failed to toggle save property:", err);
    } finally {
      setBusy(false);
    }
  }

  // Escalating staggered delay based on card sequence index
  const delayMs = index !== undefined ? Math.min((index % 8) * 60, 480) : 0;

  // Optimized thumbnail resolution for cards to reduce payload by up to 70%
  const thumbWidth = compact ? 360 : 440;
  const firstImg = property.images && property.images[0] ? property.images[0] : null;
  const image = firstImg ? thumbnailUrl(firstImg, thumbWidth, 80) : FALLBACK_IMAGE;

  const rating = property.avgRating !== undefined && property.avgRating > 0 ? property.avgRating : 5.0;

  const displayTag = property.purpose === "For Rent"
    ? "For Rent"
    : (property.purpose === "For Lease" ? "For Lease" : (property.purpose === "For Sale" ? "Sales" : (property.purpose || "Sales")));

  const displayTitle = property.title.toLowerCase().includes(property.district.toLowerCase())
    ? property.title
    : `${property.title} in ${property.district}`;

  const priceFormatted = formatPrice(property.price, property.purpose);
  const rawRole = property.listingRole || (property as any).listing_role;
  const roleFormatted = rawRole
    ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase()
    : "Owner";
  const postedDate = formatPostedDate(property.createdAt || (property as any).created_at);
  const isSold = property.status === "Sold" || (property.status as string) === "";

  return (
    <div
      ref={cardRef}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0px)" : "translateY(16px)",
        transition: "opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delayMs}ms`,
        willChange: isInView ? "auto" : "opacity, transform",
      }}
      onClick={() => {
        if (onClick) {
          onClick();
        } else if (!token && window.innerWidth >= 1000) {
          localStorage.setItem("pending_deep_link", `/property/${property.id}`);
          navigate("/login", { state: { from: `/property/${property.id}` } });
        } else {
          navigate(isOwner ? `/my-properties/${property.id}` : `/property/${property.id}`);
        }
      }}
      className="group bg-transparent cursor-pointer flex flex-col text-left select-none w-full"
    >
      {/* Property Image Container */}
      <div className="relative aspect-[4/3.1] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-xs">
        {/* Property Loading Icon while image is loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-slate-50 flex items-center justify-center p-3 z-0">
            <img
              src={propertyLoadingIconUrl || "/images/property_img.svg"}
              alt="Loading"
              className="w-10 h-10 object-contain select-none"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/property_img.svg";
              }}
            />
          </div>
        )}

        {/* Asynchronously loaded image with smooth fade-in */}
        {isInView && (
          <img
            src={image}
            alt={property.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              setImgLoaded(true);
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
              imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
            }`}
          />
        )}

        {/* Top Left Overlay Tag (Sold Out / Sales / For Rent) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {isSold ? (
            <span className="px-2.5 py-1 bg-red-600 text-white font-bold text-xs sm:text-[12px] rounded-md shadow-md select-none tracking-wide">
              Sold Out
            </span>
          ) : (
            <span className="px-2.5 py-0.5 bg-white/95 text-gray-900 font-semibold text-[10.5px] rounded-full shadow-xs backdrop-blur-xs select-none">
              {displayTag}
            </span>
          )}
        </div>

        {/* Top Right Overlay Favorite Heart Icon */}
        <button
          type="button"
          onClick={handleSaveClick}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/25 hover:bg-black/50 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
          title="Favorite"
        >
          <Heart size={15} className={saved ? "fill-rose-500 text-rose-500" : "text-white"} />
        </button>

        {/* Bottom Overlay: White gradient with Posted Date on left and User Type on right */}
        {(postedDate || roleFormatted) && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent pt-3 pb-1 px-2.5 z-10 pointer-events-none flex items-center justify-between">
            {postedDate ? (
              <span className="text-gray-900 font-normal italic text-[10px] sm:text-[11px] tracking-tight select-none">
                Posted: {postedDate}
              </span>
            ) : <span />}
            {roleFormatted && (
              <span className="px-1.5 py-0.5 bg-white/95 text-gray-800 font-medium text-[9.5px] sm:text-[10px] rounded-[3px] shadow-xs select-none tracking-tight leading-tight border border-black/5">
                {roleFormatted}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Text Section Below Image */}
      <div className="pt-2 px-0.5 flex flex-col">
        {/* Line 1: Property Location / Title */}
        <h3 className="font-semibold text-[13px] sm:text-[13.5px] text-gray-900 truncate leading-tight group-hover:text-emerald-700 transition-colors">
          {displayTitle}
        </h3>

        {/* Line 2: Price + Rating Number */}
        <p className="text-xs text-gray-600 font-medium mt-1 truncate flex items-center gap-1">
          <span>{priceFormatted}</span>
          <span className="text-gray-400">·</span>
          <span className="flex items-center gap-0.5 text-gray-800 font-semibold">
            <Star size={12} className="fill-amber-400 text-amber-400 inline" />
            <span>{rating.toFixed(rating % 1 === 0 ? 1 : 2)}</span>
          </span>
        </p>
      </div>
    </div>
  );
}
