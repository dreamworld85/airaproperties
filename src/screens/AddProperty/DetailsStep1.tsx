import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, Menu, Lock } from "lucide-react";
import { useAddProperty } from "@/lib/AddPropertyContext";
import { useAuth } from "@/lib/AuthContext";
import { ListingRole } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";

const residentialTypesForSale = [
  "Apartment",
  "Independent House / Villa",
  "Builder Floor",
  "Plot / Land",
  "1 RK/ Studio Apartment",
  "Farmhouse",
  "Other",
];

const residentialTypesForRent = [
  "Apartment",
  "Independent House / Villa",
  "Builder Floor",
  "1 RK/ Studio Apartment",
  "Serviced Apartment",
  "Other",
];

const commercialTypesForSale = [
  "Office Space",
  "Retail Shop",
  "Plot / Land",
  "Warehouse",
  "Other",
];

const commercialTypesForRent = [
  "Office Space",
  "Retail Shop",
  "Warehouse",
  "Co-working Space",
  "Other",
];

export default function DetailsStep1() {
  const navigate = useNavigate();
  const { form, update } = useAddProperty();
  const { user } = useAuth();

  const [attemptedNext, setAttemptedNext] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const defaultPostMsg = encodeURIComponent("Hello! I want to post my property listing on Aira Properties.");
  const [whatsappLink, setWhatsappLink] = useState(`https://wa.me/917012021221?text=${defaultPostMsg}`);

  useEffect(() => {
    api.fetchSetting("admin_contact_number")
      .then((data) => {
        if (data && data.value) {
          const cleanNum = data.value.replace(/\D/g, "");
          const num = cleanNum.startsWith("91") ? cleanNum : `91${cleanNum}`;
          setWhatsappLink(`https://wa.me/${num}?text=${defaultPostMsg}`);
        }
      })
      .catch((err) => console.error("Error loading admin contact number:", err));
  }, []);

  useEffect(() => {
    if (user && !form.role) {
      const activeRole: ListingRole = (user.role && user.role !== "User" ? user.role : "Owner") as ListingRole;
      update({
        role: activeRole,
        ownerName: user.role === "Owner" ? user.name : "",
        brokerName: user.role === "Broker" ? user.name : "",
        agencyName: user.role === "Agency" ? user.name : "",
        contactPhone: user.phone || "",
      });
    }
  }, [user, form.role, update]);

  const isRent = form.purpose === "For Rent" || form.purpose === "For Lease" || form.purpose === "Paying Guest";
  const activeTypes = form.propertyCategory === "Commercial"
    ? (isRent ? commercialTypesForRent : commercialTypesForSale)
    : (isRent ? residentialTypesForRent : residentialTypesForSale);

  function handlePurposeChange(val: string) {
    const nextRent = val === "For Rent" || val === "For Lease" || val === "Paying Guest";
    const nextTypes = form.propertyCategory === "Commercial"
      ? (nextRent ? commercialTypesForRent : commercialTypesForSale)
      : (nextRent ? residentialTypesForRent : residentialTypesForSale);
      
    const resetType = nextTypes.includes(form.propertyType) ? form.propertyType : "";
    const isApplicable = resetType === "Apartment" || resetType === "Independent House / Villa";
    update({ purpose: val, propertyType: resetType, ...(!isApplicable ? { furnishing: "", propertyAge: "" } : {}) });
  }

  function handleCategoryChange(cat: string) {
    update({ propertyCategory: cat, propertyType: "", furnishing: "", propertyAge: "" });
  }

  const canContinue = 
    form.purpose && 
    form.propertyCategory && 
    form.propertyType &&
    form.contactPhone;

  function handleNext() {
    setAttemptedNext(true);
    if (canContinue) {
      navigate("/add-property/more-info");
    } else {
      setTimeout(() => {
        const firstError = document.querySelector(".border-rose-500");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }

  // Slice types based on the "+ more" toggle
  const visibleTypes = showAllTypes ? activeTypes : activeTypes.slice(0, 5);
  const remainingCount = activeTypes.length - visibleTypes.length;

  return (
    <div className="min-h-screen flex flex-col bg-white pb-24 text-left font-display select-none overflow-x-hidden relative">
      {/* Top Blue Progress Bar Line */}
      <div className="w-full h-1 bg-slate-100 flex shrink-0">
        <div className="h-full bg-[#59AD63] w-[33.33%] transition-all duration-300" />
      </div>

      {/* Header Row */}
      <div className="flex justify-between items-center px-6 pt-5 pb-2 shrink-0 min-[1000px]:hidden">
        <button 
          type="button"
          className="text-charcoal p-1.5 -ml-1.5 hover:bg-charcoal/5 rounded-full transition-all duration-200 cursor-pointer active:scale-95"
          aria-label="Menu"
        >
          <Menu size={22} className="text-[#091F40]" />
        </button>
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center gap-2 text-[12px] font-bold text-[#59AD63] hover:underline cursor-pointer"
        >
          <span>Post Via WhatsApp</span>
          <img src="/images/whatsapp.svg" alt="WhatsApp" className="w-[35px] h-[35px] object-contain shrink-0" />
        </a>
      </div>

      <div className="px-6 flex flex-col gap-6 mt-1 flex-1">
        {/* Desktop Back link */}
        <button
          type="button"
          onClick={() => navigate("/add-property/role")}
          className="hidden min-[1000px]:inline-flex items-center gap-1 text-xs font-semibold text-[#1877F2] hover:underline -mb-2 self-start cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to choose role</span>
        </button>

        {/* Title & Subtitle */}
        <div className="flex flex-col">
          <h1 className="font-display font-extrabold text-[18px] text-[#091F40] leading-tight">
            Add Basic Details
          </h1>
          <p className="text-[10px] font-bold text-slate/60 tracking-wider uppercase mt-1 leading-none">
            Step 1 of 3
          </p>
        </div>

        {/* Section 1: Purpose Selection */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-[#091F40]">You're looking to?</span>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "Sell", value: "For Sale" },
              { label: "Rent", value: "For Rent" },
              { label: "Lease", value: "For Lease" },
              { label: "Paying Guest", value: "Paying Guest" },
            ].map((opt) => {
              const active = form.purpose === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handlePurposeChange(opt.value)}
                  className={`py-2 px-5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 select-none ${
                    active
                      ? "bg-[#59AD63]/10 border-[#59AD63] text-[#59AD63]"
                      : "bg-white border-[#59AD63]/30 text-slate hover:border-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Property Category */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-[#091F40]">What kind of property?</span>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "Residential", value: "Residential" },
              { label: "Commercial", value: "Commercial" },
            ].map((opt) => {
              const active = form.propertyCategory === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleCategoryChange(opt.value)}
                  className={`py-2 px-5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 select-none ${
                    active
                      ? "bg-[#59AD63]/10 border-[#59AD63] text-[#59AD63]"
                      : "bg-white border-[#59AD63]/30 text-slate hover:border-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Select Property Type */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-[#091F40]">Select Property Type</span>
          <div className={`flex flex-wrap gap-2.5 ${attemptedNext && !form.propertyType ? "border border-rose-500 bg-rose-50/5 p-2 rounded-[8px]" : ""}`}>
            {visibleTypes.map((type) => {
              const active = form.propertyType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    const isApplicable = type === "Apartment" || type === "Independent House / Villa";
                    update({
                      propertyType: type,
                      ...(!isApplicable ? { furnishing: "", propertyAge: "" } : {})
                    });
                  }}
                  className={`py-2 px-5 rounded-full border text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 select-none ${
                    active
                      ? "bg-[#59AD63]/10 border-[#59AD63] text-[#59AD63]"
                      : "bg-white border-[#59AD63]/30 text-slate hover:border-slate-400"
                  }`}
                >
                  {type}
                </button>
              );
            })}
            
            {remainingCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllTypes(true)}
                className="py-2 px-4 text-xs font-bold text-[#59AD63] hover:underline cursor-pointer active:scale-95 select-none"
              >
                + {remainingCount} more
              </button>
            )}
          </div>
        </div>

        {/* Section 3.1: Furnishing (Enabled for Apartment or Independent House / Villa) */}
        {(form.propertyType === "Apartment" || form.propertyType === "Independent House / Villa") && (
          <div className="flex flex-col gap-2 pt-0.5 animate-fade-in">
            <span className="text-sm font-bold text-[#091F40]">Furnishing</span>
            <div className="flex items-center gap-7 pt-0.5">
              {[
                { label: "Full", value: "Full" },
                { label: "Semi", value: "Semi" },
                { label: "None", value: "None" },
              ].map((opt) => {
                const checked = form.furnishing === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update({ furnishing: checked ? "" : opt.value })}
                    className="flex items-center gap-2 cursor-pointer select-none group text-left"
                  >
                    <div
                      className={`w-[18px] h-[18px] rounded-[3px] border transition-all flex items-center justify-center shrink-0 ${
                        checked
                          ? "bg-[#59AD63] border-[#59AD63] text-white"
                          : "border-slate-300 bg-white group-hover:border-[#59AD63]"
                      }`}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[13px] font-semibold transition-colors ${checked ? "text-[#091F40] font-bold" : "text-charcoal"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3.2: Property Age (Enabled for Apartment or Independent House / Villa) */}
        {(form.propertyType === "Apartment" || form.propertyType === "Independent House / Villa") && (
          <div className="flex flex-col gap-2 pt-1 animate-fade-in">
            <span className="text-sm font-bold text-[#091F40]">Property Age</span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-0.5">
              {[
                { label: "0-1 Year", value: "0-1 Year" },
                { label: "1-5 Years", value: "1-5 Years" },
                { label: "5-10 Years", value: "5-10 Years" },
                { label: "10+ Years", value: "10+ Years" },
                { label: "Under Construction", value: "Under Construction" },
              ].map((opt) => {
                const checked = form.propertyAge === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update({ propertyAge: checked ? "" : opt.value })}
                    className="flex items-center gap-2 cursor-pointer select-none group text-left"
                  >
                    <div
                      className={`w-[18px] h-[18px] rounded-[3px] border transition-all flex items-center justify-center shrink-0 ${
                        checked
                          ? "bg-[#59AD63] border-[#59AD63] text-white"
                          : "border-slate-300 bg-white group-hover:border-[#59AD63]"
                      }`}
                    >
                      {checked && (
                        <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[13px] font-semibold transition-colors ${checked ? "text-[#091F40] font-bold" : "text-charcoal"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 4: Contact Details */}
        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-bold text-[#091F40]">Your contact details</span>
          
          <div className={`relative border rounded-[8px] px-4 pt-5 pb-2.5 bg-white flex items-center shadow-sm focus-within:border-[#59AD63] focus-within:ring-1 focus-within:ring-[#59AD63]/30 transition-all duration-150 ${
            attemptedNext && !form.contactPhone ? "border-rose-500 bg-rose-50/5" : "border-[#59AD63]/30"
          }`}>
            {/* Label inside input */}
            <span className="absolute top-1.5 left-4 text-[10px] font-semibold text-slate/60 select-none">
              Phone number / User name / E-mail
            </span>
            
            {/* Flag dropdown (mock) */}
            <div className="flex items-center gap-1 border-r border-slate-200 pr-3 mr-3 select-none cursor-pointer">
              <span className="text-[13.5px] font-bold text-charcoal">+91</span>
              <ChevronDown size={14} className="text-slate/60" />
            </div>
            
            {/* Text Input */}
            <input
              type="text"
              placeholder="7012021221"
              value={form.contactPhone || ""}
              onChange={(e) => update({ contactPhone: e.target.value })}
              className="flex-1 text-[13.5px] font-bold text-charcoal placeholder:text-slate/30 outline-none bg-transparent"
            />
            
            {/* Lock Icon */}
            <Lock size={16} className="text-[#091F40] ml-2 shrink-0" />
          </div>
          
        </div>

        {/* Next Action Button */}
        <div className="mt-4 pb-4">
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-[2px] font-display font-bold text-[14px] text-white bg-[#59AD63] hover:bg-[#3F8F4B] transition-all duration-200 cursor-pointer active:scale-98 shadow-sm shadow-[#59AD63]/10 flex items-center justify-center"
          >
            Next
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
