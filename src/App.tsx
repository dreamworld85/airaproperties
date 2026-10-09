import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AddPropertyProvider } from "@/lib/AddPropertyContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/AuthContext";
import Login from "@/screens/Login";
import Home from "@/screens/Home";
import MyProperties from "@/screens/MyProperties";
import Search from "@/screens/Search";
import MapSearch from "@/screens/MapSearch";
import Saved from "@/screens/Saved";
import Profile from "@/screens/Profile";
import EditProfile from "@/screens/EditProfile";
import TopLocations from "@/screens/TopLocations";
import LocationProperties from "@/screens/LocationProperties";
import VisitorsEnquiries from "@/screens/VisitorsEnquiries";
import PublicPropertyDetails from "@/screens/PublicPropertyDetails";
import OwnerPropertyDetails from "@/screens/OwnerPropertyDetails";
import AgencyProfile from "@/screens/AgencyProfile";
import ReportProperty from "@/screens/ReportProperty";
import PropertyReviews from "@/screens/PropertyReviews";
import ChooseRole from "@/screens/AddProperty/ChooseRole";
import DetailsStep1 from "@/screens/AddProperty/DetailsStep1";
import MediaStep2 from "@/screens/AddProperty/MediaStep2";
import MoreInfoStep3 from "@/screens/AddProperty/MoreInfoStep3";
import ReviewStep4 from "@/screens/AddProperty/ReviewStep4";
import MapPickerStep from "@/screens/AddProperty/MapPickerStep";
import Success from "@/screens/AddProperty/Success";
import AddPropertyDesktopHeader from "@/components/AddPropertyDesktopHeader";
import ComingSoon from "@/screens/ComingSoon";
import PrivacyPolicy from "@/screens/Legal/PrivacyPolicy";
import TermsConditions from "@/screens/Legal/TermsConditions";
import RefundPolicy from "@/screens/Legal/RefundPolicy";
import ContactUs from "@/screens/Legal/ContactUs";
import DataDeletion from "@/screens/Legal/DataDeletion";
import SubscriptionDetails from "@/screens/SubscriptionDetails";
import Services from "@/screens/Services";
import Landing from "@/screens/Landing";
import MyApp from "@/screens/MyApp";
import PartnerWithUs from "@/screens/PartnerWithUs";
import BuilderMicrosite from "@/screens/BuilderMicrosite";
import BuildersDirectory from "@/screens/BuildersDirectory";

// Admin Screens
import AdminLayout from "@/screens/Admin/AdminLayout";
import AdminLogin from "@/screens/Admin/Login";
import AdminDashboard from "@/screens/Admin/Dashboard";
import AdminUsers from "@/screens/Admin/Users";
import AdminUserDetails from "@/screens/Admin/UserDetails";
import AdminProperties from "@/screens/Admin/Properties";
import AdminPropertyList from "@/screens/Admin/PropertyList";
import AdminPropertyDetails from "@/screens/Admin/PropertyDetails";
import AdminReportedListings from "@/screens/Admin/ReportedListings";
import AdminAnalytics from "@/screens/Admin/Analytics";
import AdminActivityLogs from "@/screens/Admin/ActivityLogs";
import AdminSettings from "@/screens/Admin/Settings";
import AdminUserReviews from "@/screens/Admin/UserReviews";
import RoleUpgrades from "@/screens/Admin/RoleUpgrades";
import Subscriptions from "@/screens/Admin/Subscriptions";
import ServiceEnquiries from "@/screens/Admin/ServiceEnquiries";
import BuilderInquiries from "@/screens/Admin/BuilderInquiries";

export default function App() {
  const location = useLocation();
  const { token } = useAuth();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isLandingPage = location.pathname === "/" || location.pathname === "/home";
  const isPropertyGuestRoute = location.pathname.startsWith("/property/") && !token;
  const isFullWidth = isAdminRoute || isLandingPage || isPropertyGuestRoute || isDesktop;

  return (
    <div className={isFullWidth ? "min-h-screen w-full bg-[#FAF8F3] relative" : "app-container w-full max-w-[420px] mx-auto bg-cream min-h-screen relative shadow-md overflow-x-hidden"}>
      <AddPropertyProvider>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/map-search" element={<ProtectedRoute><MapSearch /></ProtectedRoute>} />
        <Route path="/map_search" element={<ProtectedRoute><MapSearch /></ProtectedRoute>} />
        <Route path="/top-locations" element={<ProtectedRoute><TopLocations /></ProtectedRoute>} />
        <Route path="/location/:locationName" element={<ProtectedRoute><LocationProperties /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <div className="w-full min-h-screen min-[1000px]:bg-[#FAF8F3] flex justify-center">
                <div className="w-full min-[1000px]:max-w-[500px] min-[1000px]:shadow-xl min-[1000px]:border-x min-[1000px]:border-slate-200 bg-[#FAF8F3] min-h-screen relative flex flex-col">
                  <EditProfile />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/visitors-enquiries" element={<ProtectedRoute><VisitorsEnquiries /></ProtectedRoute>} />
        <Route path="/enquiries" element={<ProtectedRoute><VisitorsEnquiries /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><SubscriptionDetails /></ProtectedRoute>} />
        <Route path="/services" element={<Services />} />
        <Route path="/settings" element={<ProtectedRoute><ComingSoon title="Settings" /></ProtectedRoute>} />

        <Route path="/my-properties" element={<ProtectedRoute><MyProperties /></ProtectedRoute>} />
        <Route path="/my-properties/:id" element={<ProtectedRoute><OwnerPropertyDetails /></ProtectedRoute>} />

        {/* Public — no auth required to browse */}
        <Route path="/property/:id" element={<PublicPropertyDetails />} />
        <Route path="/property/:id/report" element={<ProtectedRoute><ReportProperty /></ProtectedRoute>} />
        <Route path="/property/:id/reviews" element={<ProtectedRoute><PropertyReviews /></ProtectedRoute>} />
        <Route path="/agency/:id" element={<AgencyProfile />} />
        
        {/* Legal & Compliance Routes */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/terms-of-service" element={<TermsConditions />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/data-deletion-instructions" element={<DataDeletion />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Builder & Partner Routes */}
        <Route path="/partner-with-us" element={<PartnerWithUs />} />
        <Route path="/builder-inquiry" element={<PartnerWithUs />} />
        <Route path="/builder-preview" element={<BuilderMicrosite />} />
        <Route path="/builder/:idOrSlug" element={<BuilderMicrosite />} />
        <Route path="/builders" element={<BuildersDirectory />} />

        {/* App Download Page with Android APK & iOS Web App */}
        <Route path="/myapp" element={<MyApp />} />
        <Route path="/myapp/*" element={<MyApp />} />
        <Route path="/download" element={<MyApp />} />
        <Route path="/download-app" element={<MyApp />} />

        {/* Add Property wizard — shares form state via AddPropertyProvider */}
        <Route
          path="/add-property/*"
          element={
            <ProtectedRoute>
              <div className="w-full min-h-screen flex justify-center add-property-desktop-bg relative">
                <div className="w-full min-[1000px]:max-w-[500px] min-[1000px]:shadow-xl min-[1000px]:border-x min-[1000px]:border-slate-200 bg-white min-h-screen relative flex flex-col z-10">
                  <AddPropertyDesktopHeader />
                  <Routes>
                    <Route index element={<Navigate to="role" replace />} />
                    <Route path="role" element={<ChooseRole />} />
                    <Route path="details" element={<DetailsStep1 />} />
                    <Route path="media" element={<MediaStep2 />} />
                    <Route path="more-info" element={<MoreInfoStep3 />} />
                    <Route path="map-picker" element={<MapPickerStep />} />
                    <Route path="review" element={<ReviewStep4 />} />
                    <Route path="success" element={<Success />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Admin Section */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetails />} />
          <Route path="users/:id/reviews" element={<AdminUserReviews />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="property-list" element={<AdminPropertyList />} />
          <Route path="properties-list" element={<AdminPropertyList />} />
          <Route path="properties/:id" element={<AdminPropertyDetails />} />
          <Route path="reports" element={<AdminReportedListings />} />
          <Route path="enquiries" element={<ServiceEnquiries />} />
          <Route path="builder-inquiries" element={<BuilderInquiries />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="logs" element={<AdminActivityLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="role-upgrades" element={<RoleUpgrades />} />
          <Route path="subscriptions" element={<Subscriptions />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </AddPropertyProvider>
    </div>
  );
}
