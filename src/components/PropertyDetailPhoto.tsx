import { useState } from "react";
import { useBrand } from "@/lib/BrandContext";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80";

export default function PropertyDetailPhoto({
  src,
  alt,
  className,
  containerClassName,
  loadingIcon,
}: {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loadingIcon?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const { propertyLoadingIconUrl } = useBrand();
  const icon = loadingIcon || propertyLoadingIconUrl || "/images/property_img.svg";

  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-900 flex items-center justify-center ${containerClassName || ""}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center p-4 z-0">
          <img
            src={icon}
            alt="Loading..."
            className="w-12 h-12 object-contain opacity-85 select-none"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/property_img.svg";
            }}
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setLoaded(true);
          (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
        }}
        className={`${className || "w-full h-full object-cover group-hover:scale-105 transition-all duration-500"} ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
