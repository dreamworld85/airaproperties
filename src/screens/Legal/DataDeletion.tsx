import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import { api } from "@/lib/api";

export default function DataDeletion() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [title, setTitle] = useState("User Data Deletion");
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api.fetchSetting("page_data_deletion_title")
      .then(d => { if (d && d.value) setTitle(d.value); })
      .catch(e => console.error("Error fetching title:", e));

    api.fetchSetting("page_data_deletion_content")
      .then(d => { if (d && d.value) setContent(d.value); })
      .catch(e => console.error("Error fetching content:", e));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      {/* Desktop vs Mobile Header */}
      {isDesktop ? <DesktopHeader /> : <Header title={title} showBack />}

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${isDesktop ? "max-w-5xl mx-auto px-6 py-12" : "p-5 pb-28 max-w-md mx-auto"}`}>
        {/* Desktop Hero Section Header */}
        {isDesktop && (
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3.5 py-1 rounded-full inline-block">
              Privacy Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display">
              {title}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Instructions for deleting your account and removing personal data.
            </p>
          </div>
        )}

        <div className={`flex flex-col gap-4 text-slate leading-relaxed ${isDesktop ? "text-sm" : "text-xs"}`}>
          <div className={`bg-white rounded-3xl border border-charcoal/5 shadow-sm flex flex-col gap-4 ${isDesktop ? "p-8 sm:p-10" : "p-5"}`}>
            {content ? (
              <div className="whitespace-pre-line leading-relaxed text-charcoal">{content}</div>
            ) : (
              <>
                <p><strong>User Data Deletion Instructions</strong></p>
                <p>
                  Aira Properties values your privacy. If you wish to delete your account, remove social logins (Google/Facebook), or request permanent erasure of your personal data from our platform, please follow the steps below.
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">Option 1: Delete Account via App</h3>
                <p>
                  1. Log in to your Aira Properties account.<br />
                  2. Go to <strong>Profile</strong> ➔ <strong>Edit Profile</strong>.<br />
                  3. Scroll down and click <strong>Delete Account & Data</strong>.<br />
                  4. Confirm deletion to permanently erase your profile, saved properties, and linked social accounts.
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">Option 2: Delete Facebook App Connection</h3>
                <p>
                  1. Go to your Facebook Account's <strong>Settings & Privacy</strong> ➔ <strong>Settings</strong>.<br />
                  2. Click <strong>Apps and Websites</strong>.<br />
                  3. Select <strong>Property App</strong> (GreenReal).<br />
                  4. Click <strong>Remove</strong> to revoke access and request data deletion.
                </p>

                <h3 className="font-display font-bold text-base text-ink mt-2">Option 3: Manual Data Erasure Request</h3>
                <p>
                  You can also submit a manual data deletion request by emailing our privacy team at <strong>support@airaproperties.in</strong> with the subject line <em>"Data Deletion Request"</em>. We will process and confirm permanent erasure within 48 hours.
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Desktop vs Mobile Footer */}
      {isDesktop ? <DesktopFooter /> : <BottomNav />}
    </div>
  );
}
