import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  Users,
  Layers,
  Coins,
  Search,
  MapPin,
  Filter,
  Receipt,
  ShieldCheck,
  X,
  ExternalLink,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  adminApi,
  AdminAccountUser,
  AccountReportsSummary,
} from "@/lib/adminApi";
import { INDIAN_STATES } from "@/lib/indiaLocationData";

export default function AccountReports() {
  const [users, setUsers] = useState<AdminAccountUser[]>([]);
  const [summary, setSummary] = useState<AccountReportsSummary>({
    totalAmountPaidAllUsers: 0,
    totalPayingUsers: 0,
    totalPackagesTaken: 0,
    totalListingSlots: 0,
    totalEnquiryTokens: 0,
    filteredUsersCount: 0,
  });
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [planTypeFilter, setPlanTypeFilter] = useState<"all" | "paid" | "starter">("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal for individual user transactions
  const [activeModalUser, setActiveModalUser] = useState<AdminAccountUser | null>(null);

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAccountReports({
        state: selectedState,
        search,
        planType: planTypeFilter,
      });
      setUsers(data.users || []);
      setSummary(data.summary || {
        totalAmountPaidAllUsers: 0,
        totalPayingUsers: 0,
        totalPackagesTaken: 0,
        totalListingSlots: 0,
        totalEnquiryTokens: 0,
        filteredUsersCount: 0,
      });
      if (data.availableStates && data.availableStates.length > 0) {
        setAvailableStates(data.availableStates);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load account reports. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedState, search, planTypeFilter]);

  // Combine available states with full list of Indian states for clean selection
  const stateOptions = useMemo(() => {
    const combined = new Set<string>(["All", "Kerala", "Karnataka", "Tamil Nadu", "Maharashtra", "Andhra Pradesh", "Telangana", "Delhi"]);
    availableStates.forEach((s) => s && combined.add(s));
    INDIAN_STATES.forEach((s) => combined.add(s));
    return Array.from(combined);
  }, [availableStates]);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    const r = (role || "").toLowerCase();
    switch (r) {
      case "owner":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "broker":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "agency":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <div className="px-4 py-6 md:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl text-charcoal">Account Section</h1>
            <span className="bg-emerald-500/10 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Reports
            </span>
          </div>
          <p className="text-xs text-slate mt-1">
            Track all users who took packages, total amount paid, plan names, active listing slots, and enquiry tokens.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={loading || refreshing}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-charcoal/10 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-emerald-600" : "text-slate-500"} />
          <span>{refreshing ? "Updating..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Top Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Amount Paid (All Users) */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100/90 block">
              Total Amount Paid (All Users)
            </span>
            <div className="text-2xl font-black font-display mt-1.5 tracking-tight">
              {formatCurrency(summary.totalAmountPaidAllUsers)}
            </div>
            <p className="text-[11px] text-emerald-100/80 mt-1 flex items-center gap-1">
              <Sparkles size={12} />
              Across {summary.totalPayingUsers} paying users
            </p>
          </div>
          <div className="absolute -bottom-3 -right-3 opacity-15">
            <IndianRupee size={88} />
          </div>
        </div>

        {/* Users with Packages */}
        <div className="bg-white rounded-2xl p-5 border border-charcoal/5 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Users with Packages
          </span>
          <div className="text-2xl font-black font-display text-charcoal mt-1.5">
            {summary.filteredUsersCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Users size={12} className="text-emerald-600" />
            {summary.totalPackagesTaken} total packages recorded
          </p>
          <div className="absolute -bottom-2 -right-2 text-slate-100">
            <Users size={76} />
          </div>
        </div>

        {/* Active Listing Slots */}
        <div className="bg-white rounded-2xl p-5 border border-charcoal/5 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Active Listing Slots
          </span>
          <div className="text-2xl font-black font-display text-charcoal mt-1.5">
            {summary.totalListingSlots}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Layers size={12} className="text-blue-600" />
            Current active publishing quota
          </p>
          <div className="absolute -bottom-2 -right-2 text-slate-100">
            <Layers size={76} />
          </div>
        </div>

        {/* Active Enquiry Tokens */}
        <div className="bg-white rounded-2xl p-5 border border-charcoal/5 shadow-xs relative overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Active Enquiry Tokens
          </span>
          <div className="text-2xl font-black font-display text-charcoal mt-1.5">
            {summary.totalEnquiryTokens}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Coins size={12} className="text-amber-500" />
            Available owner contact credits
          </p>
          <div className="absolute -bottom-2 -right-2 text-slate-100">
            <Coins size={76} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-charcoal/10 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl border border-charcoal/10 px-3.5 py-2.5 flex-1 min-w-[220px]">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search user by name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs outline-none text-charcoal placeholder:text-slate-400 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-charcoal cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter by State */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-charcoal/10 px-3 py-2 shrink-0">
            <MapPin size={15} className="text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              aria-label="Filter by State"
              className="bg-transparent text-xs font-semibold text-charcoal outline-none cursor-pointer pr-1"
            >
              <option value="All">All States</option>
              {stateOptions.filter(s => s !== "All").map((stateName) => (
                <option key={stateName} value={stateName}>
                  {stateName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter by Package Type */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setPlanTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              planTypeFilter === "all"
                ? "bg-white text-charcoal shadow-xs"
                : "text-slate-600 hover:text-charcoal"
            }`}
          >
            All Plans
          </button>
          <button
            onClick={() => setPlanTypeFilter("paid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              planTypeFilter === "paid"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-charcoal"
            }`}
          >
            Paid Only
          </button>
          <button
            onClick={() => setPlanTypeFilter("starter")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              planTypeFilter === "starter"
                ? "bg-white text-charcoal shadow-xs"
                : "text-slate-600 hover:text-charcoal"
            }`}
          >
            Starter Packs
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-charcoal/10 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-emerald-600" />
            <span className="text-xs font-semibold text-slate-500">Loading account reports...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-coral flex flex-col items-center justify-center gap-2">
            <span className="text-xs font-bold">{error}</span>
            <button
              onClick={() => loadData()}
              className="text-xs underline text-emerald-600 font-semibold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
            <Filter size={32} className="text-slate-300 mb-1" />
            <span className="text-sm font-bold text-charcoal">No users found</span>
            <p className="text-xs text-slate-400">
              No users matching the state filter "{selectedState}" or search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-charcoal/10 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">State & Location</th>
                  <th className="py-3.5 px-4">Plan Taken</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 text-center">Listing Slots</th>
                  <th className="py-3.5 px-4 text-center">Enquiry Tokens</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {users.map((u) => {
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-charcoal/10 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center border border-emerald-200 shrink-0">
                              {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/admin/users/${u.id}`}
                                className="font-bold text-charcoal hover:text-emerald-700 transition-colors truncate block"
                              >
                                {u.name}
                              </Link>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${getRoleBadgeColor(
                                  u.role
                                )}`}
                              >
                                {u.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex flex-col sm:flex-row sm:gap-2">
                              {u.phone && <span>{u.phone}</span>}
                              {u.email && (
                                <span className="truncate max-w-[180px]">{u.email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* State & Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 font-bold text-charcoal">
                            <MapPin size={12} className="text-emerald-600" />
                            {u.state || "Kerala"}
                          </span>
                          {u.location && (
                            <span className="text-[10px] text-slate-400 pl-4 truncate max-w-[150px]">
                              {u.location}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Plan Taken */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] inline-flex items-center gap-1 ${
                                u.is_paid
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              <ShieldCheck size={12} />
                              {u.plan_name || "Starter Pack"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} />
                            {formatDate(u.last_package_date)}
                          </span>
                        </div>
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-black text-sm ${
                              u.total_paid > 0
                                ? "text-emerald-700 font-display"
                                : "text-slate-500"
                            }`}
                          >
                            {u.total_paid > 0
                              ? formatCurrency(u.total_paid)
                              : "₹0 (Free)"}
                          </span>
                          {u.latest_payment_id && (
                            <span className="text-[9px] font-mono text-slate-400 truncate max-w-[100px]">
                              {u.latest_payment_id}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Listing Slots */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-lg font-black text-xs bg-blue-50 text-blue-800 border border-blue-200">
                          {u.listing_slots_left}
                        </span>
                      </td>

                      {/* Enquiry Tokens */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-lg font-black text-xs bg-amber-50 text-amber-900 border border-amber-200">
                          {u.enquiry_credits_left}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveModalUser(u)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="View Transaction History"
                          >
                            <Receipt size={14} />
                          </button>
                          <Link
                            to={`/admin/users/${u.id}`}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                            title="Inspect User Account"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Transaction History Modal */}
      {activeModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-charcoal/10 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-charcoal/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center text-sm border border-emerald-200">
                  {activeModalUser.name ? activeModalUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-charcoal">
                    {activeModalUser.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Role: <span className="font-bold text-charcoal">{activeModalUser.role}</span> | State:{" "}
                    <span className="font-bold text-charcoal">{activeModalUser.state}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalUser(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-charcoal transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Wallet Status */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-charcoal/5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Paid
                </span>
                <span className="font-extrabold font-display text-sm text-emerald-700">
                  {formatCurrency(activeModalUser.total_paid)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Listing Slots
                </span>
                <span className="font-extrabold text-sm text-blue-700">
                  {activeModalUser.listing_slots_left} slots left
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Enquiry Tokens
                </span>
                <span className="font-extrabold text-sm text-amber-700">
                  {activeModalUser.enquiry_credits_left} tokens left
                </span>
              </div>
            </div>

            {/* Transactions Ledger */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <h4 className="text-xs font-bold text-charcoal mb-2 uppercase tracking-wider">
                Packages & Credit Transactions
              </h4>
              {activeModalUser.transactions && activeModalUser.transactions.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {activeModalUser.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl border border-charcoal/10 bg-white flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-charcoal">
                          {tx.notes || `${tx.transaction_type} ${tx.credit_type}`}
                        </span>
                        <span
                          className={`font-black ${
                            tx.price_paid > 0 ? "text-emerald-700" : "text-slate-500"
                          }`}
                        >
                          {tx.price_paid > 0 ? formatCurrency(tx.price_paid) : "₹0 (Free Bonus)"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span>
                          Added: <strong className="text-charcoal">+{tx.amount_credits}</strong> (
                          {tx.credit_type === "listing_slot" ? "Slots" : "Tokens"})
                        </span>
                        <span>
                          Balance After: <strong className="text-charcoal">{tx.balance_after}</strong>
                        </span>
                        <span>Date: {formatDate(tx.created_at)}</span>
                      </div>

                      {(tx.payment_id || tx.order_id) && (
                        <div className="text-[10px] font-mono text-slate-400 bg-slate-50 p-1.5 rounded-lg border border-charcoal/5 flex flex-wrap gap-2">
                          {tx.payment_id && <span>Payment ID: {tx.payment_id}</span>}
                          {tx.order_id && <span>Order ID: {tx.order_id}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No explicit transaction entries recorded. Default starter pack tokens active.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-charcoal/10 flex items-center justify-between">
              <Link
                to={`/admin/users/${activeModalUser.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
              >
                <span>Open Full User Profile</span>
                <ExternalLink size={12} />
              </Link>
              <button
                onClick={() => setActiveModalUser(null)}
                className="px-4 py-2 bg-charcoal text-white rounded-xl text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
