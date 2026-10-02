import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Search, 
  Trash2, 
  RefreshCw, 
  Filter, 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Award,
  Check,
  X,
  FileText
} from "lucide-react";
import { adminApi, AdminBuilderInquiry } from "@/lib/adminApi";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Contacted: "bg-purple-50 text-purple-700 border-purple-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function BuilderInquiries() {
  const [inquiries, setInquiries] = useState<AdminBuilderInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  // Modal View
  const [selectedInquiry, setSelectedInquiry] = useState<AdminBuilderInquiry | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getBuilderInquiries();
      setInquiries(data);
    } catch (err: any) {
      console.error("Failed to load builder inquiries:", err);
      setError(err.message || "Failed to load builder inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      await adminApi.updateBuilderInquiryStatus(id, newStatus);
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus as any });
      }
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm("Approve this builder inquiry and auto-provision their developer showcase profile?")) return;
    setApprovingId(id);
    try {
      const res = await adminApi.approveBuilderInquiry(id);
      alert(res.message);
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "Approved" } : item))
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: "Approved" });
      }
    } catch (err: any) {
      alert(`Failed to approve builder: ${err.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    try {
      await adminApi.updateBuilderInquiryStatus(selectedInquiry.id, selectedInquiry.status, adminNotesInput);
      setInquiries((prev) =>
        prev.map((item) => (item.id === selectedInquiry.id ? { ...item, admin_notes: adminNotesInput } : item))
      );
      setSelectedInquiry({ ...selectedInquiry, admin_notes: adminNotesInput });
      alert("Admin notes saved successfully.");
    } catch (err: any) {
      alert(`Failed to save notes: ${err.message}`);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this builder inquiry?")) return;
    setDeletingId(id);
    try {
      await adminApi.deleteBuilderInquiry(id);
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
    } catch (err: any) {
      alert(`Failed to delete inquiry: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered List
  const filteredInquiries = inquiries.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.company_name.toLowerCase().includes(search.toLowerCase()) ||
      item.contact_person.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search) ||
      (item.city_district && item.city_district.toLowerCase().includes(search.toLowerCase())) ||
      (item.package_preference && item.package_preference.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter((i) => i.status === "Pending").length;
  const contactedCount = inquiries.filter((i) => i.status === "Contacted").length;
  const approvedCount = inquiries.filter((i) => i.status === "Approved").length;

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display text-gray-900 flex items-center gap-2">
            <Building2 className="text-emerald-700" size={26} />
            <span>Builder Partner Inquiries</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review incoming partnership applications from builders, contractors, and developers across Kerala.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/builder-preview"
            target="_blank"
            className="px-4 py-2 bg-white border border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
          >
            <span>View Demo Microsite</span>
            <ExternalLink size={13} />
          </Link>

          <button
            onClick={fetchInquiries}
            className="p-2 bg-white hover:bg-slate-50 border border-gray-200 text-gray-700 rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-emerald-600" : ""} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-charcoal/5 shadow-2xs">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Applications</div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-display mt-1">{totalCount}</div>
        </div>

        <div className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200/60 shadow-2xs">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Pending Review</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-display mt-1">{pendingCount}</div>
        </div>

        <div className="bg-purple-50/60 p-5 rounded-3xl border border-purple-200/60 shadow-2xs">
          <div className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Contacted / In Discussion</div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 font-display mt-1">{contactedCount}</div>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-3xl border border-emerald-200/60 shadow-2xs">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Approved & Live</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-display mt-1">{approvedCount}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-charcoal/5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, person, phone, city..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["All", "Pending", "Contacted", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inquiries Table */}
      <div className="bg-white rounded-3xl border border-charcoal/5 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-gray-500">Loading builder applications...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-xs">
            No builder inquiries match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-100 text-gray-400 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-5">Company / Firm</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Location & Projects</th>
                  <th className="py-3.5 px-4">Package Preference</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredInquiries.map((inq) => {
                  return (
                    <tr key={inq.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Company Name */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-gray-900 text-sm">{inq.company_name}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Submitted: {new Date(inq.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <User size={13} className="text-gray-400" />
                          <span>{inq.contact_person}</span>
                        </div>
                        <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                          <Phone size={12} className="text-emerald-600" />
                          <a href={`tel:${inq.phone}`} className="hover:underline font-mono">{inq.phone}</a>
                        </div>
                        <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                          <Mail size={12} className="text-blue-600" />
                          <a href={`mailto:${inq.email}`} className="hover:underline truncate max-w-[160px]">{inq.email}</a>
                        </div>
                      </td>

                      {/* Location & Projects */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <MapPin size={13} className="text-rose-500 shrink-0" />
                          <span>{inq.city_district || "Kerala"}</span>
                        </div>
                        <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                          <Layers size={12} className="text-purple-600" />
                          <span>{inq.active_projects}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {inq.experience_years} years in business
                        </div>
                      </td>

                      {/* Package Preference */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] inline-block">
                          {inq.package_preference}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={inq.status}
                          disabled={updatingId === inq.id}
                          onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            STATUS_COLORS[inq.status] || "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                        {inq.status !== "Approved" && (
                          <button
                            type="button"
                            onClick={() => handleApprove(inq.id)}
                            disabled={approvingId === inq.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                            title="Approve & Create Showcase"
                          >
                            <Check size={13} />
                            <span>{approvingId === inq.id ? "Approving..." : "Approve"}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setAdminNotesInput(inq.admin_notes || "");
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-800 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <FileText size={13} />
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(inq.id)}
                          disabled={deletingId === inq.id}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FULL INQUIRY DETAIL MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  BUILDER APPLICATION #{selectedInquiry.id}
                </span>
                <h3 className="text-xl font-bold font-display text-gray-900 mt-1">
                  {selectedInquiry.company_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Contact Person</span>
                <div className="font-bold text-gray-900 text-sm">{selectedInquiry.contact_person}</div>
                <div className="text-gray-600">{selectedInquiry.phone}</div>
                <div className="text-gray-600">{selectedInquiry.email}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Firm Scope</span>
                <div className="font-bold text-gray-900">{selectedInquiry.active_projects}</div>
                <div className="text-gray-600">{selectedInquiry.experience_years} Years Experience</div>
                <div className="text-emerald-700 font-semibold">{selectedInquiry.package_preference}</div>
              </div>
            </div>

            {/* Office Address */}
            <div className="text-xs space-y-1">
              <span className="font-bold text-gray-700">Office Address:</span>
              <p className="p-3 bg-slate-50 rounded-2xl text-gray-600 leading-relaxed border border-charcoal/5">
                {selectedInquiry.office_address} ({selectedInquiry.city_district})
              </p>
            </div>

            {/* Additional Message */}
            {selectedInquiry.message && (
              <div className="text-xs space-y-1">
                <span className="font-bold text-gray-700">Application Message / Launch Notes:</span>
                <p className="p-3 bg-slate-50 rounded-2xl text-gray-600 leading-relaxed border border-charcoal/5">
                  {selectedInquiry.message}
                </p>
              </div>
            )}

            {/* Admin Notes Editor */}
            <div className="text-xs space-y-1.5 pt-2 border-t border-gray-100">
              <label className="font-bold text-gray-800">Admin Internal Notes & Follow-up Log</label>
              <textarea
                rows={3}
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                placeholder="Add follow-up notes, phone call summaries, RERA license verification dates..."
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {savingNotes ? "Saving Notes..." : "Save Admin Notes"}
              </button>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Status:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${STATUS_COLORS[selectedInquiry.status]}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {selectedInquiry.status !== "Approved" && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedInquiry.id)}
                  disabled={approvingId === selectedInquiry.id}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{approvingId === selectedInquiry.id ? "Approving..." : "Approve & Provision Showcase"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
