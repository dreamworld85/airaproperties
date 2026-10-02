import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Building2, 
  UserCheck, 
  Store, 
  ArrowRight, 
  PhoneCall, 
  CheckCircle2, 
  TrendingUp, 
  Building, 
  Award, 
  Sparkles, 
  ShieldCheck,
  Star,
  ChevronRight,
  X,
  Check,
  CreditCard,
  Coins,
  Layers,
  Zap,
  Phone,
  MessageCircle,
  ExternalLink,
  Users
} from "lucide-react";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/lib/AuthContext";
import RequestInformationModal from "@/components/RequestInformationModal";
import SubscriptionPaywallModal from "@/components/SubscriptionPaywallModal";
import { fetchAllSubscriptionPlans, ApiSubscriptionPlan } from "@/lib/api";

type ServiceTab = "Seekers" | "Owners" | "Dealers" | "Builders";

const BUILDER_BOSS_PLANS = [
  {
    plan_id: "builder_launchpad",
    name: "Builder Launchpad",
    role: "builder",
    subtitle: "10 Project Units + 150 High-Intent Buyer Leads. Ideal for boutique builders.",
    price: 9999,
    discount: 1000,
    finalPrice: 8999,
    duration_months: 12,
    enquiry_tokens: 150,
    listing_slots: 10,
    isPopular: false,
    features: [
      "Up to 10 Active Project Units / Layouts",
      "150 Verified High-Intent Buyer Leads",
      "Dedicated Builder Microsite Page",
      "Direct Inquiries to Builder WhatsApp & Email",
      "RERA Verification Badge on Projects",
      "Brochure Download & Floor Plan Showcase",
      "1 Year Validity with Dedicated Support"
    ]
  },
  {
    plan_id: "builder_elite",
    name: "Builder Elite Showcase",
    role: "builder",
    subtitle: "25 Project Units + 400 Buyer Leads + Featured Developer Spotlight across Kerala.",
    price: 24999,
    discount: 3000,
    finalPrice: 21999,
    duration_months: 12,
    enquiry_tokens: 400,
    listing_slots: 25,
    isPopular: true,
    features: [
      "Up to 25 Active Project Units / Towers",
      "400 Verified High-Intent Buyer Leads",
      "Prominent Developer Spotlight on Homepage & Search",
      "Custom Branded Builder Microsite with Video Walkthroughs",
      "Direct Lead Capture CRM Integration",
      "Priority Search Ranking Across Kerala",
      "Quarterly Investor Email & Push Notification Spotlight",
      "Dedicated Key Account Manager"
    ]
  },
  {
    plan_id: "builder_enterprise",
    name: "Builder Enterprise Conglomerate",
    role: "builder",
    subtitle: "100 Units + 1,200 High-Intent Leads + Full Platform Domination & Exclusive Banners.",
    price: 49999,
    discount: 5000,
    finalPrice: 44999,
    duration_months: 12,
    enquiry_tokens: 1200,
    listing_slots: 100,
    isPopular: false,
    features: [
      "100 Active Units Across Multiple Ongoing Projects",
      "1,200 Verified High-Intent Buyer Leads",
      "Permanent Top-Tier Developer Banner Placement",
      "Exclusive Full-Featured Microsite with Custom Domain Options",
      "Unlimited Floor Plan & 3D Walkthrough Embeds",
      "High-Priority NRI Investor Blast Campaigns",
      "Zero Expiration on Unused Lead Tokens",
      "24/7 VIP Executive Relationship Manager"
    ]
  }
];

const SERVICE_DETAILS: Record<string, { title: string; bullets: string[] }> = {
  Banners: {
    title: "Banners",
    bullets: [
      "Branding choices available across different pages such as home pages, search pages, project detail pages etc.",
      "Choose between different type of banner campaigns based on your target audience, required reach & impact, city, locality, budget and purchase preferences"
    ]
  },
  "Featured Listing": {
    title: "Featured Listing",
    bullets: [
      "First/second position in the search results page of a locality",
      "Distinction through different colour and \"Featured\" tag",
      "Custom options for Res/Comm, Buy/Rent, Locality",
      "Available for two advertisers per week per locality on first come first served basis"
    ]
  },
  "Featured Project": {
    title: "Featured Project",
    bullets: [
      "Extremely high visibility on Sparrows desktop & mobile home pages",
      "Ability to advertise special offers to a large audience",
      "Presence on Sparrows search with significant number of users in 'New Bookings' segment",
      "Unlimited slots and opportunity to promote on project pages",
      "Suitable for clients with large number of units to sell in a given project"
    ]
  },
  "Premium Plan": {
    title: "Premium Plan",
    bullets: [
      "Attract customers with bigger & better listing - Bigger and prominent display on search result page",
      "Generate more buyer/tenant interest in your listing by highlighting unique property features",
      "Win customers trust with 2x more free verifications - Customers are ~70-100% more likely to contact a verified listing"
    ]
  }
};

export default function Services() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ServiceTab>("Dealers");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  
  // Plans & Token state
  const [plans, setPlans] = useState<ApiSubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<ApiSubscriptionPlan | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Drawer popup state for Know More
  const [selectedServiceKey, setSelectedServiceKey] = useState<string | null>(null);

  // Callback modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestServiceName, setRequestServiceName] = useState("General Service");

  // Load plans from backend for dynamic checkout support
  useEffect(() => {
    async function loadPlansData() {
      try {
        const data = await fetchAllSubscriptionPlans();
        setPlans(data);
      } catch (err) {
        console.error("Failed to load subscription plans:", err);
      }
    }
    loadPlansData();
  }, []);

  // Responsive resize handler
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpenDrawer = (serviceKey: string) => {
    setSelectedServiceKey(serviceKey);
  };

  const handleCloseDrawer = () => {
    setSelectedServiceKey(null);
  };

  const handleGetCallback = (serviceTitle?: string) => {
    if (serviceTitle) setRequestServiceName(serviceTitle);
    else if (selectedServiceKey) setRequestServiceName(selectedServiceKey);
    else setRequestServiceName("General Service");

    setSelectedServiceKey(null);
    setIsRequestModalOpen(true);
  };

  // Combine default Boss plans with database records and strictly filter out disabled plans (is_active === 0)
  const displayBossPlans = BUILDER_BOSS_PLANS.map((bossPlan) => {
    const matchingDbPlan = plans.find((p) => p.plan_id === bossPlan.plan_id || (p.role === "builder" && p.name?.toLowerCase().includes(bossPlan.name.toLowerCase())));
    if (matchingDbPlan) {
      let parsedFeatures = bossPlan.features;
      if (matchingDbPlan.features) {
        try {
          parsedFeatures = typeof matchingDbPlan.features === "string" ? JSON.parse(matchingDbPlan.features) : matchingDbPlan.features;
        } catch (e) {}
      }
      return {
        ...bossPlan,
        id: matchingDbPlan.id,
        name: matchingDbPlan.name || bossPlan.name,
        price: Number(matchingDbPlan.price || bossPlan.price),
        discount: Number(matchingDbPlan.discount || bossPlan.discount),
        finalPrice: Math.max(0, Number(matchingDbPlan.price || bossPlan.price) - Number(matchingDbPlan.discount || bossPlan.discount)),
        enquiry_tokens: Number(matchingDbPlan.enquiry_tokens || bossPlan.enquiry_tokens),
        listing_slots: Number(matchingDbPlan.listing_slots || bossPlan.listing_slots),
        subtitle: matchingDbPlan.description || bossPlan.subtitle,
        features: Array.isArray(parsedFeatures) && parsedFeatures.length > 0 ? parsedFeatures : bossPlan.features,
        is_active: matchingDbPlan.is_active !== undefined ? (Number(matchingDbPlan.is_active) !== 0) : true,
      };
    }
    return {
      ...bossPlan,
      is_active: true
    };
  }).filter((plan) => plan.is_active);

  const handleChoosePlan = (bossPlan: any) => {
    const matchingApiPlan = plans.find((p) => p.plan_id === bossPlan.plan_id) || {
      id: bossPlan.id || 999,
      plan_id: bossPlan.plan_id,
      name: bossPlan.name,
      role: "builder",
      plan_type: "combo",
      credits: bossPlan.enquiry_tokens,
      listing_slots: bossPlan.listing_slots,
      enquiry_tokens: bossPlan.enquiry_tokens,
      price: bossPlan.price,
      discount: bossPlan.discount,
      description: bossPlan.subtitle,
      duration_months: bossPlan.duration_months,
      features: bossPlan.features,
      is_active: 1
    };
    setSelectedPlanForCheckout(matchingApiPlan as any);
    setIsPaywallOpen(true);
  };

  const activeService = selectedServiceKey ? SERVICE_DETAILS[selectedServiceKey] : null;

  return (
    <div className="min-h-screen bg-[#FAF8F3] w-full flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Header for Desktop */}
      <DesktopHeader />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-12">
        
        {/* Main Role Navigation Tabs (Seekers, Owners, Dealers, Builders) */}
        <div className="flex items-center justify-center">
          <div className="bg-white p-1.5 rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5 max-w-lg w-full overflow-x-auto">
            {(["Seekers", "Owners", "Dealers", "Builders"] as ServiceTab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center select-none whitespace-nowrap ${
                    isActive
                      ? "bg-[#1B5E4F] text-white shadow-md scale-[1.02]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab === "Seekers" ? "Property Seekers" : tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Hero Banner Image & BOSS Feature Callout */}
        <section className="flex flex-col items-center text-center gap-6">
          {/* Main Panoramic Hero Banner Image Card */}
          <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-3xl overflow-hidden shadow-md group">
            <img 
              src="/images/service_property.jpg" 
              alt="Real Estate Services Hero Banner" 
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay for Readable Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 flex flex-col justify-end p-6 sm:p-8 text-left">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-950/60 backdrop-blur-md border border-amber-400/30 px-3 py-1 rounded-full inline-block w-fit mb-2">
                GROW YOUR REAL ESTATE NETWORK
              </span>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-display drop-shadow-md">
                Plans & Services to Reach {activeTab === "Seekers" ? "Verified Properties & Owners" : activeTab}
              </h1>
              <p className="text-xs sm:text-sm text-gray-200 font-medium mt-1.5 max-w-xl leading-relaxed">
                Connect directly with thousands of verified property buyers, owners, brokers, and certified developers across Kerala with transparent token packs.
              </p>
            </div>
          </div>

          {/* BOSS Feature Callout Banner Box */}
          <div className="w-full bg-[#EEF7FF] border border-blue-150 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs text-left relative overflow-hidden">
            {/* Left Graphic Badge */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/90 border border-blue-100 shadow-sm flex flex-col items-center justify-center shrink-0 p-2 relative">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-xs mb-1">
                  👤
                </div>
                <div className="w-10 h-2 bg-blue-300 rounded-full mb-1" />
                <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
                <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-blue-400 opacity-60" />
                <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-amber-400 opacity-60" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-100/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  BROKER OWNER SUPPLY SOLUTION
                </span>
                <h3 className="text-xl font-black text-gray-900 font-display">
                  Introducing <span className="text-blue-600">BOSS</span> Token System
                </h3>
                <p className="text-xs text-gray-600 font-medium mt-1 max-w-md">
                  Unlock direct verified phone numbers and list concurrent properties with zero expiry and automatic token roll-over!
                </p>
              </div>
            </div>

            {/* Right Action Button */}
            <a
              href="#subscription-plans"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0078D4] hover:bg-[#0060B5] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-center shrink-0"
            >
              Explore Plans
            </a>
          </div>
        </section>

        {/* SECTION: MAIN BOSS BUILDER PLANS */}
        <section id="subscription-plans" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
              BUILDER & DEVELOPER PACKAGES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">
              Developer Showcase & Growth Plans
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Tailored flagship packages to launch your residential projects, capture high-intent NRI and local buyer leads, and establish statewide market presence.
            </p>
          </div>

          {/* Boss Plans Grid dynamically rendered based on Admin active toggle */}
          {displayBossPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch pt-2">
              {displayBossPlans.map((plan) => (
                <div
                  key={plan.plan_id}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all relative group hover:shadow-xl ${
                    plan.isPopular 
                      ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20" 
                      : "border-charcoal/10 shadow-xs"
                  }`}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-md whitespace-nowrap">
                      Most Popular Choice
                    </span>
                  )}

                  <div className="space-y-4">
                    {/* Plan Role & Name */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        BUILDER PACK
                      </span>
                      <h3 className="text-xl font-black font-display text-gray-900 mt-2">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed min-h-[36px]">
                        {plan.subtitle}
                      </p>
                    </div>

                    {/* Pricing Tag */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-gray-900 font-display">
                          ₹{plan.finalPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{plan.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          /12 mo
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                        Save ₹{plan.discount.toLocaleString("en-IN")} Package Discount
                      </span>
                    </div>

                    {/* Quota Highlights Box */}
                    <div className="bg-slate-50 border border-charcoal/5 rounded-2xl p-3 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-1">
                        <div className="font-black text-emerald-700 text-base">
                          {plan.enquiry_tokens}
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold">
                          Contact Reveals
                        </div>
                      </div>
                      <div className="p-1 border-l border-gray-200">
                        <div className="font-black text-blue-700 text-base">
                          {plan.listing_slots}
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold">
                          Active Postings
                        </div>
                      </div>
                    </div>

                    {/* Features Checklist */}
                    <div className="space-y-2 pt-2">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-gray-600">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Button - Prominent Choose Button on every plan */}
                  <div className="pt-5 mt-4 border-t border-gray-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleChoosePlan(plan)}
                      className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CreditCard size={15} />
                      <span>Choose Plan</span>
                    </button>

                    <Link
                      to={`/partner-with-us?package=${encodeURIComponent(plan.name)}`}
                      className="text-[11px] text-center font-bold text-emerald-700 hover:underline inline-flex items-center justify-center gap-1 mt-0.5"
                    >
                      <span>Apply for Dedicated Showcase Page</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-gray-300 text-center max-w-lg mx-auto my-6 space-y-3">
              <Building2 className="w-12 h-12 text-emerald-700 mx-auto" />
              <h3 className="font-black text-gray-900 text-base">Builder Packages Under Tailored Review</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Direct builder subscription packages are currently being updated. Please contact our builder desk or submit a custom inquiry to get our tailored rates.
              </p>
              <Link
                to="/partner-with-us"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all"
              >
                <span>Partner With Us / Request Custom Quote</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>

        {/* PROMINENT BUILDER PARTNER CALLOUT */}
        <section className="bg-gradient-to-r from-[#0F2922] via-[#1B5E4F] to-[#2D7A68] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/15 inline-block">
              BUILDER & CONSTRUCTOR ONBOARDING
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
              Are You a Builder or Real Estate Developer in Kerala?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium">
              List your ongoing, upcoming, and completed residential towers and luxury villas. Get your own dedicated developer microsite, verified buyer inquiries, and RERA certification spotlights.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/partner-with-us"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
            >
              <Building2 size={16} />
              <span>Partner With Us</span>
            </Link>

            <Link
              to="/builder-preview"
              className="w-full sm:w-auto px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Demo Microsite</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </section>

        {/* Section 2: Other Services for [Role] (2x2 Color Box Grid) */}
        <section className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">
              Other Services for {activeTab === "Seekers" ? "Buyers & Renters" : activeTab}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              with our curated promotion & verification solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Banners */}
            <div 
              onClick={() => handleOpenDrawer("Banners")}
              className="bg-[#FFF8EC] border border-[#FDE6BA] rounded-3xl p-6 sm:p-8 flex items-start justify-between gap-4 shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer select-none"
            >
              <div className="flex-1 space-y-3 z-10">
                <h3 className="text-lg font-bold text-gray-900 font-display">Banners</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Get your brand noticed by property buyers by securing high-impact brand space across Kerala search feeds.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDrawer("Banners");
                  }}
                  className="text-[#0078D4] font-bold text-xs hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Know More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-amber-100/60 border border-amber-200/80 flex flex-col items-center justify-center shrink-0 p-3 relative group-hover:scale-105 transition-transform">
                <div className="w-16 h-12 bg-amber-400 rounded-lg flex items-center justify-center shadow-xs">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div className="w-3 h-6 bg-amber-600/70 mt-1 rounded-sm" />
              </div>
            </div>

            {/* Card 2: Featured Listing */}
            <div 
              onClick={() => handleOpenDrawer("Featured Listing")}
              className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-3xl p-6 sm:p-8 flex items-start justify-between gap-4 shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer select-none"
            >
              <div className="flex-1 space-y-3 z-10">
                <h3 className="text-lg font-bold text-gray-900 font-display">Featured Listing</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Provides guaranteed prominence and exposure at the very top of locality search feeds.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDrawer("Featured Listing");
                  }}
                  className="text-[#0078D4] font-bold text-xs hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Know More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-sky-100/60 border border-sky-200/80 flex items-center justify-center shrink-0 p-3 relative group-hover:scale-105 transition-transform">
                <div className="w-20 h-16 bg-white rounded-xl shadow-sm border border-sky-200 p-2 relative flex flex-col justify-between">
                  <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="w-12 h-1.5 bg-sky-500 rounded-full" />
                    <div className="w-8 h-1 bg-sky-200 rounded-full" />
                  </div>
                  <span className="absolute top-2 right-2 text-[7px] font-bold bg-sky-600 text-white px-1.5 py-0.5 rounded">
                    Featured
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Featured Project */}
            <div 
              onClick={() => handleOpenDrawer("Featured Project")}
              className="bg-[#FFF5E6] border border-[#FFD8A8] rounded-3xl p-6 sm:p-8 flex items-start justify-between gap-4 shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer select-none"
            >
              <div className="flex-1 space-y-3 z-10">
                <h3 className="text-lg font-bold text-gray-900 font-display">Featured Project</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Recommended for getting primary booking buyer leads for multi-tower projects.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDrawer("Featured Project");
                  }}
                  className="text-[#0078D4] font-bold text-xs hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Know More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-orange-100/60 border border-orange-200/80 flex flex-col items-center justify-end shrink-0 p-2 relative group-hover:scale-105 transition-transform">
                <div className="w-14 h-20 bg-orange-400 rounded-t-xl p-1.5 flex flex-col items-center justify-between shadow-xs">
                  <Star className="w-4 h-4 fill-white text-white mt-1" />
                  <div className="grid grid-cols-2 gap-1 w-full px-1">
                    <div className="h-1.5 bg-white/70 rounded-xs" />
                    <div className="h-1.5 bg-white/70 rounded-xs" />
                    <div className="h-1.5 bg-white/70 rounded-xs" />
                    <div className="h-1.5 bg-white/70 rounded-xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Premium Plan */}
            <div 
              onClick={() => handleOpenDrawer("Premium Plan")}
              className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-3xl p-6 sm:p-8 flex items-start justify-between gap-4 shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer select-none"
            >
              <div className="flex-1 space-y-3 z-10">
                <h3 className="text-lg font-bold text-gray-900 font-display">Premium Plan</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Highlight unique property features with larger search placement and verified badges.
                </p>
                <div className="text-xs font-extrabold text-blue-700">₹899 Onwards</div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDrawer("Premium Plan");
                  }}
                  className="text-[#0078D4] font-bold text-xs hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Know More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-blue-100/60 border border-blue-200/80 flex items-center justify-center shrink-0 p-3 relative group-hover:scale-105 transition-transform">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center shadow-md relative">
                  <Building className="w-6 h-6 text-white" />
                  <div className="absolute -bottom-2 w-12 h-5 bg-blue-800 rounded-md flex items-center justify-center text-[9px] font-black uppercase">
                    ⭐ Premium
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Benefits Checklist Container ("WHY UPGRADE MY POSTING?") */}
        <section className="bg-[#FFFBF2] border border-[#FDE3B5] rounded-3xl p-8 sm:p-12 shadow-xs text-center flex flex-col items-center gap-8">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500 bg-amber-100/70 px-3 py-1 rounded-full">
              WHY UPGRADE MY POSTING?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">
              Benefits of upgrading your posting on Sparrows
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 font-display">
                01. Appear higher in searches
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Upgraded postings appear higher in search results giving your posting 5x more views and direct buyer responses.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 font-display">
                02. Hassle free selling & renting
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Relax and close deals faster with our dedicated relationship managers and instant buyer OTP verification.
              </p>
            </div>
          </div>

          <a
            href="#subscription-plans"
            className="text-xs font-bold text-gray-900 hover:text-[#0078D4] transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
          >
            <span>View plans to sell faster</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </section>

      </main>

      {/* Slide-over Drawer Popup */}
      {selectedServiceKey && activeService && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            onClick={handleCloseDrawer}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 font-display">
                {activeService.title}
              </h2>
              <button
                onClick={handleCloseDrawer}
                className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-gray-900 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 py-6 space-y-6 overflow-y-auto">
              {activeService.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#EBF5FF] text-[#0078D4] flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs mt-0.5">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleGetCallback(activeService.title)}
                className="w-full py-3.5 px-6 bg-[#42b85d] hover:bg-[#369a4d] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Get a callback</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST INFORMATION Modal Popup */}
      <RequestInformationModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        serviceName={requestServiceName}
        defaultClass={activeTab}
      />

      {/* SUBSCRIPTION PAYWALL / PAYMENT MODAL */}
      {isPaywallOpen && (
        <SubscriptionPaywallModal
          onClose={() => {
            setIsPaywallOpen(false);
            setSelectedPlanForCheckout(null);
          }}
          onSuccess={() => {
            setIsPaywallOpen(false);
            setSelectedPlanForCheckout(null);
            window.location.reload();
          }}
          initialPlanId={selectedPlanForCheckout?.id || selectedPlanForCheckout?.plan_id}
          targetRole={selectedPlanForCheckout?.role}
        />
      )}

      {/* Footer for Desktop */}
      <DesktopFooter />

      {/* Mobile Bottom Navigation Bar */}
      {!isDesktop && <BottomNav />}
    </div>
  );
}
