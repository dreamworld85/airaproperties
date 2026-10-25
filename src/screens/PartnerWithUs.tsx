import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Building2, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Eye, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Award,
  Layers,
  ArrowRight,
  Search,
  X
} from "lucide-react";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import BottomNav from "@/components/BottomNav";
import { submitBuilderInquiry, BuilderInquiryPayload } from "@/lib/api";
import { STATE_DISTRICTS_MAP } from "@/lib/indiaLocationData";

interface LocationSuggestion {
  city: string;
  state: string;
  display: string;
}

const ALL_INDIA_LOCATIONS: LocationSuggestion[] = (() => {
  const list: LocationSuggestion[] = [];
  
  const popularAliases = [
    { city: "Kochi", state: "Kerala", alias: "Ernakulam" },
    { city: "Bengaluru", state: "Karnataka", alias: "Bangalore" },
    { city: "Mumbai", state: "Maharashtra", alias: "Bombay" },
    { city: "Delhi", state: "Delhi", alias: "New Delhi / NCR" },
    { city: "Hyderabad", state: "Telangana", alias: "Secunderabad" },
    { city: "Chennai", state: "Tamil Nadu", alias: "Madras" },
    { city: "Kolkata", state: "West Bengal", alias: "Calcutta" },
    { city: "Pune", state: "Maharashtra" },
    { city: "Ahmedabad", state: "Gujarat" },
    { city: "Jaipur", state: "Rajasthan" },
    { city: "Lucknow", state: "Uttar Pradesh" },
    { city: "Gurugram", state: "Haryana", alias: "Gurgaon" },
    { city: "Noida", state: "Uttar Pradesh", alias: "Greater Noida" },
    { city: "Chandigarh", state: "Chandigarh" },
    { city: "Thiruvananthapuram", state: "Kerala", alias: "Trivandrum" },
    { city: "Kozhikode", state: "Kerala", alias: "Calicut" },
    { city: "Thrissur", state: "Kerala" },
    { city: "Kannur", state: "Kerala" },
    { city: "Kottayam", state: "Kerala" },
    { city: "Kollam", state: "Kerala" },
    { city: "Alappuzha", state: "Kerala" },
    { city: "Palakkad", state: "Kerala" },
    { city: "Malappuram", state: "Kerala" },
    { city: "Coimbatore", state: "Tamil Nadu" },
    { city: "Madurai", state: "Tamil Nadu" },
    { city: "Surat", state: "Gujarat" },
    { city: "Indore", state: "Madhya Pradesh" },
    { city: "Bhopal", state: "Madhya Pradesh" },
    { city: "Nagpur", state: "Maharashtra" },
    { city: "Visakhapatnam", state: "Andhra Pradesh", alias: "Vizag" },
    { city: "Vijayawada", state: "Andhra Pradesh" },
    { city: "Patna", state: "Bihar" },
    { city: "Mangaluru", state: "Karnataka", alias: "Mangalore" },
    { city: "Mysuru", state: "Karnataka", alias: "Mysore" },
    { city: "Vadodara", state: "Gujarat", alias: "Baroda" },
    { city: "Goa (North/South)", state: "Goa" }
  ];

  popularAliases.forEach(item => {
    list.push({
      city: item.city,
      state: item.state,
      display: item.alias ? `${item.city} (${item.alias}), ${item.state}` : `${item.city}, ${item.state}`
    });
  });

  Object.entries(STATE_DISTRICTS_MAP).forEach(([state, districts]) => {
    districts.forEach(district => {
      const alreadyAdded = list.some(
        item => item.city.toLowerCase() === district.toLowerCase() && item.state === state
      );
      if (!alreadyAdded) {
        list.push({
          city: district,
          state: state,
          display: `${district}, ${state}`
        });
      }
    });
  });

  return list;
})();



const PACKAGES = [
  {
    id: "Builder Launchpad",
    name: "Builder Launchpad",
    price: "₹9,999 / year",
    units: "10 Project Units",
    leads: "150 Verified Leads",
    desc: "Dedicated builder microsite, brochure downloads & Aira Properties verified badge."
  },
  {
    id: "Builder Elite Showcase",
    name: "Builder Elite Showcase (Most Popular)",
    price: "₹24,999 / year",
    units: "25 Project Units / Towers",
    leads: "400 Verified Leads",
    desc: "Developer spotlight on Homepage, video walkthroughs, and quarterly investor push."
  },
  {
    id: "Builder Enterprise Conglomerate",
    name: "Builder Enterprise Conglomerate",
    price: "₹49,999 / year",
    units: "100 Units / Gated Townships",
    leads: "1,200 Verified Leads",
    desc: "Full platform domination, high-priority NRI investor blast & 24/7 dedicated account head."
  },
  {
    id: "Custom Enterprise Solution",
    name: "Custom Enterprise Solution",
    price: "Tailored Quote",
    units: "Multi-city / State-wide",
    leads: "Custom Quotas",
    desc: "Bespoke marketing campaign, 3D interactive virtual tours & custom CRM integrations."
  }
];

export default function PartnerWithUs() {
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1000 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [formData, setFormData] = useState<BuilderInquiryPayload>({
    company_name: "",
    contact_person: "",
    phone: "",
    email: "",
    office_address: "",
    city_district: "",
    active_projects: "3-5 Projects",
    package_preference: "Builder Elite Showcase",
    experience_years: 10,
    message: ""
  });

  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = useMemo(() => {
    if (!citySearchQuery.trim()) {
      return ALL_INDIA_LOCATIONS.slice(0, 30);
    }
    const q = citySearchQuery.trim().toLowerCase();
    return ALL_INDIA_LOCATIONS.filter(item => 
      item.city.toLowerCase().includes(q) || 
      item.state.toLowerCase().includes(q) ||
      item.display.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [citySearchQuery]);

  const handleSelectLocation = (loc: LocationSuggestion) => {
    const value = `${loc.city}, ${loc.state}`;
    setCitySearchQuery(value);
    setFormData(prev => ({ ...prev, city_district: value }));
    setIsCityDropdownOpen(false);
  };

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await submitBuilderInquiry(formData);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] w-full flex flex-col font-sans relative">
      <DesktopHeader />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-10">
        
        {/* Hero Section */}
        <section 
          className="rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden bg-[#0F2922]"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(15, 41, 34, 0.94) 0%, rgba(27, 94, 79, 0.88) 55%, rgba(45, 122, 104, 0.65) 100%), url('/images/partner-with-us.svg')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "bottom center"
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-200 text-xs font-bold border border-white/15">
              <Building2 size={14} />
              <span>BUILDER & DEVELOPER PARTNERSHIP PROGRAM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight leading-tight">
              List Your Projects & Connect With <span className="text-emerald-300">50,000+ Active Indian Homebuyers</span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed max-w-2xl">
              Showcase your ongoing, upcoming, and completed residential towers and luxury villas on India's premier real estate portal. Get direct, high-intent buyer leads with zero brokerage.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <a
                href="#inquiry-form"
                className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Partner With Us</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/15">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">150+</div>
              <div className="text-xs text-emerald-200 mt-0.5">Top Builders in India</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">50,000+</div>
              <div className="text-xs text-emerald-200 mt-0.5">Monthly Buyer Visits</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">42%</div>
              <div className="text-xs text-emerald-200 mt-0.5">NRI Investor Inquiries</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">0%</div>
              <div className="text-xs text-emerald-200 mt-0.5">Direct Leads Brokerage</div>
            </div>
          </div>
        </section>

        {/* Why Partner With Aira Properties? */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              ENTERPRISE ADVANTAGES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">
              Why Top Builders Choose Aira Properties
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Designed specifically to meet the high-volume demand of primary residential & commercial project launches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-charcoal/5 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-base text-gray-900 font-display">Dedicated Builder Microsite</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Receive an exclusive, customized microsite displaying your company legacy, leadership, brand video walkthroughs, and categorized project inventory.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-charcoal/5 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-base text-gray-900 font-display">Verified High-Intent Leads</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                All visitor leads are phone-verified via OTP. Buyer inquiries are delivered straight to your CRM and sales team WhatsApp desks in real time.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-charcoal/5 shadow-xs flex flex-col gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Award size={24} />
              </div>
              <h3 className="font-bold text-base text-gray-900 font-display">Aira Properties Verified Stamp</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Gain instant trust among domestic buyers and Gulf NRIs with official Aira Properties verification badges and prominent developer spotlighting.
              </p>
            </div>
          </div>
        </section>

        {/* Builder Inquiry Form */}
        <section id="inquiry-form" className="bg-white rounded-3xl border border-charcoal/10 p-6 sm:p-10 shadow-sm">
          {submitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 font-display">
                Application Received!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                Thank you for choosing to partner with Aira Properties. Our Builder Relations Director will review your company details and reach out within 24 hours to initiate your developer onboarding and project catalog setup.
              </p>
              <div className="flex items-center justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-[#1B5E4F] hover:bg-[#14473C] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Submit Another Project
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-black text-gray-900 font-display">
                  Builder Partnership Application
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Fill in your construction firm details below. Our team will verify your builder credentials and configure your developer profile.
                </p>
              </div>

              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-800">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Building2 size={14} className="text-emerald-600" />
                    Company / Firm Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. Skyline Builders Private Limited"
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Contact Person */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-emerald-600" />
                    Contact Person Name & Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="e.g. Rajeev Menon (Head of Marketing)"
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Phone size={14} className="text-emerald-600" />
                    Direct Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 94460 12345"
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Mail size={14} className="text-emerald-600" />
                    Official Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sales@skylinebuilders.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                {/* City / District with All India Autosearch */}
                <div className="space-y-1.5 relative" ref={cityDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <MapPin size={14} className="text-emerald-600" />
                      Primary City / District *
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/80">
                      All India Search
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={citySearchQuery}
                      onFocus={() => setIsCityDropdownOpen(true)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCitySearchQuery(val);
                        setFormData(prev => ({ ...prev, city_district: val }));
                        setIsCityDropdownOpen(true);
                      }}
                      placeholder="Search city or district across India (e.g. Mumbai, Kochi, Bengaluru...)"
                      className="w-full px-4 py-3 pl-10 pr-9 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-xs"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {citySearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setCitySearchQuery("");
                          setFormData(prev => ({ ...prev, city_district: "" }));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* All India Auto-suggest Dropdown */}
                  {isCityDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto py-2 divide-y divide-gray-50">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((loc, idx) => (
                          <div
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectLocation(loc);
                            }}
                            className="px-4 py-2.5 hover:bg-emerald-50/70 transition-colors cursor-pointer flex items-center justify-between text-left group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <MapPin size={14} className="text-gray-400 group-hover:text-emerald-600 shrink-0" />
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-emerald-950 truncate">
                                {loc.city}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md ml-2 shrink-0">
                              {loc.state}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-center">
                          <p className="text-xs text-gray-500 font-medium">
                            No predefined district matched "{citySearchQuery}".
                          </p>
                          <p className="text-[11px] text-emerald-700 font-bold mt-1">
                            Your typed custom location will be saved!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Active Projects Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Layers size={14} className="text-emerald-600" />
                    Number of Active / Ongoing Projects
                  </label>
                  <select
                    value={formData.active_projects}
                    onChange={(e) => setFormData({ ...formData, active_projects: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="1-2 Projects">1 - 2 Projects</option>
                    <option value="3-5 Projects">3 - 5 Projects</option>
                    <option value="6-10 Projects">6 - 10 Projects</option>
                    <option value="10+ Projects">10+ Mega Projects</option>
                  </select>
                </div>

                {/* Experience in Years */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Award size={14} className="text-emerald-600" />
                    Experience in Real Estate (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value || "0", 10) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Selected Package Preference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-600" />
                    Package Preference
                  </label>
                  <select
                    value={formData.package_preference}
                    onChange={(e) => setFormData({ ...formData, package_preference: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    {PACKAGES.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Office Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-600" />
                  Corporate / Registered Office Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.office_address}
                  onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                  placeholder="Street, Landmark, Building name, City & Pincode"
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Additional Message / Requirements */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800">
                  Additional Information / Specific Launch Timelines (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your upcoming project launches, preferred target locations, or custom brochure distribution needs."
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Your information is protected under strict privacy terms and will never be shared.</span>
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1B5E4F] hover:bg-[#14473C] text-white text-xs sm:text-sm font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  <span>{loading ? "Submitting Application..." : "Submit Partner Application"}</span>
                </button>
              </div>
            </form>
          )}
        </section>

      </main>

      <DesktopFooter />
      {!isDesktop && <BottomNav />}
    </div>
  );
}
