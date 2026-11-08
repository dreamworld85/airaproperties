import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";

interface SupportChatPopupProps {
  onClose: () => void;
}

export default function SupportChatPopup({ onClose }: SupportChatPopupProps) {
  const [phone, setPhone] = useState("+91 9495126132");
  const [email, setEmail] = useState("support@airaproperties.in");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch contact details from admin settings
    Promise.all([
      api.fetchSetting("admin_contact_number").catch(() => null),
      api.fetchSetting("contact_email").catch(() => null),
    ]).then(([phoneRes, emailRes]) => {
      if (phoneRes?.value) setPhone(phoneRes.value);
      if (emailRes?.value) setEmail(emailRes.value);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Raw digits for tel/wa links
  const rawPhone = phone.replace(/\D/g, "");
  const waMessage = encodeURIComponent("Hi Aira Properties! I need support.");
  const waUrl = `https://wa.me/${rawPhone}?text=${waMessage}`;

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col"
      style={{
        background: "linear-gradient(145deg, #e0f2fe 0%, #ddd6fe 50%, #fce7f3 100%)",
      }}
    >
      {/* Close button */}
      <div className="flex justify-end p-4 pt-safe">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
          aria-label="Close support"
        >
          <X size={20} className="text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-16 gap-8">
        {/* Banner illustration */}
        <div className="w-full max-w-xs">
          <img
            src="/support_bnner.svg"
            alt="Support"
            className="w-full h-44 object-contain drop-shadow-sm"
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-800 font-display">
            We're here to help!
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Reach us anytime through any channel below
          </p>
        </div>

        {/* Contact options */}
        <div className="w-full max-w-xs flex flex-col gap-4">
          {/* Phone — 24hr service */}
          <a
            href={`tel:${rawPhone}`}
            className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer border border-white/60 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <img src="/24-hours-service.svg" alt="24hr" className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">24/7 Support</p>
              <p className="font-extrabold text-[#16a34a] text-base truncate">
                {loading ? "Loading..." : phone}
              </p>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer border border-white/60 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <img src="/whatsapp.svg" alt="WhatsApp" className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">WhatsApp</p>
              <p className="font-extrabold text-[#16a34a] text-base">Support Available</p>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer border border-white/60 hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
              {/* Mail envelope with sparkle — inline SVG */}
              <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none">
                <rect x="4" y="12" width="40" height="28" rx="4" fill="#a78bfa" opacity="0.15"/>
                <rect x="4" y="12" width="40" height="28" rx="4" stroke="#a78bfa" strokeWidth="2.5"/>
                <path d="M4 16l20 14 20-14" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="38" cy="12" r="6" fill="#f43f5e"/>
                <text x="38" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">✦</text>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Us</p>
              <p className="font-extrabold text-purple-600 text-sm truncate">
                {loading ? "Loading..." : email}
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
