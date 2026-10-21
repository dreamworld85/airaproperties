import { useState, useEffect } from "react";
import { Rocket, CheckCircle2, AlertCircle, Eye, RefreshCw, Save, Sparkles, Video, ShieldCheck } from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import LaunchPopup from "@/components/LaunchPopup";

export default function AdminLaunch() {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string>("");

  useEffect(() => {
    async function loadSetting() {
      setLoading(true);
      try {
        const res = await adminApi.getSetting("launch_popup_enabled");
        if (res && res.value !== null) {
          setIsEnabled(res.value === "true" || res.value === "1");
        } else {
          // Default to enabled if not explicitly set yet
          setIsEnabled(true);
        }
      } catch (err: any) {
        console.error("Failed to load launch popup setting:", err);
        // Fallback to local storage if available
        const local = localStorage.getItem("aira_admin_launch_popup_enabled");
        if (local !== null) {
          setIsEnabled(local === "true");
        } else {
          setIsEnabled(true);
        }
      } finally {
        setLoading(false);
      }
    }

    loadSetting();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      const valStr = isEnabled ? "true" : "false";
      await adminApi.updateSetting("launch_popup_enabled", valStr);
      localStorage.setItem("aira_admin_launch_popup_enabled", valStr);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed to save launch popup setting:", err);
      // Even if network fails, persist locally
      localStorage.setItem("aira_admin_launch_popup_enabled", isEnabled ? "true" : "false");
      setErrorMessage(err.message || "Could not update setting on remote server, saved locally.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset24HourDismissal = () => {
    localStorage.removeItem("aira_launch_popup_dismissed_at");
    setResetMessage("Local 24-hour dismissal timer cleared. The popup can now be viewed again on this device.");
    setTimeout(() => setResetMessage(""), 5000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-charcoal/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <Rocket size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-charcoal">
                Launch Popup Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage the main page promotional & launch popup modal for site visitors.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Eye size={16} />
            <span>Preview Popup</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {saveSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>Launch popup settings updated successfully! Changes take effect immediately on frontend.</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-semibold animate-in fade-in duration-200">
          <AlertCircle size={18} className="shrink-0 text-amber-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {resetMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm font-semibold animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="shrink-0 text-blue-600" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-charcoal">
              Main Landing Page Popup Switch
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Enable or disable the popup on the website main entry page. When disabled, the popup is completely turned off and will never show to any visitor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isEnabled
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isEnabled ? "bg-emerald-600 animate-pulse" : "bg-slate-400"
                }`}
              />
              {isEnabled ? "Popup Enabled (Live)" : "Popup Disabled (Hidden)"}
            </span>
          </div>
        </div>

        {/* Checkbox / Toggle Box */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-charcoal/5 flex items-start gap-4">
          <div className="pt-0.5">
            <input
              id="launch-checkbox"
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 border-charcoal/20 cursor-pointer"
            />
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => setIsEnabled(!isEnabled)}>
            <label
              htmlFor="launch-checkbox"
              className="font-bold text-sm text-charcoal cursor-pointer block"
            >
              Enable Launch Popup on Main Page
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Check this box to activate the promotional popup. Uncheck to disable and completely hide it from frontend visitors.
            </p>
          </div>
        </div>

        {/* Feature Specs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-charcoal/5">
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <Video size={16} />
              <span>Background Video</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Plays <code>lainch.mp4</code> in auto-loop in background, overlaid with <code>launch_bg.svg</code> at bottom-left.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
              <ShieldCheck size={16} />
              <span>24-Hour Smart Dismissal</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              When a visitor closes the popup using the top-right square button, it will not appear again on that PC for 24 hours.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
              <Sparkles size={16} />
              <span>Brand Assets</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Prominently features centered <code>aira-main-logo.png</code> with official typography and Coming Soon badge.
            </p>
          </div>
        </div>

        {/* Admin Testing Controls */}
        <div className="p-5 rounded-2xl border border-charcoal/10 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">
              Testing & Local Device Controls
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reset the 24-hour closed session timer on this browser to immediately see the popup again on the home page.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset24HourDismissal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <RefreshCw size={14} />
            <span>Reset 24h Timer</span>
          </button>
        </div>
      </div>

      {/* Interactive Modal Preview */}
      {showPreview && (
        <LaunchPopup
          forceOpen={true}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
