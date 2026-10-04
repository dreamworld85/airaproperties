import { useState, useEffect } from "react";
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
  ArrowRight
} from "lucide-react";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import BottomNav from "@/components/BottomNav";
import { submitBuilderInquiry, BuilderInquiryPayload } from "@/lib/api";

const PACKAGES = [
  {
    id: "Builder Launchpad",
    name: "Builder Launchpad",
    price: "₹9,999 / year",
    units: "10 Project Units",
    leads: "150 Verified Leads",
    desc: "Dedicated builder microsite, brochure downloads & RERA verified badge."
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
    city_district: "Ernakulam",
    active_projects: "3-5 Projects",
    package_preference: "Builder Elite Showcase",
    experience_years: 10,
    message: ""
  });

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
        <section className="bg-gradient-to-br from-[#0F2922] via-[#1B5E4F] to-[#2D7A68] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-200 text-xs font-bold border border-white/15">
              <Building2 size={14} />
              <span>BUILDER & DEVELOPER PARTNERSHIP PROGRAM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight leading-tight">
              List Your Projects & Connect With <span className="text-emerald-300">50,000+ Active Kerala Homebuyers</span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed max-w-2xl">
              Showcase your ongoing, upcoming, and completed residential towers and luxury villas on Kerala's premier real estate portal. Get direct, high-intent buyer leads with zero brokerage.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <a
                href="#inquiry-form"
                className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Partner With Us</span>
                <ArrowRight size={16} />
              </a>

              <Link
                to="/builder-preview"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
              >
                <Eye size={16} />
                <span>View Client Demo Microsite</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/15">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">150+</div>
              <div className="text-xs text-emerald-200 mt-0.5">Top Kerala Builders</div>
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
              <h3 className="font-bold text-base text-gray-900 font-display">RERA Verified Stamp</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Gain instant trust among domestic buyers and Gulf NRIs with official RERA verification badges and prominent developer spotlighting.
              </p>
            </div>
          </div>
        </section>

        {/* Demo Preview Callout Box */}
        <section className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-white flex items-center justify-center shadow-md shrink-0">
              <Eye size={30} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full inline-block mb-1">
                LIVE DEMO PREVIEW
              </span>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 font-display">
                See How Your Dedicated Builder Page Will Look
              </h3>
              <p className="text-xs text-gray-600 font-medium mt-1 max-w-xl">
                Experience our interactive 99Acres-inspired developer showcase featuring high-res banners, categorized ongoing/upcoming projects, and instant lead capture forms.
              </p>
            </div>
          </div>

          <Link
            to="/builder-preview"
            className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 shrink-0 text-center flex items-center justify-center gap-2"
          >
            <span>Explore Demo Showcase</span>
            <ExternalLink size={14} />
          </Link>
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
              <div className="flex items-center gap-3 pt-4">
                <Link
                  to="/builder-preview"
                  className="px-6 py-2.5 bg-[#1B5E4F] hover:bg-[#14473C] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Explore Demo Microsite
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
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
                  Fill in your construction firm details below. Our team will verify your RERA license and configure your developer profile.
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

                {/* City / District */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-600" />
                    Primary City / District *
                  </label>
                  <select
                    value={formData.city_district}
                    onChange={(e) => setFormData({ ...formData, city_district: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="Ernakulam">Kochi / Ernakulam</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Kottayam">Kottayam</option>
                    <option value="Alappuzha">Alappuzha</option>
                    <option value="Kannur">Kannur</option>
                    <option value="Kollam">Kollam</option>
                    <option value="Palakkad">Palakkad</option>
                    <option value="Malappuram">Malappuram</option>
                  </select>
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
