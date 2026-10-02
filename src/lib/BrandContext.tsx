import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { mediaUrl } from "./api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const DEFAULT_DESKTOP_LOGO = "/brand_logo-web.png";
export const DEFAULT_MOBILE_LOGO = "/brand_logo.png";

interface BrandContextType {
  desktopLogoUrl: string;
  mobileLogoUrl: string;
  activeLogoUrl: string;
  isDesktop: boolean;
  refreshLogos: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType>({
  desktopLogoUrl: DEFAULT_DESKTOP_LOGO,
  mobileLogoUrl: DEFAULT_MOBILE_LOGO,
  activeLogoUrl: DEFAULT_DESKTOP_LOGO,
  isDesktop: typeof window !== "undefined" ? window.innerWidth >= 1000 : true,
  refreshLogos: async () => {},
});

export function BrandProvider({ children }: { children: ReactNode }) {
  const [desktopLogo, setDesktopLogo] = useState<string>(() => {
    return localStorage.getItem("sparrow_desktop_logo") || DEFAULT_DESKTOP_LOGO;
  });
  const [mobileLogo, setMobileLogo] = useState<string>(() => {
    return localStorage.getItem("sparrow_mobile_logo") || DEFAULT_MOBILE_LOGO;
  });
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    return typeof window !== "undefined" ? window.innerWidth >= 1000 : true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadLogos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.desktop_logo_url) {
          setDesktopLogo(data.desktop_logo_url);
          localStorage.setItem("sparrow_desktop_logo", data.desktop_logo_url);
        }
        if (data.mobile_logo_url) {
          setMobileLogo(data.mobile_logo_url);
          localStorage.setItem("sparrow_mobile_logo", data.mobile_logo_url);
        }
      }
    } catch {
      try {
        const [dRes, mRes] = await Promise.all([
          fetch(`${API_URL}/api/settings/desktop_logo_url`).then(r => r.json()),
          fetch(`${API_URL}/api/settings/mobile_logo_url`).then(r => r.json())
        ]);
        if (dRes?.value) {
          setDesktopLogo(dRes.value);
          localStorage.setItem("sparrow_desktop_logo", dRes.value);
        }
        if (mRes?.value) {
          setMobileLogo(mRes.value);
          localStorage.setItem("sparrow_mobile_logo", mRes.value);
        }
      } catch (err) {
        // silent fallback to default
      }
    }
  }, []);

  useEffect(() => {
    loadLogos();
    const handleCustomUpdate = () => loadLogos();
    window.addEventListener("sparrow-logos-updated", handleCustomUpdate);
    return () => window.removeEventListener("sparrow-logos-updated", handleCustomUpdate);
  }, [loadLogos]);

  const resolvedDesktop = desktopLogo ? mediaUrl(desktopLogo) : DEFAULT_DESKTOP_LOGO;
  const resolvedMobile = mobileLogo ? mediaUrl(mobileLogo) : DEFAULT_MOBILE_LOGO;
  const activeLogoUrl = isDesktop ? resolvedDesktop : resolvedMobile;

  return (
    <BrandContext.Provider
      value={{
        desktopLogoUrl: resolvedDesktop,
        mobileLogoUrl: resolvedMobile,
        activeLogoUrl,
        isDesktop,
        refreshLogos: loadLogos,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
