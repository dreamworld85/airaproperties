import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { mediaUrl, getApiUrl } from "./api";

const API_URL = getApiUrl();

export const DEFAULT_DESKTOP_LOGO = "/brand_logo-web.png";
export const DEFAULT_MOBILE_LOGO = "/brand_logo.png";
export const DEFAULT_WELCOME_BANNER = "/kerala_house_banner.jpg";
export const DEFAULT_LOGIN_BANNER = "/kerala_house_login.jpg";
export const DEFAULT_LOADING_BANNER = "";

interface BrandContextType {
  desktopLogoUrl: string;
  mobileLogoUrl: string;
  activeLogoUrl: string;
  loadingBannerUrl: string;
  loginBannerUrl: string;
  welcomeBannerUrl: string;
  isDesktop: boolean;
  refreshLogos: () => Promise<void>;
  refreshBanners: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType>({
  desktopLogoUrl: DEFAULT_DESKTOP_LOGO,
  mobileLogoUrl: DEFAULT_MOBILE_LOGO,
  activeLogoUrl: DEFAULT_DESKTOP_LOGO,
  loadingBannerUrl: DEFAULT_LOADING_BANNER,
  loginBannerUrl: DEFAULT_LOGIN_BANNER,
  welcomeBannerUrl: DEFAULT_WELCOME_BANNER,
  isDesktop: typeof window !== "undefined" ? window.innerWidth >= 1000 : true,
  refreshLogos: async () => {},
  refreshBanners: async () => {},
});

export function BrandProvider({ children }: { children: ReactNode }) {
  const [desktopLogo, setDesktopLogo] = useState<string>(() => {
    return localStorage.getItem("sparrow_desktop_logo") || DEFAULT_DESKTOP_LOGO;
  });
  const [mobileLogo, setMobileLogo] = useState<string>(() => {
    return localStorage.getItem("sparrow_mobile_logo") || DEFAULT_MOBILE_LOGO;
  });
  const [loadingBanner, setLoadingBanner] = useState<string>(() => {
    const val = localStorage.getItem("sparrow_loading_banner");
    if (!val || val === "/app_background.jpg") return DEFAULT_LOADING_BANNER;
    return val;
  });
  const [loginBanner, setLoginBanner] = useState<string>(() => {
    const val = localStorage.getItem("sparrow_login_banner");
    if (!val || val === "/app_background.jpg") return DEFAULT_LOGIN_BANNER;
    return val;
  });
  const [welcomeBanner, setWelcomeBanner] = useState<string>(() => {
    return localStorage.getItem("sparrow_welcome_banner") || DEFAULT_WELCOME_BANNER;
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

  const loadSettings = useCallback(async () => {
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
        if (data.loading_banner_url && data.loading_banner_url !== "/app_background.jpg") {
          setLoadingBanner(data.loading_banner_url);
          localStorage.setItem("sparrow_loading_banner", data.loading_banner_url);
        }
        if (data.login_banner_url) {
          setLoginBanner(data.login_banner_url);
          localStorage.setItem("sparrow_login_banner", data.login_banner_url);
        }
        if (data.welcome_banner_url) {
          setWelcomeBanner(data.welcome_banner_url);
          localStorage.setItem("sparrow_welcome_banner", data.welcome_banner_url);
        }
      }
    } catch {
      try {
        const [dRes, mRes, lRes] = await Promise.all([
          fetch(`${API_URL}/api/settings/desktop_logo_url`).then(r => r.json()).catch(() => null),
          fetch(`${API_URL}/api/settings/mobile_logo_url`).then(r => r.json()).catch(() => null),
          fetch(`${API_URL}/api/settings/loading_banner_url`).then(r => r.json()).catch(() => null)
        ]);
        if (dRes?.value) {
          setDesktopLogo(dRes.value);
          localStorage.setItem("sparrow_desktop_logo", dRes.value);
        }
        if (mRes?.value) {
          setMobileLogo(mRes.value);
          localStorage.setItem("sparrow_mobile_logo", mRes.value);
        }
        if (lRes?.value && lRes.value !== "/app_background.jpg") {
          setLoadingBanner(lRes.value);
          localStorage.setItem("sparrow_loading_banner", lRes.value);
        }
      } catch (err) {
        // silent fallback to default
      }
    }
  }, []);

  useEffect(() => {
    loadSettings();
    const handleCustomUpdate = () => {
      const savedLoading = localStorage.getItem("sparrow_loading_banner");
      if (savedLoading && savedLoading !== "/app_background.jpg") setLoadingBanner(savedLoading);
      const savedLogin = localStorage.getItem("sparrow_login_banner");
      if (savedLogin) setLoginBanner(savedLogin);
      const savedWelcome = localStorage.getItem("sparrow_welcome_banner");
      if (savedWelcome) setWelcomeBanner(savedWelcome);
      loadSettings();
    };
    window.addEventListener("sparrow-logos-updated", handleCustomUpdate);
    window.addEventListener("sparrow-banners-updated", handleCustomUpdate);
    return () => {
      window.removeEventListener("sparrow-logos-updated", handleCustomUpdate);
      window.removeEventListener("sparrow-banners-updated", handleCustomUpdate);
    };
  }, [loadSettings]);

  const resolvedDesktop = desktopLogo ? mediaUrl(desktopLogo) : DEFAULT_DESKTOP_LOGO;
  const resolvedMobile = mobileLogo ? mediaUrl(mobileLogo) : DEFAULT_MOBILE_LOGO;
  const activeLogoUrl = isDesktop ? resolvedDesktop : resolvedMobile;
  const resolvedLoadingBanner = loadingBanner ? mediaUrl(loadingBanner) : "";
  const resolvedLoginBanner = loginBanner ? mediaUrl(loginBanner) : DEFAULT_LOGIN_BANNER;
  const resolvedWelcomeBanner = welcomeBanner ? mediaUrl(welcomeBanner) : DEFAULT_WELCOME_BANNER;

  return (
    <BrandContext.Provider
      value={{
        desktopLogoUrl: resolvedDesktop,
        mobileLogoUrl: resolvedMobile,
        activeLogoUrl,
        loadingBannerUrl: resolvedLoadingBanner,
        loginBannerUrl: resolvedLoginBanner,
        welcomeBannerUrl: resolvedWelcomeBanner,
        isDesktop,
        refreshLogos: loadSettings,
        refreshBanners: loadSettings,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
