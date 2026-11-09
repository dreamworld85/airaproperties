import { useState, useEffect } from "react";
import { Star, CheckCircle, MessageSquare, Send, ChevronDown, ChevronUp, User } from "lucide-react";
import { api, CustomerReviewItem } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface CustomerReviewsSectionProps {
  targetUserId: number | string;
  targetUserName?: string;
  isOwnProfile?: boolean;
}

export default function CustomerReviewsSection({
  targetUserId,
  targetUserName = "User",
  isOwnProfile = false,
}: CustomerReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<CustomerReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalReviews: 0, averageRating: 5.0 });

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Load confirmed customer reviews
  useEffect(() => {
    if (!targetUserId) return;
    setLoading(true);
    api.fetchCustomerReviews(targetUserId)
      .then((data) => {
        setReviews(data?.reviews || []);
        if (data?.summary) {
          setSummary(data.summary);
        }
      })
      .catch((err) => {
        console.error("Failed to load customer reviews:", err);
      })
      .finally(() => setLoading(false));
  }, [targetUserId]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!comment.trim()) {
      setErrorMessage("Please enter your review comments.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitCustomerReview(targetUserId, {
        rating,
        comment: comment.trim(),
        reviewer_name: name.trim(),
        reviewer_phone: phone.trim() || undefined,
        reviewer_email: email.trim() || undefined,
      });

      setSuccessMessage(
        res.message || "Thank you! Your review has been submitted and will appear once approved by admin."
      );
      setComment("");
      if (!user) {
        setName("");
        setPhone("");
        setEmail("");
      }
      setShowReviewForm(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeRating = hoverRating !== null ? hoverRating : rating;

  // Review Form Component matching attached image design
  const ReviewFormComponent = (
    <div className="w-full bg-[#F3F4F6] rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 overflow-hidden text-left">
      {/* Left side banner image */}
      <div className="w-full lg:w-[320px] shrink-0 flex items-center justify-center">
        <img
          src="/images/review_banner.jpg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/review_banner.jpg";
          }}
          alt="The power of Reviews in building trust"
          className="w-full max-w-[280px] lg:max-w-[320px] h-auto object-contain rounded-2xl shadow-xs"
        />
      </div>

      {/* Center form */}
      <div className="flex-1 w-full max-w-xl flex flex-col justify-center">
        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight text-center lg:text-left">
          We'd love to <span className="text-[#2E7D32]">hear from you!</span>
        </h3>

        <form onSubmit={handleSubmitReview} className="mt-5 flex flex-col gap-3.5">
          {/* Services Star Rating Row */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Services</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="cursor-pointer transition-transform hover:scale-115 focus:outline-none p-0.5"
                  title={`${star} Star`}
                >
                  <Star
                    size={22}
                    className={`${
                      star <= activeRating
                        ? "text-[#2E7D32] fill-[#2E7D32]"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-[#2E7D32] ml-1">
              ({rating}/5)
            </span>
          </div>

          {/* Name Input */}
          <div>
            <input
              type="text"
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-400 bg-white/90 text-sm font-medium text-gray-900 placeholder:text-gray-500 outline-none focus:border-[#2E7D32] focus:bg-white transition"
            />
          </div>

          {/* Optional Phone & Email (Clean compact row for admin verification) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="tel"
              placeholder="Contact Number (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/80 text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2E7D32] focus:bg-white transition"
            />
            <input
              type="email"
              placeholder="Mail ID (Optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white/80 text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2E7D32] focus:bg-white transition"
            />
          </div>

          {/* Review Comments Textarea */}
          <div>
            <textarea
              required
              rows={3}
              placeholder="Review Comments"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-400 bg-white/90 text-sm font-medium text-gray-900 placeholder:text-gray-500 outline-none focus:border-[#2E7D32] focus:bg-white resize-none transition"
            />
          </div>

          {/* Error / Success Feedback */}
          {errorMessage && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {errorMessage}
            </p>
          )}

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 rounded-full bg-[#2E7D32] hover:bg-[#256629] text-white text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer w-fit"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* Right side feedback graphic */}
      <div className="w-full lg:w-[320px] shrink-0 hidden md:flex items-center justify-center">
        <img
          src="/images/review_text_box.jpg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/review_text_box.jpg";
          }}
          alt="Customer Feedback Preview"
          className="w-full max-w-[280px] lg:max-w-[320px] h-auto object-contain rounded-2xl shadow-xs"
        />
      </div>
    </div>
  );

  return (
    <section className="w-full flex flex-col gap-6 mt-6">
      {/* Success banner if submitted */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-xs animate-fade-in">
          <CheckCircle className="text-emerald-600 shrink-0" size={20} />
          <div className="text-xs font-semibold leading-relaxed">
            {successMessage}
          </div>
        </div>
      )}

      {/* IF THERE ARE CONFIRMED REVIEWS: SHOW FRONTEND REVIEWS LIST */}
      {reviews.length > 0 ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col gap-6 text-left">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2E7D32] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-600/10">
                  Verified Feedback
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 font-medium">{reviews.length} Customer Reviews</span>
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-gray-900 tracking-tight mt-1">
                Customer Reviews
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Star summary badge */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200/60">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={
                        s <= Math.round(summary.averageRating)
                          ? "text-[#2E7D32] fill-[#2E7D32]"
                          : "text-gray-300 fill-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-[#2E7D32]">
                  {summary.averageRating.toFixed(1)} / 5.0
                </span>
              </div>

              {/* Toggle Write Review Button */}
              {!isOwnProfile && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>{showReviewForm ? "Close Form" : "Write a Review"}</span>
                  {showReviewForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
          </div>

          {/* Expandable Write Review Form if toggled */}
          {showReviewForm && (
            <div className="animate-fade-in">
              {ReviewFormComponent}
            </div>
          )}

          {/* Grid of Confirmed Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-[#FAF8F3] hover:bg-white border border-gray-200/70 hover:border-gray-300 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition-all text-left"
              >
                <div>
                  {/* Reviewer Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                        {r.reviewer_name ? r.reviewer_name.charAt(0).toUpperCase() : <User size={15} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                          {r.reviewer_name}
                        </h4>
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle size={10} /> Verified Review
                        </span>
                      </div>
                    </div>

                    {/* Star rating */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={
                            star <= r.rating
                              ? "text-emerald-600 fill-emerald-600"
                              : "text-gray-300 fill-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-gray-700 mt-3 leading-relaxed bg-white/70 p-3 rounded-xl border border-gray-100">
                    "{r.comment}"
                  </p>
                </div>

                {/* Footer with date */}
                <span className="text-[10px] text-gray-400 self-end font-medium">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* OR ELSE: IF NO REVIEWS YET, SHOW LEFT SIDE IMAGE, FORM, AND RIGHT SIDE IMAGE */
        ReviewFormComponent
      )}
    </section>
  );
}
