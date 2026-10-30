import { useEffect } from "react";
import { getApiUrl } from "@/lib/api";

const API_URL = getApiUrl();

export function applyCustomCodeSettings(settings: Record<string, string>) {
  if (typeof document === "undefined") return;

  try {
    // 1. Meta Description
    if (settings.custom_meta_description !== undefined) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (settings.custom_meta_description.trim()) {
        if (!metaDesc) {
          metaDesc = document.createElement("meta");
          metaDesc.setAttribute("name", "description");
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute("content", settings.custom_meta_description.trim());
      } else if (metaDesc) {
        metaDesc.remove();
      }
    }

    // 2. Meta Keywords
    if (settings.custom_meta_keywords !== undefined) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (settings.custom_meta_keywords.trim()) {
        if (!metaKeywords) {
          metaKeywords = document.createElement("meta");
          metaKeywords.setAttribute("name", "keywords");
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute("content", settings.custom_meta_keywords.trim());
      } else if (metaKeywords) {
        metaKeywords.remove();
      }
    }

    // 3. Google Site Verification
    if (settings.custom_google_verification !== undefined) {
      let val = settings.custom_google_verification.trim();
      // Handle if admin pasted the whole tag <meta name="google-site-verification" content="..." />
      const match = val.match(/content=["']([^"']+)["']/i);
      if (match) val = match[1];

      let metaVerif = document.querySelector('meta[name="google-site-verification"]');
      if (val) {
        if (!metaVerif) {
          metaVerif = document.createElement("meta");
          metaVerif.setAttribute("name", "google-site-verification");
          document.head.appendChild(metaVerif);
        }
        metaVerif.setAttribute("content", val);
      } else if (metaVerif) {
        metaVerif.remove();
      }
    }

    // 4. Custom CSS
    let styleEl = document.getElementById("aira-custom-styles") as HTMLStyleElement | null;
    if (settings.custom_css && settings.custom_css.trim()) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "aira-custom-styles";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = settings.custom_css;
    } else if (styleEl) {
      styleEl.remove();
    }

    // 5. Custom Header Code (Scripts / Meta / Link)
    document.querySelectorAll("[data-injected='aira-custom-head']").forEach((el) => el.remove());
    if (settings.custom_header_code && settings.custom_header_code.trim()) {
      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(settings.custom_header_code, "text/html");
      const nodes = Array.from(parsedDoc.head.childNodes).concat(Array.from(parsedDoc.body.childNodes));

      for (const node of nodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName.toLowerCase() === "script") {
            const script = document.createElement("script");
            Array.from(el.attributes).forEach((attr) => {
              script.setAttribute(attr.name, attr.value);
            });
            script.text = el.textContent || "";
            script.setAttribute("data-injected", "aira-custom-head");
            document.head.appendChild(script);
          } else {
            const clone = el.cloneNode(true) as HTMLElement;
            clone.setAttribute("data-injected", "aira-custom-head");
            document.head.appendChild(clone);
          }
        }
      }
    }

    // 6. Custom Footer Code (Scripts / Elements before </body>)
    document.querySelectorAll("[data-injected='aira-custom-footer']").forEach((el) => el.remove());
    if (settings.custom_footer_code && settings.custom_footer_code.trim()) {
      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(settings.custom_footer_code, "text/html");
      const nodes = Array.from(parsedDoc.head.childNodes).concat(Array.from(parsedDoc.body.childNodes));

      for (const node of nodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName.toLowerCase() === "script") {
            const script = document.createElement("script");
            Array.from(el.attributes).forEach((attr) => {
              script.setAttribute(attr.name, attr.value);
            });
            script.text = el.textContent || "";
            script.setAttribute("data-injected", "aira-custom-footer");
            document.body.appendChild(script);
          } else {
            const clone = el.cloneNode(true) as HTMLElement;
            clone.setAttribute("data-injected", "aira-custom-footer");
            document.body.appendChild(clone);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to apply custom code settings:", err);
  }
}

export default function CustomCodeInjector() {
  useEffect(() => {
    async function initCustomCode() {
      try {
        const res = await fetch(`${API_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          applyCustomCodeSettings(data);
        }
      } catch (err) {
        console.warn("Could not fetch custom code settings:", err);
      }
    }

    initCustomCode();

    const handleUpdate = () => {
      initCustomCode();
    };

    window.addEventListener("aira-custom-code-updated", handleUpdate);
    return () => {
      window.removeEventListener("aira-custom-code-updated", handleUpdate);
    };
  }, []);

  return null;
}
