import { useState, useEffect } from "react";
import { Rocket, CheckCircle2, AlertCircle, Eye, RefreshCw, Save, Sparkles, Video, ShieldCheck, HeartHandshake, Layers } from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import LaunchPopup from "@/components/LaunchPopup";
import WelcomePopup from "@/components/WelcomePopup";

export default function AdminLaunch() {
  const [activePopup, setActivePopup] = useState<"launch" | "welcome" | "none">("launch");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [previewType, setPreviewType] = useState<"launch" | "welcome" | null>(null);
  const [resetMessage, setResetMessage] = useState<string>("");

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const [launchRes, welcomeRes, modeRes] = await Promise.all([
          adminApi.getSetting("launch_popup_enabled").catch(() => null),
          adminApi.getSetting("welcome_popup_enabled").catch(() => null),
          adminApi.getSetting("active_popup_type").catch(() => null),
        ]);

        if (modeRes && modeRes.value) {
          setActivePopup(modeRes.value as "launch" | "welcome" | "none");
        } else if (welcomeRes && (welcomeRes.value === "true" || welcomeRes.value === "1")) {
          setActivePopup("welcome");
        } else if (launchRes && (launchRes.value === "true" || launchRes.value === "1")) {
          setActivePopup("launch");
        } else if (launchRes && (launchRes.value === "false" || launchRes.value === "0")) {
          setActivePopup("none");
        } else {
          setActivePopup("launch");
        }
      } catch (err: any) {
        console.error("Failed to load popup settings:", err);
        const localMode = localStorage.getItem("aira_admin_active_popup_type");
        if (localMode) {
          setActivePopup(localMode as any);
        } else {
          setActivePopup("launch");
        }
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      const launchVal = activePopup === "launch" ? "true" : "false";
      const welcomeVal = activePopup === "welcome" ? "true" : "false";

      await Promise.all([
        adminApi.updateSetting("launch_popup_enabled", launchVal),
        adminApi.updateSetting("welcome_popup_enabled", welcomeVal),
        adminApi.updateSetting("active_popup_type", activePopup)
      ]);

      localStorage.setItem("aira_admin_launch_popup_enabled", launchVal);
      localStorage.setItem("aira_admin_welcome_popup_enabled", welcomeVal);
      localStorage.setItem("aira_admin_active_popup_type", activePopup);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed to save popup settings:", err);
      const launchVal = activePopup === "launch" ? "true" : "false";
      const welcomeVal = activePopup === "welcome" ? "true" : "false";
      localStorage.setItem("aira_admin_launch_popup_enabled", launchVal);
      localStorage.setItem("aira_admin_welcome_popup_enabled", welcomeVal);
      localStorage.setItem("aira_admin_active_popup_type", activePopup);
      setErrorMessage(err.message || "Could not update setting on remote server, saved locally.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset24HourDismissal = () => {
    localStorage.removeItem("aira_launch_popup_dismissed_at");
    localStorage.removeItem("aira_welcome_popup_dismissed_at");
    setResetMessage("Local 24-hour dismissal timers cleared for both Launch and Welcome popups. Popups will now display again on this device.");
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
                Main Page Popup Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage promotional & welcome modal popups displayed to visitors on the main page.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewType(activePopup === "welcome" ? "welcome" : "launch")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Eye size={16} />
            <span>Preview Active Popup</span>
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
          <span>Popup settings updated successfully! Changes take effect immediately on frontend.</span>
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
              Select Main Page Popup
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Choose which popup to activate on the main page. Check either option to activate it, or uncheck to disable popups completely.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                activePopup !== "none"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  activePopup !== "none" ? "bg-emerald-600 animate-pulse" : "bg-slate-400"
                }`}
              />
              {activePopup === "launch"
                ? "Launch Popup (Live)"
                : activePopup === "welcome"
                ? "Welcome Popup (Live)"
                : "All Popups Disabled (Hidden)"}
            </span>
          </div>
        </div>

        {/* 2 Popup Options with Checkboxes */}
        <div className="space-y-3.5">
          {/* Option 1: Launch Popup */}
          <div
            onClick={() => setActivePopup(activePopup === "launch" ? "none" : "launch")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              activePopup === "launch"
                ? "bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                : "bg-slate-50/70 border-charcoal/10 hover:border-charcoal/20 hover:bg-slate-100/50"
            }`}
          >
            <div className="pt-0.5">
              <input
                id="launch-checkbox"
                type="checkbox"
                checked={activePopup === "launch"}
                onChange={(e) => {
                  e.stopPropagation();
                  setActivePopup(e.target.checked ? "launch" : "none");
                }}
                className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 border-charcoal/20 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label
                  htmlFor="launch-checkbox"
                  className="font-bold text-sm text-charcoal cursor-pointer flex items-center gap-2"
                >
                  <span>1. Enable Launch Popup on Main Page</span>
                  {activePopup === "launch" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewType("launch");
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200/80 transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Preview</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Plays <code>lainch.mp4</code> background video in auto-loop, overlaid with <code>launch_bg.svg</code>, official logo, and Coming Soon banner.
              </p>
            </div>
          </div>

          {/* Option 2: Welcome Popup */}
          <div
            onClick={() => setActivePopup(activePopup === "welcome" ? "none" : "welcome")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              activePopup === "welcome"
                ? "bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs"
                : "bg-slate-50/70 border-charcoal/10 hover:border-charcoal/20 hover:bg-slate-100/50"
            }`}
          >
            <div className="pt-0.5">
              <input
                id="welcome-checkbox"
                type="checkbox"
                checked={activePopup === "welcome"}
                onChange={(e) => {
                  e.stopPropagation();
                  setActivePopup(e.target.checked ? "welcome" : "none");
                }}
                className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 border-charcoal/20 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label
                  htmlFor="welcome-checkbox"
                  className="font-bold text-sm text-charcoal cursor-pointer flex items-center gap-2"
                >
                  <span>2. Welcome Popup on Main Page</span>
                  {activePopup === "welcome" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewType("welcome");
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200/80 transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Preview</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Clean modern welcome card featuring <code>aira-main-logo.png</code>, <strong>Welcome to Aira Properties</strong>, <em>Connecting Buyers &amp; Sellers Globally.</em>, and bottom skyline illustration.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Specs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-charcoal/5">
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <Layers size={16} />
              <span>Smart Switchable Popups</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Switch between the Promotional Launch Video popup and the clean Welcome Greeting modal at any time with a single click.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
              <ShieldCheck size={16} />
              <span>24-Hour Smart Dismissal</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              When a visitor closes either popup using the top-right button, it will not appear again on that browser for 24 hours.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
              <HeartHandshake size={16} />
              <span>Brand Presentation</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Welcome popup highlights <code>aira-main-logo.png</code>, branded typography, and the iconic Aira skyline illustration.
            </p>
          </div>
        </div>

        {/* Admin Testing Controls */}
        <div className="p-5 rounded-2xl border border-charcoal/10 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">
              Testing &amp; Local Device Controls
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reset the 24-hour closed session timers on this browser to immediately test both popups on the home page.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset24HourDismissal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <RefreshCw size={14} />
            <span>Reset 24h Timers</span>
          </button>
        </div>
      </div>

      {/* Interactive Modal Previews */}
      {previewType === "launch" && (
        <LaunchPopup
          forceOpen={true}
          onClose={() => setPreviewType(null)}
        />
      )}

      {previewType === "welcome" && (
        <WelcomePopup
          forceOpen={true}
          onClose={() => setPreviewType(null)}
        />
      )}
    </div>
  );
}
