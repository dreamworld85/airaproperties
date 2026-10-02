import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import DesktopHeader from "../components/DesktopHeader";
import DesktopFooter from "../components/DesktopFooter";
import { useAuth } from "../lib/AuthContext";
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Coins,
  Home,
  Award,
  ArrowRight,
  History,
  Layers,
  Zap,
  UserCheck,
} from "lucide-react";
import SubscriptionPaywallModal from "../components/SubscriptionPaywallModal";
import { api, ApiSubscriptionPlan } from "../lib/api";

export default function SubscriptionDetails() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<any>(null);
  const [plans, setPlans] = useState<ApiSubscriptionPlan[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const userRole = (user?.role || "user").toLowerCase();
  const [activeTab, setActiveTab] = useState<"packages" | "history">("packages");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadData = () => {
    api.fetchSubscriptionPlans()
      .then((data) => {
        const mapped = data.map((p: any) => {
          let parsedFeatures: string[] = [];
          try {
            if (p.features) {
              parsedFeatures = typeof p.features === "string" ? JSON.parse(p.features) : p.features;
            }
          } catch (e) {
            console.error(e);
          }
          return {
            id: p.id,
            plan_id: p.plan_id,
            name: p.name || "",
            role: (p.role || "").toLowerCase(),
            plan_type: p.plan_type || "combo",
            credits: Number(p.credits || 10),
            listing_slots: Number(p.listing_slots ?? (p.plan_type === 'listing_slots' ? p.credits : 0)),
            enquiry_tokens: Number(p.enquiry_tokens ?? (p.plan_type === 'enquiry_pack' ? p.credits : 0)),
            price: Number(p.price),
            discount: Number(p.discount || 0),
            description: p.description || "",
            duration_months: p.duration_months || 0,
            features: Array.isArray(parsedFeatures) ? parsedFeatures : [],
          };
        });
        setPlans(mapped);
      })
      .catch((err) => console.error("Failed to fetch plans:", err));

    api.fetchCreditTransactions()
      .then((txs) => setTransactions(txs || []))
      .catch((err) => console.error("Failed to fetch transactions:", err));
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleTopUpSuccess = () => {
    setShowCheckout(false);
    setSelectedPlanForCheckout(null);
    api.getProfile().then((updatedUser: any) => {
      login(localStorage.getItem("kr_token") || "", updatedUser);
      loadData();
    });
  };

  const handleBuyPlan = (plan: any) => {
    setSelectedPlanForCheckout(plan);
    setShowCheckout(true);
  };

  // Strictly filter only packages matching this user's profile role
  const profilePlans = plans
    .filter((p) => p.role === userRole)
    .sort((a, b) => Number(a.price) - Number(b.price));

  const roleMeta: Record<string, { label: string; heroTitle: string; subtitle: string }> = {
    user: {
      label: "Buyer / Tenant",
      heroTitle: "Buyer & Tenant Packages",
      subtitle: "Tailored for property seekers. Unlocks direct owner & broker contacts, plus includes active listing slots.",
    },
    owner: {
      label: "Property Owner",
      heroTitle: "Property Owner Packages",
      subtitle: "Tailored for individual owners. Manage active property listings with reusable slots and get contact tokens.",
    },
    broker: {
      label: "Real Estate Broker",
      heroTitle: "Broker Professional Packages",
      subtitle: "Tailored for licensed brokers. Higher concurrent listing slots and direct contact tokens with zero expiration.",
    },
    agency: {
      label: "Real Estate Agency",
      heroTitle: "Agency Enterprise Packages",
      subtitle: "Tailored for property firms. Maximum concurrent listing capacity and high-volume enquiry tokens.",
    },
  };

  const currentRoleInfo = roleMeta[userRole] || roleMeta.user;

  return (
    <div className="min-h-screen bg-[#FAF8F3] w-full flex flex-col font-sans relative overflow-x-hidden">
      {/* Header */}
      {isDesktop ? <DesktopHeader /> : <Header title="Credits & Packages" showBack />}

      {/* Main Content */}
      <main className={isDesktop ? "max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8 flex-1" : "p-5 flex flex-col gap-5 pb-28 flex-1"}>
        
        {/* Profile Role Hero Section */}
        <div className="text-center space-y-3 py-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#1B5E4F] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-100">
            <UserCheck size={13} className="text-[#1B5E4F]" />
            <span>Profile Role: {user?.role || "User"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-display">
            {currentRoleInfo.heroTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            {currentRoleInfo.subtitle} Every plan includes both <strong>reusable Active Listing Slots</strong> and <strong>Enquiry Tokens</strong> that never expire!
          </p>
        </div>

        {/* Current Balances Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Enquiry Tokens Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-xs">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    Contact Access Wallet
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-900 font-display">
                    Enquiry Tokens
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-ink font-display">
                  {user?.enquiryCreditsLeft ?? 0}
                </span>
                <span className="text-[11px] font-bold text-slate block">Tokens Left</span>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              Each token unlocks 1 direct owner/broker phone and WhatsApp contact. Unlocked contacts remain permanently accessible at no additional cost.
            </p>

            <button
              onClick={() => {
                setSelectedPlanForCheckout(null);
                setShowCheckout(true);
              }}
              className="w-full py-2.5 bg-[#1B5E4F] hover:bg-[#14483d] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Top-Up Package</span>
            </button>
          </div>

          {/* Listing Slots Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#1B5E4F] flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    Active Capacity
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-900 font-display">
                    Active Listing Slots
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-ink font-display">
                  {user?.listingSlotsLeft ?? 0}
                </span>
                <span className="text-[11px] font-bold text-slate block">Slots Left</span>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              1 slot is consumed when you post an active property. When you mark it as Sold or Inactive, your slot is 100% credited back to reuse.
            </p>

            <button
              onClick={() => {
                setSelectedPlanForCheckout(null);
                setShowCheckout(true);
              }}
              className="w-full py-2.5 bg-ink hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Get More Listing Slots</span>
            </button>
          </div>
        </div>

        {/* View Toggle Bar (Only Packages for this role vs Transaction History) */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab("packages")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-display transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "packages"
                ? "bg-[#1B5E4F] text-white shadow-xs"
                : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Role Packages ({profilePlans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-display transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-[#1B5E4F] text-white shadow-xs"
                : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Transaction History</span>
          </button>
        </div>

        {/* Profile-Based Packages Grid */}
        {activeTab === "packages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 font-display">
                  Available Packages for {user?.role || "Your Account"}
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Showing packages exclusively curated for your registered role.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {profilePlans.map((planItem, idx) => {
                const finalPrice = Math.max(0, Number(planItem.price) - Number(planItem.discount || 0));
                const isPopular = idx === 1;

                return (
                  <div 
                    key={planItem.id || planItem.plan_id} 
                    className={`relative rounded-3xl p-6 border shadow-xs flex flex-col justify-between gap-6 transition-all duration-200 bg-white hover:shadow-md ${
                      isPopular 
                        ? "border-amber-400 ring-2 ring-amber-400/20 bg-gradient-to-b from-amber-50/20 to-white" 
                        : "border-gray-200"
                    }`}
                  >
                    {isPopular && (
                      <span className="absolute -top-3.5 right-6 z-10 bg-amber-400 text-gray-950 font-black text-[11px] px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-gray-950" /> Most Popular
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="border-b border-gray-100 pb-4 flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-lg text-gray-900 font-display">
                              {planItem.name || "Combo Plan"}
                            </h3>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {planItem.role}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-1 leading-snug">
                            {planItem.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-2xl sm:text-3xl font-black text-gray-900 font-display">₹{finalPrice}</span>
                          {Number(planItem.discount) > 0 && (
                            <span className="text-[10px] text-gray-400 line-through block">₹{planItem.price}</span>
                          )}
                        </div>
                      </div>

                      {/* Unified Dual Highlights Banner */}
                      <div className="grid grid-cols-2 gap-2 bg-[#FAF8F3] p-3 rounded-2xl border border-gray-200/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Home size={12} className="text-[#1B5E4F]" /> Listing Slots
                          </span>
                          <span className="text-lg font-black text-[#1B5E4F] font-display">
                            {planItem.listing_slots} Slots
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700">100% Reusable</span>
                        </div>

                        <div className="flex flex-col border-l border-gray-200 pl-3">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Coins size={12} className="text-amber-600" /> Enquiry Tokens
                          </span>
                          <span className="text-lg font-black text-amber-700 font-display">
                            {planItem.enquiry_tokens} Tokens
                          </span>
                          <span className="text-[10px] font-semibold text-amber-800">Never Expires</span>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2.5">
                        {(Array.isArray(planItem.features) ? planItem.features : []).map((feat: string, fIdx: number) => (
                          <div key={fIdx} className="flex items-start gap-2.5 text-xs text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-medium">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyPlan(planItem)}
                      className="w-full py-3 bg-[#1B5E4F] hover:bg-[#14483d] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Get Plan for ₹{finalPrice}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Transaction History */}
        {activeTab === "history" && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 font-display">
                Token & Slot Usage History
              </h2>
              <p className="text-xs text-gray-500">
                Log of all token purchases, contact reveals, listing slot consumptions, and slot refunds.
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate text-xs font-semibold">
                No credit transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3">Credit Type</th>
                      <th className="pb-3 px-3">Activity</th>
                      <th className="pb-3 px-3 text-right">Change</th>
                      <th className="pb-3 px-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => {
                      const isPositive = Number(tx.amount_credits) > 0;
                      const isEnquiry = tx.credit_type === "enquiry";
                      const dateStr = new Date(tx.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{dateStr}</td>
                          <td className="py-3 px-3 font-bold">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isEnquiry ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {isEnquiry ? <Coins size={11} /> : <Home size={11} />}
                              {isEnquiry ? "Enquiry Token" : "Listing Slot"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-800 font-medium">
                            {tx.notes || (tx.property_title ? `Property: ${tx.property_title}` : tx.transaction_type)}
                          </td>
                          <td className={`py-3 px-3 font-extrabold text-right ${
                            isPositive ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {isPositive ? `+${tx.amount_credits}` : tx.amount_credits}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-gray-900">
                            {tx.balance_after}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Security & Support Footer */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#1B5E4F] shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm text-gray-900">100% Transparent Package Policy</h4>
              <p className="text-xs text-gray-500">
                Purchased tokens never expire. Active listing slots return to your balance whenever properties sell or become inactive.
              </p>
            </div>
          </div>
          <Link
            to="/contact-us"
            className="text-xs font-bold text-[#1B5E4F] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Need Help or Custom Agency Tier?</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </main>

      {/* Paywall / Checkout Modal */}
      {showCheckout && (
        <SubscriptionPaywallModal
          onClose={() => {
            setShowCheckout(false);
            setSelectedPlanForCheckout(null);
          }}
          onSuccess={handleTopUpSuccess}
          initialPlanId={selectedPlanForCheckout?.id || selectedPlanForCheckout?.plan_id}
          targetRole={userRole}
        />
      )}

      {/* Footer / Mobile Nav */}
      {isDesktop ? <DesktopFooter /> : <BottomNav />}
    </div>
  );
}
