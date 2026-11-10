import { useState, useEffect } from "react";
import { Star, CheckCircle, ChevronLeft, ChevronRight, User, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
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
  const [currentSlide, setCurrentSlide] = useState(0);

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
        const list = data?.reviews || [];
        setReviews(list);
        if (data?.summary) {
          setSummary(data.summary);
        } else if (list.length > 0) {
          const avg = list.reduce((acc, r) => acc + (r.rating || 5), 0) / list.length;
          setSummary({ totalReviews: list.length, averageRating: avg });
        }
      })
      .catch((err) => {
        console.error("Failed to load customer reviews:", err);
      })
      .finally(() => setLoading(false));
  }, [targetUserId]);

  // Auto-slide every 6s when multiple reviews exist
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length]);

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
  const currentReview = reviews.length > 0 ? reviews[currentSlide % reviews.length] : null;

  // Review Form sub-component
  const ReviewFormElement = (
    <div className="flex flex-col justify-center text-left">
      <h3 className="font-display font-extrabold text-2xl sm:text-[26px] text-gray-900 tracking-tight leading-tight">
        We'd love to <span className="text-[#2E7D32]">hear from you!</span>
      </h3>

      <form onSubmit={handleSubmitReview} className="mt-4 flex flex-col gap-3">
        {/* Services Star Rating Row */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-gray-800">Services</span>
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
                  size={18}
                  className={`${
                    star <= activeRating
                      ? "text-[#2E7D32] fill-[#2E7D32]"
                      : "text-gray-300 fill-gray-200"
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
            className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition"
          />
        </div>

        {/* Contact Number & Mail ID side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="tel"
            placeholder="Contact Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition"
          />
          <input
            type="email"
            placeholder="Mail ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] transition"
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
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] resize-none transition"
          />
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
            {errorMessage}
          </p>
        )}

        {/* Submit Button */}
        <div className="pt-0.5">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 rounded-full bg-[#2E7D32] hover:bg-[#256629] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer w-fit"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <section className="w-full flex flex-col gap-4 mt-6">
      {/* Success banner if submitted */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-xs animate-fade-in text-left">
          <CheckCircle className="text-emerald-600 shrink-0" size={20} />
          <div className="text-xs font-semibold leading-relaxed">
            {successMessage}
          </div>
        </div>
      )}

      {/* CASE 1: IF NO REVIEWS EXIST YET -> JUST SHOW review_text_box.jpg */}
      {reviews.length === 0 ? (
        <div className="w-full bg-[#F3F4F6] rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col items-center justify-center text-center">
          <img
            src="/images/review_text_box.jpg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://airaproperties.in/images/review_text_box.jpg";
            }}
            alt="Customer Reviews"
            onClick={() => !isOwnProfile && setShowReviewForm(!showReviewForm)}
            className={`w-full max-w-2xl h-auto object-contain rounded-2xl shadow-xs ${
              !isOwnProfile ? "cursor-pointer hover:opacity-95 transition" : ""
            }`}
          />

          {/* Toggle Write Review Button for visitors if no reviews yet */}
          {!isOwnProfile && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-6 py-2.5 bg-[#2E7D32] hover:bg-[#256629] text-white text-xs sm:text-sm font-bold rounded-full shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer mx-auto"
              >
                <MessageSquare size={16} />
                <span>{showReviewForm ? "Close Review Form" : "Write a Review"}</span>
                {showReviewForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          )}

          {/* Expandable Form if toggled */}
          {showReviewForm && !isOwnProfile && (
            <div className="w-full max-w-xl mt-6 text-left animate-fade-in bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              {ReviewFormElement}
            </div>
          )}
        </div>
      ) : (
        /* CASE 2: IF REVIEWS ALREADY EXIST -> 3-COLUMN UNIFIED DESIGN:
           LEFT: review_banner.jpg | MIDDLE: review with comments & slider | RIGHT: review form */
        <div className="w-full bg-[#F7F7F8] rounded-3xl p-4 sm:p-6 lg:p-7 border border-gray-200/80 shadow-xs flex flex-col lg:flex-row items-stretch gap-5 sm:gap-6 text-left overflow-hidden">
          
          {/* COLUMN 1: LEFT SIDE - review_banner.jpg */}
          <div className="w-full lg:w-[28%] xl:w-[26%] shrink-0 flex items-center justify-center rounded-2xl overflow-hidden bg-white shadow-2xs border border-gray-100">
            <img
              src="/images/review_banner.jpg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://airaproperties.in/images/review_banner.jpg";
              }}
              alt="The power of Reviews in building trust"
              className="w-full h-full object-cover max-h-[360px] sm:max-h-[440px] rounded-2xl"
            />
          </div>

          {/* COLUMN 2: MIDDLE - REVIEW WITH COMMENTS + SLIDER */}
          <div className="flex-1 min-w-0 flex flex-col justify-between bg-[#FCFCFA] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/70 shadow-2xs">
            {/* Top row: Customer Ratings Badge + Slider Controls */}
            <div className="flex items-start justify-between gap-3">
              {/* Customer Ratings Badge */}
              <div className="bg-white/95 border border-gray-200/80 rounded-xl px-4 py-2.5 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2E7D32] block">
                  CUSTOMER RATINGS
                </span>
                <p className="text-sm font-black text-gray-900 mt-0.5 leading-tight">
                  {summary.averageRating.toFixed(1)} out of 5.0 Stars
                </p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Based on {reviews.length} verified {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>

              {/* Slider Next Button (Green square/pill button as in screenshot) */}
              {reviews.length > 1 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length)}
                    className="w-10 h-10 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-xs"
                    title="Previous Review"
                    aria-label="Previous Review"
                  >
                    <ChevronLeft size={22} className="stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % reviews.length)}
                    className="w-10 h-10 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-xs"
                    title="Next Review"
                    aria-label="Next Review"
                  >
                    <ChevronRight size={22} className="stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>

            {/* Active Review Card Details */}
            {currentReview && (
              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Reviewer Header Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-[#D4EDDA] text-[#2E7D32] font-black text-base flex items-center justify-center shrink-0 border border-[#C3E6CB]">
                        {currentReview.reviewer_name
                          ? currentReview.reviewer_name.charAt(0).toUpperCase()
                          : <User size={18} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                          {currentReview.reviewer_name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#2E7D32]">
                          <CheckCircle size={12} className="stroke-[2.5]" />
                          <span>Verified Review</span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= currentReview.rating
                              ? "text-[#2E7D32] fill-[#2E7D32]"
                              : "text-gray-300 fill-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment speech card */}
                  <div className="mt-4 bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-2xs">
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                      "{currentReview.comment}"
                    </p>
                  </div>
                </div>

                {/* Footer with date & slide index */}
                <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
                  {reviews.length > 1 ? (
                    <span className="font-bold text-[#2E7D32]">
                      {currentSlide + 1} of {reviews.length}
                    </span>
                  ) : <span />}
                  <span>
                    {currentReview.created_at
                      ? new Date(currentReview.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 3: RIGHT SIDE - REVIEW FORM */}
          {!isOwnProfile ? (
            <div className="w-full lg:w-[38%] xl:w-[36%] shrink-0 flex flex-col justify-center bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-2xs">
              {ReviewFormElement}
            </div>
          ) : (
            /* On user's own profile, show a clean message or stats instead of self-reviewing */
            <div className="w-full lg:w-[32%] shrink-0 flex flex-col justify-center items-center bg-white rounded-2xl sm:rounded-3xl p-6 border border-gray-200/80 shadow-2xs text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#2E7D32] flex items-center justify-center border border-emerald-100">
                <CheckCircle size={24} />
              </div>
              <h4 className="font-bold text-base text-gray-900">Your Verified Reviews</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Customers and clients can leave feedback directly on your public profile. Approved reviews are displayed here to build trust.
              </p>
            </div>
          )}

        </div>
      )}
    </section>
  );
}
