import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface LaunchPopupProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const DISMISSED_KEY = "aira_launch_popup_dismissed_at";
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function LaunchPopup({ forceOpen = false, onClose }: LaunchPopupProps) {
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
        return; // Closed within 24 hours, do not show
      }
    }

    // 2. Check if admin enabled/disabled popup
    async function checkAdminSetting() {
      try {
        const res = await fetch(`${getApiUrl()}/api/admin/settings/launch_popup_enabled`);
        if (res.ok) {
          const data = await res.json();
          // If explicitly disabled by admin, never show
          if (data && (data.value === "false" || data.value === "0")) {
            setIsOpen(false);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not check launch popup setting from server:", err);
        // Check local mirror if network unavailable
        const localSetting = localStorage.getItem("aira_admin_launch_popup_enabled");
        if (localSetting === "false") {
          setIsOpen(false);
          setIsLoading(false);
          return;
        }
      }

      // Default or when value !== 'false': show popup
      setIsOpen(true);
      setIsLoading(false);
    }

    checkAdminSetting();
  }, [forceOpen]);

  const handleClose = () => {
    if (!forceOpen) {
      // Record dismissal timestamp for 24-hour block on this browser/PC
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
      className="fixed inset-0 z-[100] w-full h-full flex items-center justify-center select-none overflow-hidden bg-black animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Background Video: lainch.mp4 original video full screen autoplay loop - no dark gradient overlay */}
      <video
        src="/images/lainch.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      />

      {/* launch_bg.svg on popup left bottom side, 30% width */}
      <img
        src="/images/launch_bg.svg"
        alt=""
        className="absolute bottom-0 left-0 w-[30%] pointer-events-none select-none z-10 opacity-90 object-contain object-bottom-left"
      />

      {/* Top right corner Close square button */}
      <button
        onClick={handleClose}
        type="button"
        aria-label="Close"
        className="absolute top-5 right-5 sm:top-8 sm:right-8 z-30 w-11 h-11 bg-black/60 hover:bg-black/90 text-white border border-white/30 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm shadow-xl active:scale-95 group"
      >
        <X size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Center Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-2xl mx-auto my-auto">
        {/* aira-main-logo.png center - 250px */}
        <img
          src="/images/aira-main-logo.png"
          alt="Aira Properties"
          className="w-[250px] max-w-full h-auto object-contain mb-4 animate-in zoom-in-90 duration-300"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/images/aira-main-logo.webp";
          }}
        />

        <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight bg-gradient-to-r from-[#599243] to-[#14200e] bg-clip-text text-transparent inline-block">
          Aira Properties
        </h1>

        <h2 className="text-base sm:text-xl font-semibold text-emerald-400 mt-3 tracking-wide">
          Discover, Buy, and Lease Properties Across India.
        </h2>

        <p className="text-xs sm:text-base text-slate-100 font-medium mt-4 leading-relaxed max-w-lg">
          Aira Properties is your trusted real estate platform, connecting buyers, sellers, tenants, and verified property listing promoters.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-sm sm:text-base uppercase tracking-widest shadow-2xl shadow-emerald-500/40 border border-emerald-300/50">
          <span>Coming Soon!</span>
        </div>
      </div>
    </div>
  );
}
