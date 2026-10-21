import { useEffect, useState } from "react";
import { 
  PhoneCall, 
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
  Eye,
  X,
  Building,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { adminApi, PropertyRequestItem, ServiceEnquiry } from "@/lib/adminApi";

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-purple-50 text-purple-700 border-purple-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Closed: "bg-gray-100 text-gray-700 border-gray-200",
};

const REQUEST_TYPE_COLORS: Record<string, string> = {
  Rent: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Buy: "bg-blue-50 text-blue-800 border-blue-200",
  Roommate: "bg-purple-50 text-purple-800 border-purple-200",
  "Property service": "bg-amber-50 text-amber-800 border-amber-200",
};

export default function ServiceEnquiries() {
  const [activeTab, setActiveTab] = useState<"propertyRequests" | "serviceCallbacks">("propertyRequests");
  
  // Property Requests state
  const [requests, setRequests] = useState<PropertyRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // Legacy/Service callbacks state
  const [callbacks, setCallbacks] = useState<ServiceEnquiry[]>([]);
  const [callbacksLoading, setCallbacksLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected item for detail modal
  const [selectedRequest, setSelectedRequest] = useState<PropertyRequestItem | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPropertyRequests = async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const data = await adminApi.getPropertyRequests();
      setRequests(data);
    } catch (err: any) {
      console.error("Failed to load property requests:", err);
      setRequestsError(err.message || "Failed to load enquiries.");
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchCallbacks = async () => {
    setCallbacksLoading(true);
    try {
      const data = await adminApi.getServiceEnquiries();
      setCallbacks(data);
    } catch (err) {
      console.error("Failed to load service callbacks:", err);
    } finally {
      setCallbacksLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyRequests();
    fetchCallbacks();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      await adminApi.updatePropertyRequestStatus(id, newStatus);
      setRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    setDeletingId(id);
    try {
      await adminApi.deletePropertyRequest(id);
      setRequests((prev) => prev.filter((item) => item.id !== id));
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(null);
      }
    } catch (err: any) {
      alert(`Failed to delete enquiry: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered Property Requests
  const filteredRequests = requests.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
      item.phone.includes(search) ||
      item.preferred_location.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      requestTypeFilter === "All" || item.request_type.toLowerCase() === requestTypeFilter.toLowerCase();

    const matchesLocation =
      locationFilter.trim() === "" ||
      item.preferred_location.toLowerCase().includes(locationFilter.trim().toLowerCase());

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesType && matchesLocation && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = requests.length;
  const newCount = requests.filter((e) => e.status === "New").length;
  const contactedCount = requests.filter((e) => e.status === "Contacted" || e.status === "In Progress").length;
  const resolvedCount = requests.filter((e) => e.status === "Resolved" || e.status === "Closed").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display">
            User Enquiries
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Review and manage all user property requests and callback submissions across the portal
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchPropertyRequests();
              fetchCallbacks();
            }}
            disabled={requestsLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-2xs active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${requestsLoading ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("propertyRequests")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "propertyRequests"
              ? "border-[#0F5B5C] text-[#0F5B5C]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>Property Requests</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
            {requests.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("serviceCallbacks")}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "serviceCallbacks"
              ? "border-[#0F5B5C] text-[#0F5B5C]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>Service Callbacks</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700 font-extrabold">
            {callbacks.length}
          </span>
        </button>
      </div>

      {activeTab === "propertyRequests" ? (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Enquiries</span>
                <PhoneCall className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-gray-900 font-display">{totalCount}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">New</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 font-display">{newCount}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Contacted</span>
                <AlertCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-600 font-display">{contactedCount}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs flex flex-col gap-1">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 font-display">{resolvedCount}</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-2xs flex flex-col gap-4">
            {/* Top row: search & location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone, email, requirements..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 transition"
                />
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Filter by location (e.g. Wayanad, Kochi)..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-emerald-600 transition"
                />
              </div>
            </div>

            {/* Bottom row: Request type pills & Status filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
              {/* Request Type Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">
                  Type:
                </span>
                {["All", "Rent", "Buy", "Roommate", "Property service"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setRequestTypeFilter(t)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      requestTypeFilter === t
                        ? "bg-[#0F5B5C] text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">
                  Status:
                </span>
                {["All", "New", "Contacted", "In Progress", "Resolved", "Closed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      statusFilter === st
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enquiries Data List */}
          {requestsLoading ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center text-gray-500 font-medium text-xs">
              Loading user enquiries...
            </div>
          ) : requestsError ? (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center text-red-600 font-semibold text-xs">
              {requestsError}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No Property Enquiries Found</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                {search || requestTypeFilter !== "All" || locationFilter || statusFilter !== "All"
                  ? "No enquiries match your search or filter criteria."
                  : "No user property requests have been submitted yet."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-150 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-150 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                      <th className="py-3.5 px-4">ID & Date</th>
                      <th className="py-3.5 px-4">User Details</th>
                      <th className="py-3.5 px-4">Type & Property</th>
                      <th className="py-3.5 px-4">Location & Budget</th>
                      <th className="py-3.5 px-4">Contact Preference</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
                    {filteredRequests.map((item) => {
                      const statusClass =
                        STATUS_COLORS[item.status] || "bg-gray-50 text-gray-700 border-gray-200";
                      const typeClass =
                        REQUEST_TYPE_COLORS[item.request_type] || "bg-gray-100 text-gray-800 border-gray-200";

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/60 transition">
                          {/* ID & Date */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="font-extrabold text-gray-900">#{item.id}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(item.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                            </div>
                          </td>

                          {/* User Details */}
                          <td className="py-4 px-4 space-y-1">
                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{item.full_name}</span>
                            </div>
                            <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <a href={`tel:${item.phone}`} className="hover:underline font-semibold">
                                {item.phone}
                              </a>
                            </div>
                            {item.email && (
                              <div className="text-[11px] text-gray-500 flex items-center gap-1.5 truncate max-w-[180px]">
                                <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                <span>{item.email}</span>
                              </div>
                            )}
                          </td>

                          {/* Request Type & Property */}
                          <td className="py-4 px-4 space-y-1">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${typeClass}`}>
                              {item.request_type}
                            </span>
                            <div className="font-bold text-gray-800 text-xs">
                              {item.property_type}
                            </div>
                            {item.bedrooms && (
                              <div className="text-[11px] text-gray-500 font-medium">
                                {item.bedrooms}
                              </div>
                            )}
                          </td>

                          {/* Location & Budget */}
                          <td className="py-4 px-4 space-y-1">
                            <div className="flex items-center gap-1 text-gray-900 font-bold">
                              <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              <span className="truncate max-w-[150px]">{item.preferred_location}</span>
                            </div>
                            <div className="text-emerald-700 font-bold text-xs">
                              {item.budget_range}
                            </div>
                            {item.furnished && (
                              <div className="text-[10px] text-gray-500">
                                Furnished: {item.furnished}
                              </div>
                            )}
                          </td>

                          {/* Contact Preference */}
                          <td className="py-4 px-4 space-y-0.5 text-[11px]">
                            <div className="font-semibold text-gray-800">
                              Via: <span className="text-[#0F5B5C] font-bold">{item.contact_preference || "Any"}</span>
                            </div>
                            <div className="text-gray-500 text-[10px]">
                              Time: {item.best_time_to_contact || "Anytime"}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <select
                              value={item.status}
                              disabled={updatingId === item.id}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${statusClass}`}
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedRequest(item)}
                                className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                title="View Full Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === item.id}
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                                title="Delete Enquiry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Legacy Service Callbacks Tab */
        <div className="bg-white rounded-2xl border border-gray-150 shadow-2xs overflow-hidden">
          {callbacksLoading ? (
            <div className="p-12 text-center text-gray-500 text-xs">Loading service callbacks...</div>
          ) : callbacks.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">No service callbacks recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-150 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
                  {callbacks.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4 font-bold">#{c.id}</td>
                      <td className="py-3 px-4">{c.name}</td>
                      <td className="py-3 px-4">
                        <div>{c.phone}</div>
                        <div className="text-[10px] text-gray-500">{c.email}</div>
                      </td>
                      <td className="py-3 px-4">{c.city}</td>
                      <td className="py-3 px-4 font-bold text-emerald-800">{c.service_name}</td>
                      <td className="py-3 px-4">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-xl w-full p-6 shadow-2xl relative my-auto space-y-5">
            <div className="flex items-center justify-between border-b border-gray-150 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F5B5C] bg-emerald-50 px-2 py-0.5 rounded-md">
                  Enquiry #{selectedRequest.id}
                </span>
                <h3 className="text-lg font-extrabold text-gray-900 mt-1">
                  Property Request Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Contact Information */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-150 space-y-1.5">
                <div className="font-bold text-gray-800 uppercase tracking-wider text-[10px] text-gray-500">
                  Contact Information
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Name:</strong> {selectedRequest.full_name}</div>
                  <div><strong>Phone:</strong> <a href={`tel:${selectedRequest.phone}`} className="text-emerald-700 font-bold hover:underline">{selectedRequest.phone}</a></div>
                  <div><strong>Email:</strong> {selectedRequest.email || "Not provided"}</div>
                  <div><strong>Preference:</strong> {selectedRequest.contact_preference || "Any"} ({selectedRequest.best_time_to_contact || "Anytime"})</div>
                </div>
              </div>

              {/* Requirement Details */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-150 space-y-1.5">
                <div className="font-bold text-gray-800 uppercase tracking-wider text-[10px] text-gray-500">
                  Requirement Specifications
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Request Type:</strong> <span className="font-bold text-[#0F5B5C]">{selectedRequest.request_type}</span></div>
                  <div><strong>Property Type:</strong> {selectedRequest.property_type}</div>
                  <div><strong>Preferred Location:</strong> {selectedRequest.preferred_location}</div>
                  <div><strong>Rooms/Bedrooms:</strong> {selectedRequest.bedrooms || "Not specified"}</div>
                  <div><strong>Budget:</strong> <span className="font-bold text-emerald-700">{selectedRequest.budget_range}</span></div>
                  <div><strong>Move-in Date:</strong> {selectedRequest.move_in_date || "Flexible"}</div>
                  <div><strong>Furnished:</strong> {selectedRequest.furnished || "Either"}</div>
                  <div><strong>Submitted:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</div>
                </div>
              </div>

              {/* Need description */}
              <div className="space-y-1">
                <div className="font-bold text-gray-700">What they need:</div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {selectedRequest.description}
                </div>
              </div>

              {/* Special requirements */}
              {selectedRequest.special_requirements && (
                <div className="space-y-1">
                  <div className="font-bold text-gray-700">Special Requirements:</div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedRequest.special_requirements}
                  </div>
                </div>
              )}

              {/* Status Update Row */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-150">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">Update Status:</span>
                  <select
                    value={selectedRequest.status}
                    onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold bg-white"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
