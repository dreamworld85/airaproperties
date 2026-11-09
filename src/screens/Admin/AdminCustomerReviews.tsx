import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Star, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  MessageSquare, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock,
  Sparkles
} from "lucide-react";
import { adminApi, AdminCustomerReview } from "@/lib/adminApi";
import { toSlug } from "../AgencyProfile";

export default function AdminCustomerReviews() {
  const [reviews, setReviews] = useState<AdminCustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending">("all");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Edit Modal State
  const [editingReview, setEditingReview] = useState<AdminCustomerReview | null>(null);
  const [editForm, setEditForm] = useState({
    reviewer_name: "",
    reviewer_phone: "",
    reviewer_email: "",
    rating: 5,
    comment: "",
    is_confirmed: 1,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  async function loadReviews() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getCustomerReviews();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || "Failed to load customer reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleToggleConfirm(review: AdminCustomerReview) {
    setTogglingId(review.id);
    try {
      const res = await adminApi.toggleCustomerReviewConfirm(review.id);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, is_confirmed: res.is_confirmed } : r))
      );
    } catch (err: any) {
      alert(err.message || "Failed to toggle review confirmation.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(reviewId: number) {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this review?");
    if (!confirmDelete) return;

    setDeletingId(reviewId);
    try {
      await adminApi.deleteCustomerReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      alert(err.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleOpenEdit(review: AdminCustomerReview) {
    setEditingReview(review);
    setEditForm({
      reviewer_name: review.reviewer_name || "",
      reviewer_phone: review.reviewer_phone || "",
      reviewer_email: review.reviewer_email || "",
      rating: review.rating || 5,
      comment: review.comment || "",
      is_confirmed: review.is_confirmed ? 1 : 0,
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingReview) return;
    setSavingEdit(true);
    try {
      await adminApi.updateCustomerReview(editingReview.id, editForm);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id
            ? {
                ...r,
                reviewer_name: editForm.reviewer_name,
                reviewer_phone: editForm.reviewer_phone,
                reviewer_email: editForm.reviewer_email,
                rating: editForm.rating,
                comment: editForm.comment,
                is_confirmed: editForm.is_confirmed,
              }
            : r
        )
      );
      setEditingReview(null);
    } catch (err: any) {
      alert(err.message || "Failed to update review.");
    } finally {
      setSavingEdit(false);
    }
  }

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter === "confirmed" && !r.is_confirmed) return false;
    if (statusFilter === "pending" && r.is_confirmed) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const reviewerName = (r.reviewer_name || "").toLowerCase();
    const reviewerPhone = (r.reviewer_phone || "").toLowerCase();
    const reviewerEmail = (r.reviewer_email || "").toLowerCase();
    const targetName = (r.target_user_name || "").toLowerCase();
    const comment = (r.comment || "").toLowerCase();

    return (
      reviewerName.includes(q) ||
      reviewerPhone.includes(q) ||
      reviewerEmail.includes(q) ||
      targetName.includes(q) ||
      comment.includes(q)
    );
  });

  const totalReviews = reviews.length;
  const confirmedCount = reviews.filter((r) => r.is_confirmed).length;
  const pendingCount = reviews.filter((r) => !r.is_confirmed).length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
    : "5.0";

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto flex flex-col gap-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-600/10">
              Reports Section
            </span>
            <span className="text-[10px] font-bold text-slate-400">•</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">User Reviews</span>
          </div>
          <h1 className="font-display font-black text-2xl text-gray-900 mt-1">Customer Reviews</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage feedback and testimonials for user profiles. Toggling confirm publishes the review to that user's public profile.
          </p>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-charcoal/10 rounded-xl text-xs font-bold text-gray-700 shadow-xs transition cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-emerald-600" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-charcoal/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Total Reviews</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{totalReviews}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Submitted across all profiles</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center">
            <MessageSquare size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-charcoal/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">Confirmed (Live)</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{confirmedCount}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Visible on public profiles</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-charcoal/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">Pending Review</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</p>
            <p className="text-[11px] text-amber-600 mt-0.5">Awaiting admin confirm</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-charcoal/10 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 block">Average Rating</span>
            <p className="text-2xl font-black text-gray-900 mt-1 flex items-center gap-1.5">
              <span>{avgRating}</span>
              <Star size={18} className="text-amber-400 fill-amber-400 inline" />
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">Out of 5.0 stars</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-charcoal/10 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl border border-charcoal/10 px-3.5 py-2.5 flex-1 min-w-[240px]">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by reviewer, phone, email, recipient, or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs outline-none text-gray-900 placeholder:text-gray-400 w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-700 cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "confirmed" ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "pending" ? "bg-amber-500 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Main Reviews Table */}
      <div className="bg-white rounded-2xl border border-charcoal/10 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-emerald-600" />
            <span className="text-xs font-semibold text-gray-500">Loading customer reviews...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 flex flex-col items-center justify-center gap-2">
            <span className="text-xs font-bold">{error}</span>
            <button onClick={loadReviews} className="text-xs underline text-emerald-600 font-semibold cursor-pointer">
              Try Again
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
            <MessageSquare size={36} className="text-gray-300 mb-1" />
            <span className="text-sm font-bold text-gray-800">No customer reviews found</span>
            <p className="text-xs text-gray-500">
              {search ? `No reviews matching "${search}"` : "No customer reviews have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-charcoal/10 text-gray-500 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="py-3.5 px-4">Reviewer Details</th>
                  <th className="py-3.5 px-4">Target User & Profile</th>
                  <th className="py-3.5 px-4">Rating & Review</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Confirm Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {filteredReviews.map((r) => {
                  const targetSlug = toSlug(r.target_user_name || "");
                  const profileUrl = targetSlug ? `/${targetSlug}` : `/agency/${r.target_user_id}`;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Reviewer Details (Name, Phone, Email) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
                            <User size={14} className="text-gray-400 shrink-0" />
                            <span>{r.reviewer_name || "Anonymous User"}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                            <Phone size={12} className="text-emerald-600 shrink-0" />
                            {r.reviewer_phone ? (
                              <a href={`tel:${r.reviewer_phone}`} className="hover:underline">
                                {r.reviewer_phone}
                              </a>
                            ) : (
                              <span className="text-gray-400 italic">No phone</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                            <Mail size={12} className="text-blue-500 shrink-0" />
                            {r.reviewer_email ? (
                              <a href={`mailto:${r.reviewer_email}`} className="hover:underline truncate max-w-[180px]">
                                {r.reviewer_email}
                              </a>
                            ) : (
                              <span className="text-gray-400 italic">No email</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Target User Info & Clickable Profile URL */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-gray-900 text-sm">
                            {r.target_user_name || `User #${r.target_user_id}`}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-600/10 uppercase tracking-wider">
                              {r.target_user_role || "User"}
                            </span>
                            {r.target_agency_name && (
                              <span className="text-[11px] text-gray-500 truncate max-w-[140px]">
                                {r.target_agency_name}
                              </span>
                            )}
                          </div>

                          {/* Profile URL link */}
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline mt-1 w-fit cursor-pointer"
                            title="Open User Profile Page"
                          >
                            <span>Open Profile Page</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>

                      {/* Rating & Review Comment */}
                      <td className="py-3.5 px-4 align-top max-w-sm">
                        <div className="flex flex-col gap-1.5">
                          {/* Star rating */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={
                                  star <= r.rating
                                    ? "text-emerald-500 fill-emerald-500"
                                    : "text-gray-200 fill-gray-200"
                                }
                              />
                            ))}
                            <span className="text-xs font-bold text-gray-700 ml-1.5">
                              {r.rating}.0
                            </span>
                          </div>

                          {/* Comment bubble */}
                          <p className="text-xs text-gray-800 bg-slate-50 border border-charcoal/5 rounded-xl p-2.5 leading-relaxed break-words whitespace-pre-wrap">
                            "{r.comment}"
                          </p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 align-top text-gray-500 text-[11px] whitespace-nowrap">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }) : "—"}
                      </td>

                      {/* Confirm Toggle Button */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            disabled={togglingId === r.id}
                            onClick={() => handleToggleConfirm(r)}
                            title={r.is_confirmed ? "Click to unconfirm (hide from profile)" : "Click to confirm (show on profile)"}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              r.is_confirmed ? "bg-emerald-600" : "bg-gray-300"
                            } ${togglingId === r.id ? "opacity-50" : ""}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                r.is_confirmed ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider ${
                              r.is_confirmed ? "text-emerald-600" : "text-gray-400"
                            }`}
                          >
                            {r.is_confirmed ? "Confirmed" : "Pending"}
                          </span>
                        </div>
                      </td>

                      {/* Edit and Delete Buttons */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700 transition cursor-pointer"
                            title="Edit Review Details"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Delete button */}
                          <button
                            disabled={deletingId === r.id}
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer border border-rose-100 disabled:opacity-50"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-charcoal/10 flex flex-col gap-5 text-left animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-display font-black text-lg text-gray-900">Edit Customer Review</h3>
                <p className="text-xs text-gray-500">For profile: {editingReview.target_user_name}</p>
              </div>
              <button
                onClick={() => setEditingReview(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              {/* Reviewer Name */}
              <div>
                <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.reviewer_name}
                  onChange={(e) => setEditForm({ ...editForm, reviewer_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-slate-50 text-xs font-semibold text-gray-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Reviewer Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={editForm.reviewer_phone}
                    onChange={(e) => setEditForm({ ...editForm, reviewer_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-slate-50 text-xs font-semibold text-gray-900 outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                    Mail ID
                  </label>
                  <input
                    type="email"
                    value={editForm.reviewer_email}
                    onChange={(e) => setEditForm({ ...editForm, reviewer_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-slate-50 text-xs font-semibold text-gray-900 outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                  Star Rating (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating: s })}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={
                          s <= editForm.rating
                            ? "text-emerald-500 fill-emerald-500"
                            : "text-gray-200 fill-gray-200"
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">{editForm.rating} of 5 Stars</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-[11px] font-extrabold text-gray-600 uppercase tracking-wider block mb-1">
                  Review Comments
                </label>
                <textarea
                  rows={4}
                  required
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-slate-50 text-xs font-semibold text-gray-900 outline-none focus:border-emerald-600 focus:bg-white resize-none"
                />
              </div>

              {/* Confirmation Status */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Confirm Review</span>
                  <span className="text-[10px] text-gray-500">Show this review on the user's public profile</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, is_confirmed: editForm.is_confirmed ? 0 : 1 })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    editForm.is_confirmed ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      editForm.is_confirmed ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {savingEdit ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
