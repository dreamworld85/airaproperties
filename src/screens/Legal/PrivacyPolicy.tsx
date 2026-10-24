import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import { api } from "@/lib/api";

export default function PrivacyPolicy() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [title, setTitle] = useState("Privacy Policy");
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api.fetchSetting("page_privacy_policy_title")
      .then(d => { if (d && d.value) setTitle(d.value); })
      .catch(e => console.error("Error fetching title:", e));

    api.fetchSetting("page_privacy_policy_content")
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
              Legal & Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display">
              {title}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              How Kerala Realty collects, protects, and securely handles your data.
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
                  At GreenReal (Kerala Realty), we value the trust you place in us. This Privacy Policy details how we collect, use, process, and protect your information when you register and use our platform.
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">1. Data We Collect</h3>
                <p>
                  We collect personal identity data required to create listings, including name, email address, phone number, physical location, and account passwords. We also collect IP addresses and user agents for security, spam prevention, and analytics.
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">2. How Your Data is Used</h3>
                <p>
                  Your information is primarily used to connect property buyers and renters with sellers/brokers/agencies. We also use your contact details to communicate platform announcements and authorize premium subscriptions.
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">3. Payment Information</h3>
                <p>
                  Subscription orders are securely processed through our certified payment partner, Razorpay. We do not store or collect your complete debit/credit card details or net banking credentials on our local servers.
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
