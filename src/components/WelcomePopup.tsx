import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getApiUrl, mediaUrl } from "@/lib/api";
import { useBrand } from "@/lib/BrandContext";

interface WelcomePopupProps {
  forceOpen?: boolean;
  onClose?: () => void;
  customBgUrl?: string | null;
  customTitle?: string;
  customDescription?: string;
}

const DISMISSED_KEY = "aira_welcome_popup_dismissed_at";
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function WelcomePopup({ 
  forceOpen = false, 
  onClose,
  customBgUrl,
  customTitle,
  customDescription
}: WelcomePopupProps) {
  const { activeLogoUrl } = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!forceOpen);
  const [title, setTitle] = useState(customTitle || "Welcome to Aira Properties");
  const [description, setDescription] = useState(customDescription || "Connecting Buyers & Sellers Globally.");
  const [bgUrl, setBgUrl] = useState<string | null>(customBgUrl !== undefined ? customBgUrl : null);

  useEffect(() => {
    if (customTitle !== undefined) setTitle(customTitle);
  }, [customTitle]);

  useEffect(() => {
    if (customDescription !== undefined) setDescription(customDescription);
  }, [customDescription]);

  useEffect(() => {
    if (customBgUrl !== undefined) setBgUrl(customBgUrl);
  }, [customBgUrl]);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setIsLoading(false);
      return;
    }

    // 1. Check if closed by user within 24 hours on this browser
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < ONE_DAY_MS) {
        setIsLoading(false);
        return;
      }
    }

    // 2. Fetch admin settings
    async function checkAdminSettings() {
      try {
        const [enableRes, titleRes, descRes, bgRes] = await Promise.all([
          fetch(`${getApiUrl()}/api/admin/settings/welcome_popup_enabled`).then(r => r.json()).catch(() => null),
          fetch(`${getApiUrl()}/api/admin/settings/welcome_popup_title`).then(r => r.json()).catch(() => null),
          fetch(`${getApiUrl()}/api/admin/settings/welcome_popup_description`).then(r => r.json()).catch(() => null),
          fetch(`${getApiUrl()}/api/admin/settings/welcome_popup_bg_url`).then(r => r.json()).catch(() => null),
        ]);

        if (titleRes?.value) setTitle(titleRes.value);
        if (descRes?.value) setDescription(descRes.value);
        if (bgRes?.value) setBgUrl(bgRes.value);

        if (enableRes && (enableRes.value === "true" || enableRes.value === "1")) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } catch (err) {
        console.warn("Could not check welcome popup setting from server:", err);
        const localSetting = localStorage.getItem("aira_admin_welcome_popup_enabled");
        const localTitle = localStorage.getItem("sparrow_welcome_popup_title");
        const localDesc = localStorage.getItem("sparrow_welcome_popup_description");
        const localBg = localStorage.getItem("sparrow_welcome_popup_bg");

        if (localTitle) setTitle(localTitle);
        if (localDesc) setDescription(localDesc);
        if (localBg) setBgUrl(localBg);

        setIsOpen(localSetting === "true");
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminSettings();
  }, [forceOpen]);

  const handleClose = () => {
    if (!forceOpen) {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    }
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  if (isLoading || !isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] w-full h-full flex items-center justify-center select-none overflow-y-auto p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Card */}
      <div className="relative w-full max-w-[460px] sm:max-w-[490px] bg-white rounded-[32px] sm:rounded-[38px] shadow-2xl shadow-emerald-950/20 overflow-hidden border border-emerald-50 text-center animate-in zoom-in-95 duration-300">
        
        {/* Custom Uploaded Background Image or Default Ambient Glow */}
        {bgUrl ? (
          <>
            <img
              src={mediaUrl(bgUrl)}
              alt="Welcome Popup Background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Soft overlay so text and logo remain crisp and readable */}
            <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px]" />
          </>
        ) : (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[220px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* Top-right Circular Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 group"
        >
          <X size={18} className="group-hover:scale-110 transition-transform text-slate-700" />
        </button>

        {/* Top Content: Logo, Title, Divider, Subtitle */}
        <div className="pt-10 sm:pt-12 px-6 sm:px-8 relative z-10 flex flex-col items-center">
          {/* Logo on top */}
          <img
            src={activeLogoUrl || "/images/aira-main-logo.png"}
            alt="Aira Properties"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/aira-main-logo.png";
            }}
            className="w-[190px] sm:w-[220px] max-h-16 h-auto object-contain mx-auto"
          />

          {/* Title */}
          <h2 className="mt-8 sm:mt-10 text-2xl sm:text-[28px] font-display font-extrabold text-[#449348] tracking-tight text-center leading-snug">
            {title || "Welcome to Aira Properties"}
          </h2>

          {/* Short green pill divider bar */}
          <div className="w-12 h-1 bg-[#4FA857] rounded-full mx-auto my-3 sm:my-3.5" />

          {/* Subtitle / Description */}
          <p className="text-sm sm:text-[15px] font-medium text-slate-600 text-center leading-relaxed max-w-sm">
            {description || "Connecting Buyers & Sellers Globally."}
          </p>
        </div>

        {/* Bottom Cityscape Skyline Illustration when no full bg image */}
        {!bgUrl ? (
          <div 
            className="w-full h-16 sm:h-20 mt-8 sm:mt-10 opacity-75 select-none pointer-events-none relative z-10"
            style={{
              backgroundImage: "url('/images/footer-image.png')",
              backgroundRepeat: "repeat-x",
              backgroundPosition: "bottom center",
              backgroundSize: "auto 72px"
            }}
          />
        ) : (
          <div className="h-10" />
        )}
      </div>
    </div>
  );
}
