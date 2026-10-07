import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import { Mail, Phone, MapPin, ShieldCheck, Lock, CheckCircle2, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function ContactUs() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [email, setEmail] = useState("support@airaproperties.in");
  const [phone, setPhone] = useState("+91 484 2901234 (10 AM - 6 PM)");
  const [address, setAddress] = useState("Aira Properties Private Limited,\nInfopark Phase II, Kakkanad,\nKochi, Kerala - 682030");

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api.fetchSetting("contact_email")
      .then(d => { if (d && d.value) setEmail(d.value); })
      .catch(e => console.error("Error fetching email:", e));

    api.fetchSetting("contact_phone")
      .then(d => { if (d && d.value) setPhone(d.value); })
      .catch(e => console.error("Error fetching phone:", e));

    api.fetchSetting("contact_address")
      .then(d => { if (d && d.value) setAddress(d.value); })
      .catch(e => console.error("Error fetching address:", e));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      {/* Desktop vs Mobile Header */}
      {isDesktop ? <DesktopHeader /> : <Header title="Contact Us" showBack />}

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${isDesktop ? "max-w-5xl mx-auto px-6 py-12" : "p-5 pb-28 max-w-md mx-auto"}`}>
        {/* Desktop Hero Section Header */}
        {isDesktop && (
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3.5 py-1 rounded-full inline-block">
              We're Here to Help
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display">
              Contact Aira Properties Support
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Have questions regarding property listings, builder inquiries, verification, or subscriptions? Our Kerala-based support team is here for you.
            </p>
          </div>
        )}

        <div className={`flex flex-col gap-6 text-xs text-slate leading-relaxed ${isDesktop ? "" : "text-left"}`}>
          {/* Support Channels Grid */}
          <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/5 shadow-sm ${
            isDesktop ? "grid grid-cols-1 md:grid-cols-3 gap-6" : "flex flex-col gap-5"
          }`}>
            {/* Email Support Card */}
            <div className={`flex gap-3.5 items-start ${isDesktop ? "p-4 rounded-2xl bg-[#FAF8F3]/60 border border-charcoal/5" : "border-b border-slate-100 pb-4"}`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B5E4F] flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-charcoal text-sm">Support & Billing Email</p>
                <a 
                  href={`mailto:${email}`} 
                  className="text-xs text-emerald-700 hover:underline font-semibold block mt-0.5 break-all"
                >
                  {email}
                </a>
                <p className="text-[11px] text-slate/70 mt-1">24-48 business hours response</p>
              </div>
            </div>

            {/* Phone Support Card */}
            <div className={`flex gap-3.5 items-start ${isDesktop ? "p-4 rounded-2xl bg-[#FAF8F3]/60 border border-charcoal/5" : "border-b border-slate-100 pb-4"}`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B5E4F] flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-charcoal text-sm">Phone Hotline</p>
                <a 
                  href="tel:+914842901234" 
                  className="text-xs text-emerald-700 hover:underline font-semibold block mt-0.5"
                >
                  {phone}
                </a>
                <p className="text-[11px] text-slate/70 mt-1 flex items-center gap-1">
                  <Clock size={11} className="inline text-slate/60" />
                  <span>Mon - Sat, 10 AM - 6 PM IST</span>
                </p>
              </div>
            </div>

            {/* Registered Office Card */}
            <div className={`flex gap-3.5 items-start ${isDesktop ? "p-4 rounded-2xl bg-[#FAF8F3]/60 border border-charcoal/5" : ""}`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B5E4F] flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-charcoal text-sm">Registered Office</p>
                <p className="text-xs text-slate/85 leading-normal mt-0.5 whitespace-pre-line font-medium">
                  {address}
                </p>
              </div>
            </div>
          </div>

          {/* Razorpay Compliance Badge Section */}
          <div className="bg-ink text-cream rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-3 shadow-md">
            <div className="flex gap-2.5 text-gold mb-1">
              <ShieldCheck size={26} />
              <Lock size={26} />
            </div>
            <h4 className="font-display font-extrabold text-base sm:text-lg text-white">
              Secure Payments via Razorpay
            </h4>
            <p className="text-xs text-cream/70 leading-relaxed max-w-lg">
              Your payment processing is strictly PCI-DSS Compliant. Every subscription and featured transaction is safeguarded by 256-bit secure SSL encryption tunnels.
            </p>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold mt-2 text-gold">
              <CheckCircle2 size={13} className="text-gold" />
              <span>Verified Merchant Checkout</span>
            </div>
          </div>
        </div>
      </main>

      {/* Desktop vs Mobile Footer */}
      {isDesktop ? <DesktopFooter /> : <BottomNav />}
    </div>
  );
}
