import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle2, 
  Award, 
  Calendar, 
  Send, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  Eye, 
  Clock, 
  Home, 
  FileText, 
  MessageSquare,
  ArrowRight,
  Filter
} from "lucide-react";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import BottomNav from "@/components/BottomNav";
import { 
  fetchBuilderDetails, 
  fetchBuilders, 
  submitBuilderLead, 
  BuilderProfile, 
  BuilderProject 
} from "@/lib/api";

type ProjectCategoryTab = "all" | "ongoing" | "upcoming" | "completed";

export default function BuilderMicrosite() {
  const { idOrSlug } = useParams<{ idOrSlug?: string }>();
  const activeParam = idOrSlug || "skyline-builders";

  const [builder, setBuilder] = useState<BuilderProfile | null>(null);
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [activeTab, setActiveTab] = useState<ProjectCategoryTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1000 : false
  );

  // Available builders for demo switcher
  const [allBuilders, setAllBuilders] = useState<BuilderProfile[]>([]);

  // Lead Form State
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      setLogoError(false);
      try {
        const [builderData, buildersList] = await Promise.all([
          fetchBuilderDetails(activeParam),
          fetchBuilders().catch(() => [])
        ]);

        setBuilder(builderData.builder);
        setProjects(builderData.projects);
        setAllBuilders(buildersList);
      } catch (err: any) {
        console.error("Error loading builder microsite:", err);
        setError(err.message || "Failed to load builder page.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeParam]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builder) return;
    setSubmittingLead(true);
    try {
      await submitBuilderLead(builder.id, {
        name: leadName,
        phone: leadPhone,
        email: leadEmail,
        message: leadMessage,
        projectId: selectedProjectId
      });
      setLeadSuccess(true);
      setLeadName("");
      setLeadPhone("");
      setLeadEmail("");
      setLeadMessage("");
      setTimeout(() => setLeadSuccess(false), 6000);
    } catch (err: any) {
      alert(err.message || "Failed to submit inquiry.");
    } finally {
      setSubmittingLead(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (activeTab === "all") return true;
    return p.status.toLowerCase() === activeTab.toLowerCase();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] w-full flex flex-col font-sans">
        <DesktopHeader />
        <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-700">Loading Developer Showcase...</p>
        </div>
        <DesktopFooter />
      </div>
    );
  }

  if (error || !builder) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] w-full flex flex-col font-sans">
        <DesktopHeader />
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto space-y-4">
          <Building2 size={48} className="text-gray-400 mx-auto" />
          <h2 className="text-2xl font-black text-gray-900 font-display">Builder Page Not Found</h2>
          <p className="text-xs text-gray-600">{error || "The requested builder profile could not be loaded."}</p>
          <Link
            to="/partner-with-us"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Partner With Us
          </Link>
        </div>
        <DesktopFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] w-full flex flex-col font-sans relative">
      <DesktopHeader />

      {/* Top Demo Bar for Prospective Builders / Reviewers */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider text-[11px] text-emerald-300">
            Developer Microsite Preview
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300 text-[11px]">
            Live dynamic template for builders & constructors
          </span>
        </div>

        {/* Demo Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden md:inline">Switch Showcase:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {allBuilders.map((b) => (
              <Link
                key={b.id}
                to={`/builder/${b.slug}`}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  b.slug === activeParam
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {b.name}
              </Link>
            ))}
          </div>

          <Link
            to="/partner-with-us"
            className="ml-2 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] transition-all whitespace-nowrap"
          >
            List Your Projects
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-8">
        
        {/* HERO BRANDING SECTION */}
        <section className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-charcoal/10 bg-white">
          {/* Cover Banner Image */}
          <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden bg-slate-900">
            <img
              src={builder.banner_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=600&fit=crop"}
              alt={`${builder.name} banner`}
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Verified Builder Partner</span>
              </span>
            </div>
          </div>

          {/* Builder Profile Box - ALL TEXT & DETAILS ENTIRELY OCCUPIED IN THIS WHITE BOX */}
          <div className="relative bg-white px-6 sm:px-8 py-6 flex flex-col gap-6">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Logo Frame - completely inside the white box */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 shadow-md border-2 border-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                  {!logoError && builder.logo_url ? (
                    <img
                      src={builder.logo_url}
                      alt={builder.name}
                      onError={() => setLogoError(true)}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#1B5E4F] via-[#14473C] to-[#0D382F] flex flex-col items-center justify-center text-white shadow-inner p-2 border border-emerald-400/20">
                      <Building2 size={26} className="text-amber-300 mb-0.5" />
                      <span className="text-xs font-black tracking-widest text-amber-200 uppercase font-display">
                        {builder.name
                          ? builder.name
                              .split(" ")
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join("")
                          : "DEV"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Developer Title, Badges & Tagline - 100% inside white box */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <ShieldCheck size={13} className="text-emerald-700" />
                      Verified Developer
                    </span>
                    {builder.rera_id && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        RERA: {builder.rera_id}
                      </span>
                    )}
                    <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
                      <MapPin size={13} className="text-emerald-600" />
                      {builder.district}, Kerala
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-gray-900">
                    {builder.name}
                  </h1>

                  <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-2xl leading-relaxed">
                    {builder.tagline}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${builder.phone}`}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:border-slate-400 active:scale-95"
                >
                  <Phone size={14} className="text-emerald-700" />
                  <span>Call Desk</span>
                </a>

                {builder.phone && (
                  <a
                    href={`https://wa.me/${builder.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${builder.name}, I am interested in your residential projects on Kerala Realty.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp</span>
                  </a>
                )}

                <a
                  href="#direct-lead-form"
                  className="px-5 py-2.5 bg-[#1B5E4F] hover:bg-[#14473C] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Request Site Visit</span>
                </a>
              </div>
            </div>

            {/* High-Contrast, Dedicated Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex flex-col items-center justify-center text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-display">
                  {builder.experience_years}+ Years
                </div>
                <div className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                  Industry Excellence
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-300/80 flex flex-col items-center justify-center text-center">
                <div className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
                  {builder.total_projects}+
                </div>
                <div className="text-[11px] text-slate-700 font-bold uppercase tracking-wider mt-0.5">
                  Total Landmarks
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex flex-col items-center justify-center text-center">
                <div className="text-2xl sm:text-3xl font-black text-blue-900 font-display">
                  {builder.ongoing_projects} Active
                </div>
                <div className="text-[11px] text-blue-800 font-bold uppercase tracking-wider mt-0.5">
                  Ongoing Projects
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col items-center justify-center text-center">
                <div className="text-2xl sm:text-3xl font-black text-amber-900 font-display">
                  {builder.completed_projects}
                </div>
                <div className="text-[11px] text-amber-800 font-bold uppercase tracking-wider mt-0.5">
                  Completed & Handed Over
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2-COLUMN MAIN CONTENT (Catalog + Sticky Lead Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLS: About Us & Project Catalog */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Us Card */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-emerald-700" />
                <h2 className="text-xl font-bold font-display text-gray-900">
                  About {builder.name}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                {builder.about}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-gray-700 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-600 shrink-0" />
                  <span className="truncate">{builder.office_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-emerald-600 shrink-0" />
                  <span className="truncate">{builder.email}</span>
                </div>
                {builder.website && (
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-emerald-600 shrink-0" />
                    <a href={builder.website} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline truncate">
                      {builder.website.replace("https://", "")}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-emerald-600 shrink-0" />
                  <span>K-RERA Registered Developer</span>
                </div>
              </div>
            </section>

            {/* PROJECT CATALOG WITH CATEGORIZED TABS */}
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-display text-gray-900">
                    Project Portfolio
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Browse residential towers, luxury villas, and smart homes by {builder.name}.
                  </p>
                </div>

                {/* Status Filter Tabs (Completed, Ongoing, Upcoming) */}
                <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-x-auto">
                  {(
                    [
                      { id: "all", label: "All Projects" },
                      { id: "ongoing", label: "Ongoing" },
                      { id: "upcoming", label: "Upcoming" },
                      { id: "completed", label: "Ready to Move" }
                    ] as { id: ProjectCategoryTab; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[#1B5E4F] text-white shadow-xs"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Projects Grid */}
              <div className="flex flex-col gap-6">
                {filteredProjects.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-charcoal/5 text-gray-500 text-xs">
                    No projects found under this category.
                  </div>
                ) : (
                  filteredProjects.map((project) => {
                    const statusColor = 
                      project.status === "Ongoing" 
                        ? "bg-blue-600 text-white" 
                        : project.status === "Upcoming" 
                        ? "bg-purple-600 text-white" 
                        : "bg-emerald-600 text-white";

                    let parsedAmenities: string[] = [];
                    try {
                      parsedAmenities = typeof project.amenities === "string" 
                        ? JSON.parse(project.amenities) 
                        : (project.amenities || []);
                    } catch (_) {}

                    return (
                      <div
                        key={project.id}
                        className="bg-white rounded-3xl border border-charcoal/10 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col sm:flex-row"
                      >
                        {/* Project Cover Image */}
                        <div className="sm:w-2/5 h-56 sm:h-auto relative overflow-hidden shrink-0">
                          <img
                            src={project.cover_image}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${statusColor}`}>
                            {project.status === "Completed" ? "Ready To Move" : project.status}
                          </span>
                        </div>

                        {/* Project Information */}
                        <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                                {project.project_type}
                              </span>
                              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Clock size={12} />
                                {project.possession_date}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold font-display text-gray-900 group-hover:text-emerald-700 transition-colors">
                              {project.title}
                            </h3>

                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={13} className="text-gray-400" />
                              <span>{project.location}, {project.district}</span>
                            </p>

                            <div className="pt-2 flex flex-wrap items-baseline gap-3">
                              <span className="text-lg font-black text-gray-900 font-display">
                                {project.price_range}
                              </span>
                              <span className="text-xs font-semibold text-gray-500">
                                • {project.units_config}
                              </span>
                            </div>

                            {/* Amenities Chips */}
                            {parsedAmenities.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {parsedAmenities.slice(0, 3).map((amenity, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                                  >
                                    ✓ {amenity}
                                  </span>
                                ))}
                                {parsedAmenities.length > 3 && (
                                  <span className="text-[10px] font-medium text-gray-400">
                                    +{parsedAmenities.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                            <span className="text-[10px] text-gray-400 font-mono truncate">
                              {project.rera_reg_number ? `RERA: ${project.rera_reg_number}` : "K-RERA Certified"}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProjectId(project.id);
                                const el = document.getElementById("direct-lead-form");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="px-4 py-2 bg-[#1B5E4F] hover:bg-[#14473C] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                              <span>Enquire Now</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* RIGHT 1 COL: DIRECT LEAD FORM (STICKY) */}
          <div className="lg:col-span-1 sticky top-16 space-y-6">
            <div id="direct-lead-form" className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal/10 shadow-sm space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
                  <MessageSquare size={13} />
                  <span>DIRECT BUILDER DESK</span>
                </div>
                <h3 className="text-xl font-bold font-display text-gray-900">
                  Connect with {builder.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Schedule an on-site visit or request customized price sheets & floor plans.
                </p>
              </div>

              {leadSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-2 text-center">
                  <CheckCircle2 size={24} className="text-emerald-600 mx-auto" />
                  <p className="font-bold">Inquiry Sent Successfully!</p>
                  <p className="text-[11px] text-emerald-700">
                    The {builder.name} sales desk will connect with you via phone / WhatsApp shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Arun Kumar"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="+91 98460 00000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="arun@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Interested In Project</label>
                    <select
                      value={selectedProjectId || ""}
                      onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    >
                      <option value="">All Projects / General Inquiry</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Message / Preferred Visit Date</label>
                    <textarea
                      rows={2}
                      value={leadMessage}
                      onChange={(e) => setLeadMessage(e.target.value)}
                      placeholder="Looking for 3 BHK under 1.5 Cr, weekend site visit."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="w-full py-3 bg-[#1B5E4F] hover:bg-[#14473C] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingLead ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    <span>{submittingLead ? "Connecting..." : "Request Direct Callback"}</span>
                  </button>

                  <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>Zero Brokerage • Direct from Builder</span>
                  </p>
                </form>
              )}
            </div>

            {/* Quick Partner CTA Banner */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full inline-block">
                ARE YOU A BUILDER?
              </span>
              <h4 className="font-bold text-base text-gray-900 font-display">
                Want a dedicated showcase page like this?
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Get your own customized builder microsite and feature your residential projects in front of thousands of buyers.
              </p>
              <Link
                to="/partner-with-us"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center justify-center gap-1.5"
              >
                <span>Partner With Us</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

      </main>

      <DesktopFooter />
      {!isDesktop && <BottomNav />}
    </div>
  );
}
