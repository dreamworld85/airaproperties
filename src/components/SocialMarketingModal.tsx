import React, { useState, useEffect } from "react";
import { 
  X, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight,
  CheckCheck,
  Flame,
  Layers,
  ChevronRight
} from "lucide-react";
import { api, ApiSubscriptionPlan } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

interface SocialMarketingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PaymentSuccessDetails {
  paymentId: string;
  orderId?: string;
  amount: number;
  planName: string;
  propertyCount: number;
  userName: string;
}

export default function SocialMarketingModal({
  isOpen,
  onClose,
  onSuccess,
}: SocialMarketingModalProps) {
  const { user, login } = useAuth();
  const [plans, setPlans] = useState<ApiSubscriptionPlan[]>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<number | string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessDetails | null>(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    api.fetchSubscriptionPlans()
      .then((data) => {
        const socialPlans = data
          .filter((p: any) => p.role === "social_media" && p.is_active !== 0)
          .map((p: any) => {
            let parsedFeatures: string[] = [];
            try {
              if (p.features) {
                parsedFeatures = typeof p.features === "string" ? JSON.parse(p.features) : p.features;
              }
            } catch (e) {
              console.error("Failed to parse social features:", e);
            }
            return {
              id: p.id,
              plan_id: p.plan_id || `social_${p.id}`,
              name: p.name || "Social Media Publish",
              role: "social_media",
              plan_type: p.plan_type || "social_media",
              credits: Number(p.credits || p.listing_slots || 1),
              listing_slots: Number(p.listing_slots ?? (p.credits || 1)),
              enquiry_tokens: Number(p.enquiry_tokens || 0),
              price: Number(p.price || 499),
              discount: Number(p.discount || 100),
              description: p.description || "Upload & promote your property across all major social media platforms.",
              duration_months: p.duration_months || 0,
              features: Array.isArray(parsedFeatures) && parsedFeatures.length > 0 ? parsedFeatures : [
                "1 Property Promoted Across Platforms",
                "Instagram Reel & Carousel Post Blast",
                "Facebook Page & Real Estate Group Sharing",
                "WhatsApp Broadcast to Active Buyers",
                "Verified Listing Badge & Reach Analytics"
              ],
            };
          });

        if (socialPlans.length > 0) {
          setPlans(socialPlans);
        } else {
          // Fallback default starter & pro
          const fallback: any[] = [
            {
              id: 999991,
              plan_id: "social_media_starter",
              name: "Social Media Starter",
              role: "social_media",
              plan_type: "social_media",
              credits: 1,
              listing_slots: 1,
              enquiry_tokens: 0,
              price: 499,
              discount: 100,
              description: "Promote 1 Property across Instagram, Facebook & WhatsApp network with dedicated reach.",
              features: [
                "1 Property Promoted Across Platforms",
                "Instagram Reel & Carousel Post Blast",
                "Facebook Page & Real Estate Group Sharing",
                "WhatsApp Broadcast to Active Buyers",
                "Verified Listing Badge & Reach Analytics"
              ],
            },
            {
              id: 999992,
              plan_id: "social_media_pro",
              name: "Social Media Pro (3 Properties)",
              role: "social_media",
              plan_type: "social_media",
              credits: 3,
              listing_slots: 3,
              enquiry_tokens: 0,
              price: 1299,
              discount: 300,
              description: "Promote 3 Properties with video highlights and high-engagement targeted campaigns.",
              features: [
                "3 Properties Promoted Across Platforms",
                "Instagram Reels + Story Highlights Blast",
                "Facebook Sponsored Boost & Community Groups",
                "YouTube Shorts Video Showcase",
                "Dedicated Buyer Lead Inquiries Forwarding",
                "Save ₹300 with Multi-Property Discount"
              ],
            }
          ];
          setPlans(fallback);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch social marketing plans:", err);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribePlan = async (plan: ApiSubscriptionPlan) => {
    const finalPrice = Math.max(0, Number(plan.price) - Number(plan.discount || 0));
    const propertyCount = Number(plan.listing_slots || plan.credits || 1);
    const planIdentifier = (plan.id || plan.plan_id) ?? null;

    setLoadingPlanId(planIdentifier);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please check your internet connection.");
        setLoadingPlanId(null);
        return;
      }

      // 1. Create order
      const subscription = await api.initiateSubscription({
        planId: plan.id,
        plan_id: plan.plan_id,
        planType: "social_media",
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: subscription.key || subscription.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TjCoQOO2xpM24Y",
        amount: subscription.amount,
        currency: subscription.currency || "INR",
        order_id: subscription.id,
        name: "Aira Properties",
        image: window.location.origin + "/brand_logo-web.png",
        description: plan.name ? `${plan.name} (${propertyCount} Properties Social Publish)` : "Social Marketing Package",
        handler: async function (response: any) {
          try {
            setLoadingPlanId(planIdentifier);
            const verifyRes = await api.verifySubscription({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              plan_id: plan.plan_id,
            });

            // Update user auth profile in state
            if (user) {
              const updatedUser = await api.fetchMyProfile().catch(() => null);
              if (updatedUser) {
                login(localStorage.getItem("kr_token") || "", updatedUser);
              }
            }

            setPaymentSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: verifyRes.amount ?? finalPrice,
              planName: plan.name || "Social Media Publish",
              propertyCount,
              userName: user?.name || user?.email || "Aira User",
            });

            if (onSuccess) onSuccess();
          } catch (err: any) {
            alert("Verification failed: " + (err.message || err));
          } finally {
            setLoadingPlanId(null);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#7E22CE", // Royal Purple
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Failed to initiate Social Marketing subscription.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const copyPaymentId = () => {
    if (!paymentSuccess?.paymentId) return;
    navigator.clipboard.writeText(paymentSuccess.paymentId);
    setCopiedPaymentId(true);
    setTimeout(() => setCopiedPaymentId(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-5 sm:p-7 w-full max-w-3xl border border-charcoal/10 shadow-2xl relative flex flex-col items-center text-center gap-4 animate-slide-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-all cursor-pointer z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {paymentSuccess ? (
          /* Payment Success View */
          <div className="w-full max-w-md flex flex-col items-center text-center gap-4 animate-scale-up py-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center ring-8 ring-purple-50 mt-1 shadow-sm">
              <CheckCircle2 size={36} className="text-purple-600" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-0.5 rounded-full">
                <Sparkles size={11} />
                <span>Subscription Confirmed</span>
              </div>
              <h3 className="font-display font-black text-2xl text-gray-900">
                Order Successful!
              </h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Thank you, <strong>{paymentSuccess.userName}</strong>. Your <strong>{paymentSuccess.planName}</strong> package is active. Our marketing team is preparing your social property campaigns!
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full bg-slate-50 border border-charcoal/10 rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Package:</span>
                <span className="font-bold text-gray-900">{paymentSuccess.planName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Properties Covered:</span>
                <span className="font-bold text-purple-700">{paymentSuccess.propertyCount} Properties</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Amount Paid:</span>
                <span className="font-bold text-emerald-700 font-display text-sm">₹{paymentSuccess.amount}</span>
              </div>
              <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment ID</span>
                  <span className="font-mono text-[11px] text-gray-700 truncate block select-all font-semibold">
                    {paymentSuccess.paymentId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyPaymentId}
                  className="shrink-0 p-1.5 rounded-lg border border-charcoal/10 hover:bg-white text-slate-600 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                >
                  {copiedPaymentId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span className="text-[10px]">{copiedPaymentId ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold font-display shadow-md transition-all active:scale-[0.98] cursor-pointer mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          /* ALL PRICING WITH DETAILS VIEW */
          <div className="w-full flex flex-col items-center gap-5">
            {/* Header: Title & Badges */}
            <div className="flex flex-col items-center gap-2 pt-1 max-w-xl">
              <div className="w-16 h-16 rounded-2xl bg-white border border-purple-200/80 p-2.5 flex items-center justify-center shadow-md">
                <img src="/social-media.png" alt="Social Media" className="w-full h-full object-contain" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border border-purple-200/60 shadow-2xs">
                <Flame size={13} className="text-pink-600 fill-pink-600" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  Social Media Marketing
                </span>
              </div>

              <h2 className="font-display font-black text-xl sm:text-2xl text-ink tracking-tight">
                Upload Property to All Social Media Platforms
              </h2>

              <p className="text-xs text-slate-600 max-w-lg leading-relaxed font-medium">
                Get massive visibility! We produce high-impact reels, posts, and broadcasts to deliver verified buyer leads directly to you.
              </p>

              {/* Social Channels Pills */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center mt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 text-pink-700 border border-pink-200 shadow-2xs">
                  📸 Instagram
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                  👍 Facebook
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 shadow-2xs">
                  ▶️ YouTube
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  💬 WhatsApp
                </span>
              </div>
            </div>

            {/* ALL PACKAGES WITH PRICING & FULL DETAILS */}
            <div className={`w-full grid gap-4 text-left ${plans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
              {plans.map((p, pIdx) => {
                const finalPrice = Math.max(0, Number(p.price) - Number(p.discount || 0));
                const numProperties = Number(p.listing_slots || p.credits || 1);
                const isPromoted = pIdx === 0 || numProperties > 1;
                const featuresList: string[] = Array.isArray(p.features) ? p.features : [];
                const isCurrentPlanLoading = loadingPlanId === (p.id || p.plan_id);

                return (
                  <div
                    key={p.id || p.plan_id || pIdx}
                    className="relative flex flex-col justify-between bg-[#FAF8F3] hover:bg-white border-2 border-purple-200/90 hover:border-purple-500 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all"
                  >
                    {/* Top Row: Package Name & Capacity */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md mb-1.5">
                            <img src="/social-media.png" alt="Social" className="w-3.5 h-3.5 object-contain" />
                            <span>Social Publish</span>
                          </div>
                          <h3 className="font-display font-black text-lg text-gray-900 leading-tight">
                            {p.name}
                          </h3>
                        </div>

                        {/* Number of Property Tag */}
                        <div className="text-right shrink-0 bg-white border border-purple-300 px-3 py-1 rounded-xl shadow-2xs">
                          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Number of</span>
                          <span className="font-display font-black text-xs text-purple-800">
                            {numProperties} {numProperties === 1 ? "Property" : "Properties"}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                        {p.description}
                      </p>

                      {/* Pricing Box */}
                      <div className="my-4 p-3.5 bg-white rounded-2xl border border-charcoal/5 flex items-center justify-between shadow-2xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Payable Price
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-display font-black text-2xl text-emerald-700">
                              ₹{finalPrice}
                            </span>
                            {Number(p.discount) > 0 && (
                              <span className="text-xs text-slate-400 line-through font-semibold">
                                ₹{p.price}
                              </span>
                            )}
                          </div>
                        </div>

                        {Number(p.discount) > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200 block shadow-2xs">
                              Save ₹{p.discount}
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                              Instant Discount
                            </span>
                          </div>
                        )}
                      </div>

                      {/* What We Do / Features List */}
                      <div className="space-y-2 mb-5">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          What We Do (Details & Platforms):
                        </span>
                        <div className="space-y-2">
                          {featuresList.map((feat: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-charcoal">
                              <CheckCheck size={15} className="text-purple-600 shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Subscribe Button */}
                    <button
                      type="button"
                      disabled={isCurrentPlanLoading || loadingPlanId !== null}
                      onClick={() => handleSubscribePlan(p)}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-2xl text-xs sm:text-sm font-bold font-display flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
                    >
                      <Sparkles size={15} />
                      <span>
                        {isCurrentPlanLoading 
                          ? "Connecting Gateway..." 
                          : `Subscribe for ₹${finalPrice}`}
                      </span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer Trust Info */}
            <p className="text-[11px] text-slate-400 font-medium pt-1">
              🔒 100% Secure Checkout via Razorpay • Instant Activation • Verified Buyer Network
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
