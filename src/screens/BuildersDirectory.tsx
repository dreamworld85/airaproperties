import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Search, 
  ExternalLink,
  Layers,
  Sparkles,
  Phone
} from "lucide-react";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import BottomNav from "@/components/BottomNav";
import { fetchBuilders, BuilderProfile } from "@/lib/api";

export default function BuildersDirectory() {
  const [builders, setBuilders] = useState<BuilderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchBuilders();
        setBuilders(data);
      } catch (err) {
        console.error("Error loading builders directory:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredBuilders = builders.filter((b) => {
    const matchesDistrict = selectedDistrict === "All" || b.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesSearch = 
      searchQuery === "" || 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3] w-full flex flex-col font-sans relative">
      <DesktopHeader />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
        
        {/* Header Hero */}
        <section className="bg-gradient-to-r from-[#0F2922] to-[#1B5E4F] rounded-3xl p-8 sm:p-10 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/15 inline-block">
              VERIFIED BUILDERS DIRECTORY
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display">
              Top Real Estate Builders & Constructors in Kerala
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
              Explore reputable RERA-registered developers, view categorized ongoing luxury apartments & gated villas, and connect directly with builder desks.
            </p>
          </div>

          <Link
            to="/partner-with-us"
            className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-2"
          >
            <Building2 size={16} />
            <span>List Your Firm / Projects</span>
          </Link>
        </section>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search builders, districts..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {/* District Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            {["All", "Ernakulam", "Thiruvananthapuram", "Thrissur", "Kozhikode"].map((district) => (
              <button
                key={district}
                onClick={() => setSelectedDistrict(district)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedDistrict === district
                    ? "bg-[#1B5E4F] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {district === "All" ? "All Locations" : district}
              </button>
            ))}
          </div>
        </div>

        {/* Builders Card Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-gray-500">Loading verified builders...</p>
          </div>
        ) : filteredBuilders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-charcoal/5 text-gray-500 text-xs">
            No builders match your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuilders.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-charcoal/10 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Banner Image Cover */}
                  <div className="h-36 relative overflow-hidden bg-slate-900">
                    <img
                      src={b.banner_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&fit=crop"}
                      alt={b.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    
                    {/* Verified Badge */}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-xs">
                      <ShieldCheck size={12} />
                      Verified
                    </span>
                  </div>

                  {/* Body with Logo Overlap */}
                  <div className="p-5 pt-0 relative">
                    <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md border-2 border-white -mt-8 relative z-10 shrink-0 overflow-hidden">
                      <img
                        src={b.logo_url || "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=100&h=100&fit=crop"}
                        alt={b.name}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <h3 className="text-base font-bold font-display text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {b.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium line-clamp-2">
                        {b.tagline}
                      </p>
                      
                      <div className="pt-2 flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          <Award size={13} />
                          {b.experience_years}+ Yrs Experience
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <MapPin size={12} />
                          {b.district}
                        </span>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center text-xs">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <div className="font-black text-gray-900">{b.total_projects}</div>
                        <div className="text-[10px] text-gray-400">Total</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-xl">
                        <div className="font-black text-blue-700">{b.ongoing_projects}</div>
                        <div className="text-[10px] text-blue-600">Ongoing</div>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded-xl">
                        <div className="font-black text-emerald-700">{b.completed_projects}</div>
                        <div className="text-[10px] text-emerald-600">Delivered</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <Link
                    to={`/builder/${b.slug}`}
                    className="w-full py-2.5 bg-slate-900 hover:bg-[#1B5E4F] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <span>Visit Developer Microsite</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <DesktopFooter />
      {!isDesktop && <BottomNav />}
    </div>
  );
}
