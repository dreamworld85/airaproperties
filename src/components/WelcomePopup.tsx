import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface WelcomePopupProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const DISMISSED_KEY = "aira_welcome_popup_dismissed_at";
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours

export default function WelcomePopup({ forceOpen = false, onClose }: WelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!forceOpen);

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

    // 2. Check if admin enabled welcome popup
    async function checkAdminSetting() {
      try {
        const res = await fetch(`${getApiUrl()}/api/admin/settings/welcome_popup_enabled`);
        if (res.ok) {
          const data = await res.json();
          // Show only when explicitly enabled ("true" or "1")
          if (data && (data.value === "true" || data.value === "1")) {
            setIsOpen(true);
            setIsLoading(false);
            return;
          } else {
            setIsOpen(false);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not check welcome popup setting from server:", err);
        const localSetting = localStorage.getItem("aira_admin_welcome_popup_enabled");
        if (localSetting === "true") {
          setIsOpen(true);
          setIsLoading(false);
          return;
        }
      }

      setIsOpen(false);
      setIsLoading(false);
    }

    checkAdminSetting();
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
        
        {/* Ambient soft green radial glow in upper background matching user reference image */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[220px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

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
          {/* Aira Main Logo on top */}
          <img
            src="/images/aira-main-logo.png"
            alt="Aira Properties"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/aira-main-logo.webp";
            }}
            className="w-[190px] sm:w-[220px] h-auto object-contain mx-auto"
          />

          {/* Title: Welcome to Aira Properties */}
          <h2 className="mt-8 sm:mt-10 text-2xl sm:text-[28px] font-display font-extrabold text-[#449348] tracking-tight text-center leading-snug">
            Welcome to Aira Properties
          </h2>

          {/* Short green pill divider bar */}
          <div className="w-12 h-1 bg-[#4FA857] rounded-full mx-auto my-3 sm:my-3.5" />

          {/* Subtitle */}
          <p className="text-sm sm:text-[15px] font-medium text-slate-600 text-center leading-relaxed max-w-sm">
            Connecting Buyers & Sellers Globally.
          </p>
        </div>

        {/* Bottom Cityscape Skyline Illustration matching user mockup */}
        <div 
          className="w-full h-16 sm:h-20 mt-8 sm:mt-10 opacity-75 select-none pointer-events-none"
          style={{
            backgroundImage: "url('/images/footer-image.png')",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "bottom center",
            backgroundSize: "auto 72px"
          }}
        />
      </div>
    </div>
  );
}
