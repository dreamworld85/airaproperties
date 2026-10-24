import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import { api } from "@/lib/api";

export default function TermsConditions() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [title, setTitle] = useState("Terms & Conditions");
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api.fetchSetting("page_terms_conditions_title")
      .then(d => { if (d && d.value) setTitle(d.value); })
      .catch(e => console.error("Error fetching title:", e));

    api.fetchSetting("page_terms_conditions_content")
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
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3.5 py-1 rounded-full inline-block">
              Terms of Use
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display">
              {title}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Please review the general terms, platform rules, and guidelines for Kerala Realty.
            </p>
          </div>
        )}

        <div className={`flex flex-col gap-4 text-slate leading-relaxed ${isDesktop ? "text-sm" : "text-xs"}`}>
          <div className={`bg-white rounded-3xl border border-charcoal/5 shadow-sm flex flex-col gap-4 ${isDesktop ? "p-8 sm:p-10" : "p-5"}`}>
            {content ? (
              <div className="whitespace-pre-line leading-relaxed text-charcoal">{content}</div>
            ) : (
              <>
                <p><strong>Effective Date:</strong> August 4, 2026</p>
                <p>
                  By accessing and registering on GreenReal, you agree to comply with and be bound by the following terms of use. Please read these terms carefully.
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">1. Eligibility & Registration</h3>
                <p>
                  To list properties or view contact details, you must create a validated user profile. You are responsible for maintaining the confidentiality of your credentials and all activities occurring under your profile.
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">2. Subscriptions & Trial Use</h3>
                <p>
                  All new user accounts are granted a 3-day free trial period. Upon expiry, list viewing privileges will be limited unless a premium recurring subscription plan is successfully purchased through our Razorpay checkout gateway.
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">3. Accuracy of Listings</h3>
                <p>
                  Owners, brokers, and agencies are solely responsible for ensuring the correctness, legitimacy, and physical state of the properties they list. Listings discovered to be fraudulent, outdated, or duplicate will be deleted by the admin team.
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
