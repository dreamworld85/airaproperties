import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Aira Properties - Real Estate Marketplace Kerala & India",
    description: "Discover, buy, and lease verified properties, apartments, villas, and plots across Kerala and India on Aira Properties."
  },
  "/services": {
    title: "Real Estate Services - Aira Properties",
    description: "Explore legal verification, property inspection, documentation, and valuation services by Aira Properties."
  },
  "/builders": {
    title: "Top Real Estate Builders & Developers - Aira Properties",
    description: "Browse verified residential projects, luxury apartments, and commercial complexes from premier builders."
  },
  "/partner-with-us": {
    title: "Partner With Us - Builders & Agencies - Aira Properties",
    description: "List your residential projects, showcase luxury villas, and connect with genuine property buyers."
  },
  "/app": {
    title: "Download Aira Properties Mobile App - Android & iOS",
    description: "Get the Aira Properties app for instant property alerts, direct owner contacts, and mobile property search."
  },
  "/contact-us": {
    title: "Contact Us - Aira Properties",
    description: "Reach our support team for property enquiries, listing assistance, and customer support."
  },
  "/privacy": {
    title: "Privacy Policy - Aira Properties",
    description: "Learn how Aira Properties protects user data, privacy, and account information."
  },
  "/terms": {
    title: "Terms & Conditions - Aira Properties",
    description: "Terms of service and user agreements for Aira Properties portal."
  },
  "/refund": {
    title: "Refund Policy - Aira Properties",
    description: "Refund terms and conditions for subscriptions and token purchases on Aira Properties."
  }
};

export default function SEOHead() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const matched = ROUTE_SEO[path];

    if (matched) {
      document.title = matched.title;

      let descTag = document.querySelector('meta[name="description"]');
      if (descTag) {
        descTag.setAttribute("content", matched.description);
      }

      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", matched.title);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", matched.description);

      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute("href", `https://airaproperties.in${path === "/" ? "" : path}`);
      }
    } else if (path.startsWith("/location/")) {
      const locName = decodeURIComponent(path.replace("/location/", ""));
      const title = `Properties for Sale in ${locName} - Aira Properties`;
      const desc = `Find verified villas, plots, houses, and apartments for sale in ${locName}, Kerala on Aira Properties.`;
      document.title = title;

      let descTag = document.querySelector('meta[name="description"]');
      if (descTag) descTag.setAttribute("content", desc);

      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", title);

      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `https://airaproperties.in${path}`);
    }
  }, [location.pathname]);

  return null;
}
