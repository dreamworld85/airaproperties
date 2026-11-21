import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, User, Trash2, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { adminApi, AdminUser } from "@/lib/adminApi";

const filterTabs = [
  { label: "All Users", value: "All" },
  { label: "Buyers Only", value: "Buyer" },
  { label: "Owners Only", value: "Owner" },
  { label: "Brokers Only", value: "Broker" },
  { label: "Agencies Only", value: "Agency" },
];

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [deleteTargetUser, setDeleteTargetUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.getUsers(search, activeTab);
        setUsers(data);
      } catch (err) {
        setError("Failed to load user directory.");
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  async function handleConfirmDelete() {
    if (!deleteTargetUser) return;
    setIsDeleting(true);
    try {
      const res = await adminApi.deleteUser(deleteTargetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTargetUser.id));
      const deletedName = deleteTargetUser.name;
      setDeleteTargetUser(null);
      setDeleteSuccessToast(`User "${deletedName}" and all associated data, properties, and uploaded media were permanently deleted.`);
      setTimeout(() => setDeleteSuccessToast(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to delete user account.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      {/* Toast notification */}
      {deleteSuccessToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[70] max-w-md w-[90%] bg-emerald-900/95 text-emerald-100 text-xs px-4 py-3 rounded-2xl shadow-xl border border-emerald-500/30 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{deleteSuccessToast}</span>
        </div>
      )}

      <div>
        <h2 className="font-display font-extrabold text-xl text-black">User Accounts</h2>
        <p className="text-xs text-slate mt-0.5">Manage, inspect, and permanently remove registered platform accounts.</p>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-charcoal/10 px-4 py-3 shadow-sm">
        <Search size={16} className="text-slate/60" />
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-xs outline-none text-charcoal placeholder:text-slate/40"
        />
      </div>

      {/* Segments Filter Carousel */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-full text-[11px] font-bold border whitespace-nowrap transition-all shrink-0 ${
              activeTab === tab.value
                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                : "bg-white border-charcoal/10 text-charcoal hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users List Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-xs text-slate py-6 text-center">Loading accounts directory...</p>
        ) : error ? (
          <p className="text-xs text-coral py-6 text-center">{error}</p>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-white border border-charcoal/5 rounded-2xl shadow-sm hover:border-emerald-600/20 transition-colors group relative"
            >
              <Link
                to={`/admin/users/${user.id}`}
                className="flex items-center gap-3 min-w-0 flex-1 pr-2"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  user.is_disabled ? "bg-slate-100 text-slate-400" : "bg-emerald-50 text-emerald-600"
                }`}>
                  <User size={18} />
                </div>
                <div className="min-w-0 flex-1">
                   <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-ink truncate group-hover:text-emerald-700 transition-colors">{user.name}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      user.role === "Agency"
                        ? "bg-purple-50 text-purple-600 border border-purple-100"
                        : user.role === "Broker"
                        ? "bg-teal-50 text-teal-600 border border-teal-100"
                        : user.role === "Owner"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                      {user.role || "Buyer"}
                    </span>
                    {user.is_disabled === 1 && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        Suspended
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    {user.phone && <span>Mobile: {user.phone}</span>}
                    {user.phone && user.email && <span className="text-slate/40 select-none">•</span>}
                    {user.email && <span>Email: {user.email}</span>}
                    {(user.district || user.state || user.location) && (
                      <>
                        <span className="text-slate/40 select-none">•</span>
                        <span className="text-emerald-700 font-medium">📍 {[user.district, user.state].filter(Boolean).join(", ") || user.location}</span>
                      </>
                    )}
                    {!user.phone && !user.email && !user.district && !user.state && <span>No contact info</span>}
                  </p>
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  title="Delete Account Permanently"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetUser(user);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <Link
                  to={`/admin/users/${user.id}`}
                  className="p-1 text-slate/40 hover:text-emerald-600 transition-colors"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white border border-charcoal/4 rounded-2xl">
            <p className="text-xs text-slate font-medium">No registered accounts match search criteria.</p>
          </div>
        )}
      </div>

      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      {deleteTargetUser && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isDeleting && setDeleteTargetUser(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95 duration-200 border border-charcoal/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="font-display font-extrabold text-base text-slate-900">
                Delete Account Permanently?
              </h3>
              <p className="text-xs text-slate-600">
                You are about to permanently delete user account:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left my-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{deleteTargetUser.name}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {deleteTargetUser.role || "Buyer"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex flex-col gap-0.5">
                  {deleteTargetUser.phone && <span>📞 Phone: {deleteTargetUser.phone}</span>}
                  {deleteTargetUser.email && <span>✉️ Email: {deleteTargetUser.email}</span>}
                </div>
              </div>
            </div>

            {/* Clear Warning of What Gets Purged */}
            <div className="text-left bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3.5 flex flex-col gap-2 text-[11px] text-rose-900 font-medium">
              <span className="font-bold text-rose-800 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                <Trash2 size={13} className="shrink-0 text-rose-600" />
                This permanent deletion will immediately:
              </span>
              <ul className="list-disc list-inside space-y-1 text-rose-800/90 text-[11px] leading-relaxed">
                <li>Permanently wipe this user record from the database.</li>
                <li>Delete <strong>all property listings</strong> uploaded by this user.</li>
                <li>Purge <strong>all uploaded images, videos & thumbnails</strong> from the server disk.</li>
                <li>Remove all associated enquiries, reviews, views, and credit tokens.</li>
              </ul>
              <p className="text-[10px] text-rose-600 font-bold mt-0.5">
                ⚠️ This action is irreversible and cannot be recovered.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTargetUser(null)}
                className="w-full py-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-full py-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Purging data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
