import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X, User, Wrench, Building2, UploadCloud, ChevronLeft, CheckCircle2, ShieldAlert, Sparkles, AlertCircle, Phone } from "lucide-react";
import { useAddProperty } from "@/lib/AddPropertyContext";
import { useAuth } from "@/lib/AuthContext";
import { ListingRole } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import SubscriptionPaywallModal from "@/components/SubscriptionPaywallModal";
import { api } from "@/lib/api";

const rolesList: { role: ListingRole; icon: typeof User; label: string; desc: string }[] = [
  { 
    role: "Owner", 
    icon: User, 
    label: "Owner", 
    desc: "Individual property owner selling or renting personal spaces." 
  },
  { 
    role: "Broker", 
    icon: Wrench, 
    label: "Broker", 
    desc: "Independent agent managing property portfolios for clients." 
  },
  { 
    role: "Agency", 
    icon: Building2, 
    label: "Agency", 
    desc: "Real estate agency listing properties with corporate branding." 
  },
];

export default function ChooseRole() {
  const navigate = useNavigate();
  const { form, update } = useAddProperty();
  const { user, token, login, refreshUser } = useAuth();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<"choose" | "setup">("choose");
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchTargetRole, setSwitchTargetRole] = useState<string>("");
  const [switchContactPhone, setSwitchContactPhone] = useState<string>("");
  const [switchReason, setSwitchReason] = useState<string>("");
  const [switchSubmitting, setSwitchSubmitting] = useState(false);
  const [switchSuccessMessage, setSwitchSuccessMessage] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [attemptedSwitchSubmit, setAttemptedSwitchSubmit] = useState(false);
  const [switchToast, setSwitchToast] = useState<string | null>(null);
  const switchToastTimerRef = useRef<any>(null);

  const [attemptedSetupSubmit, setAttemptedSetupSubmit] = useState(false);
  const [contactPhoneTouched, setContactPhoneTouched] = useState(false);
  const [whatsappTouched, setWhatsappTouched] = useState(false);

  const showSwitchToast = (msg: string) => {
    setSwitchToast(msg);
    if (switchToastTimerRef.current) clearTimeout(switchToastTimerRef.current);
    switchToastTimerRef.current = setTimeout(() => {
      setSwitchToast(null);
    }, 4000);
  };

  useEffect(() => {
    api.fetchSubscriptionPlans()
      .then((data) => setPlans(data))
      .catch((err) => console.error("Error loading plans:", err));
  }, []);

  const selectedRoleLower = form.role?.toLowerCase() || "";
  const rolePlans = plans.filter(p => p.role?.toLowerCase() === selectedRoleLower);
  const firstPlan = rolePlans[0];
  const secondPlan = rolePlans[1] || rolePlans[0];

  const firstFeatures: string[] = (() => {
    if (!firstPlan?.features) return [];
    try {
      return typeof firstPlan.features === 'string' ? JSON.parse(firstPlan.features) : firstPlan.features;
    } catch {
      return [];
    }
  })();

  const secondFeatures: string[] = (() => {
    if (!secondPlan?.features) return [];
    try {
      return typeof secondPlan.features === 'string' ? JSON.parse(secondPlan.features) : secondPlan.features;
    } catch {
      return [];
    }
  })();

  const isRoleAlreadyLocked = Boolean(user?.role && user.role.toLowerCase() !== "user" && user.role.toLowerCase() !== "buyer");

  // Pre-populate data from profile
  useEffect(() => {
    const lockedRole = (isRoleAlreadyLocked && user?.role) 
      ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) as ListingRole 
      : null;
    const initialRole = lockedRole || form.role || "Owner";
    const contact = form.contactPhone || user?.phone || "";

    update({ 
      role: initialRole,
      ownerName: form.ownerName || (initialRole === "Owner" ? user?.name || "" : ""),
      brokerName: form.brokerName || (initialRole === "Broker" ? user?.name || "" : ""),
      agencyName: form.agencyName || (initialRole === "Agency" ? user?.name || "" : ""),
      agencyAddress: form.agencyAddress || (initialRole === "Agency" ? user?.agencyAddress || "" : ""),
      agencyDistrict: form.agencyDistrict || (initialRole === "Agency" ? user?.agencyDistrict || "" : ""),
      contactPhone: contact,
      sameAsContact: form.sameAsContact !== undefined ? form.sameAsContact : true,
      whatsappNumber: form.whatsappNumber || contact,
    });

    if (isRoleAlreadyLocked) {
      setStage("setup");
    }
  }, [user, isRoleAlreadyLocked]);

  useEffect(() => {
    if (form.sameAsContact) {
      update({ whatsappNumber: form.contactPhone });
    }
  }, [form.contactPhone, form.sameAsContact, update]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg") {
        update({ agencyLogo: file });
      } else {
        alert("Please upload a PNG or JPEG image for the agency logo.");
      }
    }
    e.target.value = "";
  };

  const districts = [
    "Wayanad", "Kozhikode", "Kannur", "Kasaragod", "Malappuram", "Palakkad",
    "Thrissur", "Ernakulam", "Idukki", "Kottayam", "Alappuzha", "Pathanamthitta",
    "Kollam", "Thiruvananthapuram",
  ];

  const validatePhone = (num: string) => {
    if (!num) return false;
    const digits = String(num).replace(/\D/g, "");
    return digits.length >= 10;
  };

  const isOwnerValid = Boolean(
    form.ownerName.trim() &&
    validatePhone(form.contactPhone) &&
    validatePhone(form.whatsappNumber)
  );

  const isBrokerValid = Boolean(
    form.brokerName.trim() &&
    validatePhone(form.contactPhone) &&
    validatePhone(form.whatsappNumber)
  );

  const isAgencyValid = Boolean(
    form.agencyName.trim() &&
    form.agencyAddress?.trim() &&
    form.agencyDistrict &&
    validatePhone(form.contactPhone) &&
    validatePhone(form.whatsappNumber) &&
    (isRoleAlreadyLocked ? true : Boolean(form.agencyLogo))
  );

  const isSetupValid = (() => {
    if (!form.role) return false;
    if (isRoleAlreadyLocked) {
      // Must have valid contact phone & WhatsApp number even when role is locked
      return validatePhone(form.contactPhone) && validatePhone(form.whatsappNumber);
    }
    if (form.role === "Owner") {
      return isOwnerValid;
    }
    if (form.role === "Broker") {
      return isBrokerValid;
    }
    if (form.role === "Agency") {
      return isAgencyValid;
    }
    return false;
  })();

  // Setup inline validation flags
  const hasOwnerNameError = attemptedSetupSubmit && !isRoleAlreadyLocked && form.role === "Owner" && !form.ownerName.trim();
  const hasBrokerNameError = attemptedSetupSubmit && !isRoleAlreadyLocked && form.role === "Broker" && !form.brokerName.trim();
  const hasAgencyNameError = attemptedSetupSubmit && !isRoleAlreadyLocked && form.role === "Agency" && !form.agencyName.trim();
  const hasAgencyAddressError = attemptedSetupSubmit && !isRoleAlreadyLocked && form.role === "Agency" && !form.agencyAddress?.trim();
  const hasAgencyDistrictError = attemptedSetupSubmit && !isRoleAlreadyLocked && form.role === "Agency" && !form.agencyDistrict;
  const hasAgencyLogoError = attemptedSetupSubmit && !isRoleAlreadyLocked && form.role === "Agency" && !form.agencyLogo;
  const hasContactPhoneError = (attemptedSetupSubmit || contactPhoneTouched) && !validatePhone(form.contactPhone);
  const hasWhatsappNumberError = (attemptedSetupSubmit || whatsappTouched) && !validatePhone(form.whatsappNumber);

  // Role Switch inline validation flags
  const hasSwitchRoleError = attemptedSwitchSubmit && !switchTargetRole;
  const hasSwitchPhoneError = attemptedSwitchSubmit && !validatePhone(switchContactPhone);
  const isSwitchValid = Boolean(switchTargetRole && validatePhone(switchContactPhone));

  const handleConfirmRole = async () => {
    setAttemptedSetupSubmit(true);
    if (!isSetupValid) {
      setTimeout(() => {
        const firstError = document.querySelector(".border-rose-500, [id$='-field'] .border-rose-500, input:invalid");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    if (isRoleAlreadyLocked) {
      setSubmitting(true);
      setSetupError(null);
      try {
        const needsUpdate = 
          form.contactPhone !== (user?.phone || "") || 
          form.whatsappNumber !== (user?.whatsappNumber || "");

        if (needsUpdate) {
          const res = await api.updateMyProfile({
            phone: form.contactPhone,
            whatsappNumber: form.whatsappNumber
          });
          if (res && token) {
            login(token, res);
          }
        }
        navigate("/add-property/details");
      } catch (err: any) {
        setSetupError(err.message || "Failed to save contact profile details.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    setSetupError(null);
    try {
      const fd = new FormData();
      fd.append("role", (form.role || "owner").toLowerCase());
      fd.append("contactPhone", form.contactPhone);
      fd.append("whatsappNumber", form.whatsappNumber);

      if (form.role === "Owner") {
        fd.append("ownerName", form.ownerName);
      } else if (form.role === "Broker") {
        fd.append("brokerName", form.brokerName);
      } else if (form.role === "Agency") {
        fd.append("agencyName", form.agencyName);
        if (form.agencyAddress) {
          fd.append("agencyAddress", form.agencyAddress);
        }
        if (form.agencyDistrict) {
          fd.append("agencyDistrict", form.agencyDistrict);
        }
        if (form.agencyLogo) {
          fd.append("agencyLogo", form.agencyLogo);
        }
      }

      const res = await api.setupRole(fd);
      if (res && res.user && token) {
        login(token, res.user);
      }
      navigate("/add-property/details");
    } catch (err: any) {
      setSetupError(err.message || "Failed to complete role onboarding. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-28 bg-white select-none">
      {/* Top Green Progress Bar Line */}
      <div className="w-full h-1 bg-slate-100 flex shrink-0">
        <div className={`h-full bg-[#59AD63] transition-all duration-300 ${stage === "choose" ? "w-[16.6%]" : "w-[33.3%]"}`} />
      </div>

      {/* Header Row */}
      <div className="flex justify-between items-center px-6 pt-5 pb-2 shrink-0 min-[1000px]:hidden">
        <div className="flex items-center gap-2">
          {stage === "setup" && !isRoleAlreadyLocked && (
            <button 
              type="button"
              onClick={() => setStage("choose")}
              className="p-1 hover:bg-slate-100 rounded-full transition-all duration-200 cursor-pointer active:scale-95 mr-1"
            >
              <ChevronLeft size={20} className="text-[#091F40]" />
            </button>
          )}
          <h1 className="font-display font-extrabold text-[18px] text-[#091F40]">Add Property</h1>
        </div>
        <button 
          onClick={() => navigate("/home")} 
          className="p-1.5 hover:bg-charcoal/5 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} className="text-[#091F40]" />
        </button>
      </div>

      <div className="px-6 py-6 flex-1 flex flex-col gap-5 max-w-lg mx-auto w-full">
        {stage === "choose" ? (
          <>
            <div>
              <h2 className="font-display font-semibold text-[16px] text-ink leading-tight">
                How are you listing?
              </h2>
              <p className="text-slate text-xs mt-0.5 font-medium">
                Choose one option to setup your listing workspace
              </p>
            </div>

            {/* Compact Grid selector */}
            <div className="grid grid-cols-3 gap-2.5">
              {rolesList.map(({ role, icon: Icon, label }) => {
                const selected = form.role === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => update({ role })}
                    className={`relative flex flex-col items-center justify-center rounded-[8px] py-2.5 px-1.5 border transition-all cursor-pointer ${
                      selected 
                        ? "border-[#59AD63] bg-[#59AD63]/10 ring-1 ring-[#59AD63] text-[#59AD63]" 
                        : "border-[#59AD63]/30 bg-white hover:border-charcoal/20 active:scale-[0.98]"
                    }`}
                  >
                    {/* Radio Indicator (Top Right) */}
                    <div className="absolute top-1.5 right-1.5">
                      <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all ${
                        selected ? "border-[#59AD63] bg-[#59AD63] text-white" : "border-charcoal/20"
                      }`}>
                        {selected && <div className="w-1 h-1 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="mt-1">
                      <Icon size={16} className={selected ? "text-[#59AD63]" : "text-slate"} />
                    </div>

                    {/* Label */}
                    <span className={`font-display font-bold text-[11px] mt-1 ${selected ? "text-[#59AD63]" : "text-slate"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Features Description Card */}
            {form.role && (
              <div className="bg-white border border-charcoal/5 rounded-[8px] p-4 shadow-sm flex flex-col gap-3.5 font-display text-left">
                <div className="border-b border-slate-100/80 pb-2">
                  <h3 className="font-extrabold text-xs text-ink">{form.role} Listing Plans</h3>
                  <p className="text-[10px] text-slate mt-0.5 leading-snug font-medium">
                    {rolesList.find(r => r.role === form.role)?.desc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate/60 uppercase tracking-wider block mb-1">
                      {firstPlan?.name || "Starter"} ({firstPlan?.listing_slots ?? firstPlan?.credits ?? 5} Slots + {firstPlan?.enquiry_tokens ?? 15} Tokens)
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {firstFeatures.map((feat, index) => (
                        <div key={index} className="flex items-start gap-1 text-[11px] font-medium text-slate-800 leading-snug">
                          <CheckCircle2 size={11} className="text-forest shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                      {firstFeatures.length === 0 && (
                        <span className="text-[10px] text-slate/30 italic">No features listed.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                      {secondPlan?.name || "Growth"} ({secondPlan?.listing_slots ?? secondPlan?.credits ?? 10} Slots + {secondPlan?.enquiry_tokens ?? 30} Tokens)
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {secondFeatures.map((feat, index) => (
                        <div key={index} className="flex items-start gap-1 text-[11px] font-medium text-slate-800 leading-snug">
                          <Sparkles size={11} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                      {secondFeatures.length === 0 && (
                        <span className="text-[10px] text-slate/30 italic">No features listed.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* View plans popup trigger */}
                <button
                  type="button"
                  onClick={() => setShowPlansModal(true)}
                  className="w-full mt-1.5 py-2.5 border border-[#59AD63]/10 bg-[#59AD63]/5 hover:bg-[#59AD63]/10 text-[#59AD63] text-[10px] font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  View Details & Pricing
                </button>
              </div>
            )}

            <button
              disabled={!form.role}
              onClick={() => setStage("setup")}
              className={`w-full py-4 rounded-[2px] font-display font-bold text-[14px] transition-all shadow-md mt-auto active:scale-[0.99] cursor-pointer ${
                form.role ? "bg-[#59AD63] text-white hover:bg-[#3F8F4B]" : "bg-charcoal/15 text-slate/50 cursor-not-allowed shadow-none"
              }`}
            >
              Next: Complete Onboarding Setup
            </button>
          </>
        ) : (
          <>
            <div>
              {stage === "setup" && !isRoleAlreadyLocked && (
                <button
                  type="button"
                  onClick={() => setStage("choose")}
                  className="hidden min-[1000px]:inline-flex items-center gap-1 text-xs font-semibold text-[#1877F2] hover:underline mb-2 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back to choose role</span>
                </button>
              )}
              <h2 className="font-display font-semibold text-[16px] text-ink leading-tight">
                {isRoleAlreadyLocked ? "Profile Details" : `Complete ${form.role} Setup`}
              </h2>
              <p className="text-slate text-xs mt-0.5 font-medium">
                {isRoleAlreadyLocked ? "Your listing role details are currently locked." : "Provide setup details to lock your listing role"}
              </p>
            </div>

            {setupError && (
              <div className="p-3.5 bg-rose-50 text-rose-600 text-xs rounded-[8px] border border-rose-100 flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{setupError}</span>
              </div>
            )}

            {/* Selected Role Summary Box */}
            <div className="bg-white border border-[#59AD63]/30 rounded-[8px] p-4 shadow-sm text-left flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate/50 uppercase tracking-wider">
                    {isRoleAlreadyLocked ? "Account Role (Locked)" : "Selected Role"}
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-ink capitalize flex items-center gap-1.5 mt-0.5">
                    👤 {form.role || user?.role || "User"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSwitchError(null);
                    setSwitchSuccessMessage(null);
                    setSwitchTargetRole("");
                    setSwitchContactPhone(user?.phone || form.contactPhone || "");
                    setSwitchReason("");
                    setAttemptedSwitchSubmit(false);
                    setSwitchToast(null);
                    setShowSwitchModal(true);
                  }}
                  className="text-[10px] font-extrabold text-[#0F5B5C] bg-[#EAF5F5] hover:bg-[#D5EDED] px-3 py-1.5 rounded-[2px] transition-all cursor-pointer shadow-sm border border-[#0F5B5C]/10"
                >
                  Request Admin to Switch
                </button>
              </div>
              <p className="text-[10.5px] text-slate/70 leading-relaxed">
                {isRoleAlreadyLocked 
                  ? "Your listing role is locked. Need to switch? Submit a request to the Admin." 
                  : "You can lock this listing role or submit a request to the Admin to change it."}
              </p>

              {/* Display user's name if role is already locked */}
              {isRoleAlreadyLocked && user?.name && (
                <div className="mt-1 border-t border-slate-100 pt-2 flex flex-col">
                  <span className="text-[9px] font-bold text-slate/50 uppercase tracking-wider">Registered Name</span>
                  <span className="text-[13px] font-extrabold text-charcoal">{user.name}</span>
                </div>
              )}
            </div>

            {/* Inputs based on role (Hidden when role is already locked) */}
            {!isRoleAlreadyLocked && (
              <div className="flex flex-col gap-5 text-left animate-fade-in">
                {form.role === "Owner" && (
                  <div className="flex flex-col gap-1.5" id="owner-name-field">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate uppercase tracking-wider">
                        Owner Name <span className="text-rose-500">*</span>
                      </label>
                      {hasOwnerNameError && (
                        <span className="text-rose-500 font-bold text-[10px]">Required</span>
                      )}
                    </div>
                    <input
                      type="text"
                      disabled={isRoleAlreadyLocked}
                      placeholder="Enter owner name"
                      value={form.ownerName}
                      onChange={(e) => update({ ownerName: e.target.value })}
                      className={`w-full rounded-[8px] border px-4 py-3 text-xs font-semibold text-charcoal outline-none transition-all shadow-sm ${
                        hasOwnerNameError
                          ? "border-rose-500 bg-rose-50/20 ring-1 ring-rose-500"
                          : "border-[#59AD63]/30 bg-white focus:border-black"
                      } disabled:bg-slate-100/70 disabled:text-slate/60`}
                    />
                    {hasOwnerNameError && (
                      <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-0.5">
                        <AlertCircle size={12} className="shrink-0" />
                        Owner name is mandatory to proceed.
                      </p>
                    )}
                  </div>
                )}

                {form.role === "Broker" && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5" id="broker-name-field">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate uppercase tracking-wider">
                          Broker Name <span className="text-rose-500">*</span>
                        </label>
                        {hasBrokerNameError && (
                          <span className="text-rose-500 font-bold text-[10px]">Required</span>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={isRoleAlreadyLocked}
                        placeholder="Enter broker name"
                        value={form.brokerName}
                        onChange={(e) => update({ brokerName: e.target.value })}
                        className={`w-full rounded-[8px] border px-4 py-3 text-xs font-semibold text-charcoal outline-none transition-all shadow-sm ${
                          hasBrokerNameError
                            ? "border-rose-500 bg-rose-50/20 ring-1 ring-rose-500"
                            : "border-[#59AD63]/30 bg-white focus:border-black"
                        } disabled:bg-slate-100/70 disabled:text-slate/60`}
                      />
                      {hasBrokerNameError && (
                        <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={12} className="shrink-0" />
                          Broker name is mandatory to proceed.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {form.role === "Agency" && (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5" id="agency-name-field">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate uppercase tracking-wider">
                          Agency Name <span className="text-rose-500">*</span>
                        </label>
                        {hasAgencyNameError && (
                          <span className="text-rose-500 font-bold text-[10px]">Required</span>
                        )}
                      </div>
                      <input
                        type="text"
                        disabled={isRoleAlreadyLocked}
                        placeholder="Enter agency name"
                        value={form.agencyName}
                        onChange={(e) => update({ agencyName: e.target.value })}
                        className={`w-full rounded-[8px] border px-4 py-3 text-xs font-semibold text-charcoal outline-none transition-all shadow-sm ${
                          hasAgencyNameError
                            ? "border-rose-500 bg-rose-50/20 ring-1 ring-rose-500"
                            : "border-[#59AD63]/30 bg-white focus:border-black"
                        } disabled:bg-slate-100/70 disabled:text-slate/60`}
                      />
                      {hasAgencyNameError && (
                        <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={12} className="shrink-0" />
                          Agency name is mandatory to proceed.
                        </p>
                      )}
                    </div>

                    {!isRoleAlreadyLocked && (
                      <div className="flex flex-col gap-1.5" id="agency-logo-field">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate uppercase tracking-wider">
                            Agency Logo <span className="text-rose-500">*</span>
                          </label>
                          {hasAgencyLogoError && (
                            <span className="text-rose-500 font-bold text-[10px]">Required</span>
                          )}
                        </div>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                        {form.agencyLogo ? (
                          <div className="flex items-center gap-3 bg-white border border-[#59AD63]/30 rounded-[8px] p-3 shadow-sm">
                            <img
                              src={URL.createObjectURL(form.agencyLogo)}
                              alt="Agency Logo"
                              className="w-10 h-10 object-cover rounded-lg border border-[#59AD63]/30"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-charcoal truncate">{form.agencyLogo.name}</p>
                              <p className="text-[10px] text-slate mt-0.5">{(form.agencyLogo.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => update({ agencyLogo: null })}
                              className="text-xs font-bold text-coral hover:underline pr-1 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className={`w-full py-5 border-2 border-dashed rounded-[8px] flex flex-col items-center justify-center gap-1.5 transition-colors bg-white shadow-sm cursor-pointer ${
                              hasAgencyLogoError
                                ? "border-rose-500 bg-rose-50/20"
                                : "border-charcoal/15 hover:border-black"
                            }`}
                          >
                            <UploadCloud size={20} className={hasAgencyLogoError ? "text-rose-500" : "text-slate/60"} />
                            <span className="text-xs font-semibold text-charcoal">Upload Logo Image</span>
                            <span className="text-[10px] text-slate/50">PNG or JPEG format</span>
                          </button>
                        )}
                        {hasAgencyLogoError && (
                          <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-0.5">
                            <AlertCircle size={12} className="shrink-0" />
                            Agency logo is mandatory to proceed.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Agency Address */}
                    <div className="flex flex-col gap-1.5" id="agency-address-field">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate uppercase tracking-wider">
                          Agency Address <span className="text-rose-500">*</span>
                        </label>
                        {hasAgencyAddressError && (
                          <span className="text-rose-500 font-bold text-[10px]">Required</span>
                        )}
                      </div>
                      <textarea
                        disabled={isRoleAlreadyLocked}
                        placeholder="Enter agency address"
                        value={form.agencyAddress || ""}
                        onChange={(e) => update({ agencyAddress: e.target.value })}
                        rows={3}
                        className={`w-full rounded-[8px] border px-4 py-3 text-xs font-semibold text-charcoal outline-none transition-all shadow-sm resize-none ${
                          hasAgencyAddressError
                            ? "border-rose-500 bg-rose-50/20 ring-1 ring-rose-500"
                            : "border-[#59AD63]/30 bg-white focus:border-black"
                        } disabled:bg-slate-100/70 disabled:text-slate/60`}
                      />
                      {hasAgencyAddressError && (
                        <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={12} className="shrink-0" />
                          Agency address is mandatory to proceed.
                        </p>
                      )}
                    </div>

                    {/* Agency District */}
                    <div className="flex flex-col gap-1.5" id="agency-district-field">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate uppercase tracking-wider">
                          District <span className="text-rose-500">*</span>
                        </label>
                        {hasAgencyDistrictError && (
                          <span className="text-rose-500 font-bold text-[10px]">Required</span>
                        )}
                      </div>
                      <div className="relative">
                        <select
                          disabled={isRoleAlreadyLocked}
                          value={form.agencyDistrict || ""}
                          onChange={(e) => update({ agencyDistrict: e.target.value })}
                          className={`w-full rounded-[8px] border px-4 py-3 text-xs font-semibold text-charcoal outline-none transition-all shadow-sm appearance-none cursor-pointer ${
                            hasAgencyDistrictError
                              ? "border-rose-500 bg-rose-50/20 ring-1 ring-rose-500"
                              : "border-[#59AD63]/30 bg-white focus:border-black"
                          } disabled:bg-slate-100/70 disabled:text-slate/60`}
                        >
                          <option value="">Select District</option>
                          {districts.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate/50">
                          ▼
                        </div>
                      </div>
                      {hasAgencyDistrictError && (
                        <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle size={12} className="shrink-0" />
                          Please select a district to proceed.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Details (Always visible) */}
            <div className="flex flex-col gap-5 text-left">
              <div className="flex flex-col gap-4 border-t border-[#59AD63]/30 pt-4 mt-1">

                <div className="flex flex-col gap-1.5" id="contact-phone-field">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate uppercase tracking-wider">
                      Contact Number <span className="text-rose-500">*</span>
                    </label>
                    {hasContactPhoneError && (
                      <span className="text-rose-500 font-bold text-[10px] animate-pulse">
                        Mandatory for Buyers
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center rounded-[8px] border px-3 py-0.5 transition-all shadow-sm ${
                    hasContactPhoneError
                      ? "border-rose-500 bg-rose-50/20 ring-2 ring-rose-500/20 animate-shake"
                      : "border-[#59AD63]/30 bg-white focus-within:border-black"
                  } disabled:bg-slate-100/50`}>
                    <div className="flex items-center gap-1 text-[13px] font-semibold text-charcoal pr-3 border-r border-[#59AD63]/30 cursor-pointer">
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      disabled={isRoleAlreadyLocked && !!user?.phone}
                      placeholder="Enter 10-digit contact number"
                      value={form.contactPhone}
                      onBlur={() => setContactPhoneTouched(true)}
                      onChange={(e) => {
                        update({ contactPhone: e.target.value });
                        if (form.sameAsContact) {
                          update({ contactPhone: e.target.value, whatsappNumber: e.target.value });
                        }
                      }}
                      className="flex-1 bg-transparent text-[14px] px-3 py-3 outline-none text-charcoal placeholder:text-slate/40 font-medium disabled:text-slate/50"
                    />
                  </div>
                  {hasContactPhoneError && (
                    <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-rose-50 border border-rose-200/90 rounded-[8px] text-rose-700 animate-in fade-in slide-in-from-top-1 duration-300 shadow-xs">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                      </span>
                      <AlertCircle size={15} className="shrink-0 text-rose-600 animate-bounce" />
                      <span className="text-[12px] font-bold text-rose-700 tracking-tight">
                        Your Phone number is mandatory for Buyers {!form.contactPhone.trim() ? "" : "(10 digits required)"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="sameAsContact"
                    checked={form.sameAsContact}
                    disabled={isRoleAlreadyLocked && !!user?.whatsappNumber}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      update({ 
                        sameAsContact: checked,
                        whatsappNumber: checked ? form.contactPhone : "" 
                      });
                    }}
                    className="w-4 h-4 rounded border-[#59AD63]/30 text-[#59AD63] focus:ring-[#59AD63] focus:ring-offset-0 bg-white cursor-pointer"
                  />
                  <label htmlFor="sameAsContact" className="text-xs font-semibold text-slate cursor-pointer select-none">
                    WhatsApp number is same as contact number
                  </label>
                </div>

                <div className="flex flex-col gap-1.5" id="whatsapp-number-field">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate uppercase tracking-wider">
                      WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    {hasWhatsappNumberError && (
                      <span className="text-rose-500 font-bold text-[10px] animate-pulse">
                        Mandatory for Buyers
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center rounded-[8px] border px-3 py-0.5 transition-all shadow-sm ${
                    hasWhatsappNumberError
                      ? "border-rose-500 bg-rose-50/20 ring-2 ring-rose-500/20 animate-shake"
                      : (isRoleAlreadyLocked && !!user?.whatsappNumber) || form.sameAsContact 
                        ? "bg-slate-100/50 border-[#59AD63]/30 text-slate/50" 
                        : "bg-white border-[#59AD63]/30 focus-within:border-black"
                  }`}>
                    <div className="flex items-center gap-1 text-[13px] font-semibold pr-3 border-r border-[#59AD63]/30 cursor-pointer">
                      <span className={(isRoleAlreadyLocked && !!user?.whatsappNumber) || form.sameAsContact ? "text-slate/50" : "text-charcoal"}>+91</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit WhatsApp number"
                      value={form.whatsappNumber}
                      onBlur={() => setWhatsappTouched(true)}
                      onChange={(e) => update({ whatsappNumber: e.target.value })}
                      disabled={(isRoleAlreadyLocked && !!user?.whatsappNumber) || form.sameAsContact}
                      className="flex-1 bg-transparent text-[14px] px-3 py-3 outline-none text-charcoal placeholder:text-slate/40 font-medium disabled:text-slate/50"
                    />
                  </div>
                  {hasWhatsappNumberError && (
                    <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-rose-50 border border-rose-200/90 rounded-[8px] text-rose-700 animate-in fade-in slide-in-from-top-1 duration-300 shadow-xs">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                      </span>
                      <AlertCircle size={15} className="shrink-0 text-rose-600 animate-bounce" />
                      <span className="text-[12px] font-bold text-rose-700 tracking-tight">
                        WhatsApp number is mandatory for Buyers {!form.whatsappNumber.trim() ? "" : "(10 digits required)"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Validation Error Banner */}
            {attemptedSetupSubmit && !isSetupValid && (
              <div className="p-3.5 bg-rose-50 text-rose-700 text-xs rounded-[8px] border border-rose-200 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert size={16} className="shrink-0 text-rose-600 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">Missing Required Details</span>
                  <span className="text-[11px] text-rose-600 leading-relaxed">
                    Essential fields like contact numbers and role profile details are mandatory to proceed. Missing fields are highlighted in red above.
                  </span>
                </div>
              </div>
            )}

            <div 
              onClick={() => {
                if (!isSetupValid) {
                  setAttemptedSetupSubmit(true);
                  setContactPhoneTouched(true);
                  setWhatsappTouched(true);
                  setTimeout(() => {
                    const firstError = document.querySelector(".border-rose-500, [id$='-field'] .border-rose-500, input:invalid");
                    if (firstError) {
                      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }, 100);
                }
              }}
              className="w-full mt-auto"
            >
              <button
                type="button"
                disabled={submitting || !isSetupValid}
                onClick={handleConfirmRole}
                className={`w-full py-4 rounded-[2px] font-display font-bold text-[14px] transition-all shadow-md active:scale-[0.99] bg-[#59AD63] text-white ${
                  submitting || !isSetupValid 
                    ? "opacity-50 cursor-not-allowed shadow-none" 
                    : "hover:bg-[#3F8F4B] cursor-pointer"
                }`}
              >
                {submitting ? "Locking Account Role..." : isRoleAlreadyLocked ? "Continue" : "Confirm & Lock Role"}
              </button>
            </div>
          </>
        )}
      </div>

      {showPlansModal && (
        <SubscriptionPaywallModal
          initialPlanType="listing_slots"
          onClose={() => setShowPlansModal(false)}
          targetRole={form.role?.toLowerCase() || "owner"}
          onSuccess={() => {
            setShowPlansModal(false);
            refreshUser();
            alert("Listing slot pack purchased successfully!");
          }}
        />
      )}

      {/* Role Switch Request Modal */}
      {showSwitchModal && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSwitchModal(false)}
        >
          {/* Subtle Floating Toast Notification for Role Switch */}
          {switchToast && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[70] bg-slate-900/95 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200 border border-white/10 max-w-sm text-center">
              <AlertCircle size={15} className="text-amber-400 shrink-0" />
              <span>{switchToast}</span>
            </div>
          )}

          <div 
            className="bg-cream rounded-[8px] p-6 w-full max-w-[380px] border border-[#59AD63]/30 shadow-2xl relative flex flex-col gap-4 animate-slide-up font-display text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowSwitchModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100/80 rounded-full text-slate transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="font-extrabold text-lg text-ink">Request Role Switch</h3>
              <p className="text-xs text-slate mt-1 leading-relaxed">
                Select the new listing role you wish to switch your account to and confirm your contact number. The Admin will review and approve your request.
              </p>
            </div>

            {switchSuccessMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-[8px] text-emerald-800 text-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Request Submitted!</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {switchSuccessMessage}
                </p>
                <button
                  onClick={() => setShowSwitchModal(false)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[2px] text-xs font-bold text-center mt-1 cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {switchError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-rose-600" />
                    <span>{switchError}</span>
                  </div>
                )}

                {/* Select New Role with Inline Validation */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate uppercase tracking-wider">
                      Select New Role <span className="text-rose-500">*</span>
                    </label>
                    {hasSwitchRoleError && (
                      <span className="text-rose-500 font-bold text-[10px]">Required</span>
                    )}
                  </div>
                  <div className={`flex flex-col gap-2 p-1 rounded-xl transition-all ${
                    hasSwitchRoleError ? "border border-rose-500 bg-rose-50/20" : ""
                  }`}>
                    {["Broker", "Agency"].filter(r => r.toLowerCase() !== (user?.role || "").toLowerCase()).map((r) => {
                      const selected = switchTargetRole === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setSwitchTargetRole(r);
                            if (switchToast && switchToast.includes("role")) {
                              setSwitchToast(null);
                            }
                          }}
                          className={`p-3 rounded-[8px] border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                            selected 
                              ? "border-black bg-white shadow-sm ring-1 ring-black text-ink" 
                              : "border-[#59AD63]/30 bg-white hover:bg-slate-50 text-charcoal"
                          }`}
                        >
                          <span>{r}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selected ? "border-black bg-black text-white" : "border-charcoal/30"
                          }`}>
                            {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {hasSwitchRoleError && (
                    <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0" />
                      Please choose a target role to proceed.
                    </p>
                  )}
                </div>

                {/* Contact Number with Inline Validation */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate uppercase tracking-wider">
                      Contact Number <span className="text-rose-500">*</span>
                    </label>
                    {hasSwitchPhoneError && (
                      <span className="text-rose-500 font-bold text-[10px]">
                        {!switchContactPhone.trim() ? "Required" : "Min 10 digits"}
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center rounded-[8px] border px-3 py-0.5 transition-all shadow-sm ${
                    hasSwitchPhoneError
                      ? "border-rose-500 bg-rose-50/25 ring-1 ring-rose-500"
                      : "border-[#59AD63]/30 bg-white focus-within:border-black"
                  }`}>
                    <div className="flex items-center gap-1 text-[13px] font-semibold text-charcoal pr-2.5 border-r border-[#59AD63]/30">
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit contact number"
                      value={switchContactPhone}
                      onChange={(e) => {
                        setSwitchContactPhone(e.target.value);
                        if (attemptedSwitchSubmit && validatePhone(e.target.value)) {
                          if (switchToast && switchToast.includes("contact")) {
                            setSwitchToast(null);
                          }
                        }
                      }}
                      className="flex-1 bg-transparent text-[13px] px-2.5 py-2.5 outline-none text-charcoal placeholder:text-slate/40 font-medium"
                    />
                  </div>
                  {hasSwitchPhoneError && (
                    <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                      <AlertCircle size={12} className="shrink-0" />
                      {!switchContactPhone.trim() 
                        ? "Contact number is mandatory to proceed with role switch."
                        : "Please enter a valid 10-digit contact number."}
                    </p>
                  )}
                </div>

                {/* Reason / Notes (Optional) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate uppercase tracking-wider">
                    Reason / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Upgrading to manage client listings"
                    value={switchReason}
                    onChange={(e) => setSwitchReason(e.target.value)}
                    className="w-full rounded-[8px] border border-[#59AD63]/30 bg-white px-3 py-2 text-xs font-medium text-charcoal outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <button
                    disabled={switchSubmitting}
                    onClick={async () => {
                      setAttemptedSwitchSubmit(true);
                      if (!isSwitchValid) {
                        if (!switchTargetRole && !validatePhone(switchContactPhone)) {
                          showSwitchToast("Please select a new role and provide your contact number to proceed.");
                        } else if (!switchTargetRole) {
                          showSwitchToast("Please select the new role you wish to switch your account to.");
                        } else if (!validatePhone(switchContactPhone)) {
                          showSwitchToast("A valid 10-digit contact number is mandatory to proceed.");
                        }
                        return;
                      }
                      setSwitchSubmitting(true);
                      setSwitchError(null);
                      try {
                        const res = await api.requestRoleSwitch(switchTargetRole, switchContactPhone, switchReason);
                        setSwitchSuccessMessage(res.message || "Your switch request has been sent to the Admin for approval.");
                      } catch (err: any) {
                        setSwitchError(err.message || "Failed to submit role switch request.");
                      } finally {
                        setSwitchSubmitting(false);
                      }
                    }}
                    className={`w-full py-3.5 bg-ink text-cream rounded-[2px] text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                      switchSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-black cursor-pointer active:scale-95"
                    }`}
                  >
                    {switchSubmitting ? "Submitting Request..." : `Request Switch to ${switchTargetRole || "Role"}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSwitchModal(false)}
                    className="w-full py-2 text-xs font-semibold text-slate hover:text-charcoal cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
