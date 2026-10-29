import { useState, useEffect } from "react";
import { Heart, Star, MapPin } from "lucide-react";
import { ApiProperty, mediaUrl, api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80";

function formatPrice(price: number, purpose?: string): string {
  let text = "";
  if (price >= 10000000) text = `₹${(price / 10000000).toFixed(2)} Cr`;
  else if (price >= 100000) text = `₹${(price / 100000).toFixed(1)} L`;
  else text = `₹${price.toLocaleString("en-IN")}`;

  if (purpose === "For Rent") {
    return `${text} for 1 night`;
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

export default function PropertyListCard({
  property,
  onToggleSave,
  onClick
}: {
  property: ApiProperty;
  onToggleSave?: (id: number, isSaved: boolean) => void;
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [saved, setSaved] = useState(property.isSaved || false);
  const [busy, setBusy] = useState(false);
  const isOwner = user && user.id === property.ownerId;

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

  const firstImg = property.images && property.images[0] ? property.images[0] : null;
  const image = firstImg ? mediaUrl(firstImg) : FALLBACK_IMAGE;

  const rating = property.avgRating !== undefined && property.avgRating > 0 ? property.avgRating : 5.0;

  const displayTag = property.purpose === "For Rent"
    ? "For Rent"
    : (property.purpose === "For Lease" ? "For Lease" : (property.purpose === "For Sale" ? "Sales" : (property.purpose || "Sales")));

  const displayTitle = property.title.toLowerCase().includes((property.district || "").toLowerCase())
    ? property.title
    : (property.district ? `${property.title} in ${property.district}` : property.title);

  const priceFormatted = formatPrice(property.price, property.purpose);
  const roleFormatted = property.purpose === "For Rent" ? "Host" : (property.listingRole || "Owner");
  const postedDate = formatPostedDate(property.createdAt || (property as any).created_at);
  const isSold = property.status === "Sold" || (property.status as string) === "";

  const locationParts = [property.address, property.district].filter(Boolean);
  const locationText = locationParts.length > 0 ? locationParts.join(", ") : (property.state || "India");

  return (
    <div
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
      className="group bg-white p-2.5 flex flex-row items-center gap-3 transition-shadow hover:shadow-md cursor-pointer select-none w-full text-left border"
      style={{
        borderRadius: "10px",
        boxShadow: "rgba(0, 0, 0, 0.04) 0px 3px 5px",
        borderColor: "rgb(215 234 221)",
      }}
    >
      {/* Left side: Image */}
      <div className="relative w-36 h-28 sm:w-40 sm:h-28 shrink-0 overflow-hidden rounded-md bg-gray-100">
        <img
          src={image}
          alt={displayTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />

        {/* Top-Left Badge */}
        {isSold ? (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded-md shadow-xs select-none tracking-wide">
            Sold Out
          </span>
        ) : (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 text-gray-900 font-semibold text-[10px] rounded-full shadow-xs backdrop-blur-xs select-none">
            {displayTag}
          </span>
        )}

        {/* Top-Right Favorite Heart */}
        <button
          type="button"
          onClick={handleSaveClick}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
          title="Favorite"
        >
          <Heart size={13} className={saved ? "fill-rose-500 text-rose-500" : "text-white"} />
        </button>

        {/* Bottom Overlay: White gradient with Posted Date */}
        {postedDate && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent pt-4 pb-1.5 px-2 z-10 pointer-events-none flex items-end">
            <span className="text-gray-900 font-bold italic text-[9.5px] sm:text-[10px] tracking-tight select-none">
              Posted Date: {postedDate}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Data */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 sm:gap-1.5 py-0.5">
        {/* Row 1: Post by & Rating */}
        <div className="flex items-center gap-1 text-xs text-gray-500 font-normal">
          <span>Posted By</span>
          <span className="text-gray-700 font-medium">{roleFormatted}</span>
          <span className="inline-flex items-center gap-0.5 text-gray-700 font-semibold ml-1.5">
            <Star size={12} className="text-amber-400 fill-amber-400 inline" />
            <span>{rating.toFixed(1)}</span>
          </span>
        </div>

        {/* Row 2: Property Type / Title */}
        <h3 className="font-semibold text-xs sm:text-[13px] text-gray-800 truncate leading-snug group-hover:text-emerald-700 transition-colors">
          {displayTitle}
        </h3>

        {/* Row 3: Price */}
        <div className="font-bold text-base sm:text-lg text-gray-700 tracking-tight">
          {priceFormatted}
        </div>

        {/* Row 4: Location */}
        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 truncate">
          <MapPin size={13} className="text-sky-500 shrink-0" />
          <span className="truncate">{locationText}</span>
        </div>
      </div>
    </div>
  );
}
