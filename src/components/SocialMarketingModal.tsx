import React, { useState, useEffect } from "react";
import { 
  X, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Home, 
  Copy, 
  Check, 
  ArrowRight,
  Send,
  Flame,
  CheckCheck
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
  const [selectedPlanId, setSelectedPlanId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(false);
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
          setSelectedPlanId(socialPlans[0].id || socialPlans[0].plan_id || null);
        } else {
          // Fallback default starter
          const fallback: any = {
            id: 999999,
            plan_id: "social_media_starter",
            name: "Social Media Starter",
            role: "social_media",
            plan_type: "social_media",
            credits: 1,
            listing_slots: 1,
            enquiry_tokens: 0,
            price: 499,
            discount: 100,
            description: "Upload & promote your property across all major social media platforms.",
            features: [
              "1 Property Promoted Across Platforms",
              "Instagram Reel & Carousel Post Blast",
              "Facebook Page & Real Estate Group Sharing",
              "WhatsApp Broadcast to Active Buyers",
              "Verified Listing Badge & Reach Analytics"
            ],
          };
          setPlans([fallback]);
          setSelectedPlanId(fallback.id);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch social marketing plans:", err);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId || p.plan_id === selectedPlanId) || plans[0];
  const finalPrice = selectedPlan ? Math.max(0, Number(selectedPlan.price) - Number(selectedPlan.discount || 0)) : 399;
  const propertyCount = Number(selectedPlan?.listing_slots || selectedPlan?.credits || 1);

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

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // 1. Create order
      const subscription = await api.initiateSubscription({
        planId: selectedPlan.id,
        plan_id: selectedPlan.plan_id,
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
        description: selectedPlan.name ? `${selectedPlan.name} (${propertyCount} Properties Social Publish)` : "Social Marketing Package",
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyRes = await api.verifySubscription({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: selectedPlan.id,
              plan_id: selectedPlan.plan_id,
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
              planName: selectedPlan.name || "Social Media Publish",
              propertyCount,
              userName: user?.name || user?.email || "Aira User",
            });

            if (onSuccess) onSuccess();
          } catch (err: any) {
            alert("Verification failed: " + (err.message || err));
          } finally {
            setLoading(false);
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
      setLoading(false);
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
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-[480px] border border-charcoal/10 shadow-2xl relative flex flex-col items-center text-center gap-4 animate-slide-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {paymentSuccess ? (
          /* Payment Success View */
          <div className="w-full flex flex-col items-center text-center gap-4 animate-scale-up py-2">
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
                Thank you, <strong>{paymentSuccess.userName}</strong>. Your <strong>{paymentSuccess.planName}</strong> package is active. Our team is preparing your social promotions.
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
          /* Package Showcase & Subscribe View */
          <>
            {/* Header Icon & Channels */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shadow-md">
                <Share2 size={28} />
              </div>

              {/* Social Channels Pill Badges */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center mt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                  Instagram
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Facebook
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                  YouTube
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  WhatsApp
                </span>
              </div>

              <div className="space-y-1 mt-1">
                <h3 className="font-display font-extrabold text-xl text-ink">
                  Social Marketing
                </h3>
                <p className="text-xs text-slate-600 max-w-sm leading-relaxed font-medium">
                  Upload & promote your property across all major social media platforms with high-engagement buyer reach.
                </p>
              </div>
            </div>

            {/* Package Selector Cards (If multiple) */}
            {plans.length > 1 && (
              <div className="w-full flex gap-2 overflow-x-auto no-scrollbar py-1">
                {plans.map((p) => {
                  const isSel = p.id === selectedPlanId || p.plan_id === selectedPlanId;
                  const numP = Number(p.listing_slots || p.credits || 1);
                  return (
                    <button
                      key={p.id || p.plan_id}
                      type="button"
                      onClick={() => setSelectedPlanId(p.id || p.plan_id || null)}
                      className={`flex-1 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSel 
                          ? "border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20 shadow-xs" 
                          : "border-charcoal/10 bg-slate-50 hover:bg-white"
                      }`}
                    >
                      <span className="block text-[11px] font-extrabold text-gray-900 truncate">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 block mt-0.5">
                        {numP} {numP === 1 ? "Property" : "Properties"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active Selected Package Highlights */}
            {selectedPlan && (
              <div className="w-full bg-[#FAF8F3] border border-charcoal/10 rounded-2xl p-4 text-left space-y-3 shadow-inner">
                {/* Title & Property Capacity Badge */}
                <div className="flex items-center justify-between gap-2 border-b border-charcoal/5 pb-2.5">
                  <div>
                    <h4 className="font-display font-extrabold text-sm text-gray-900">
                      {selectedPlan.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {selectedPlan.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-center bg-white border border-purple-200 px-2.5 py-1 rounded-xl shadow-2xs">
                    <span className="block text-[10px] font-bold text-purple-800 uppercase">Coverage</span>
                    <span className="font-display font-extrabold text-xs text-purple-900">
                      {propertyCount} {propertyCount === 1 ? "Property" : "Properties"}
                    </span>
                  </div>
                </div>

                {/* Bullet Points / What We Do */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    What We Do / Platforms Included:
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {(Array.isArray(selectedPlan.features) ? selectedPlan.features : []).map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-charcoal">
                        <CheckCheck size={14} className="text-purple-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Bar */}
                <div className="pt-2 border-t border-charcoal/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Price</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display font-black text-xl text-emerald-700">
                        ₹{finalPrice}
                      </span>
                      {Number(selectedPlan.discount) > 0 && (
                        <span className="text-xs text-slate-400 line-through font-medium">
                          ₹{selectedPlan.price}
                        </span>
                      )}
                    </div>
                  </div>
                  {Number(selectedPlan.discount) > 0 && (
                    <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Save ₹{selectedPlan.discount}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Subscribe Action Button */}
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs sm:text-sm font-bold font-display flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              <Sparkles size={15} />
              <span>{loading ? "Connecting Gateway..." : `Subscribe & Publish (₹${finalPrice})`}</span>
              <ArrowRight size={15} />
            </button>

            <p className="text-[10px] text-slate-400 font-medium">
              Secure 256-bit encrypted checkout via Razorpay • 100% Verified Reach
            </p>
          </>
        )}
      </div>
    </div>
  );
}
