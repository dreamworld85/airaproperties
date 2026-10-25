import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import { ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";

export default function RefundPolicy() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [title, setTitle] = useState("Cancellation & Refund");
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api.fetchSetting("page_refund_policy_title")
      .then(d => { if (d && d.value) setTitle(d.value); })
      .catch(e => console.error("Error fetching title:", e));

    api.fetchSetting("page_refund_policy_content")
      .then(d => { if (d && d.value) setContent(d.value); })
      .catch(e => console.error("Error fetching content:", e));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      {/* Desktop vs Mobile Header */}
      {isDesktop ? <DesktopHeader /> : <Header title={title} showBack />}

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${isDesktop ? "max-w-5xl mx-auto px-6 py-12" : "p-5 pb-28 max-w-md mx-auto"}`}>
        {/* Desktop Hero Section Header */}
        {isDesktop && (
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-800 bg-rose-100/80 px-3.5 py-1 rounded-full inline-block">
              Billing Policies
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display">
              {title}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Understand our cancellation and refund guidelines before subscribing.
            </p>
          </div>
        )}

        <div className={`flex flex-col gap-4 text-slate leading-relaxed ${isDesktop ? "text-sm" : "text-xs"}`}>
          <div className={`bg-white rounded-3xl border border-charcoal/5 shadow-sm flex flex-col gap-4 ${isDesktop ? "p-8 sm:p-10" : "p-5"}`}>
            <div className="flex items-center gap-2 bg-rose-50 p-3.5 rounded-2xl text-rose-600 font-bold mb-1">
              <ShieldAlert size={18} />
              <span>Strict No-Refund Policy</span>
            </div>

            {content ? (
              <div className="whitespace-pre-line leading-relaxed text-charcoal">{content}</div>
            ) : (
              <>
                <p>
                  Please review our strict cancellation and refund policies before purchasing any premium subscription plans on Aira Properties:
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">1. Subscription Cancellations</h3>
                <p>
                  You can cancel your subscription plan at any time through your account settings or profile. Once cancelled, your premium access will remain active and you will continue to have full access to direct contact details until the end of your current billing period. No future recurring charges will be made.
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">2. No-Refunds Policy</h3>
                <p>
                  We do not offer refunds, credits, or prorated billing for any purchased subscription plans, including unused time, accidental purchases, or changes in preference. All payments made to Aira Properties are strictly final and non-refundable.
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Desktop vs Mobile Footer */}
      {isDesktop ? <DesktopFooter /> : <BottomNav />}
    </div>
  );
}
