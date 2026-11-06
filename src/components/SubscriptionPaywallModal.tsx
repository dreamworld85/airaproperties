import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Coins, 
  Home, 
  Layers, 
  UserCheck, 
  Copy, 
  Check, 
  ArrowRight 
} from "lucide-react";
import { api, ApiSubscriptionPlan } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

interface SubscriptionPaywallModalProps {
  onClose: () => void;
  onSuccess: () => void;
  targetRole?: string;
  initialPlanType?: string;
  initialDuration?: number;
  initialPlanId?: number | string | null;
}

interface PaymentSuccessDetails {
  paymentId: string;
  orderId?: string;
  amount: number;
  planName: string;
  listingSlotsAdded: number;
  enquiryTokensAdded: number;
  totalListingSlots: number;
  totalEnquiryTokens: number;
  userName: string;
  userRole: string;
}

export default function SubscriptionPaywallModal({
  onClose,
  onSuccess,
  targetRole,
  initialPlanId,
}: SubscriptionPaywallModalProps) {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<ApiSubscriptionPlan[]>([]);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessDetails | null>(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState(false);
  
  const rawRole = (targetRole || user?.role || "user").toLowerCase();
  const planRole = (rawRole === "buyer" || rawRole === "user") ? "user" : rawRole;
  const [selectedPlanId, setSelectedPlanId] = useState<number | string | null>(initialPlanId || null);

  useEffect(() => {
    api.fetchSubscriptionPlans()
      .then((data) => {
        const mapped = data.map((p: any) => {
          let parsedFeatures: string[] = [];
          try {
            if (p.features) {
              parsedFeatures = typeof p.features === "string" ? JSON.parse(p.features) : p.features;
            }
          } catch (e) {
            console.error("Failed to parse paywall features:", e);
          }
          return {
            id: p.id,
            plan_id: p.plan_id,
            name: p.name || "",
            role: (p.role || "").toLowerCase(),
            plan_type: p.plan_type || "combo",
            credits: Number(p.credits || 10),
            listing_slots: Number(p.listing_slots ?? (p.plan_type === 'listing_slots' ? p.credits : 0)),
            enquiry_tokens: Number(p.enquiry_tokens ?? (p.plan_type === 'enquiry_pack' ? p.credits : 0)),
            price: Number(p.price),
            discount: Number(p.discount || 0),
            description: p.description || "",
            duration_months: p.duration_months || 0,
            features: Array.isArray(parsedFeatures) ? parsedFeatures : []
          };
        });

        setPlans(mapped);
      })
      .catch((err) => console.error("Failed to fetch paywall plan details:", err));
  }, [user, targetRole]);

  // Strictly filter only packages matching this user's profile role
  const profilePlans = plans
    .filter((p) => p.role === planRole || (planRole === "user" && p.role === "buyer"))
    .sort((a, b) => Number(a.price) - Number(b.price));

  const selectedPlan = profilePlans.find((p) => p.id === selectedPlanId || p.plan_id === selectedPlanId) || profilePlans[0];

  const roleDisplayName = 
    planRole === "broker" ? "Broker" :
    planRole === "owner" ? "Owner" :
    planRole === "agency" ? "Agency" : "Buyer & Tenant";

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load payment gateway script. Check your internet connection.");
        setLoading(false);
        return;
      }

      // Create order with plan details
      const subscription = await api.initiateSubscription({
        planId: selectedPlan.id,
        plan_id: selectedPlan.plan_id,
        planType: selectedPlan.plan_type || "combo"
      });
      
      const options = {
        key: subscription.key || subscription.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TjCoQOO2xpM24Y",
        amount: subscription.amount,
        currency: subscription.currency,
        order_id: subscription.id,
        name: "Aira Properties",
        image: window.location.origin + "/brand_logo-web.png",
        description: selectedPlan.name ? `${selectedPlan.name} (${selectedPlan.listing_slots} Slots + ${selectedPlan.enquiry_tokens} Tokens)` : "Credit & Slot Top-up",
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

            const slotsCredited = verifyRes.listingSlotsAdded ?? Number(selectedPlan.listing_slots || 0);
            const tokensCredited = verifyRes.enquiryTokensAdded ?? Number(selectedPlan.enquiry_tokens || 0);
            const updatedEnquiry = verifyRes.enquiryCreditsLeft ?? ((user?.enquiryCreditsLeft ?? 0) + tokensCredited);
            const updatedSlots = verifyRes.listingSlotsLeft ?? ((user?.listingSlotsLeft ?? 0) + slotsCredited);

            // Update user auth state with new balances
            if (user) {
              login(localStorage.getItem("kr_token") || "", {
                ...user,
                enquiryCreditsLeft: updatedEnquiry,
                listingSlotsLeft: updatedSlots,
              });
            }

            // Show payment success details in popup instead of raw alert
            setPaymentSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: verifyRes.amount ?? Math.max(0, Number(selectedPlan.price) - Number(selectedPlan.discount || 0)),
              planName: verifyRes.planName || selectedPlan.name || "Top-up Package",
              listingSlotsAdded: slotsCredited,
              enquiryTokensAdded: tokensCredited,
              totalListingSlots: updatedSlots,
              totalEnquiryTokens: updatedEnquiry,
              userName: user?.name || user?.email || "Aira User",
              userRole: roleDisplayName,
            });
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
          color: "#1B5E4F",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Failed to initiate transaction. Please try again.");
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

  const handleFinishAndNavigateToProfile = () => {
    onSuccess();
    onClose();
    navigate("/profile");
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm"
      onClick={paymentSuccess ? handleFinishAndNavigateToProfile : onClose}
    >
      <div 
        className="bg-cream rounded-3xl p-6 w-full max-w-[440px] border border-charcoal/10 shadow-2xl relative flex flex-col items-center text-center gap-4 animate-slide-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {paymentSuccess ? (
          /* Payment Success View */
          <div className="w-full flex flex-col items-center text-center gap-4 animate-scale-up">
            {/* Close Button */}
            <button 
              onClick={handleFinishAndNavigateToProfile}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100/80 rounded-full text-slate transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#1B5E4F] flex items-center justify-center ring-8 ring-emerald-50/70 mt-1 shadow-sm">
              <CheckCircle2 size={36} className="text-[#1B5E4F]" />
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3 py-0.5 rounded-full mb-1">
                <Check size={12} className="stroke-[3]" />
                <span>Payment Verified</span>
              </div>
              <h3 className="font-display font-extrabold text-2xl text-ink">
                Payment Successful!
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#1B5E4F]">
                Thanks for choosing Aira property
              </p>
            </div>

            {/* Details Card */}
            <div className="w-full bg-white rounded-2xl border border-charcoal/10 divide-y divide-gray-100 text-left text-xs shadow-xs overflow-hidden">
              {/* User Name & User Type */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate uppercase tracking-wider block">User Name</span>
                  <span className="font-extrabold text-ink text-sm truncate block font-display">
                    {paymentSuccess.userName}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate uppercase tracking-wider block">User Type</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-[#1B5E4F] bg-emerald-100/80 px-2.5 py-0.5 rounded-full mt-0.5">
                    <UserCheck size={11} />
                    {paymentSuccess.userRole}
                  </span>
                </div>
              </div>

              {/* Tokens & Slots Purchased (Dynamically breakdown Listing / Enquiry) */}
              <div className="p-3.5 space-y-2 bg-emerald-50/30">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Purchased Package</span>
                  <span className="text-xs font-bold text-ink">{paymentSuccess.planName}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {paymentSuccess.listingSlotsAdded > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-[#1B5E4F] text-xs font-extrabold">
                      <Home size={13} className="text-[#1B5E4F]" />
                      <span>+{paymentSuccess.listingSlotsAdded} Listing Slots</span>
                    </div>
                  )}

                  {paymentSuccess.enquiryTokensAdded > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/70 border border-amber-200 text-amber-800 text-xs font-extrabold">
                      <Coins size={13} className="text-amber-600" />
                      <span>+{paymentSuccess.enquiryTokensAdded} Enquiry Tokens</span>
                    </div>
                  )}

                  {paymentSuccess.listingSlotsAdded === 0 && paymentSuccess.enquiryTokensAdded === 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-[#1B5E4F] text-xs font-extrabold">
                      <Sparkles size={13} />
                      <span>Credits Added</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Token Amount & Payment ID */}
              <div className="p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Purchase Token Amount</span>
                  <span className="text-base font-extrabold text-[#1B5E4F] font-display">
                    ₹{paymentSuccess.amount}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate uppercase tracking-wider block">Payment ID:</span>
                    <span className="font-mono text-[11px] font-semibold text-charcoal truncate block select-all">
                      {paymentSuccess.paymentId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyPaymentId}
                    className="shrink-0 p-1.5 rounded-lg border border-charcoal/10 hover:bg-gray-100 text-slate hover:text-ink transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    title="Copy Payment ID"
                  >
                    {copiedPaymentId ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-600 text-[10px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Total Balance Status */}
              <div className="p-3 bg-gray-50 flex items-center justify-between text-xs font-bold text-ink">
                <span className="text-slate text-[11px]">Updated Balance:</span>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1B5E4F]">
                    <Home size={12} /> {paymentSuccess.totalListingSlots} Slots
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700">
                    <Coins size={12} /> {paymentSuccess.totalEnquiryTokens} Tokens
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2 mt-1">
              <button
                onClick={handleFinishAndNavigateToProfile}
                className="w-full py-3.5 bg-[#1B5E4F] hover:bg-[#154a3e] text-white rounded-xl text-xs sm:text-sm font-bold font-display flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                <span>Go to Profile</span>
                <ArrowRight size={15} />
              </button>
              <button 
                onClick={handleFinishAndNavigateToProfile}
                className="w-full py-1 text-xs font-bold text-slate hover:text-charcoal cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Top-up Slots & Tokens View */
          <>
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100/80 rounded-full text-slate transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Icon & Title */}
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-[#1B5E4F] flex items-center justify-center shadow-inner mt-1 border border-emerald-100">
              <Layers size={26} className="text-[#1B5E4F]" />
            </div>
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#1B5E4F] bg-emerald-100/60 px-3 py-0.5 rounded-full mb-1">
                <UserCheck size={12} />
                <span>{roleDisplayName} Packages</span>
              </div>
              <h3 className="font-display font-extrabold text-xl text-ink">
                Top-up Slots & Tokens
              </h3>
              <p className="text-xs text-slate px-2">
                Every plan includes both <strong>Active Listing Slots</strong> and <strong>Enquiry Tokens</strong> that never expire!
              </p>
            </div>

            {/* Balance Status Banner */}
            <div className="w-full py-2.5 px-3 bg-white rounded-2xl border border-charcoal/10 flex items-center justify-around text-xs font-bold text-ink">
              <div className="flex items-center gap-1.5">
                <Coins size={15} className="text-amber-500" />
                <span className="text-slate text-[11px]">Tokens:</span>
                <span className="text-ink font-extrabold">{user?.enquiryCreditsLeft ?? 0}</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <Home size={15} className="text-[#1B5E4F]" />
                <span className="text-slate text-[11px]">Slots:</span>
                <span className="text-ink font-extrabold">{user?.listingSlotsLeft ?? 0}</span>
              </div>
            </div>

            {/* Package Selector Cards (Profile only) */}
            <div className="w-full flex flex-col gap-2.5">
              {profilePlans.map((planItem) => {
                const finalPrice = Math.max(0, Number(planItem.price) - Number(planItem.discount || 0));
                const isSelected = selectedPlan?.id === planItem.id || selectedPlan?.plan_id === planItem.plan_id;
                return (
                  <div
                    key={planItem.id || planItem.plan_id}
                    onClick={() => setSelectedPlanId(planItem.id || planItem.plan_id || null)}
                    className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected 
                        ? "border-[#1B5E4F] bg-emerald-50/50 ring-2 ring-[#1B5E4F]/20 shadow-xs" 
                        : "border-charcoal/10 bg-white hover:border-charcoal/30"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-ink font-display">
                          {planItem.name || `${planItem.listing_slots} Slots + ${planItem.enquiry_tokens} Tokens`}
                        </span>
                        {Number(planItem.discount) > 0 && (
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Save ₹{planItem.discount}
                          </span>
                        )}
                      </div>

                      {/* Dual Badges: Listing Slots & Enquiry Tokens */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1B5E4F] bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          <Home size={11} /> {planItem.listing_slots} Slots
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                          <Coins size={11} /> {planItem.enquiry_tokens} Tokens
                        </span>
                      </div>

                      <p className="text-[11px] text-slate line-clamp-1">
                        {planItem.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-ink font-display">₹{finalPrice}</span>
                      {Number(planItem.discount) > 0 && (
                        <span className="text-[10px] text-slate line-through block">₹{planItem.price}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Highlights */}
            <div className="w-full bg-white rounded-2xl p-3.5 border border-charcoal/5 flex flex-col gap-2 text-left shadow-xs text-xs font-semibold text-charcoal">
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Zero Expiry — Both listing slots and enquiry tokens are valid forever</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>100% Reusable Slots — credited back instantly when properties sell</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Direct WhatsApp & phone reveals with unlocked contact permanence</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={handlePayment}
                disabled={loading || !selectedPlan}
                className="w-full py-3.5 bg-[#1B5E4F] hover:bg-[#154a3e] text-white rounded-xl text-xs sm:text-sm font-bold font-display flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles size={15} className="text-amber-300" />
                <span>
                  {loading 
                    ? "Initiating..." 
                    : `Top-up Now @ ₹${selectedPlan ? Math.max(0, Number(selectedPlan.price) - Number(selectedPlan.discount || 0)) : 199}`}
                </span>
              </button>
              <button 
                onClick={onClose} 
                className="w-full py-2 text-xs font-bold text-slate hover:text-charcoal cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate/75">
              <ShieldCheck size={13} className="text-emerald-600" /> Instant activation via Razorpay
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-1 text-[9px] text-slate/60 mt-0.5 border-t border-slate-100/50 pt-2 w-full">
              <Link to="/privacy" onClick={onClose} className="hover:underline">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" onClick={onClose} className="hover:underline">Terms</Link>
              <span>•</span>
              <Link to="/refund" onClick={onClose} className="hover:underline">Refund Policy</Link>
              <span>•</span>
              <Link to="/contact-us" onClick={onClose} className="hover:underline">Contact Us</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
