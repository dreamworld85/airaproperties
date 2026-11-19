import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Eye, RefreshCw, Save, Sparkles, Upload, RotateCcw, Image as ImageIcon, ShieldCheck, HeartHandshake } from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { mediaUrl } from "@/lib/api";
import { useBrand } from "@/lib/BrandContext";
import WelcomePopup from "@/components/WelcomePopup";

export default function AdminLaunch() {
  const { activeLogoUrl } = useBrand();
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("Welcome to Aira Properties");
  const [description, setDescription] = useState<string>("Connecting Buyers & Sellers Globally.");
  const [currentBgUrl, setCurrentBgUrl] = useState<string | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string>("");

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const [enableRes, titleRes, descRes, bgRes] = await Promise.all([
          adminApi.getSetting("welcome_popup_enabled").catch(() => null),
          adminApi.getSetting("welcome_popup_title").catch(() => null),
          adminApi.getSetting("welcome_popup_description").catch(() => null),
          adminApi.getSetting("welcome_popup_bg_url").catch(() => null),
        ]);

        if (enableRes && (enableRes.value === "true" || enableRes.value === "1")) {
          setIsEnabled(true);
        } else if (enableRes && (enableRes.value === "false" || enableRes.value === "0")) {
          setIsEnabled(false);
        }

        if (titleRes?.value) {
          setTitle(titleRes.value);
        }
        if (descRes?.value) {
          setDescription(descRes.value);
        }
        if (bgRes?.value) {
          setCurrentBgUrl(bgRes.value);
        }
      } catch (err: any) {
        console.error("Failed to load popup settings:", err);
        const localEnable = localStorage.getItem("aira_admin_welcome_popup_enabled");
        if (localEnable !== null) setIsEnabled(localEnable === "true");
        const localTitle = localStorage.getItem("sparrow_welcome_popup_title");
        if (localTitle) setTitle(localTitle);
        const localDesc = localStorage.getItem("sparrow_welcome_popup_description");
        if (localDesc) setDescription(localDesc);
        const localBg = localStorage.getItem("sparrow_welcome_popup_bg");
        if (localBg) setCurrentBgUrl(localBg);
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
      const enableVal = isEnabled ? "true" : "false";

      // 1. Update text settings
      await Promise.all([
        adminApi.updateSetting("welcome_popup_enabled", enableVal),
        adminApi.updateSetting("welcome_popup_title", title.trim() || "Welcome to Aira Properties"),
        adminApi.updateSetting("welcome_popup_description", description.trim() || "Connecting Buyers & Sellers Globally."),
        adminApi.updateSetting("launch_popup_enabled", "false"),
        adminApi.updateSetting("active_popup_type", isEnabled ? "welcome" : "none")
      ]);

      localStorage.setItem("aira_admin_welcome_popup_enabled", enableVal);
      localStorage.setItem("sparrow_welcome_popup_title", title.trim());
      localStorage.setItem("sparrow_welcome_popup_description", description.trim());
      localStorage.setItem("aira_admin_launch_popup_enabled", "false");
      localStorage.setItem("aira_admin_active_popup_type", isEnabled ? "welcome" : "none");

      // 2. Upload background file if selected
      if (bgFile) {
        const bgRes = await adminApi.updateSetting("welcome_popup_bg_url", bgFile);
        if (bgRes?.value) {
          setCurrentBgUrl(bgRes.value);
          localStorage.setItem("sparrow_welcome_popup_bg", bgRes.value);
          setBgFile(null);
          setBgPreview(null);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed to save popup settings:", err);
      localStorage.setItem("aira_admin_welcome_popup_enabled", isEnabled ? "true" : "false");
      localStorage.setItem("sparrow_welcome_popup_title", title.trim());
      localStorage.setItem("sparrow_welcome_popup_description", description.trim());
      setErrorMessage(err.message || "Could not save to remote server, saved locally.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!confirm("Are you sure you want to remove the custom popup background and return to default?")) return;
    setSaving(true);
    try {
      await adminApi.updateSetting("welcome_popup_bg_url", "");
      setCurrentBgUrl(null);
      setBgFile(null);
      setBgPreview(null);
      localStorage.removeItem("sparrow_welcome_popup_bg");
      alert("Custom popup background removed. Default background restored.");
    } catch (err: any) {
      alert(err.message || "Failed to remove background.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset24HourDismissal = () => {
    localStorage.removeItem("aira_welcome_popup_dismissed_at");
    setResetMessage("Local 24-hour dismissal timer cleared. The welcome popup will now appear again on the home page for this device.");
    setTimeout(() => setResetMessage(""), 5000);
  };

  const activeBg = bgPreview || (currentBgUrl ? mediaUrl(currentBgUrl) : null);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-charcoal/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-charcoal">
                Main Page Welcome Popup Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Customize the welcome greeting modal popup displayed to visitors on the main page.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Eye size={16} />
            <span>Preview Interactive Modal</span>
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
          <span>Welcome popup settings saved successfully! Changes reflect on the home page immediately.</span>
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
        {/* Enable / Disable Toggle Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-5 border-b border-charcoal/5">
          <div className="flex items-center gap-3">
            <input
              id="enable-welcome-popup"
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 border-charcoal/20 cursor-pointer"
            />
            <label htmlFor="enable-welcome-popup" className="cursor-pointer">
              <h2 className="text-base sm:text-lg font-bold text-charcoal">
                Enable Welcome Popup on Main Page
              </h2>
              <p className="text-xs text-slate-500">
                Displays the greeting popup once every 24 hours to visitors entering the home page.
              </p>
            </label>
          </div>

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

        {/* 2-Column Layout: Left Form Inputs, Right Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center justify-between">
                <span>Popup Title</span>
                <span className="text-[10px] text-slate-400 font-normal">Main heading on modal</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Welcome to Aira Properties"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-charcoal/10 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-charcoal"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal flex items-center justify-between">
                <span>Popup Description / Subtitle</span>
                <span className="text-[10px] text-slate-400 font-normal">Tagline or announcement</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Connecting Buyers & Sellers Globally."
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-charcoal/10 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-700 resize-none leading-relaxed"
              />
            </div>

            {/* Background Image Upload */}
            <div className="space-y-2 pt-2 border-t border-charcoal/5">
              <label className="text-xs font-bold text-charcoal flex items-center justify-between">
                <span>Upload Popup Background Image</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional custom card backdrop</span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBgFile(file);
                      setBgPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="flex-1 text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 text-slate-600 bg-slate-50 p-1.5 rounded-xl border border-charcoal/10 cursor-pointer"
                />

                {(currentBgUrl || bgPreview) && (
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    disabled={saving}
                    className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    <span>Reset to Default</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Recommended: 600×500px or 800×600px PNG/JPG/WebP. When uploaded, a soft translucent overlay ensures your title and logo remain crisp and legible.
              </p>
            </div>
          </div>

          {/* Right Column: Live Modal Card Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Live Real-Time Card Preview
            </span>

            {/* Preview Container */}
            <div className="relative w-full max-w-[340px] bg-white rounded-[26px] shadow-lg shadow-emerald-950/10 overflow-hidden border border-emerald-100 text-center select-none p-5 pb-0 flex flex-col items-center">
              {/* Background Layer */}
              {activeBg ? (
                <>
                  <img
                    src={activeBg}
                    alt="Custom Background Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px]" />
                </>
              ) : (
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[140px] bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />
              )}

              {/* Close icon dummy */}
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-100/90 text-slate-500 flex items-center justify-center text-[10px] font-bold shadow-xs">
                ✕
              </div>

              {/* Logo */}
              <div className="relative z-10 pt-4">
                <img
                  src={activeLogoUrl || "/images/aira-main-logo.png"}
                  alt="Aira Logo"
                  className="h-9 w-auto object-contain mx-auto"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/aira-main-logo.png";
                  }}
                />
              </div>

              {/* Title */}
              <h3 className="relative z-10 mt-4 text-base font-display font-extrabold text-[#449348] tracking-tight text-center leading-snug px-2">
                {title.trim() || "Welcome to Aira Properties"}
              </h3>

              {/* Green divider bar */}
              <div className="relative z-10 w-9 h-0.5 bg-[#4FA857] rounded-full mx-auto my-2" />

              {/* Description */}
              <p className="relative z-10 text-[11px] font-medium text-slate-600 text-center leading-relaxed px-2 line-clamp-3">
                {description.trim() || "Connecting Buyers & Sellers Globally."}
              </p>

              {/* Bottom Skyline Illustration when default, or bottom spacer */}
              {!activeBg ? (
                <div
                  className="w-full h-12 mt-4 opacity-75 select-none pointer-events-none relative z-10"
                  style={{
                    backgroundImage: "url('/images/footer-image.png')",
                    backgroundRepeat: "repeat-x",
                    backgroundPosition: "bottom center",
                    backgroundSize: "auto 48px"
                  }}
                />
              ) : (
                <div className="h-6" />
              )}

              {/* Badge indicating background mode */}
              <span className="absolute bottom-2 right-2 z-20 text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                {activeBg ? (bgPreview ? "New Upload Preview" : "Custom DB Background") : "Default Skyline Background"}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Specs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-charcoal/5">
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck size={16} />
              <span>24-Hour Smart Dismissal</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              When a visitor dismisses the welcome popup via the top-right close button, it stays hidden on that browser for 24 hours.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
              <HeartHandshake size={16} />
              <span>Dynamic Brand Sync</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Synchronizes automatically with your primary active brand logo and custom background graphics across desktop and mobile.
            </p>
          </div>
        </div>

        {/* Admin Testing Controls */}
        <div className="p-5 rounded-2xl border border-charcoal/10 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">
              Testing &amp; Device Controls
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear the 24-hour dismissal timer on this device to test the popup immediately on the home page.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset24HourDismissal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <RefreshCw size={14} />
            <span>Reset 24h Timer</span>
          </button>
        </div>
      </div>

      {/* Full-screen Interactive Modal Preview */}
      {previewModalOpen && (
        <WelcomePopup
          forceOpen={true}
          customBgUrl={activeBg}
          customTitle={title}
          customDescription={description}
          onClose={() => setPreviewModalOpen(false)}
        />
      )}
    </div>
  );
}
