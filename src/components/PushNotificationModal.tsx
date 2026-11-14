import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertCircle, X, MapPin, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { enablePushNotifications } from "@/firebase";

const KERALA_DISTRICTS = [
  "All Kerala",
  "Alappuzha",
  "Ernakulam",
  "Idukki",
  "Kannur",
  "Kasaragod",
  "Kollam",
  "Kottayam",
  "Kozhikode",
  "Malappuram",
  "Palakkad",
  "Pathanamthitta",
  "Thiruvananthapuram",
  "Thrissur",
  "Wayanad",
];

const DISMISSED_KEY = "aira_push_modal_dismissed_at";
const ENABLED_KEY = "aira_push_notification_enabled";
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

interface PushNotificationModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function PushNotificationModal({ forceOpen = false, onClose }: PushNotificationModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize selected district from user's profile location or district
  const initialDistrict = (() => {
    if (user?.district && KERALA_DISTRICTS.includes(user.district)) {
      return user.district;
    }
    if (user?.location) {
      const match = KERALA_DISTRICTS.find((d) =>
        user.location?.toLowerCase().includes(d.toLowerCase())
      );
      if (match) return match;
    }
    return "All Kerala";
  })();

  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // 1. Browser feature detection
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    // 2. Already granted or permanently blocked by browser
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return;
    }

    // 3. User previously enabled or dismissed within cooldown window
    if (localStorage.getItem(ENABLED_KEY) === "true") {
      return;
    }

    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_COOLDOWN_MS) {
        return;
      }
    }

    // 4. Polite delay: trigger 3.5 seconds after page loads
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, [forceOpen]);

  const handleDismiss = () => {
    if (!forceOpen) {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleEnable = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatus("idle");

    try {
      const targetDistrict = selectedDistrict === "All Kerala" ? null : selectedDistrict;
      const targetUserId = user?.id || null;

      const result = await enablePushNotifications(targetUserId, targetDistrict);

      if (result.success) {
        setStatus("success");
        localStorage.setItem(ENABLED_KEY, "true");
        localStorage.removeItem(DISMISSED_KEY);

        // Auto close after showing success animation
        setTimeout(() => {
          setIsOpen(false);
          if (onClose) onClose();
        }, 1800);
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Permission denied or failed to enable notifications.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "Failed to subscribe to push notifications.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] w-full h-full flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="push-modal-title"
    >
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl shadow-emerald-950/20 overflow-hidden border border-emerald-100 text-center animate-in zoom-in-95 duration-300">
        
        {/* Soft emerald background ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-44 bg-gradient-to-b from-emerald-100/70 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Close"
          disabled={loading}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-6 sm:p-7 pt-7 flex flex-col items-center">
          
          {/* Bell Icon with pulsed halo */}
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Bell className="w-8 h-8 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
            </span>
          </div>

          {/* Heading & Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold mb-2.5 border border-emerald-200/60">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Instant Property Alerts
          </div>

          <h3 id="push-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            Never Miss Your Dream Home
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed px-2">
            Get instant push notifications when new certified properties, price drops, and verified listings are published in Kerala.
          </p>

          {/* Location & District Preference Selector */}
          <div className="w-full mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-left">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="push-district-select" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Notify me for properties in:
              </label>
              {user?.name && (
                <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                  User #{user.id}
                </span>
              )}
            </div>

            <select
              id="push-district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={loading || status === "success"}
              className="w-full text-xs font-medium py-2 px-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 transition shadow-xs cursor-pointer"
            >
              {KERALA_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district === "All Kerala" ? "🌟 All Kerala (Every District)" : `${district} District`}
                </option>
              ))}
            </select>
          </div>

          {/* User info note if signed in */}
          {user?.name && (
            <div className="w-full mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Registering for account: <strong className="text-gray-700 font-semibold">{user.name}</strong>
              </span>
            </div>
          )}

          {/* Status Feedback */}
          {status === "success" && (
            <div className="w-full mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Notifications enabled! Device registered.
            </div>
          )}

          {status === "error" && errorMessage && (
            <div className="w-full mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleEnable}
              disabled={loading || status === "success"}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Device...</span>
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Subscribed!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Enable Push Notifications</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              disabled={loading}
              className="w-full py-2.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition cursor-pointer"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-[10px] text-gray-400 mt-2">
            You can modify or disable notifications at any time in your browser settings.
          </p>
        </div>
      </div>
    </div>
  );
}
