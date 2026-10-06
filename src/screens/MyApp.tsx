import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Download, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Home, 
  Key, 
  LandPlot, 
  Building2, 
  Building, 
  QrCode, 
  Zap, 
  Check
} from "lucide-react";
import { api, mediaUrl, API_URL } from "@/lib/api";
import { useBrand } from "@/lib/BrandContext";

function AndroidLogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5802 8.411 13.8407 8.0872 12 8.0872c-1.8413 0-3.5804.3238-5.1373.8625L4.8404 5.4467a.416.416 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
    </svg>
  );
}

function AppleIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 170" className={className} fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.71-11.71-14.01-6.74-10.22-12.08-21.85-16.02-34.89-3.94-13.04-5.91-25.26-5.91-36.66 0-14.13 3.58-26.08 10.74-35.84 7.17-9.76 16.29-14.74 27.37-14.94 4.89 0 10.12 1.25 15.69 3.75 5.57 2.5 9.17 3.86 10.81 4.08 2.07-.43 5.92-1.85 11.55-4.25 5.63-2.4 10.63-3.52 15.01-3.37 13.05.65 23.38 5.66 31 15.01-11.53 6.96-17.18 16.63-16.96 29.02.22 9.79 3.96 17.93 11.23 24.42 7.27 6.49 15.86 10.22 25.77 11.2-2.18 6.52-4.68 13.15-7.51 19.89zM119.22 33.02c0-7.39 2.66-14.46 7.99-21.2 5.33-6.74 12.01-11.09 20.04-13.06.65 1.74.98 3.59.98 5.54 0 7.39-2.77 14.73-8.31 22.01-5.54 7.28-12.28 11.53-20.22 12.75-.11-1.96-.48-3.98-.48-6.04z" />
    </svg>
  );
}

export default function MyApp() {
  const navigate = useNavigate();
  const { activeLogoUrl } = useBrand();
  const [deviceType, setDeviceType] = useState<"android" | "ios" | "desktop">("desktop");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) {
      setDeviceType("android");
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      setDeviceType("ios");
    } else {
      setDeviceType("desktop");
    }
  }, []);

  const handleDownloadApk = (name: string, apkUrl: string) => {
    setDownloading(name);
    // Create temporary link to trigger native instant download
    const link = document.createElement("a");
    link.href = apkUrl;
    link.download = apkUrl.split("/").pop() || "airaproperties.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(null);
    }, 5000);
  };

  const handleAppleClick = () => {
    setShowIosPrompt(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] font-display text-charcoal select-none flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div 
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <img
            src={activeLogoUrl}
            alt="Aira Properties"
            className="h-9 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <span className="text-lg font-black text-[#0F3D3E] tracking-tight">Aira Properties</span>
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-xs font-bold text-[#0F3D3E] hover:text-[#1B5E4F] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Web Version</span>
          <ArrowRight size={14} />
        </button>
      </nav>

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        
        {/* Hero Section matching the user poster */}
        <div className="bg-white rounded-3xl sm:rounded-[36px] border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col text-left">
            
            {/* Header pill & tagline */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-black uppercase tracking-wider">
                Official Release v1.0
              </span>
              {deviceType === "android" && (
                <span className="px-2.5 py-1 bg-[#59AD63]/15 text-[#1B5E4F] rounded-full text-[11px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#59AD63] animate-pulse" />
                  Android Device
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-bold text-[#59AD63] tracking-widest uppercase">
              FIND YOUR PERFECT PROPERTY
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F3D3E] tracking-tight leading-tight mt-1">
              Aira Properties<br className="hidden sm:inline" /> Mobile App
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-3 sm:mt-4 leading-relaxed font-medium max-w-xl">
              Discover, buy, rent, and invest in properties anytime, anywhere. Explore verified listings, get instant updates and connect directly with trusted agents & owners — all in one super-fast app.
            </p>

            {/* Feature Icons Category Strip (as in user mock) */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 py-5 my-4 border-y border-slate-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                  <Home size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-1.5">Buy</span>
                <span className="text-[9px] text-slate-400 hidden sm:block">Dream home</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
                  <Key size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-1.5">Rent</span>
                <span className="text-[9px] text-slate-400 hidden sm:block">Explore rentals</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                  <LandPlot size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-1.5">Plots</span>
                <span className="text-[9px] text-slate-400 hidden sm:block">Land & plots</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shadow-xs">
                  <Building2 size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-1.5">Villas</span>
                <span className="text-[9px] text-slate-400 hidden sm:block">Luxury living</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-xs">
                  <Building size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-1.5">Commercial</span>
                <span className="text-[9px] text-slate-400 hidden sm:block">Business units</span>
              </div>
            </div>

            {/* DOWNLOAD BUTTONS SECTION */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              
              {/* PRIMARY: Download Android App button (Replaces standard play store badge) */}
              <button
                type="button"
                onClick={() => handleDownloadApk("Aira Properties Android App", "/airaproperties.apk")}
                className="py-3.5 px-6 sm:px-7 bg-black hover:bg-neutral-900 active:bg-neutral-800 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-150 active:scale-[0.98] flex items-center justify-center sm:justify-start gap-4 cursor-pointer group border border-neutral-700"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#3DDC84] group-hover:scale-105 transition-transform shrink-0">
                  <AndroidLogoIcon className="w-7 h-7" />
                </div>
                <div className="text-left flex flex-col">
                  <span className="text-[10px] font-semibold text-neutral-300 uppercase tracking-wider leading-none">
                    Fast Direct Download
                  </span>
                  <span className="text-[17px] sm:text-[18px] font-black text-white tracking-tight mt-1 leading-tight">
                    Download Android App
                  </span>
                </div>
              </button>

              {/* SECONDARY: Apple iOS Progressive App Button */}
              <button
                type="button"
                onClick={handleAppleClick}
                className="py-3.5 px-5 bg-white hover:bg-slate-50 border-2 border-black/80 text-black rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group"
              >
                <AppleIcon className="w-6 h-6 text-black shrink-0 group-hover:scale-105 transition-transform" />
                <div className="text-left flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                    Apple Device
                  </span>
                  <span className="text-[14px] font-extrabold text-black tracking-tight mt-0.5 leading-tight">
                    iOS Web App
                  </span>
                </div>
              </button>

              {/* QR Code trigger (Desktop view) */}
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="hidden lg:flex items-center gap-2 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-black transition-all cursor-pointer"
                title="Scan QR Code to download on phone"
              >
                <QrCode size={24} />
                <span className="text-xs font-bold">Scan QR</span>
              </button>
            </div>

            {/* Download Notification Toast */}
            {downloading && (
              <div className="mt-4 w-full bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl p-3 text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-sm">
                <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                <span>Downloading <strong>{downloading}</strong> (5.7 MB)... Check your browser downloads.</span>
              </div>
            )}

            {/* Admin App APK Direct Download */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-semibold">Are you an Aira Properties Administrator?</span>
              <button
                type="button"
                onClick={() => handleDownloadApk("Aira Admin App", "/aira-admin.apk")}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F3D3E] font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Download Admin APK</span>
              </button>
            </div>

          </div>

          {/* Right Hero Poster Showcase Image */}
          <div className="lg:col-span-5 relative bg-gradient-to-br from-emerald-50 to-teal-100/50 p-6 sm:p-8 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-100">
            <div className="relative w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <img
                src="/aira-app-banner.jpg"
                alt="Aira Properties Mobile App Preview"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback to app mockup if banner fails
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              
              <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-2xl p-2.5 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-[11px]">Direct Android APK</span>
                </div>
                <span className="text-[10px] text-white/70">v1.0 • 5.7 MB</span>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0F3D3E]">Ultra-Fast Browsing</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Optimized mobile engine opens instantly and loads real estate listings without buffering.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0F3D3E]">100% Safe & Verified</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Clean APK signed package verified against malware and security exploits.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0F3D3E]">Direct Phone APK</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                No Google Play Store account required. Installs directly on any Android smartphone.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5 backdrop-blur-xs"
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center font-display"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#59AD63]/10 text-[#1B5E4F] flex items-center justify-center mb-3">
              <QrCode size={26} />
            </div>
            <h3 className="font-extrabold text-lg text-[#0F3D3E]">Scan to Download</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Point your smartphone camera at this QR code to download the Aira Properties APK directly.
            </p>

            <div className="w-48 h-48 bg-white p-3 border-2 border-slate-200 rounded-2xl flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#0F3D3E]">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                <rect x="5" y="5" width="25" height="25" fill="currentColor" />
                <rect x="10" y="10" width="15" height="15" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="currentColor" />
                <rect x="70" y="5" width="25" height="25" fill="currentColor" />
                <rect x="75" y="10" width="15" height="15" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="currentColor" />
                <rect x="5" y="70" width="25" height="25" fill="currentColor" />
                <rect x="10" y="75" width="15" height="15" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="currentColor" />
                <rect x="35" y="5" width="5" height="15" fill="currentColor" />
                <rect x="45" y="10" width="10" height="5" fill="currentColor" />
                <rect x="60" y="5" width="5" height="5" fill="currentColor" />
                <rect x="35" y="25" width="10" height="5" fill="currentColor" />
                <rect x="50" y="20" width="5" height="15" fill="currentColor" />
                <rect x="60" y="25" width="5" height="5" fill="currentColor" />
                <rect x="5" y="35" width="15" height="5" fill="currentColor" />
                <rect x="10" y="45" width="5" height="10" fill="currentColor" />
                <rect x="25" y="35" width="10" height="5" fill="currentColor" />
                <rect x="35" y="35" width="5" height="5" fill="currentColor" />
                <rect x="45" y="40" width="25" height="5" fill="currentColor" />
                <rect x="75" y="35" width="15" height="5" fill="currentColor" />
                <rect x="35" y="50" width="10" height="10" fill="currentColor" />
                <rect x="50" y="45" width="5" height="15" fill="currentColor" />
                <rect x="65" y="50" width="15" height="5" fill="currentColor" />
                <rect x="5" y="60" width="5" height="5" fill="currentColor" />
                <rect x="15" y="60" width="10" height="5" fill="currentColor" />
                <rect x="25" y="50" width="5" height="15" fill="currentColor" />
                <rect x="35" y="70" width="15" height="5" fill="currentColor" />
                <rect x="55" y="75" width="5" height="10" fill="currentColor" />
                <rect x="70" y="70" width="10" height="5" fill="currentColor" />
                <rect x="35" y="80" width="5" height="15" fill="currentColor" />
                <rect x="45" y="85" width="15" height="5" fill="currentColor" />
                <rect x="70" y="80" width="5" height="15" fill="currentColor" />
                <rect x="80" y="85" width="15" height="5" fill="currentColor" />
              </svg>
            </div>

            <div className="flex gap-2 w-full mt-6">
              <button
                type="button"
                onClick={() => handleDownloadApk("Aira Properties Android App", "/airaproperties.apk")}
                className="flex-1 py-3 bg-[#0F3D3E] hover:bg-[#1B5E4F] text-white rounded-xl text-xs font-bold transition-all"
              >
                Download APK Directly
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-charcoal rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Information Modal */}
      {showIosPrompt && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5 backdrop-blur-xs"
          onClick={() => setShowIosPrompt(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col gap-4 text-left font-display"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
                <AppleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0F3D3E]">Aira Properties for iOS</h3>
                <p className="text-[11px] text-slate-500 font-medium">iPhone & iPad Progressive App</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Aira Properties runs as a fast progressive mobile app on Apple iOS without taking extra device storage.
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col gap-2 text-xs">
              <span className="font-bold text-[#0F3D3E] flex items-center gap-1.5">
                <Info size={14} className="text-emerald-600" />
                How to install on iPhone/iPad:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 font-medium text-[11.5px]">
                <li>Tap the <strong>Share</strong> button at bottom of Safari.</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                <li>Tap <strong>Add</strong> at top right to open full-screen!</li>
              </ol>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowIosPrompt(false);
                  navigate("/home");
                }}
                className="flex-1 py-3 bg-[#0F3D3E] hover:bg-[#1B5E4F] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Open Web App
              </button>
              <button
                type="button"
                onClick={() => setShowIosPrompt(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-charcoal rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-6 px-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Aira Properties. All rights reserved.</p>
      </footer>
    </div>
  );
}
