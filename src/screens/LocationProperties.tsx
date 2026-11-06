import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, MapPin, BedDouble, Bath, X, Sparkles } from "lucide-react";
import { api, ApiProperty, mediaUrl, formatArea, isLandProperty } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import PropertyCard from "@/components/PropertyCard";
import { STATE_COORDINATES } from "@/lib/indiaLocationData";

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
  Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  "Bengaluru Urban": { lat: 12.9716, lng: 77.5946 },
  "Bengaluru Rural": { lat: 13.2257, lng: 77.5750 },
  Ramanagara: { lat: 12.7209, lng: 77.2799 },
  Mysore: { lat: 12.2958, lng: 76.6394 },
  Mysuru: { lat: 12.2958, lng: 76.6394 }
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80";

function formatPrice(price: number): string {
  const num = Number(price);
  if (!num || isNaN(num)) return "₹0";
  const formatted = Math.round(num).toLocaleString("en-IN");
  if (num >= 10000000) return `₹${formatted} Cr`;
  if (num >= 100000) return `₹${formatted} L`;
  if (num >= 1000) return `₹${formatted} K`;
  return `₹${formatted}`;
}

export default function LocationProperties() {
  const { locationName } = useParams<{ locationName: string }>();
  const [searchParams] = useSearchParams();
  const stateParam = searchParams.get("state") || "";
  const navigate = useNavigate();
  const decodedLocation = locationName ? decodeURIComponent(locationName) : "";

  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [isStateFallback, setIsStateFallback] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<ApiProperty | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Centered position coordinates
  const coords = DISTRICT_COORDINATES[decodedLocation] || (stateParam && STATE_COORDINATES[stateParam]) || { lat: 10.850516, lng: 76.271080 };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchLocationData() {
      const loc = decodedLocation.trim();
      let found: ApiProperty[] = [];
      let fallbackUsed = false;

      try {
        if (loc) {
          // 1. Try district match
          found = await api.fetchProperties({ district: loc }).catch(() => []);
          // 2. If no direct district match, try free text search (in address/title)
          if ((!found || found.length === 0)) {
            found = await api.fetchProperties({ search: loc }).catch(() => []);
          }
        }

        // 3. If still empty and state is provided, show the whole state's listings!
        if ((!found || found.length === 0) && stateParam) {
          const stateResults = await api.fetchProperties({ state: stateParam }).catch(() => []);
          if (stateResults && stateResults.length > 0) {
            found = stateResults;
            fallbackUsed = true;
          }
        }
      } catch (err) {
        console.error("Failed to fetch location properties:", err);
      }

      if (isMounted) {
        setProperties(found || []);
        setIsStateFallback(fallbackUsed);
        setLoading(false);
      }
    }

    fetchLocationData();

    return () => {
      isMounted = false;
    };
  }, [decodedLocation, stateParam]);

  // Leaflet Map Initialization Hook
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const checkAndInit = () => {
      if (window.L && mapContainerRef.current) {
        setMapLoading(false);
        if (!mapRef.current) {
          const map = window.L.map(mapContainerRef.current, {
            center: [coords.lat, coords.lng],
            zoom: 10,
            zoomControl: false,
          });
          window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
          }).addTo(map);
          mapRef.current = map;
        }
      } else {
        timer = setTimeout(checkAndInit, 150);
      }
    };

    checkAndInit();

    return () => {
      clearTimeout(timer);
    };
  }, [coords]);

  // Sync Markers with Properties & fit map bounds
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Remove existing markers
    markersRef.current.forEach((m) => {
      if (m && typeof m.remove === "function") {
        m.remove();
      }
    });
    markersRef.current = [];

    const latLngBounds: [number, number][] = [];

    properties.forEach((property) => {
      let lat = parseFloat(property.latitude as string);
      let lng = parseFloat(property.longitude as string);

      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        const fallback = DISTRICT_COORDINATES[property.district] || (property.state && STATE_COORDINATES[property.state]) || coords;
        const seed = property.id || 1;
        const offsetLat = (Math.sin(seed) * 0.5) * 0.03;
        const offsetLng = (Math.cos(seed) * 0.5) * 0.03;
        lat = fallback.lat + offsetLat;
        lng = fallback.lng + offsetLng;
      }

      latLngBounds.push([lat, lng]);

      const isSelected = selectedProperty?.id === property.id;
      const priceText = formatPrice(property.price);

      const customIcon = window.L.divIcon({
        className: "custom-leaflet-price-pin",
        html: `<div style="
          background: ${isSelected ? '#FF5A5F' : '#59AD63'};
          color: #ffffff;
          padding: 4px 10px;
          border-radius: 18px;
          font-weight: 800;
          font-size: 11px;
          font-family: inherit;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          white-space: nowrap;
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1.0)'};
          transition: transform 0.2s, background 0.2s;
        ">📍 ${priceText}</div>`,
        iconSize: null,
      });

      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);
      marker.on("click", () => {
        handleMarkerClick(property, lat, lng);
      });

      markersRef.current.push(marker);
    });

    if (latLngBounds.length > 0 && !selectedProperty) {
      mapRef.current.fitBounds(latLngBounds, { padding: [40, 40], maxZoom: 13 });
    } else if (latLngBounds.length === 0) {
      mapRef.current.setView([coords.lat, coords.lng], 9);
    }
  }, [properties, selectedProperty, coords]);

  const handleMarkerClick = (property: ApiProperty, lat?: number, lng?: number) => {
    setSelectedProperty(property);
    if (mapRef.current) {
      const propLat = lat !== undefined ? lat : parseFloat(property.latitude as string);
      const propLng = lng !== undefined ? lng : parseFloat(property.longitude as string);
      if (!isNaN(propLat) && !isNaN(propLng)) {
        mapRef.current.setView([propLat, propLng], 13, { animate: true });
      }
    }
  };

  const handlePropertyCardClick = (property: ApiProperty) => {
    handleMarkerClick(property);
    const mapElement = document.getElementById("properties-map");
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] font-display select-none overflow-x-hidden relative pb-28">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center px-6 pt-5 pb-3 bg-white border-b border-charcoal/5 shrink-0 sticky top-0 z-50 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-charcoal p-1.5 -ml-1.5 hover:bg-charcoal/5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center"
        >
          <ChevronLeft size={22} className="text-[#091F40]" />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="font-bold text-sm text-[#091F40]">
            Properties in {decodedLocation}{stateParam ? `, ${stateParam}` : ""}
          </span>
          <span className="text-[9px] font-bold text-slate/50 tracking-wider uppercase leading-none mt-0.5">
            {properties.length} Listings {isStateFallback ? `Found in ${stateParam}` : "Found"}
          </span>
        </div>

        <div className="w-8 h-8" />
      </div>

      {/* Map View Section */}
      <div id="properties-map" className="relative w-full h-[270px] bg-slate-50 border-b border-charcoal/5 shrink-0">
        {mapLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate bg-slate-100 z-10">
            <div className="w-8 h-8 border-4 border-[#59AD63] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading Map View...</span>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Property Preview Card */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg border border-charcoal/5 p-3 flex gap-3 animate-slide-up z-[1000]">
            {/* Cover Image */}
            <div 
              onClick={() => navigate(`/property/${selectedProperty.id}`)}
              className="w-20 h-20 rounded-lg bg-slate-50 overflow-hidden shrink-0 cursor-pointer"
            >
              <img 
                src={selectedProperty.images[0] ? mediaUrl(selectedProperty.images[0]) : FALLBACK_IMAGE} 
                alt={selectedProperty.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info Column */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div onClick={() => navigate(`/property/${selectedProperty.id}`)} className="cursor-pointer">
                <div className="flex justify-between items-start gap-1">
                  <h4 className="text-[12px] font-bold text-charcoal truncate">{selectedProperty.title}</h4>
                  <span className="text-[11px] font-bold text-[#59AD63] shrink-0">{formatPrice(selectedProperty.price)}</span>
                </div>
                <p className="text-[10px] text-slate/60 truncate flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="shrink-0" />
                  {[selectedProperty.address, selectedProperty.district, selectedProperty.state].filter(Boolean).join(", ")}
                </p>
              </div>

              {/* Attributes row */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2.5 text-[10px] text-slate-500 font-semibold">
                  {isLandProperty(selectedProperty.propertyType) ? (
                    <>
                      <span className="text-emerald-700 font-bold">
                        {formatArea(selectedProperty.areaSqft, selectedProperty.propertyType)}
                      </span>
                      <span>{selectedProperty.purpose || "For Sale"}</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-0.5">
                        <BedDouble size={12} className="text-slate-400" /> {selectedProperty.bedrooms || 0} Bed
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Bath size={12} className="text-slate-400" /> {selectedProperty.bathrooms || 0} Bath
                      </span>
                      <span>{selectedProperty.areaSqft} sq.ft.</span>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => navigate(`/property/${selectedProperty.id}`)}
                  className="text-[10px] font-bold text-white bg-[#59AD63] px-2.5 py-1 rounded-[4px] hover:bg-[#3F8F4B] transition-colors"
                >
                  View
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute -top-2.5 -right-2.5 bg-white border border-charcoal/10 text-charcoal hover:bg-slate-100 rounded-full p-1.5 shadow-md active:scale-90 transition-transform cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="px-6 pt-5 flex-1 flex flex-col gap-4">
        {/* Fallback Notice Banner */}
        {isStateFallback && properties.length > 0 && (
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 shadow-sm flex items-start gap-2.5">
            <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[12px] text-emerald-950">
                Showing all {properties.length} properties across {stateParam}
              </p>
              <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-snug">
                No direct listings were found in {decodedLocation}. We are displaying all available listings across {stateParam}.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-[16px] text-[#091F40]">Available Listings</h2>
          <span className="text-xs font-medium text-slate-500">
            {properties.length} {properties.length === 1 ? "Property" : "Properties"}
          </span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#59AD63]" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-charcoal/5 rounded-2xl flex flex-col items-center justify-center gap-3">
            <MapPin size={32} className="text-slate-300" />
            <span className="text-xs font-bold text-charcoal/60">No properties listed in this area yet</span>
            <button
              onClick={() => navigate("/add-property")}
              className="mt-1 text-xs font-bold text-white bg-[#59AD63] hover:bg-[#3F8F4B] px-4 py-2 rounded-full shadow-sm"
            >
              Post a Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {properties.map((property) => (
              <div key={property.id} className="relative group">
                <PropertyCard property={property} compact />
                {/* Visual click overlay/pan connector */}
                <button
                  type="button"
                  onClick={() => handlePropertyCardClick(property)}
                  className="absolute bottom-3 left-3 bg-[#59AD63] text-white rounded-full p-1.5 shadow-md z-20 hover:scale-105 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
                  title="Show on map"
                >
                  <MapPin size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
