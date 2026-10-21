import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, RotateCw, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { api, mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useBrand } from "@/lib/BrandContext";

const countries = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "+1", name: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+33", name: "France", flag: "🇫🇷" },
];

function detectUserCountry(): { code: string; name: string; flag: string } {
  try {
    if (typeof window !== "undefined") {
      const savedCode = localStorage.getItem("sparrow_country_code");
      const savedFlag = localStorage.getItem("sparrow_country_flag");
      if (savedCode && savedFlag) {
        const found = countries.find((c) => c.code === savedCode);
        if (found) return found;
      }
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const locale = (navigator.language || (navigator.languages && navigator.languages[0]) || "").toUpperCase();

    if (/Calcutta|Kolkata|India/i.test(tz) || locale.endsWith("-IN")) {
      return { code: "+91", name: "India", flag: "🇮🇳" };
    }
    if (/Dubai/i.test(tz) || locale.endsWith("-AE")) {
      return { code: "+971", name: "UAE", flag: "🇦🇪" };
    }
    if (/Riyadh/i.test(tz) || locale.endsWith("-SA")) {
      return { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" };
    }
    if (/Muscat/i.test(tz) || locale.endsWith("-OM")) {
      return { code: "+968", name: "Oman", flag: "🇴🇲" };
    }
    if (/Qatar/i.test(tz) || locale.endsWith("-QA")) {
      return { code: "+974", name: "Qatar", flag: "🇶🇦" };
    }
    if (/Bahrain/i.test(tz) || locale.endsWith("-BH")) {
      return { code: "+973", name: "Bahrain", flag: "🇧🇭" };
    }
    if (/Kuwait/i.test(tz) || locale.endsWith("-KW")) {
      return { code: "+965", name: "Kuwait", flag: "🇰🇼" };
    }
    if (/Singapore/i.test(tz) || locale.endsWith("-SG")) {
      return { code: "+65", name: "Singapore", flag: "🇸🇬" };
    }
    if (/London/i.test(tz) || locale.endsWith("-GB")) {
      return { code: "+44", name: "UK", flag: "🇬🇧" };
    }
    if (/Sydney|Melbourne|Brisbane|Perth|Adelaide|Australia/i.test(tz) || locale.endsWith("-AU")) {
      return { code: "+61", name: "Australia", flag: "🇦🇺" };
    }
    if (/New_York|Chicago|Denver|Los_Angeles|Toronto|America/i.test(tz) || locale.endsWith("-US") || locale.endsWith("-CA")) {
      return { code: "+1", name: "USA / Canada", flag: "🇺🇸" };
    }
    if (/Kuala_Lumpur|Malaysia/i.test(tz) || locale.endsWith("-MY")) {
      return { code: "+60", name: "Malaysia", flag: "🇲🇾" };
    }
    if (/Berlin|Germany/i.test(tz) || locale.endsWith("-DE")) {
      return { code: "+49", name: "Germany", flag: "🇩🇪" };
    }
  } catch (e) {
    // ignore
  }
  return { code: "+91", name: "India", flag: "🇮🇳" };
}

/**
 * 4-Digit Rounded Box OTP Input component matching Image 2
 */
function FourDigitOtpInput({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = [
    value[0] || "",
    value[1] || "",
    value[2] || "",
    value[3] || "",
  ];

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      const next = [...digits];
      next[index] = "";
      onChange(next.join(""));
      return;
    }
    if (raw.length === 1) {
      const next = [...digits];
      next[index] = raw;
      onChange(next.join(""));
      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      const pasted = raw.slice(0, 4);
      const next = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      onChange(next.join(""));
      const nextIdx = Math.min(pasted.length, 3);
      inputRefs.current[nextIdx]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const next = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    onChange(next.join(""));
    const nextIdx = Math.min(pasted.length, 3);
    inputRefs.current[nextIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-3 w-full my-3">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="w-14 h-16 sm:w-16 sm:h-18 bg-white text-center font-bold text-2xl text-[#0F5B5C] rounded-none border-2 border-gray-300 focus:border-[#0F5B5C] focus:ring-2 focus:ring-[#0F5B5C]/20 shadow-sm outline-none transition-all disabled:opacity-50"
          autoFocus={idx === 0}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token, user } = useAuth();
  const { activeLogoUrl, loadingBannerUrl: brandLoadingBanner, loginBannerUrl: brandLoginBanner } = useBrand();

  const [mode, setMode] = useState<"loading" | "login" | "login_otp" | "register" | "register_otp" | "forgot_password" | "reset_password">(() => {
    if (typeof window !== "undefined" && (localStorage.getItem("pending_deep_link") || (location.state as any)?.from)) {
      return "login";
    }
    return "loading";
  });

  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [forgotMethod, setForgotMethod] = useState<"phone" | "email">("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [last4, setLast4] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [resetType, setResetType] = useState<"phone" | "email">("phone");
  const [resetTarget, setResetTarget] = useState("");

  const [bannerUrl, setBannerUrl] = useState<string>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("sparrow_login_banner") : null;
    if (!saved || saved === "/app_background.jpg") return "/kerala_house_login.jpg";
    return saved;
  });
  const [loadingBannerUrl, setLoadingBannerUrl] = useState<string>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("sparrow_loading_banner") : null;
    if (!saved || saved === "/app_background.jpg") return "";
    return saved;
  });

  const bgUrl = brandLoginBanner || (bannerUrl ? mediaUrl(bannerUrl) : "/kerala_house_login.jpg");
  const loadingBgUrl = brandLoadingBanner || (loadingBannerUrl ? mediaUrl(loadingBannerUrl) : "");

  // Country Code Dropdown State
  const [countryCode, setCountryCode] = useState(() => detectUserCountry().code);
  const [countryFlag, setCountryFlag] = useState(() => detectUserCountry().flag);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (token && user) {
      const pendingLink = localStorage.getItem("pending_deep_link") || (location.state as any)?.from;
      if (pendingLink) {
        localStorage.removeItem("pending_deep_link");
        navigate(pendingLink, { replace: true });
        return;
      }
      navigate("/home", { replace: true });
      return;
    }

    if (mode === "loading") {
      const timer = setTimeout(() => {
        setMode("login");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [token, user, navigate, mode, location]);

  const [connectingProvider, setConnectingProvider] = useState<"google" | "facebook" | null>(null);

  // Desktop background (above 1000px)
  useEffect(() => {
    const applyDesktopBg = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1000) {
        document.body.style.backgroundColor = "#FAF8F3";
        document.body.style.backgroundImage = "url('/images/loginbg-1000.svg')";
        document.body.style.backgroundRepeat = "repeat-x";
        document.body.style.backgroundPosition = "bottom center";
        document.body.style.backgroundSize = "auto 240px";
      } else {
        document.body.style.backgroundImage = "";
        document.body.style.backgroundColor = "";
        document.body.style.backgroundRepeat = "";
        document.body.style.backgroundPosition = "";
        document.body.style.backgroundSize = "";
      }
    };

    applyDesktopBg();
    window.addEventListener("resize", applyDesktopBg);
    return () => {
      window.removeEventListener("resize", applyDesktopBg);
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundSize = "";
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params.get("oauth");
    const oauthToken = params.get("token");
    const oauthError = params.get("error");

    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      window.history.replaceState({}, document.title, window.location.pathname);
      setMode("login");
      return;
    }

    if (oauthStatus === "success") {
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(true);

      const handleOAuthSuccess = async () => {
        try {
          if (oauthToken) {
            localStorage.setItem("kr_token", oauthToken);
          }
          const data = await api.validateSession();
          if (data && data.user) {
            const finalToken = oauthToken || localStorage.getItem("kr_token") || "";
            login(finalToken, data.user);
            const pendingLink = localStorage.getItem("pending_deep_link") || (location.state as any)?.from;
            if (pendingLink) {
              localStorage.removeItem("pending_deep_link");
              navigate(pendingLink, { replace: true });
            } else {
              navigate("/profile/edit", { replace: true });
            }
          } else {
            setError("Authentication succeeded, but failed to load user profile.");
            setMode("login");
          }
        } catch (err: any) {
          setError(err?.message || "Failed to finalize social authentication session.");
          setMode("login");
        } finally {
          setLoading(false);
        }
      };

      handleOAuthSuccess();
    }
  }, [login, navigate]);

  useEffect(() => {
    api.fetchSetting("login_banner_url")
      .then((data) => {
        if (data && data.value) {
          setBannerUrl(data.value);
          localStorage.setItem("sparrow_login_banner", data.value);
        }
      })
      .catch((err) => console.error("Failed to load login banner setting:", err));

    api.fetchSetting("loading_banner_url")
      .then((data) => {
        if (data && data.value) {
          setLoadingBannerUrl(data.value);
          localStorage.setItem("sparrow_loading_banner", data.value);
        }
      })
      .catch((err) => console.error("Failed to load loading banner setting:", err));
  }, []);

  useEffect(() => {
    const handleBannersUpdated = () => {
      const savedLoading = localStorage.getItem("sparrow_loading_banner");
      if (savedLoading) setLoadingBannerUrl(savedLoading);
      const savedLogin = localStorage.getItem("sparrow_login_banner");
      if (savedLogin) setBannerUrl(savedLogin);
    };
    window.addEventListener("sparrow-banners-updated", handleBannersUpdated);
    return () => window.removeEventListener("sparrow-banners-updated", handleBannersUpdated);
  }, []);

  const selectCountry = (code: string, flag: string) => {
    setCountryCode(code);
    setCountryFlag(flag);
    setShowCountryDropdown(false);
    setCountrySearch("");
    try {
      localStorage.setItem("sparrow_country_code", code);
      localStorage.setItem("sparrow_country_flag", flag);
    } catch (e) {}
  };

  const handlePhoneChange = (val: string) => {
    let cleaned = val.replace(/[^\d+]/g, "");

    if (cleaned.startsWith("+")) {
      const sortedCountries = [...countries].sort((a, b) => b.code.length - a.code.length);
      for (const c of sortedCountries) {
        if (cleaned.startsWith(c.code)) {
          selectCountry(c.code, c.flag);
          cleaned = cleaned.substring(c.code.length);
          break;
        }
      }
    } else {
      const sortedCountries = [...countries].sort((a, b) => b.code.length - a.code.length);
      for (const c of sortedCountries) {
        const codeWithoutPlus = c.code.substring(1);
        if (cleaned.startsWith(codeWithoutPlus) && cleaned.length > codeWithoutPlus.length + 5) {
          selectCountry(c.code, c.flag);
          cleaned = cleaned.substring(codeWithoutPlus.length);
          break;
        }
      }
    }
    setPhone(cleaned);
  };

  // Trigger Send OTP for Sign Up
  async function handleSendSignupOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const rawPhone = phone.trim();
    if (!rawPhone) {
      setError("Please enter your mobile number");
      return;
    }
    const digitsOnly = rawPhone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const fullPhone = rawPhone.startsWith("+") ? rawPhone : `${countryCode}${rawPhone}`;
      const res = await api.sendSignupOtp(fullPhone);
      setLast4(digitsOnly.slice(-4));
      setOtp("");
      setResendTimer(30);
      setSuccessMsg(res.message || "OTP code sent to your mobile number.");
      setMode("register_otp");
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP to this mobile number");
    } finally {
      setLoading(false);
    }
  }

  // Trigger Resend OTP for Sign Up
  async function handleResendSignupOtp() {
    if (resendTimer > 0) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const rawPhone = phone.trim();
      const fullPhone = rawPhone.startsWith("+") ? rawPhone : `${countryCode}${rawPhone}`;
      const res = await api.sendSignupOtp(fullPhone);
      setResendTimer(30);
      setSuccessMsg(res.message || "A new OTP code has been sent to your mobile number.");
    } catch (err: any) {
      setError(err?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  }

  // Trigger Verify OTP for Sign Up -> then redirect to Profile
  async function handleVerifySignupOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (otp.length < 4) {
      setError("Please enter the complete 4-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      const rawPhone = phone.trim();
      const fullPhone = rawPhone.startsWith("+") ? rawPhone : `${countryCode}${rawPhone}`;
      const res = await api.verifySignupOtp({
        phone: fullPhone,
        otp: otp.trim(),
        name: name.trim() || undefined,
      });

      login(res.token, res.user);

      if (res.isNewUser) {
        // New user: navigate to Profile page to set name, email, and password
        navigate("/profile/edit", { state: { isNewUser: true } });
      } else {
        // Existing registered user: login directly and redirect
        const pendingLink = localStorage.getItem("pending_deep_link") || (location.state as any)?.from;
        if (pendingLink) {
          localStorage.removeItem("pending_deep_link");
          navigate(pendingLink, { replace: true });
        } else {
          navigate("/home");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Invalid OTP code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Standard Login with Password
  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    let loginIdentifier = "";
    if (loginMethod === "phone") {
      const raw = phone.trim();
      if (!raw) {
        setError("Please enter your mobile number");
        return;
      }
      if (raw.includes("@") || raw.startsWith("+")) {
        loginIdentifier = raw;
      } else {
        loginIdentifier = `${countryCode}${raw}`;
      }
    } else {
      const raw = email.trim();
      if (!raw) {
        setError("Please enter your email address");
        return;
      }
      loginIdentifier = raw;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await api.login(loginIdentifier, password);
      login(token, user);

      const pendingLink = localStorage.getItem("pending_deep_link") || (location.state as any)?.from;
      if (pendingLink) {
        localStorage.removeItem("pending_deep_link");
        navigate(pendingLink, { replace: true });
      } else {
        navigate("/home");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Forgot Password (Sends OTP to Mobile or Email)
  async function handleSendForgotOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    let target = "";
    if (forgotMethod === "phone") {
      const raw = phone.trim();
      if (!raw) {
        setError("Please enter your registered mobile number");
        return;
      }
      target = raw.startsWith("+") ? raw : `${countryCode}${raw}`;
    } else {
      target = email.trim();
      if (!target) {
        setError("Please enter your registered email address");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(target);
      setResetType((res.type as any) || (target.includes("@") ? "email" : "phone"));
      setResetTarget(target);
      const digits = target.replace(/\D/g, "");
      setLast4(res.last4 || digits.slice(-4));
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setResendTimer(30);
      setSuccessMsg(res.message || "OTP code sent successfully.");
      setMode("reset_password");
    } catch (err: any) {
      setError(err?.message || "Failed to send reset OTP");
    } finally {
      setLoading(false);
    }
  }

  // Handle Reset Password with OTP
  async function handleResetPassword(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otp.trim()) {
      setError("Please enter the OTP code received on your phone");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await api.resetPasswordWithOtp({
        identifier: resetTarget,
        phone: resetType === "phone" ? resetTarget : undefined,
        email: resetType === "email" ? resetTarget : undefined,
        otp: otp.trim(),
        newPassword,
      });

      login(token, user);
      navigate("/home");
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. Please check your OTP code.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleClick() {
    setError(null);
    setConnectingProvider("google");
    window.location.href = api.getGoogleOAuthUrl();
  }

  function handleFacebookClick() {
    setError(null);
    setConnectingProvider("facebook");
    window.location.href = api.getFacebookOAuthUrl();
  }

  if (mode === "loading") {
    return (
      <div className="min-h-screen bg-[#0D2436] flex items-center justify-center p-0 select-none overflow-x-hidden relative">
        <div 
          style={loadingBgUrl ? { backgroundImage: `url(${loadingBgUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          className="w-full max-w-md min-h-screen flex flex-col justify-center relative overflow-hidden font-display shadow-2xl"
        >
          {/* Central Logo Panel */}
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in px-8 mt-12 select-none relative z-10">
            <img 
              src={activeLogoUrl} 
              alt="Logo" 
              className="w-56 h-auto object-contain select-none animate-pulse brightness-110" 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/brand_logo.png";
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] login-desktop-bg flex items-center justify-center p-0 select-none overflow-x-hidden relative">
      <style>{`
        @media (min-width: 1000px) {
          .login-desktop-bg {
            background-color: #FAF8F3;
            background-image: url('/images/loginbg-1000.svg');
            background-repeat: repeat-x;
            background-position: bottom center;
            background-size: auto 240px;
          }
        }
      `}</style>
      <div 
        style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
        className="w-full max-w-md min-h-screen flex flex-col justify-start relative overflow-hidden font-display shadow-2xl"
      >
        {/* Header container */}
        <div 
          style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
          className="text-white px-4 py-3 relative flex flex-col justify-center items-center overflow-hidden shrink-0 h-[140px] sm:h-[160px]"
        >
          {/* Brand Logo centered */}
          <div className="relative z-20 w-full flex items-center justify-center select-none pt-1">
            <img 
              src={activeLogoUrl} 
              alt="Brand Logo" 
              className="h-auto object-contain filter drop-shadow-md select-none" 
              style={{ width: "8rem" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/brand_logo.png";
              }}
            />
          </div>
        </div>

        {/* Form Container (rounded-none, equal fields, fit on screen) */}
        <div className="bg-[#F5F4F8] rounded-none px-5 pt-4 pb-5 sm:px-8 sm:pt-6 sm:pb-8 flex-1 flex flex-col -mt-3 z-10 shadow-lg relative">
          
          {/* Back button for secondary modes */}
          {mode !== "login" && (
            <button 
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                if (mode === "register_otp") {
                  setMode(loginMethod === "phone" ? "login" : "register");
                } else {
                  setMode("login");
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0F5B5C] mb-5 hover:opacity-80 active:scale-95 transition-all self-start cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>{mode === "register_otp" ? "Change mobile number" : "Back to login"}</span>
            </button>
          )}

          {/* Form Title */}
          <div className="flex items-center gap-2 mb-3.5 select-none">
            <ShieldCheck className="w-5 h-5 text-[#0F5B5C] shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-wider uppercase leading-tight">
              {mode === "login" ? (
                "LOGIN"
              ) : mode === "login_otp" ? (
                "LOGIN WITH MOBILE OTP"
              ) : mode === "register" ? (
                "SIGN UP"
              ) : mode === "register_otp" ? (
                "VERIFY OTP"
              ) : mode === "forgot_password" ? (
                "FORGOT PASSWORD"
              ) : (
                "RESET PASSWORD"
              )}
            </h2>
          </div>

          {((location.state as any)?.from || (typeof window !== "undefined" && localStorage.getItem("pending_deep_link"))) && (
            <div className="bg-emerald-50 border border-emerald-500/20 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-none mb-4 flex items-center gap-2">
              <span>Please sign in to view property details.</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODE: SIGN UP (Image 1: Phone + Name -> Send OTP)              */}
          {/* ============================================================== */}
          {mode === "register" && (
            <form onSubmit={handleSendSignupOtp} className="flex flex-col gap-4">
              {/* Full Name field */}
              <div className="flex items-center bg-white rounded-none px-5 py-3.5 shadow-sm border border-[#59AD63]/30 gap-3 focus-within:ring-2 focus-within:ring-[#0F5B5C]/20 transition-all">
                <User size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="flex-1 bg-transparent text-xs outline-none text-charcoal font-semibold placeholder:text-slate-400"
                />
              </div>

              {/* Mobile Number with Country Code */}
              <div>
                <div className="flex gap-2 relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="bg-white rounded-none px-3.5 py-3.5 text-xs text-charcoal flex items-center gap-1.5 hover:bg-slate-50 shadow-sm border border-[#59AD63]/30 select-none whitespace-nowrap min-w-[76px] justify-center cursor-pointer font-bold transition-all shrink-0"
                    title="Select Country Code"
                  >
                    <span className="text-sm leading-none">{countryFlag}</span>
                    <span className="font-semibold text-charcoal">{countryCode}</span>
                  </button>

                  <div className="flex-1 flex items-center bg-white rounded-none px-4 py-3.5 shadow-sm border border-[#59AD63]/30 gap-3 focus-within:ring-2 focus-within:ring-[#0F5B5C]/20 transition-all">
                    <Phone size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Number"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      autoComplete="tel"
                      className="flex-1 bg-transparent text-xs outline-none text-charcoal font-semibold placeholder:text-slate-400"
                    />
                  </div>

                  {showCountryDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowCountryDropdown(false)} 
                      />
                      <div className="absolute left-0 top-[48px] w-64 bg-white border border-[#59AD63]/30 rounded-none p-2.5 z-50 shadow-2xl flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Search country name or code..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full bg-slate-50 border border-[#59AD63]/30 rounded-none px-2.5 py-1.5 text-[11px] text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-[#0F5B5C]"
                          autoFocus
                        />
                        <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto no-scrollbar">
                          {countries
                            .filter(
                              (c) =>
                                c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                c.code.includes(countrySearch)
                            )
                            .map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => selectCountry(c.code, c.flag)}
                                className="w-full text-left flex items-center justify-between px-2.5 py-2 rounded-none hover:bg-slate-50 text-charcoal text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-sm">{c.flag}</span>
                                  <span>{c.name}</span>
                                </span>
                                <span className="text-slate-500 font-mono text-[10px]">{c.code}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-[12px] text-slate-500 font-medium mt-2 pl-1 select-none">
                  You will receive an OTP on this number.
                </p>
              </div>

              {/* Error Message */}
              {error && <p className="text-[11.5px] text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-none border border-rose-200 text-left">{error}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0F5B5C] hover:bg-[#0F5B5C]/90 text-white rounded-none text-xs font-bold tracking-wider uppercase shadow-md shadow-[#0F5B5C]/20 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>{loading ? "Sending OTP..." : "SIGN UP"}</span>
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* MODE: SIGN UP OTP (Image 2: 4 Rounded Boxes -> Verify OTP)      */}
          {/* ============================================================== */}
          {mode === "register_otp" && (
            <form onSubmit={handleVerifySignupOtp} className="flex flex-col gap-3">
              {/* 4 Digit OTP Boxes */}
              <FourDigitOtpInput 
                value={otp} 
                onChange={(val) => { setOtp(val); setError(null); }} 
                disabled={loading} 
              />

              {/* Information Text */}
              <p className="text-[12.5px] text-[#2C5282] font-medium leading-relaxed my-1 select-none text-left">
                We've sent you a one-time code to your mobile ending in <span className="font-bold">{last4 || "..."}</span>. This code will expire after 5 minutes.
              </p>

              {/* Resend OTP button */}
              <div className="flex items-center justify-between text-xs pt-1 pb-2">
                <span className="text-slate-500">Didn't receive code?</span>
                {resendTimer > 0 ? (
                  <span className="text-slate-400 font-medium">Resend OTP in <span className="font-bold text-[#0F5B5C]">{resendTimer}s</span></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendSignupOtp}
                    disabled={loading}
                    className="text-[#0F5B5C] font-bold hover:underline cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <RotateCw size={12} />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>

              {/* Error & Success Messages */}
              {successMsg && <p className="text-[11.5px] text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-none border border-emerald-200 text-left">{successMsg}</p>}
              {error && <p className="text-[11.5px] text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-none border border-rose-200 text-left">{error}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-4 bg-[#0F5B5C] hover:bg-[#0F5B5C]/90 text-white rounded-none text-xs font-bold tracking-wider uppercase shadow-md shadow-[#0F5B5C]/20 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{loading ? "Verifying..." : "VERIFY & CONTINUE"}</span>
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* MODE: LOGIN WITH MOBILE OTP (Send OTP)                         */}
          {/* ============================================================== */}
          {mode === "login_otp" && (
            <form onSubmit={handleSendSignupOtp} className="flex flex-col gap-3">
              <p className="text-[12px] text-slate-600 font-medium text-left leading-relaxed">
                Enter your mobile number to receive an instant 4-digit OTP. Works for both registered users and new users.
              </p>

              {/* Mobile Number with Country Code */}
              <div className="flex gap-2 relative w-full">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="h-11 bg-white rounded-none px-3 text-xs text-charcoal flex items-center gap-1.5 hover:bg-slate-50 border border-gray-300 select-none whitespace-nowrap min-w-[76px] justify-center cursor-pointer font-bold transition-all shrink-0 shadow-2xs"
                  title="Select Country Code"
                >
                  <span className="font-bold text-gray-800">IN {countryCode}</span>
                </button>

                <div className="flex-1 h-11 flex items-center bg-white rounded-none px-3.5 border border-gray-300 gap-2.5 shadow-2xs focus-within:border-[#0F5B5C] transition-all">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    autoComplete="tel"
                    autoFocus
                    className="flex-1 bg-transparent text-xs outline-none text-charcoal font-semibold placeholder:text-slate-400"
                  />
                </div>

                {showCountryDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowCountryDropdown(false)} 
                    />
                    <div className="absolute left-0 top-[48px] w-64 bg-white border border-gray-300 rounded-none p-2 z-50 shadow-2xl flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Search country name or code..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-300 rounded-none px-2.5 py-1.5 text-[11px] text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-[#0F5B5C]"
                        autoFocus
                      />
                      <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto no-scrollbar">
                        {countries
                          .filter(
                            (c) =>
                              c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                              c.code.includes(countrySearch)
                          )
                          .map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => selectCountry(c.code, c.flag)}
                              className="w-full text-left flex items-center justify-between px-2.5 py-2 rounded-none hover:bg-slate-50 text-charcoal text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-sm">{c.flag}</span>
                                <span>{c.name}</span>
                              </span>
                              <span className="text-slate-500 font-mono text-[10px]">{c.code}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && <p className="text-[11px] text-rose-600 font-semibold bg-rose-50 p-2 rounded-none border border-rose-200 text-left">{error}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#0F5B5C] hover:bg-[#0c4a4b] text-white rounded-none text-xs font-bold tracking-wider uppercase shadow-xs transition-all active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>{loading ? "Sending OTP..." : "SEND OTP"}</span>
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* MODE: LOGIN (Phone / Email with Password)                      */}
          {/* ============================================================== */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              {/* Method Toggle: Mobile Number vs Email */}
              <div className="flex bg-[#EAE8F2] p-1 rounded-none gap-1 mb-1 w-full">
                <button
                  type="button"
                  onClick={() => { setLoginMethod("phone"); setError(null); }}
                  className={`flex-1 h-9 text-[11px] font-bold rounded-none uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === "phone"
                      ? "bg-white text-[#0F5B5C] border border-gray-200 shadow-2xs"
                      : "text-slate-500 hover:text-charcoal"
                  }`}
                >
                  <Phone size={12} className={loginMethod === "phone" ? "text-[#0F5B5C]" : ""} />
                  <span>MOBILE NUMBER</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod("email"); setError(null); }}
                  className={`flex-1 h-9 text-[11px] font-bold rounded-none uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === "email"
                      ? "bg-white text-[#0F5B5C] border border-gray-200 shadow-2xs"
                      : "text-slate-500 hover:text-charcoal"
                  }`}
                >
                  <Mail size={12} className={loginMethod === "email" ? "text-[#0F5B5C]" : ""} />
                  <span>EMAIL ADDRESS</span>
                </button>
              </div>

              {/* Mobile Number with Country Code */}
              {loginMethod === "phone" && (
                <div className="flex gap-2 relative w-full">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="h-11 bg-white rounded-none px-3 text-xs text-charcoal flex items-center gap-1.5 hover:bg-slate-50 border border-gray-300 select-none whitespace-nowrap min-w-[76px] justify-center cursor-pointer font-bold transition-all shrink-0 shadow-2xs"
                    title="Select Country Code"
                  >
                    <span className="font-bold text-gray-800">IN {countryCode}</span>
                  </button>

                  <div className="flex-1 h-11 flex items-center bg-white rounded-none px-3.5 border border-gray-300 gap-2.5 shadow-2xs focus-within:border-[#0F5B5C] transition-all">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Number"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      autoComplete="tel"
                      className="flex-1 bg-transparent text-xs outline-none text-charcoal font-semibold placeholder:text-slate-400"
                    />
                  </div>

                  {showCountryDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowCountryDropdown(false)} 
                      />
                      <div className="absolute left-0 top-[48px] w-64 bg-white border border-gray-300 rounded-none p-2 z-50 shadow-2xl flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Search country name or code..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full bg-slate-50 border border-gray-300 rounded-none px-2.5 py-1.5 text-[11px] text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-[#0F5B5C]"
                          autoFocus
                        />
                        <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto no-scrollbar">
                          {countries
                            .filter(
                              (c) =>
                                c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                c.code.includes(countrySearch)
                            )
                            .map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => selectCountry(c.code, c.flag)}
                                className="w-full text-left flex items-center justify-between px-2.5 py-2 rounded-none hover:bg-slate-50 text-charcoal text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="text-sm">{c.flag}</span>
                                  <span>{c.name}</span>
                                </span>
                                <span className="text-slate-500 font-mono text-[10px]">{c.code}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Email Address */}
              {loginMethod === "email" && (
                <div className="w-full h-11 flex items-center bg-white rounded-none px-3.5 border border-gray-300 gap-2.5 shadow-2xs focus-within:border-[#0F5B5C] transition-all">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="flex-1 bg-transparent text-xs outline-none text-charcoal font-semibold placeholder:text-slate-400"
                  />
                </div>
              )}

              {/* Password */}
              <div className="w-full h-11 flex items-center bg-white rounded-none px-3.5 border border-gray-300 gap-2.5 shadow-2xs focus-within:border-[#0F5B5C] transition-all">
                <Lock size={14} className="text-slate-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="flex-1 bg-transparent text-xs outline-none text-charcoal font-semibold placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-slate-400 hover:text-charcoal transition-colors shrink-0 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Forgot password link */}
              <button 
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMsg(null);
                  setMode("forgot_password");
                }}
                className="text-[10.5px] font-bold text-slate-700 hover:text-[#0F5B5C] block text-right uppercase tracking-wider self-end -mt-1 cursor-pointer"
              >
                FORGOT PASSWORD?
              </button>

              {/* Error Message */}
              {error && <p className="text-[11px] text-rose-600 font-semibold bg-rose-50 p-2 rounded-none border border-rose-200 text-left">{error}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#0F5B5C] hover:bg-[#0c4a4b] text-white rounded-none text-xs font-bold tracking-wider uppercase shadow-xs transition-all active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-0.5"
              >
                <span>{loading ? "Signing In..." : "LOGIN"}</span>
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* MODE: FORGOT PASSWORD (Send OTP to Mobile or Email)            */}
          {/* ============================================================== */}
          {mode === "forgot_password" && (
            <form onSubmit={handleSendForgotOtp} className="flex flex-col gap-4">
              {/* Method Toggle */}
              <div className="flex bg-[#EAE8F2] p-1 rounded-none gap-1 mb-1">
                <button
                  type="button"
                  onClick={() => { setForgotMethod("phone"); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-none transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    forgotMethod === "phone"
                      ? "bg-white text-[#0F5B5C] shadow-sm"
                      : "text-slate-500 hover:text-charcoal"
                  }`}
                >
                  <Phone size={13} />
                  <span>Mobile OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setForgotMethod("email"); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-none transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    forgotMethod === "email"
                      ? "bg-white text-[#0F5B5C] shadow-sm"
                      : "text-slate-500 hover:text-charcoal"
                  }`}
                >
                  <Mail size={13} />
                  <span>Email OTP</span>
                </button>
              </div>

              {forgotMethod === "phone" ? (
                <div>
                  <div className="flex gap-2 relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="bg-white rounded-none px-3.5 py-3.5 text-xs text-charcoal flex items-center gap-1.5 hover:bg-slate-50 shadow-sm border border-[#59AD63]/30 select-none whitespace-nowrap min-w-[76px] justify-center cursor-pointer font-bold transition-all shrink-0"
                    >
                      <span className="text-sm leading-none">{countryFlag}</span>
                      <span className="font-semibold text-charcoal">{countryCode}</span>
                    </button>

                    <div className="flex-1 flex items-center bg-white rounded-none px-4 py-3.5 shadow-sm border border-[#59AD63]/30 gap-3 focus-within:ring-2 focus-within:ring-[#0F5B5C]/20 transition-all">
                      <Phone size={16} className="text-slate-400 shrink-0" />
                      <input
                        type="tel"
                        required
                        placeholder="Registered Mobile Number"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        autoComplete="tel"
                        className="flex-1 bg-transparent text-xs outline-none text-charcoal font-semibold placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium mt-2 pl-1 select-none">
                    We will send an SMS OTP to reset your password.
                  </p>
                </div>
              ) : (
                <div className="flex items-center bg-white rounded-none px-5 py-3.5 shadow-sm border border-[#59AD63]/30 gap-3 focus-within:ring-2 focus-within:ring-[#0F5B5C]/20 transition-all">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="Registered Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="flex-1 bg-transparent text-xs outline-none text-charcoal font-semibold placeholder:text-slate-400"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && <p className="text-[11.5px] text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-none border border-rose-200 text-left">{error}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0F5B5C] hover:bg-[#0F5B5C]/90 text-white rounded-none text-xs font-bold tracking-wider uppercase shadow-md shadow-[#0F5B5C]/20 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>{loading ? "Sending OTP..." : "SEND OTP"}</span>
              </button>
            </form>
          )}

          {/* ============================================================== */}
          {/* MODE: RESET PASSWORD (Enter OTP + New Password)               */}
          {/* ============================================================== */}
          {mode === "reset_password" && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              {resetType === "phone" ? (
                <>
                  <FourDigitOtpInput 
                    value={otp} 
                    onChange={(val) => { setOtp(val); setError(null); }} 
                    disabled={loading} 
                  />
                  <p className="text-[12px] text-slate-500 font-medium text-left">
                    Enter the 4-digit OTP sent to mobile ending in <span className="font-bold text-[#0F5B5C]">{last4}</span>
                  </p>
                </>
              ) : (
                <div className="flex items-center bg-white rounded-none px-5 py-3.5 shadow-sm border border-[#59AD63]/30 gap-3 focus-within:ring-2 focus-within:ring-[#0F5B5C]/20 transition-all">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter OTP Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-transparent text-center font-mono tracking-widest text-sm outline-none text-charcoal font-bold placeholder:text-slate-400"
                  />
                </div>
              )}

              {/* Resend OTP button */}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-500">Didn't receive code?</span>
                {resendTimer > 0 ? (
                  <span className="text-slate-400 font-medium">Resend in <span className="font-bold text-[#0F5B5C]">{resendTimer}s</span></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendForgotOtp}
                    disabled={loading}
                    className="text-[#0F5B5C] font-bold hover:underline cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <RotateCw size={12} />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>

              {/* New Password */}
              <div className="flex items-center bg-white rounded-none px-5 py-3.5 shadow-sm border border-[#59AD63]/30 gap-3 focus-within:ring-2 focus-within:ring-[#0F5B5C]/20 transition-all">
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 bg-transparent text-xs outline-none text-charcoal font-semibold placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-charcoal cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Confirm New Password */}
              <div className="flex items-center bg-white rounded-none px-5 py-3.5 shadow-sm border border-[#59AD63]/30 gap-3 focus-within:ring-2 focus-within:ring-[#0F5B5C]/20 transition-all">
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="flex-1 bg-transparent text-xs outline-none text-charcoal font-semibold placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-charcoal cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error & Success Messages */}
              {successMsg && <p className="text-[11.5px] text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-none border border-emerald-200 text-left">{successMsg}</p>}
              {error && <p className="text-[11.5px] text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-none border border-rose-200 text-left">{error}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0F5B5C] hover:bg-[#0F5B5C]/90 text-white rounded-none text-xs font-bold tracking-wider uppercase shadow-md shadow-[#0F5B5C]/20 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{loading ? "Resetting..." : "RESET PASSWORD & LOGIN"}</span>
              </button>
            </form>
          )}

          {/* Social login options */}
          {(mode === "login" || mode === "register" || mode === "register_otp") && (
            <>
              {/* Divider */}
              <div className="flex items-center gap-3 my-2.5 select-none">
                <div className="h-[1px] flex-1 bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OR CONTINUE WITH</span>
                <div className="h-[1px] flex-1 bg-slate-200" />
              </div>

              {/* Social Login Buttons (all equal h-11, rounded-none) */}
              <div className="flex flex-col gap-2 mb-2 w-full">
                {/* Login with Mobile OTP */}
                <button 
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    const rawPhone = phone.trim();
                    const digitsOnly = rawPhone.replace(/\D/g, "");
                    if (digitsOnly.length >= 10) {
                      handleSendSignupOtp();
                    } else {
                      setMode("login_otp");
                    }
                  }}
                  className="w-full h-11 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 rounded-none border border-gray-300 shadow-2xs flex items-center justify-center gap-2 font-semibold text-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span className="text-sm">🔐</span>
                  <span>Login with Mobile OTP</span>
                </button>

                {/* Continue with Google */}
                <button 
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading || connectingProvider !== null}
                  className="w-full h-11 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 rounded-none border border-gray-300 shadow-2xs flex items-center justify-center gap-2.5 font-semibold text-xs transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {connectingProvider === "google" ? (
                    <span className="text-gray-500 font-bold">Connecting to Google...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                {/* Continue with Facebook */}
                <button 
                  type="button"
                  onClick={handleFacebookClick}
                  disabled={loading || connectingProvider !== null}
                  className="w-full h-11 bg-[#1877F2] hover:bg-[#166fe5] active:bg-[#1465d2] text-white rounded-none shadow-2xs flex items-center justify-center gap-2.5 font-semibold text-xs transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {connectingProvider === "facebook" ? (
                    <span className="font-bold">Connecting to Facebook...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Continue with Facebook</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Toggle login vs register links */}
          <p className="text-center text-slate-500 text-xs font-semibold select-none mt-auto">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => { setError(null); setSuccessMsg(null); setMode("register"); }} 
                  className="font-bold text-[#0F5B5C] hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            ) : mode === "login_otp" ? (
              <>
                Prefer password?{" "}
                <button 
                  type="button" 
                  onClick={() => { setError(null); setSuccessMsg(null); setMode("login"); }} 
                  className="font-bold text-[#0F5B5C] hover:underline cursor-pointer"
                >
                  Login with Password
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => { setError(null); setSuccessMsg(null); setMode("login"); }} 
                  className="font-bold text-[#0F5B5C] hover:underline cursor-pointer"
                >
                  Login
                </button>
              </>
            )}
          </p>

        </div>
      </div>
    </div>
  );
}
