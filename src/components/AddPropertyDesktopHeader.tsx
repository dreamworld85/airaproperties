import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useBrand } from "@/lib/BrandContext";

export default function AddPropertyDesktopHeader() {
  const navigate = useNavigate();
  const { desktopLogoUrl } = useBrand();
  const defaultHelpMsg = encodeURIComponent("Hello! I need help with posting a property on Aira Properties.");
  const [whatsappLink, setWhatsappLink] = useState(`https://wa.me/917012021221?text=${defaultHelpMsg}`);

  useEffect(() => {
    api.fetchSetting("admin_contact_number")
      .then((data) => {
        if (data && data.value) {
          const cleanNum = data.value.replace(/\D/g, "");
          const num = cleanNum.startsWith("91") ? cleanNum : `91${cleanNum}`;
          setWhatsappLink(`https://wa.me/${num}?text=${defaultHelpMsg}`);
        }
      })
      .catch((err) => console.error("Error loading admin contact number:", err));
  }, []);

  return (
    <header className="hidden min-[1000px]:flex items-center justify-between w-full bg-white border-b border-slate-200/80 px-6 py-3.5 shrink-0 select-none sticky top-0 z-30">
      {/* Left side: Back button & Logo */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="flex items-center gap-1.5 text-[#1877F2] hover:text-blue-700 font-semibold text-[14px] cursor-pointer transition-colors active:scale-95"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>Back</span>
        </button>

        <img
          src={desktopLogoUrl}
          alt="Aira Properties"
          onClick={() => navigate("/home")}
          className="h-7 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
        />
      </div>

      {/* Right side: Need Help? & WhatsApp 35px icon */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <span className="font-bold text-[14px] text-[#28A745] group-hover:text-[#218838] transition-colors">
          Need Help?
        </span>
        <img
          src="/images/whatsapp.svg"
          alt="WhatsApp"
          className="w-[35px] h-[35px] object-contain shrink-0 group-hover:scale-105 transition-transform"
        />
      </a>
    </header>
  );
}
