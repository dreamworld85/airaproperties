import { useEffect, useState } from "react";
import { Sparkles, Save, Users, Coins, Layers, Home, Trash2, CheckCircle2, XCircle, Power } from "lucide-react";
import { api, ApiSubscriptionPlan } from "@/lib/api";

interface PlanConfig {
  id?: number;
  plan_id?: string;
  name?: string;
  role: "user" | "owner" | "broker" | "agency" | "builder";
  plan_type: string;
  credits: number;
  listing_slots: number;
  enquiry_tokens: number;
  price: number;
  discount: number;
  description: string;
  features: string[];
  is_active?: number;
}

export default function Subscriptions() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [stats, setStats] = useState<{ user: number; owner: number; broker: number; agency: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"user" | "owner" | "broker" | "agency" | "builder">("user");

  async function loadData() {
    try {
      const [plansData, statsData] = await Promise.all([
        api.fetchSubscriptionPlans(),
        (api as any).adminFetchSubscriptionStats(),
      ]);

      setPlans(
        plansData.map((p: any) => {
          let parsedFeatures: string[] = [];
          try {
            if (p.features) {
              parsedFeatures = typeof p.features === 'string' ? JSON.parse(p.features) : p.features;
            }
          } catch (e) {
            console.error("Failed to parse features:", e);
          }
          return {
            id: p.id,
            plan_id: p.plan_id || "",
            name: p.name || "",
            role: p.role,
            plan_type: p.plan_type || "combo",
            credits: Number(p.credits || 0),
            listing_slots: Number(p.listing_slots ?? (p.plan_type === 'listing_slots' ? p.credits : 0)),
            enquiry_tokens: Number(p.enquiry_tokens ?? (p.plan_type === 'enquiry_pack' ? p.credits : 0)),
            price: Number(p.price),
            discount: Number(p.discount || 0),
            description: p.description || "",
            features: Array.isArray(parsedFeatures) ? parsedFeatures : [],
            is_active: p.is_active !== undefined ? Number(p.is_active) : 1,
          };
        })
      );
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load subscription configuration.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdatePlans = async () => {
    setSaving(true);
    try {
      await api.adminUpdateSubscriptionPlans(plans);
      alert("Unified packages, slot capacity, tokens, and pricing updated successfully!");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update subscription plans");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePlan = async (targetPlan: PlanConfig) => {
    const planKey = targetPlan.id || targetPlan.plan_id;
    if (!planKey) return;
    const currentActive = targetPlan.is_active !== 0;
    const nextActive = currentActive ? 0 : 1;
    // Optimistic state update
    setPlans(prev => prev.map(p => (p.id === targetPlan.id || p.plan_id === targetPlan.plan_id) ? { ...p, is_active: nextActive } : p));
    try {
      const res = await (api as any).adminToggleSubscriptionPlan(planKey);
      if (res && res.is_active !== undefined) {
        setPlans(prev => prev.map(p => (p.id === targetPlan.id || p.plan_id === targetPlan.plan_id) ? { ...p, is_active: res.is_active } : p));
      }
    } catch (err: any) {
      alert(err.message || "Failed to toggle plan status.");
      loadData();
    }
  };

  const handleToggleAllBossPlans = async (enable: boolean) => {
    setSaving(true);
    try {
      await (api as any).adminToggleBossPlans(enable);
      setPlans(prev => prev.map(p => p.role === "builder" ? { ...p, is_active: enable ? 1 : 0 } : p));
      alert(`All Boss Builder plans have been ${enable ? "Enabled" : "Disabled"}.`);
    } catch (err: any) {
      alert(err.message || "Failed to toggle all boss plans.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-sm text-slate">Loading subscription configurations...</p>;
  }

  if (error) {
    return <p className="p-6 text-sm text-coral font-bold">{error}</p>;
  }

  const totalSubscribers = stats ? (stats.user || 0) + (stats.owner || 0) + (stats.broker || 0) + (stats.agency || 0) : 0;

  const tabs: { role: "user" | "owner" | "broker" | "agency" | "builder"; label: string; sub: string }[] = [
    { role: "user", label: "Seeker / Buyer", sub: "User Combos" },
    { role: "owner", label: "Owner", sub: "Owner Combos" },
    { role: "broker", label: "Broker", sub: "Broker Combos" },
    { role: "agency", label: "Agency", sub: "Agency Combos" },
    { role: "builder", label: "Builders (Boss Plans)", sub: "Launchpad / Elite / Enterprise" },
  ];

  const currentPlans = plans
    .filter((p) => p.role === activeTab)
    .sort((a, b) => a.price - b.price);

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-black">Unified Packages & Credits</h1>
          <p className="text-xs text-slate mt-0.5">
            Configure all-in-one packages. Each package includes both reusable active listing slots and enquiry tokens.
          </p>
        </div>
        <button
          onClick={handleUpdatePlans}
          disabled={saving}
          className="mt-3 md:mt-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-display shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Save size={14} />
          {saving ? "Saving Changes..." : "Save All Packages"}
        </button>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-charcoal/5 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
            <Coins size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Credit Model</span>
            <h3 className="font-display font-extrabold text-xl text-ink mt-0.5">Unified Combos</h3>
          </div>
        </div>

        <div className="bg-white border border-charcoal/5 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Package Contents</span>
            <h3 className="font-display font-extrabold text-xl text-emerald-600 mt-0.5">Slots + Tokens</h3>
          </div>
        </div>

        <div className="bg-white border border-charcoal/5 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Registered Base</span>
            <h3 className="font-display font-extrabold text-xl text-ink mt-0.5 font-sans">{totalSubscribers} Users</h3>
          </div>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const selected = activeTab === tab.role;
          return (
            <button
              key={tab.role}
              onClick={() => setActiveTab(tab.role)}
              className={`pb-3.5 px-4 font-display font-bold text-xs border-b-2 transition-all relative shrink-0 cursor-pointer ${
                selected 
                  ? "border-emerald-600 text-emerald-600" 
                  : "border-transparent text-slate/85 hover:text-charcoal"
              }`}
            >
              <span>{tab.label}</span>
              <span className="block text-[9px] text-slate/60 font-semibold">{tab.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Boss Plans Master Visibility Banner (Shown when Builder Tab is active) */}
      {activeTab === "builder" && (
        <div className="bg-gradient-to-r from-[#0F2922] via-[#1B5E4F] to-[#2D7A68] rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-emerald-200 px-2.5 py-0.5 rounded-full">
                Boss Plans Master Visibility
              </span>
              <span className="text-[10px] text-emerald-200 font-bold">
                {currentPlans.filter(p => p.is_active !== 0).length} of {currentPlans.length} Active
              </span>
            </div>
            <h3 className="text-lg font-black font-display text-white">
              Builder / Developer Flagship Packages
            </h3>
            <p className="text-xs text-emerald-100 max-w-xl">
              Enable or disable builder packages (Launchpad, Elite Showcase, Enterprise Conglomerate) from appearing on the client-facing Services page.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleToggleAllBossPlans(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Enable All Boss Plans</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleAllBossPlans(false)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white/10 hover:bg-red-600 hover:text-white text-white font-bold text-xs rounded-xl border border-white/20 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <XCircle size={14} />
              <span>Disable All</span>
            </button>
          </div>
        </div>
      )}

      {/* Plans Config Cards Grid for selected Tab */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate/60 uppercase tracking-widest">
            {activeTab.toUpperCase()} Packages ({currentPlans.length} packages)
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-500/10">
            Combined Slots + Tokens
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPlans.map((plan) => {
            const finalPrice = Math.max(0, plan.price - plan.discount);
            const isActive = plan.is_active !== 0;

            return (
              <div 
                key={plan.id || plan.plan_id} 
                className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 ${
                  isActive ? "border-charcoal/10" : "border-red-200/80 bg-red-50/10 opacity-90"
                }`}
              >
                {/* Active / Inactive Status Toggle Bar */}
                <div className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  isActive 
                    ? "bg-emerald-50/80 border-emerald-200/80" 
                    : "bg-red-50/80 border-red-200/80"
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-emerald-500 shadow-sm" : "bg-red-500"}`} />
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider block ${isActive ? "text-emerald-800" : "text-red-700"}`}>
                        {isActive ? "Active (Live on App)" : "Disabled (Hidden)"}
                      </span>
                      <span className="text-[9px] text-gray-500 font-medium">
                        {isActive ? "Visible to users" : "Hidden from checkout & services"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePlan(plan)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? "bg-white hover:bg-red-50 text-red-600 border border-red-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <Power size={11} />
                    <span>{isActive ? "Disable" : "Enable"}</span>
                  </button>
                </div>

                {/* Card Header & Name Input */}
                <div className="border-b border-charcoal/5 pb-3 flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate uppercase tracking-wider block mb-1">
                      Package Name
                    </label>
                    <input
                      type="text"
                      value={plan.name || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPlans((prev) => prev.map(p => p.id === plan.id ? { ...p, name: val } : p));
                      }}
                      placeholder="e.g. Starter Pack"
                      className="w-full border border-charcoal/10 rounded-xl px-2.5 py-1.5 text-xs text-charcoal outline-none bg-slate-50 focus:bg-white focus:border-emerald-600 transition-all font-bold"
                    />
                  </div>
                  <span className="px-2 py-1 rounded-full text-[9px] font-extrabold uppercase shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200 mt-5">
                    {plan.role === "builder" ? "Boss Pack" : "Combo"}
                  </span>
                </div>

                {/* Listing Slots & Enquiry Tokens Dual Inputs */}
                <div className="grid grid-cols-2 gap-2.5 bg-[#FAF8F3] p-3 rounded-2xl border border-gray-200/60">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#1B5E4F] uppercase tracking-wider flex items-center gap-1">
                      <Home size={11} /> Listing Slots
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={plan.listing_slots}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setPlans((prev) => prev.map(p => p.id === plan.id ? { ...p, listing_slots: val } : p));
                      }}
                      className="w-full border border-charcoal/10 rounded-xl px-2.5 py-2 text-xs text-charcoal outline-none bg-white focus:border-emerald-600 transition-all font-extrabold text-center"
                    />
                    <span className="text-[9px] text-gray-500 text-center font-medium">Reusable capacity</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                      <Coins size={11} /> Enquiry Tokens
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={plan.enquiry_tokens}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setPlans((prev) => prev.map(p => p.id === plan.id ? { ...p, enquiry_tokens: val, credits: val } : p));
                      }}
                      className="w-full border border-charcoal/10 rounded-xl px-2.5 py-2 text-xs text-charcoal outline-none bg-white focus:border-emerald-600 transition-all font-extrabold text-center"
                    />
                    <span className="text-[9px] text-gray-500 text-center font-medium">Contact reveals</span>
                  </div>
                </div>

                {/* Price and Discount inputs */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate uppercase tracking-wider">Price (₹)</label>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPlans((prev) => prev.map(p => p.id === plan.id ? { ...p, price: val } : p));
                      }}
                      className="w-full border border-charcoal/10 rounded-xl px-2.5 py-2 text-xs text-charcoal outline-none bg-slate-50 focus:bg-white focus:border-emerald-600 transition-all font-bold text-center"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate uppercase tracking-wider">Discount (₹)</label>
                    <input
                      type="number"
                      value={plan.discount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPlans((prev) => prev.map(p => p.id === plan.id ? { ...p, discount: val } : p));
                      }}
                      className="w-full border border-charcoal/10 rounded-xl px-2.5 py-2 text-xs text-charcoal outline-none bg-slate-50 focus:bg-white focus:border-emerald-600 transition-all font-bold text-center"
                    />
                  </div>
                </div>

                {/* Payable summary check */}
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-2xl border border-charcoal/4">
                  <span className="text-[10px] text-slate font-semibold">Payable at Checkout:</span>
                  <span className="font-display font-extrabold text-xs text-emerald-600">₹{finalPrice}</span>
                </div>

                {/* Marketing description */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate uppercase tracking-wider">Offer Banner / Description</label>
                  <textarea
                    rows={2}
                    value={plan.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlans((prev) => prev.map(p => p.id === plan.id ? { ...p, description: val } : p));
                    }}
                    placeholder="Short description displayed on cards..."
                    className="w-full border border-charcoal/10 rounded-xl px-3 py-2 text-xs text-charcoal outline-none bg-slate-50 focus:bg-white focus:border-emerald-600 transition-all leading-relaxed font-medium"
                  />
                </div>

                {/* Dynamic features editor */}
                <div className="flex flex-col gap-2 mt-1 border-t border-charcoal/5 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate/60 uppercase tracking-widest">Bullet Points</span>
                    <button
                      onClick={() => {
                        setPlans((prev) => prev.map(p => {
                          if (p.id !== plan.id) return p;
                          return { ...p, features: [...(p.features || []), ""] };
                        }));
                      }}
                      className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-all border border-emerald-500/10 cursor-pointer"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPlans((prev) => prev.map(p => {
                              if (p.id !== plan.id) return p;
                              const nextFeats = [...p.features];
                              nextFeats[fIdx] = val;
                              return { ...p, features: nextFeats };
                            }));
                          }}
                          className="flex-1 border border-charcoal/10 rounded-lg px-2 py-1 text-[11px] text-charcoal outline-none bg-slate-50 focus:bg-white focus:border-emerald-600"
                        />
                        <button
                          onClick={() => {
                            setPlans((prev) => prev.map(p => {
                              if (p.id !== plan.id) return p;
                              return { ...p, features: p.features.filter((_, idx) => idx !== fIdx) };
                            }));
                          }}
                          className="text-slate/40 hover:text-coral transition-colors p-1"
                          title="Remove feature"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
