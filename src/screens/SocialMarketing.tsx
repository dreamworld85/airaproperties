import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import DesktopHeader from "../components/DesktopHeader";
import DesktopFooter from "../components/DesktopFooter";
import { useAuth } from "../lib/AuthContext";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Check, 
  Copy, 
  CheckCheck,
  Flame,
  Layers,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  PlusCircle
} from "lucide-react";
import { api, ApiSubscriptionPlan } from "../lib/api";

interface PaymentSuccessDetails {
  paymentId: string;
  orderId?: string;
  amount: number;
  planName: string;
  propertyCount: number;
  userName: string;
}

export default function SocialMarketing() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [plans, setPlans] = useState<ApiSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState<number | string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessDetails | null>(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadPlans = () => {
    setLoading(true);
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
              discount: Number(p.discount || 0),
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
          // Fallback default plans
          const fallback: any[] = [
            {
              id: 999991,
              plan_id: "social_media_starter",
              name: "Starter Pack",
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
              name: "Pro Blast",
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
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

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
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col font-sans text-left">
      {isDesktop ? (
        <DesktopHeader />
      ) : (
        <Header title="Social Marketing" showBack={true} />
      )}

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-8 flex-1">
        
        {/* Back navigation & Breadcrumb (Desktop) */}
        {isDesktop && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate/80">
            <button 
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1.5 hover:text-ink transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Profile
            </button>
            <span>/</span>
            <span className="text-ink font-bold">Social Marketing</span>
          </div>
        )}

        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-3xl p-4 sm:p-7 border-2 border-purple-500 bg-gradient-to-br from-[#1b0d38] via-[#241242] to-[#3b0764] text-white shadow-2xl">
          {/* Ambient Background Glows */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4">
            {/* Top Banner Image exactly as in user screenshot */}
            <div className="w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-white/20">
              <img 
                src="/SocialMarketing.png" 
                alt="Social Marketing Banner" 
                className="w-full h-auto object-cover max-h-56 sm:max-h-72" 
              />
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-md flex items-center gap-1.5">
                <Sparkles size={12} /> HIGH ENGAGEMENT BOOST
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-purple-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Multi-Platform Viral Reach
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
              Social Marketing
            </h1>

            {/* Inner description box with 2x2 grid channel tags */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xs flex flex-col gap-3.5">
              <p className="italic text-xs sm:text-sm text-purple-100 font-medium leading-relaxed">
                Upload property to all social media platforms. Reach active buyers across Instagram Reels, Facebook Community Groups, YouTube Shorts, and direct WhatsApp broadcasts.
              </p>

              {/* Channel Tags (2-column on mobile, 4-column on desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/15 backdrop-blur-md flex items-center gap-2">
                  <span>📸</span>
                  <span>Instagram Reels & Feed</span>
                </div>
                <div className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/15 backdrop-blur-md flex items-center gap-2">
                  <span>▶️</span>
                  <span>YouTube Shorts Showcase</span>
                </div>
                <div className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/15 backdrop-blur-md flex items-center gap-2">
                  <span>👍</span>
                  <span>Facebook Groups & Boost</span>
                </div>
                <div className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/15 backdrop-blur-md flex items-center gap-2">
                  <span>💬</span>
                  <span>WhatsApp Buyer Broadcast</span>
                </div>
              </div>
            </div>

            {/* Fast-Track Deals Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-purple-200 font-bold block mb-0.5">
                  FAST-TRACK DEALS
                </span>
                <span className="text-xl sm:text-3xl font-black text-white">
                  10x More Views
                </span>
              </div>
              <span className="text-xs text-purple-200/90 font-medium">
                Direct buyer inquiries to your WhatsApp
              </span>
            </div>
          </div>
        </div>

        {/* Payment Success Receipt Card (If payment just succeeded) */}
        {paymentSuccess && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl text-ink">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Payment Confirmed & Active
                </span>
                <h3 className="font-display font-black text-xl sm:text-2xl text-emerald-950 mt-1">
                  Thank you! Your Social Marketing Plan is Live
                </h3>
              </div>
            </div>

            <p className="text-sm text-emerald-900 font-medium mb-6">
              Your payment for <span className="font-bold">{paymentSuccess.planName}</span> has been processed successfully. Our marketing team will curate and publish your properties across our social media channels.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white/80 p-4 rounded-2xl border border-emerald-200 text-left">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate/70">Payment ID</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs font-bold text-ink truncate">{paymentSuccess.paymentId}</span>
                  <button 
                    onClick={copyPaymentId}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    title="Copy Payment ID"
                  >
                    {copiedPaymentId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate/70">Amount Paid</span>
                <p className="font-black text-base text-ink">₹{paymentSuccess.amount}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate/70">Properties Capacity</span>
                <p className="font-black text-base text-ink">{paymentSuccess.propertyCount} {paymentSuccess.propertyCount === 1 ? "Property" : "Properties"}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate/70">Subscriber</span>
                <p className="font-bold text-sm text-ink truncate">{paymentSuccess.userName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 flex-wrap">
              <button
                onClick={() => navigate("/add-property")}
                className="py-3 px-6 rounded-xl bg-forest hover:bg-emerald-800 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <PlusCircle size={15} /> Upload Property to Publish
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="py-3 px-6 rounded-xl bg-white border border-charcoal/15 hover:bg-slate-50 text-ink text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                Go to Profile
              </button>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-charcoal/10 pb-4">
          <div>
            <h2 className="font-display font-black text-2xl text-ink">
              Choose Your Social Media Marketing Package
            </h2>
            <p className="text-xs sm:text-sm text-slate mt-1 font-medium">
              Transparent pricing with no hidden charges. Multi-channel broadcast included with every package.
            </p>
          </div>
          <span className="text-[11px] font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 self-start sm:self-auto">
            100% Verified Publishing Guarantee
          </span>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-charcoal/5 shadow-sm animate-pulse h-96" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, index) => {
              const finalPrice = Math.max(0, Number(plan.price) - Number(plan.discount || 0));
              const propertyCount = Number(plan.listing_slots || plan.credits || 1);
              const planIdentifier = (plan.id || plan.plan_id) ?? null;
              const isProcessing = loadingPlanId === planIdentifier;
              const isBestValue = index === 1 || propertyCount > 1;
              const featureList: string[] = Array.isArray(plan.features)
                ? plan.features
                : (typeof plan.features === "string" ? (() => {
                    try { const p = JSON.parse(plan.features); return Array.isArray(p) ? p : [plan.features]; } catch { return [plan.features]; }
                  })() : []);

              return (
                <div 
                  key={plan.id || plan.plan_id || index}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all duration-300 relative group hover:shadow-xl ${
                    isBestValue 
                      ? "border-2 border-purple-500 shadow-lg ring-4 ring-purple-100" 
                      : "border-charcoal/10 shadow-sm hover:border-purple-300"
                  }`}
                >
                  {/* Top Badge */}
                  {isBestValue && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-md flex items-center gap-1.5">
                      <Flame size={12} className="fill-amber-300 text-amber-300" />
                      <span>Most Popular Boost</span>
                    </div>
                  )}

                  <div>
                    {/* Header: Name & Property Count */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-display font-black text-xl text-ink group-hover:text-purple-700 transition-colors">
                          {plan.name || "Social Media Package"}
                        </h3>
                        <p className="text-xs text-slate mt-1 line-clamp-2 leading-relaxed">
                          {plan.description || "Upload & promote across Instagram, Facebook & WhatsApp"}
                        </p>
                      </div>
                    </div>

                    {/* Capacity Badge */}
                    <div className="bg-purple-50 rounded-2xl p-3 border border-purple-100 flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2 text-purple-900">
                        <Layers size={18} className="text-purple-600" />
                        <span className="text-xs font-bold uppercase tracking-wider">Number of Properties</span>
                      </div>
                      <span className="text-sm font-black text-purple-900 bg-white px-3 py-1 rounded-xl shadow-xs border border-purple-200">
                        {propertyCount} {propertyCount === 1 ? "Property" : "Properties"}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2.5 mb-1">
                      <span className="font-display font-black text-3xl sm:text-4xl text-ink">
                        ₹{finalPrice.toLocaleString("en-IN")}
                      </span>
                      {Number(plan.discount) > 0 && (
                        <span className="text-sm font-semibold text-slate/60 line-through">
                          ₹{Number(plan.price).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    {Number(plan.discount) > 0 && (
                      <div className="mb-5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Save ₹{Number(plan.discount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    {Number(plan.discount) === 0 && <div className="mb-5" />}

                    {/* Bullet Points / Deliverables */}
                    <div className="border-t border-charcoal/5 pt-4 mb-6">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate/70 mb-3 block">
                        Included Deliverables:
                      </span>
                      <ul className="flex flex-col gap-2.5">
                        {featureList.map((bullet: string, bIdx: number) => (
                          <li key={bIdx} className="flex items-start gap-2.5 text-xs text-charcoal/90 font-medium">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                              <Check size={12} strokeWidth={3} />
                            </span>
                            <span className="leading-tight">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleSubscribePlan(plan)}
                      className={`w-full py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                        isBestValue
                          ? "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white shadow-purple-500/25"
                          : "bg-ink hover:bg-black text-white"
                      } disabled:opacity-50`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Initiating Gateway...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Purchase Now • ₹{finalPrice}</span>
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate/70 font-medium mt-2">
                      Instant activation • Secure payment via Razorpay
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Benefits & How it works section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/5 shadow-sm mt-4">
          <h3 className="font-display font-black text-lg sm:text-xl text-ink mb-2">
            How Social Media Marketing Works for Your Property
          </h3>
          <p className="text-xs sm:text-sm text-slate mb-6">
            Get your property noticed by thousands of verified homebuyers and active investors across Kerala & South India.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-charcoal/5 flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-sm text-ink">Creative Media Preparation</h4>
              <p className="text-xs text-slate leading-relaxed">
                We craft eye-catching reels, carousel images, and highlight videos from your property photos and specs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-charcoal/5 flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-sm text-ink">Multi-Platform Publishing</h4>
              <p className="text-xs text-slate leading-relaxed">
                Broadcasted simultaneously on Instagram, Facebook Real Estate groups, YouTube Shorts, and WhatsApp channels.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-charcoal/5 flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-sm text-ink">Direct Buyer Inquiries</h4>
              <p className="text-xs text-slate leading-relaxed">
                Interested buyers reach you directly through calls, WhatsApp, or through your verified Aira listing.
              </p>
            </div>
          </div>
        </div>

      </main>

      {isDesktop ? <DesktopFooter /> : <BottomNav />}
    </div>
  );
}
