import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Eye, 
  MessageSquare, 
  Phone, 
  MessageCircle, 
  Lock, 
  AlertCircle, 
  Sparkles,
  Send,
  Copy,
  Check,
  Search,
  Building,
  RefreshCw,
  Clock,
  Mail,
  UserCheck,
  Globe,
  Instagram,
  ExternalLink,
  CornerDownRight,
  Loader2
} from "lucide-react";
import { api, ApiDashboardStats, mediaUrl } from "@/lib/api";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import { useAuth } from "@/lib/AuthContext";
import SubscriptionPaywallModal from "@/components/SubscriptionPaywallModal";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80";

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "numeric", 
      month: "short", 
      hour: "2-digit", 
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatPrice(price?: number): string {
  if (!price) return "";
  const num = Number(price);
  if (!num || isNaN(num)) return "₹0";
  const formatted = Math.round(num).toLocaleString("en-IN");
  if (num >= 10000000) return `₹${formatted} Cr`;
  if (num >= 100000) return `₹${formatted} L`;
  if (num >= 1000) return `₹${formatted} K`;
  return `₹${formatted}`;
}

export default function VisitorsEnquiries() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [sentEnquiries, setSentEnquiries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [sourceFilter, setSourceFilter] = useState<"all" | "web" | "facebook" | "instagram">("all");
  const [isSyncingSocial, setIsSyncingSocial] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  // Facebook reply state: keyed by enquiryId or externalId
  const [fbReplyText, setFbReplyText] = useState<Record<string, string>>({});
  const [fbReplySending, setFbReplySending] = useState<Record<string, boolean>>({});
  const [fbReplySent, setFbReplySent] = useState<Record<string, boolean>>({});
  const [fbReplyError, setFbReplyError] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [statsData, sentData] = await Promise.all([
        api.fetchMyStats().catch(() => null),
        api.fetchMySentEnquiries().catch(() => [])
      ]);
      setStats(statsData);
      setSentEnquiries(sentData || []);

      // If user has no received enquiries but has sent enquiries, default to sent tab
      if (statsData && statsData.recentVisitors?.length === 0 && (sentData?.length || 0) > 0) {
        setActiveTab("sent");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load enquiries data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (id: string | number, text?: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Update text for a specific FB reply input
  const setReplyText = (cid: string, text: string) => {
    setFbReplyText(prev => ({ ...prev, [cid]: text }));
    setFbReplyError(prev => ({ ...prev, [cid]: "" }));
  };

  // Send reply to Facebook comment
  const handleFbReply = async (cid: string) => {
    const text = (fbReplyText[cid] || "").trim();
    if (!text) return;
    setFbReplySending(prev => ({ ...prev, [cid]: true }));
    setFbReplyError(prev => ({ ...prev, [cid]: "" }));
    try {
      await api.replyFacebookComment(cid, text);
      setFbReplyText(prev => ({ ...prev, [cid]: "" }));
      setFbReplySending(prev => ({ ...prev, [cid]: false }));
      setFbReplySent(prev => ({ ...prev, [cid]: true }));
      setTimeout(() => setFbReplySent(prev => ({ ...prev, [cid]: false })), 3000);
    } catch (err: any) {
      setFbReplySending(prev => ({ ...prev, [cid]: false }));
      setFbReplyError(prev => ({ ...prev, [cid]: err.message || "Failed to send reply." }));
    }
  };

  const isBrokerOrAgency = user?.role === "Broker" || user?.role === "Agency";
  const isSubscribed = user?.subscriptionStatus === "active";

  // Counts for the 3 Enquiry Sections
  const webCount = stats?.webCount ?? (stats?.recentVisitors || []).filter(v => (v.source || "web") === "web").length;
  const fbCount = stats?.facebookCount ?? (stats?.recentVisitors || []).filter(v => v.source === "facebook").length;
  const igCount = stats?.instagramCount ?? (stats?.recentVisitors || []).filter(v => v.source === "instagram").length;
  const totalReceivedCount = (stats?.recentVisitors || []).length;

  // Filter received visitors by Search and 3 Channels (Web, Facebook, Instagram)
  const filteredVisitors = (stats?.recentVisitors || []).filter((v) => {
    if (sourceFilter !== "all" && (v.source || "web") !== sourceFilter) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (v.visitorName && v.visitorName.toLowerCase().includes(term)) ||
      (v.propertyTitle && v.propertyTitle.toLowerCase().includes(term)) ||
      (v.visitorPhone && v.visitorPhone.includes(term)) ||
      (v.message && v.message.toLowerCase().includes(term))
    );
  });

  // Filter sent enquiries
  const filteredSent = sentEnquiries.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.propertyTitle && s.propertyTitle.toLowerCase().includes(term)) ||
      (s.sellerName && s.sellerName.toLowerCase().includes(term)) ||
      (s.message && s.message.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col font-sans">
      {/* Dynamic Header */}
      {isDesktop ? (
        <DesktopHeader />
      ) : (
        <Header title="Visitors & Enquiries" showBack />
      )}

      {/* Main Container */}
      <main className={`flex-1 w-full mx-auto ${isDesktop ? "max-w-6xl px-6 py-8" : "px-4 pt-4 pb-28"}`}>
        {/* Page Header (Desktop) */}
        {isDesktop && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">
                  Visitors & Enquiries
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                  Live Lead Feed
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Manage incoming buyer enquiries, contact leads directly, and track responses for your property listings.
              </p>
            </div>
            
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        )}

        {/* Banner Alert for Free Trial/Upgrade */}
        {stats?.isTrialExpired && (
          <div className="mb-6 p-4 rounded-2xl border flex gap-3 shadow-xs bg-rose-50/90 border-rose-200 text-rose-900">
            <AlertCircle size={20} className="shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 min-w-0 font-display">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-950">
                Lead Contact Access Gated
              </h4>
              <p className="text-[12px] leading-relaxed mt-1 font-sans text-rose-800">
                You currently have 0 tokens. Top up your enquiry tokens to view direct phone numbers, messages, and reach out to prospective buyers.
              </p>
              <button 
                onClick={() => setShowPaywall(true)}
                className="mt-3 px-3.5 py-1.5 bg-[#1B5E4F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-[#14483d] shadow-xs transition-all"
              >
                <Sparkles size={12} className="text-amber-300" />
                <span>Top Up Enquiry Tokens</span>
              </button>
            </div>
          </div>
        )}

        {/* Minimal Metrics Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                <Eye size={20} className="text-gray-700" />
              </div>
              <div>
                <p className="font-extrabold text-2xl text-gray-900 leading-none">{stats.totalViews}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total Views</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#1B5E4F] shrink-0">
                <MessageSquare size={20} className="text-[#1B5E4F]" />
              </div>
              <div>
                <p className="font-extrabold text-2xl text-[#1B5E4F] leading-none">{stats.totalEnquiries}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Enquiries Received</p>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Send size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-extrabold text-2xl text-blue-600 leading-none">{sentEnquiries.length}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">My Sent Enquiries</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-white p-2 rounded-2xl border border-gray-200/80 shadow-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl">
            <button
              onClick={() => setActiveTab("received")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "received"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>Received Enquiries</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === "received" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
              }`}>
                {stats?.recentVisitors?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("sent")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "sent"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>My Sent Enquiries</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === "sent" ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-600"
              }`}>
                {sentEnquiries.length}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enquiries or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#1B5E4F] rounded-xl text-xs outline-none transition font-medium"
            />
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#1B5E4F] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading enquiries feed...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* TAB 1: RECEIVED ENQUIRIES */}
        {!loading && activeTab === "received" && (
          <div className="flex flex-col gap-4">
            {/* 3 Received Enquiry Sections: Web Enquiry, Facebook Enquiry, Instagram Enquiry */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
              <button
                type="button"
                onClick={() => setSourceFilter("all")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  sourceFilter === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>All Enquiries</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  sourceFilter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}>
                  {totalReceivedCount}
                </span>
              </button>

              {/* 1. WEB ENQUIRY */}
              <button
                type="button"
                onClick={() => setSourceFilter("web")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  sourceFilter === "web"
                    ? "bg-[#1B5E4F] text-white shadow-xs"
                    : "text-emerald-800 hover:bg-emerald-50"
                }`}
              >
                <Globe size={13} className={sourceFilter === "web" ? "text-emerald-200" : "text-emerald-600"} />
                <span>Web Enquiry</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  sourceFilter === "web" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {webCount}
                </span>
              </button>

              {/* 2. FACEBOOK ENQUIRY */}
              <button
                type="button"
                onClick={() => setSourceFilter("facebook")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  sourceFilter === "facebook"
                    ? "bg-[#1877F2] text-white shadow-xs"
                    : "text-[#1877F2] hover:bg-blue-50"
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook Enquiry</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  sourceFilter === "facebook" ? "bg-white/20 text-white" : "bg-blue-100 text-[#1877F2]"
                }`}>
                  {fbCount}
                </span>
              </button>

              {/* 3. INSTAGRAM ENQUIRY */}
              <button
                type="button"
                onClick={() => setSourceFilter("instagram")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  sourceFilter === "instagram"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs"
                    : "text-pink-700 hover:bg-pink-50"
                }`}
              >
                <Instagram size={13} className={sourceFilter === "instagram" ? "text-pink-200" : "text-pink-600"} />
                <span>Instagram Enquiry</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  sourceFilter === "instagram" ? "bg-white/20 text-white" : "bg-pink-100 text-pink-700"
                }`}>
                  {igCount}
                </span>
              </button>
            </div>
            {filteredVisitors.length === 0 ? (
              <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#1B5E4F] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">No Enquiries Found</h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  {searchTerm
                    ? "No enquiries match your search query."
                    : "Enquiries from interested buyers and tenants will appear here as soon as they submit an inquiry or click contact options."}
                </p>
              </div>
            ) : (
              filteredVisitors.map((v, i) => {
                const waText = encodeURIComponent(
                  `Hi ${v.visitorName}, thank you for your enquiry on "${v.propertyTitle}" listed on Aira Properties! How can I help you?`
                );
                const isClickAction = v.message?.startsWith("Clicked ");

                return (
                  <div 
                    key={v.enquiryId || `visitor-${i}`} 
                    className="bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col gap-4"
                  >
                    {/* Top Row: Lead Avatar + Name + Timestamp + Type Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-sm flex items-center justify-center border border-emerald-200 shrink-0">
                          {v.visitorName ? v.visitorName.charAt(0).toUpperCase() : "V"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-bold text-sm text-gray-900 truncate ${v.isLocked ? "filter blur-[4px] select-none" : ""}`}>
                              {v.visitorName || "Prospective Buyer"}
                            </h4>
                            {v.isLocked ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full">
                                <Lock size={9} /> Locked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <UserCheck size={9} /> Verified Lead
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5 font-medium">
                            <Clock size={11} />
                            <span>{formatDateTime(v.enquiredAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Enquiry Type & Platform Source Badge */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {v.source === "facebook" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1877F2] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                            <svg className="w-3 h-3 fill-[#1877F2]" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span>Facebook Comment</span>
                          </span>
                        ) : v.source === "instagram" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-full">
                            <Instagram size={11} className="text-pink-600" />
                            <span>Instagram Enquiry</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            isClickAction
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}>
                            <Globe size={10} className="text-emerald-600" />
                            <span>{isClickAction ? "Contact Click" : "Web Enquiry"}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Property Strip (Image + Title + Price) */}
                    <div 
                      onClick={() => v.propertyId && navigate(`/property/${v.propertyId}`)}
                      className="flex items-center gap-3 p-3 bg-gray-50/80 hover:bg-gray-100/80 rounded-xl border border-gray-100 cursor-pointer transition-colors group"
                    >
                      <img
                        src={v.propertyImage ? mediaUrl(v.propertyImage) : FALLBACK_IMAGE}
                        alt={v.propertyTitle}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Listing Reference
                        </span>
                        <h5 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                          {v.propertyTitle}
                        </h5>
                      </div>
                      {v.propertyPrice ? (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-gray-900 block">
                            {formatPrice(v.propertyPrice)}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Enquiry Message Content */}
                    {v.message && (
                      <div className="p-3.5 bg-[#FAF8F3] border border-gray-200/70 rounded-xl flex items-start gap-2.5">
                        <MessageSquare size={14} className="text-[#1B5E4F] shrink-0 mt-0.5" />
                        <div className="text-xs text-gray-800 leading-relaxed font-medium">
                          {v.isLocked ? (
                            <span className="italic text-gray-400">Enquiry message hidden. Top up tokens to view.</span>
                          ) : (
                            <span>"{v.message}"</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Facebook Reply Input — always show for Facebook source enquiries when not locked */}
                    {v.source === "facebook" && !v.isLocked && (() => {
                      const cid = String(v.externalId || v.enquiryId || i);
                      const text = fbReplyText[cid] || "";
                      const sending = !!fbReplySending[cid];
                      const sent = !!fbReplySent[cid];
                      const replyError = fbReplyError[cid] || "";
                      return (
                        <div className="mt-1 flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1877F2]">
                            <CornerDownRight size={12} className="text-[#1877F2]" />
                            <span>Reply on Facebook</span>
                          </div>
                          <div className="flex items-stretch gap-2">
                            <input
                              type="text"
                              value={text}
                              onChange={e => setReplyText(cid, e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter" && !sending) handleFbReply(cid); }}
                              disabled={sending || sent}
                              placeholder="Write a reply to this comment…"
                              className="flex-1 px-3 py-2 bg-blue-50 border border-blue-200 focus:border-[#1877F2] rounded-xl text-xs outline-none transition font-medium placeholder:text-blue-300 disabled:opacity-60"
                            />
                            <button
                              onClick={() => handleFbReply(cid)}
                              disabled={sending || sent || !text.trim()}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                sent
                                  ? "bg-emerald-500 text-white"
                                  : "bg-[#1877F2] hover:bg-[#1565d8] text-white shadow-xs"
                              }`}
                            >
                              {sending ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : sent ? (
                                <>
                                  <Check size={13} className="stroke-[3]" />
                                  <span>Sent!</span>
                                </>
                              ) : (
                                <>
                                  <Send size={12} />
                                  <span>Reply</span>
                                </>
                              )}
                            </button>
                          </div>
                          {replyError && (
                            <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                              <AlertCircle size={11} />
                              {replyError}
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Contact Details & Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 mt-1">
                      {/* Left: Contact Info */}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {v.visitorPhone && (
                          <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                            <Phone size={13} className="text-gray-400" />
                            <span className={v.isLocked ? "filter blur-[4px] select-none" : ""}>
                              {v.isLocked ? "+91 XXXXX XXXXX" : v.visitorPhone}
                            </span>
                            {!v.isLocked && (
                              <button
                                onClick={() => handleCopy(v.enquiryId || i, v.visitorPhone)}
                                title="Copy phone"
                                className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
                              >
                                {copiedId === (v.enquiryId || i) ? (
                                  <Check size={12} className="text-emerald-600 stroke-[3]" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        {v.visitorEmail && (
                          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                            <Mail size={13} className="text-gray-400" />
                            <span className={v.isLocked ? "filter blur-[4px] select-none" : ""}>
                              {v.isLocked ? "locked@airaproperties.com" : v.visitorEmail}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {v.isLocked ? (
                          <button
                            onClick={() => setShowPaywall(true)}
                            className="w-full sm:w-auto py-2.5 px-4 bg-[#1B5E4F] hover:bg-[#14483d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Lock size={13} />
                            <span>Unlock Lead Contact</span>
                          </button>
                        ) : (
                          <>
                            {v.visitorPhone && (
                              <a
                                href={`tel:${v.visitorPhone}`}
                                className="flex-1 sm:flex-initial py-2.5 px-4 bg-[#1B5E4F] hover:bg-[#14483d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <Phone size={13} />
                                <span>Call Lead</span>
                              </a>
                            )}

                            {v.visitorPhone && (
                              <a
                                href={`https://wa.me/${v.visitorPhone.replace(/\D/g, "")}?text=${waText}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 sm:flex-initial py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                              >
                                <MessageCircle size={14} />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: MY SENT ENQUIRIES */}
        {!loading && activeTab === "sent" && (
          <div className="flex flex-col gap-4">
            {filteredSent.length === 0 ? (
              <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">No Sent Enquiries</h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  You haven't enquired on any properties yet. Browse properties and send inquiries to contact sellers directly.
                </p>
                <button
                  onClick={() => navigate("/search")}
                  className="mt-2 px-4 py-2 bg-[#1B5E4F] hover:bg-[#14483d] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Explore Properties
                </button>
              </div>
            ) : (
              filteredSent.map((s, idx) => {
                const sellerContact = s.sellerPhone || s.sellerWhatsapp;
                const waText = encodeURIComponent(
                  `Hi ${s.sellerName}, I sent an enquiry regarding "${s.propertyTitle}" via Aira Properties and would love to follow up.`
                );

                return (
                  <div
                    key={s.enquiryId || `sent-${idx}`}
                    className="bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col gap-4"
                  >
                    {/* Top Row: Property Reference & Timestamp */}
                    <div className="flex items-start justify-between gap-3">
                      <div 
                        onClick={() => navigate(`/property/${s.propertyId}`)}
                        className="flex items-center gap-3 cursor-pointer group min-w-0"
                      >
                        <img
                          src={s.propertyImage ? mediaUrl(s.propertyImage) : FALLBACK_IMAGE}
                          alt={s.propertyTitle}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            Enquiry Sent
                          </span>
                          <h4 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                            {s.propertyTitle}
                          </h4>
                          <p className="text-xs font-black text-gray-800 mt-0.5">
                            {formatPrice(s.propertyPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-semibold text-gray-400 block">
                          {formatDateTime(s.enquiredAt)}
                        </span>
                      </div>
                    </div>

                    {/* Message You Sent */}
                    {s.message && (
                      <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-start gap-2.5">
                        <MessageSquare size={14} className="text-gray-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-gray-700 leading-relaxed font-medium">
                          <span className="font-bold text-gray-900 block mb-0.5 text-[11px]">Your Message:</span>
                          "{s.message}"
                        </div>
                      </div>
                    )}

                    {/* Seller Details & Contact Followup */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <div className="text-xs text-gray-600 font-medium">
                        <span className="text-gray-400">Seller: </span>
                        <strong className="text-gray-900">{s.sellerName}</strong>
                        {sellerContact && (
                          <span className="text-gray-500 ml-2 font-mono">({sellerContact})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {sellerContact && (
                          <a
                            href={`tel:${sellerContact}`}
                            className="py-2 px-3.5 bg-[#1B5E4F] hover:bg-[#14483d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Phone size={12} />
                            <span>Call Seller</span>
                          </a>
                        )}

                        {sellerContact && (
                          <a
                            href={`https://wa.me/${sellerContact.replace(/\D/g, "")}?text=${waText}`}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <button
                          onClick={() => navigate(`/property/${s.propertyId}`)}
                          className="py-2 px-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          View Listing
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Paywall Modal */}
      {showPaywall && (
        <SubscriptionPaywallModal
          initialPlanType={isBrokerOrAgency ? "listing_slots" : "enquiry_pack"}
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            setShowPaywall(false);
            loadData();
          }}
        />
      )}

      {/* Responsive Footer Navigation */}
      {isDesktop ? (
        <DesktopFooter />
      ) : (
        <BottomNav />
      )}
    </div>
  );
}
