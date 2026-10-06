/// <reference types="vite/client" />
export function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://api.airaproperties.in";
  }
  return envUrl || "http://localhost:4000";
}

export const API_URL = getApiUrl();

const originalFetch = window.fetch;
window.fetch = function (input, init) {
  const options = init || {};
  options.credentials = "include";
  return originalFetch(input, options);
};

export interface ApiUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  whatsappNumber?: string | null;
  location: string | null;
  avatarUrl: string | null;
  trialEndsAt?: string | null;
  subscriptionStatus?: "trial" | "active" | "expired" | "canceled" | null;
  razorpaySubscriptionId?: string | null;
  role?: "Owner" | "Broker" | "Agency" | "User" | null;
  agencyLogoUrl?: string | null;
  agencyAddress?: string | null;
  agencyDistrict?: string | null;
  hasAccess?: boolean;
  hasTrial?: boolean;
  remainingDays?: number;
  inquiryCount?: number;
  propertiesCount?: number;
  enquiryCreditsLeft?: number;
  listingSlotsLeft?: number;
  canPostProperty?: boolean;
  createdAt?: string | null;
}

export interface ApiProperty {
  id: number;
  ownerId: number;
  title: string;
  propertyType: string;
  purpose: string;
  price: number;
  areaSqft: number;
  address: string;
  state?: string;
  district: string;
  bedrooms: number;
  bathrooms: number;
  furnishing: string | null;
  facing: string | null;
  propertyAge: string | null;
  description: string | null;
  listingRole: "Owner" | "Broker" | "Agency";
  status: "Draft" | "Pending" | "Active" | "Inactive" | "Rejected" | "Sold";
  views: number;
  images: string[];
  videos: string[];
  youtubeUrl?: string | null;
  createdAt: string;
  isSaved?: boolean;
  isFeatured?: boolean;
  isPriceNegotiable?: boolean;
  useAdminContact?: boolean;
  avgRating?: number;
  ratingCount?: number;
  ownerName?: string;
  ownerAvatarUrl?: string | null;
  contactNumber?: string | null;
  whatsappNumber?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
}

export interface ApiPropertyDetail extends ApiProperty {
  ownerName: string;
  ownerPhone: string | null;
  saveCount: number;
  enquiryCount: number;
  isSaved: boolean;
  contactNumber?: string | null;
  whatsappNumber?: string | null;
  brokerName?: string | null;
  agencyName?: string | null;
  agencyLogoUrl?: string | null;
  contactAccess?: boolean;
  isMasked?: boolean;
  agencyAddress?: string | null;
  agencyDistrict?: string | null;
}

export interface ApiPublicProfile extends ApiUser {
  totalListings: number;
  distinctEnquirers: number;
  yearsActive: number;
}

export interface ApiReview {
  id: number;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  created_at: string;
}

export interface ApiDashboardStats {
  totalViews: number;
  totalEnquiries: number;
  recentVisitors: {
    enquiryId?: number;
    visitorName: string;
    visitorLocation: string | null;
    visitorPhone?: string | null;
    visitorEmail?: string | null;
    message?: string | null;
    propertyId?: number;
    propertyTitle: string;
    propertyPrice?: number;
    propertyImage?: string | null;
    enquiredAt: string;
    isLocked?: boolean;
  }[];
  isTrialExpired?: boolean;
  hasTrial?: boolean;
  remainingDays?: number;
  role?: string;
  isSubscribed?: boolean;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("kr_token");
  const adminToken = localStorage.getItem("kerala_realty_admin_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (adminToken && window.location.pathname.startsWith("/admin")) {
    headers["x-admin-auth"] = adminToken;
  }
  return headers;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Request failed with status ${res.status}`);
    Object.assign(err, body);
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  async register(input: { name: string; email?: string; phone?: string; password: string; role?: string }) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handle<{ token: string; user: ApiUser }>(res);
  },

  async login(identifier: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    return handle<{ token: string; user: ApiUser }>(res);
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handle<{ success: boolean; message: string; email: string }>(res);
  },

  async verifyOtp(email: string, otp: string) {
    const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return handle<{ valid: boolean; message: string }>(res);
  },

  async resetPasswordWithOtp(input: { email: string; otp: string; newPassword: string }) {
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handle<{ success: boolean; token: string; user: ApiUser }>(res);
  },

  getGoogleOAuthUrl() {
    return `${API_URL}/api/auth/google`;
  },

  getFacebookOAuthUrl() {
    return `${API_URL}/api/auth/facebook`;
  },

  async loginWithGoogle(data: { credential?: string; token?: string; email?: string; name?: string; avatarUrl?: string }) {
    const res = await fetch(`${API_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handle<{ success: boolean; token: string; user: ApiUser }>(res);
  },

  async loginWithFacebook(data: { accessToken?: string; email?: string; name?: string; avatarUrl?: string }) {
    const res = await fetch(`${API_URL}/api/auth/facebook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handle<{ success: boolean; token: string; user: ApiUser }>(res);
  },

  async fetchProperties(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/properties${query ? `?${query}` : ""}`, {
      headers: authHeaders(),
    });
    return handle<ApiProperty[]>(res);
  },

  async fetchFeaturedStatus() {
    const res = await fetch(`${API_URL}/api/properties/featured-status`, { headers: authHeaders() });
    return handle<{
      isSubscribed: boolean;
      featuredCount: number;
      freeFeaturedLimit: number;
      featuredPrice: number;
      featuredText: string;
      isEligibleForFree: boolean;
    }>(res);
  },

  async fetchMyProperties() {
    const res = await fetch(`${API_URL}/api/properties/mine`, { headers: authHeaders() });
    return handle<ApiProperty[]>(res);
  },

  async fetchProperty(id: number | string) {
    const res = await fetch(`${API_URL}/api/properties/${id}`, { headers: authHeaders() });
    return handle<ApiPropertyDetail>(res);
  },

  async fetchPropertyViewers(id: number | string) {
    const res = await fetch(`${API_URL}/api/properties/${id}/viewers`, { headers: authHeaders() });
    return handle<{
      id: number;
      viewed_at: string;
      visitor_id: number | null;
      visitor_name: string | null;
      visitor_email: string | null;
      visitor_phone: string | null;
      visitor_avatar: string | null;
    }[]>(res);
  },

  async toggleSaveProperty(id: number) {
    const res = await fetch(`${API_URL}/api/properties/${id}/save`, {
      method: "POST",
      headers: authHeaders(),
    });
    return handle<{ saved: boolean }>(res);
  },

  async fetchSavedProperties() {
    const res = await fetch(`${API_URL}/api/properties/saved/mine`, { headers: authHeaders() });
    return handle<ApiProperty[]>(res);
  },

  async sendEnquiry(
    propertyId: number, 
    data?: string | { message?: string; name?: string; phone?: string; email?: string }
  ) {
    const payload = typeof data === "string" ? { message: data } : (data || {});
    const res = await fetch(`${API_URL}/api/properties/${propertyId}/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    return handle<{ ok: boolean }>(res);
  },

  async fetchMySentEnquiries() {
    const res = await fetch(`${API_URL}/api/users/me/sent-enquiries`, {
      headers: authHeaders(),
    });
    return handle<{
      enquiryId: number;
      message: string | null;
      enquiredAt: string;
      propertyId: number;
      propertyTitle: string;
      propertyPrice: number;
      propertyDistrict: string;
      propertyState: string;
      propertyImage: string | null;
      sellerPhone: string | null;
      sellerWhatsapp: string | null;
      sellerName: string;
    }[]>(res);
  },

  async schedulePropertyTour(propertyId: number, date: string) {
    const res = await fetch(`${API_URL}/api/properties/${propertyId}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ date }),
    });
    return handle<{ success: boolean; message: string }>(res);
  },

  async recordClickInquiry(propertyId: number) {
    const res = await fetch(`${API_URL}/api/properties/${propertyId}/click-inquiry`, {
      method: "POST",
      headers: authHeaders(),
    });
    return handle<{
      success: boolean;
      enquiryCreditsLeft?: number;
      requiresTopUp?: boolean;
      contact?: string;
      whatsapp?: string;
      contactNumber?: string;
      whatsappNumber?: string;
      isReAccess?: boolean;
    }>(res);
  },

  async fetchMyProfile() {
    const res = await fetch(`${API_URL}/api/users/me`, { headers: authHeaders() });
    return handle<ApiUser & { hasTrial: boolean; remainingDays: number; isSubscribed: boolean; inquiryCount: number; propertiesCount: number }>(res);
  },

  async getProfile() {
    return this.fetchMyProfile();
  },

  async validateSession() {
    const res = await fetch(`${API_URL}/api/auth/me`, { headers: authHeaders() });
    return handle<{ user: ApiUser }>(res);
  },

  async logout() {
    const res = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: authHeaders()
    });
    return handle<{ success: boolean }>(res);
  },

  async updateMyProfile(input: Partial<Pick<ApiUser, "name" | "phone" | "email" | "location" | "whatsappNumber">>) {
    const res = await fetch(`${API_URL}/api/users/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(input),
    });
    return handle<ApiUser>(res);
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch(`${API_URL}/api/users/me/avatar`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("kr_token")}`
      },
      body: formData,
    });
    return handle<ApiUser>(res);
  },

  async fetchAgents() {
    const res = await fetch(`${API_URL}/api/users/agents`);
    return handle<ApiUser[]>(res);
  },

  async fetchTopLocations() {
    const res = await fetch(`${API_URL}/api/admin/top-locations`);
    return handle<{ id: number; name: string; image_url: string }[]>(res);
  },

  async adminAddTopLocation(formData: FormData) {
    const res = await fetch(`${API_URL}/api/admin/top-locations`, {
      method: "POST",
      headers: { "x-admin-auth": "KeralaRealtyAdminSecretToken2026" },
      body: formData,
    });
    return handle<{ success: boolean; message: string }>(res);
  },

  async adminDeleteTopLocation(id: number) {
    const res = await fetch(`${API_URL}/api/admin/top-locations/${id}`, {
      method: "DELETE",
      headers: { "x-admin-auth": "KeralaRealtyAdminSecretToken2026" },
    });
    return handle<{ success: boolean; message: string }>(res);
  },

  async setupRole(formData: FormData) {
    const res = await fetch(`${API_URL}/api/users/setup-role`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("kr_token")}`
      },
      body: formData,
    });
    return handle<{ success: boolean; message: string; user: ApiUser }>(res);
  },

  async fetchMyStats() {
    const res = await fetch(`${API_URL}/api/users/me/stats`, { headers: authHeaders() });
    return handle<ApiDashboardStats>(res);
  },

  async fetchPublicProfile(userId: number) {
    const res = await fetch(`${API_URL}/api/users/${userId}/profile`);
    return handle<ApiPublicProfile>(res);
  },

  async createProperty(formData: FormData) {
    const res = await fetch(`${API_URL}/api/properties`, {
      method: "POST",
      headers: authHeaders(), // don't set Content-Type — browser sets multipart boundary
      body: formData,
    });
    return handle<{ id: number; status: string; isOverLimit?: boolean; user?: ApiUser }>(res);
  },

  async updateProperty(id: number | string, formData: FormData) {
    const res = await fetch(`${API_URL}/api/properties/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: formData,
    });
    return handle<{ success: boolean; message: string }>(res);
  },

  async updatePropertyStatus(id: number, status: "Active" | "Inactive" | "Draft" | "Sold", useAdminContact?: boolean) {
    const res = await fetch(`${API_URL}/api/properties/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status, useAdminContact }),
    });
    return handle<{ id: number; status: string; useAdminContact?: boolean }>(res);
  },

  async restorePropertyContact(id: number | string) {
    const res = await fetch(`${API_URL}/api/properties/${id}/restore-contact`, {
      method: "POST",
      headers: authHeaders(),
    });
    return handle<{ success: boolean; message: string }>(res);
  },

  async deleteProperty(id: number) {
    const res = await fetch(`${API_URL}/api/properties/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handle<void>(res);
  },

  async reportProperty(id: number | string, reason: string, description?: string) {
    const res = await fetch(`${API_URL}/api/properties/${id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ reason, description }),
    });
    return handle<{ message: string }>(res);
  },

  async fetchReviews(propertyId: number | string) {
    const res = await fetch(`${API_URL}/api/properties/${propertyId}/reviews`);
    return handle<ApiReview[]>(res);
  },

  async submitReview(propertyId: number | string, rating: number, comment?: string) {
    const res = await fetch(`${API_URL}/api/properties/${propertyId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ rating, comment }),
    });
    return handle<{ message: string }>(res);
  },

  async getPaymentConfig() {
    const res = await fetch(`${API_URL}/api/payments/config`);
    return handle<{ keyId: string; key_id: string; isConfigured: boolean; mode: "live" | "test" }>(res);
  },

  async initiateSubscription(options: number | { planId?: number; plan_id?: string; planType?: string }) {
    const payload = typeof options === "number" ? { durationMonths: options } : options;
    const res = await fetch(`${API_URL}/api/payments/create-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    return handle<{ id: string; amount: number; currency: string; key?: string; key_id?: string; planId?: number; credits?: number; planType?: string }>(res);
  },

  async verifySubscription(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    planId?: number;
    plan_id?: string;
    durationMonths?: number;
  }) {
    const res = await fetch(`${API_URL}/api/payments/verify-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(paymentData),
    });
    return handle<{ 
      success: boolean; 
      planType?: string; 
      creditsAdded?: number; 
      enquiryTokensAdded?: number; 
      listingSlotsAdded?: number; 
      enquiryCreditsLeft?: number; 
      listingSlotsLeft?: number; 
    }>(res);
  },

  async fetchCreditTransactions() {
    const res = await fetch(`${API_URL}/api/users/me/transactions`, {
      headers: authHeaders(),
    });
    return handle<any[]>(res);
  },

  async initiateFeaturedPayment(propertyId: number) {
    const res = await fetch(`${API_URL}/api/payments/create-featured-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ propertyId }),
    });
    return handle<{ id: string; amount: number; currency: string; key?: string; key_id?: string; propertyId: number }>(res);
  },

  async verifyFeaturedPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    propertyId: number;
  }) {
    const res = await fetch(`${API_URL}/api/payments/verify-featured-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(paymentData),
    });
    return handle<{ success: boolean }>(res);
  },

  async featureProperty(id: number) {
    const res = await fetch(`${API_URL}/api/properties/${id}/feature`, {
      method: "POST",
      headers: authHeaders(),
    });
    return handle<{ success: boolean; message: string }>(res);
  },

  async fetchSetting(key: string): Promise<{ key: string; value: string }> {
    const res = await fetch(`${API_URL}/api/admin/settings/${key}`);
    return handle<{ key: string; value: string }>(res);
  },

  async requestRoleSwitch(requestedRole: string) {
    const res = await fetch(`${API_URL}/api/users/me/role-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ requestedRole }),
    });
    return handle<{ message: string }>(res);
  },

  async fetchRoleSwitchStatus() {
    const res = await fetch(`${API_URL}/api/users/me/role-switch`, {
      headers: authHeaders(),
    });
    return handle<{ status: "Pending" | "Approved" | "Rejected"; created_at: string } | null>(res);
  },

  async fetchSubscriptionPlans() {
    const res = await fetch(`${API_URL}/api/admin/subscription-plans`);
    return handle<ApiSubscriptionPlan[]>(res);
  },

  async adminUpdateSubscriptionPlans(plans: Partial<ApiSubscriptionPlan>[]) {
    const res = await fetch(`${API_URL}/api/admin/subscription-plans`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || ""
      },
      body: JSON.stringify({ plans }),
    });
    return handle<{ success: boolean }>(res);
  },

  async adminToggleSubscriptionPlan(id: number | string) {
    const res = await fetch(`${API_URL}/api/admin/subscription-plans/${id}/toggle`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || ""
      }
    });
    return handle<{ success: boolean; id: number; plan_id: string; is_active: number; message: string }>(res);
  },

  async adminToggleBossPlans(enable: boolean) {
    const res = await fetch(`${API_URL}/api/admin/subscription-plans/boss/toggle-all`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || ""
      },
      body: JSON.stringify({ enable })
    });
    return handle<{ success: boolean; is_active: number; message: string }>(res);
  },

  async adminFetchRoleSwitches() {
    const res = await fetch(`${API_URL}/api/admin/role-switches`, {
      headers: { "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "" },
    });
    return handle<{
      id: number;
      requested_role: string;
      status: "Pending" | "Approved" | "Rejected";
      created_at: string;
      user_id: number;
      user_name: string;
      user_email: string;
      user_phone: string;
    }[]>(res);
  },

  async adminApproveRoleSwitch(id: number) {
    const res = await fetch(`${API_URL}/api/admin/role-switches/${id}/approve`, {
      method: "PUT",
      headers: { "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "" },
    });
    return handle<{ success: boolean }>(res);
  },

  async adminRejectRoleSwitch(id: number) {
    const res = await fetch(`${API_URL}/api/admin/role-switches/${id}/reject`, {
      method: "PUT",
      headers: { "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "" },
    });
    return handle<{ success: boolean }>(res);
  },

  async adminFetchSubscriptionStats() {
    const res = await fetch(`${API_URL}/api/admin/subscription-stats`, {
      headers: { "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "" },
    });
    return handle<{ User: number; Owner: number; Broker: number; Agency: number }>(res);
  },

  async fetchNotifications() {
    const res = await fetch(`${API_URL}/api/users/me/notifications`, { headers: authHeaders() });
    return handle<ApiNotification[]>(res);
  },

  async markNotificationsRead() {
    const res = await fetch(`${API_URL}/api/users/me/notifications/read-all`, {
      method: "POST",
      headers: authHeaders(),
    });
    return handle<{ success: boolean }>(res);
  },

  async deleteAccount() {
    const res = await fetch(`${API_URL}/api/users/me`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handle<{ success: boolean; message: string }>(res);
  },

  async fetchAppDownloadSettings() {
    const res = await fetch(`${API_URL}/api/admin/app-download-settings`);
    return handle<ApiAppDownloadSettings>(res);
  },

  async updateAppDownloadSettings(formData: FormData) {
    const res = await fetch(`${API_URL}/api/admin/app-download-settings`, {
      method: "PUT",
      headers: { "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "" },
      body: formData
    });
    return handle<{ message: string; brand_logo_url: string }>(res);
  },

  async fetchMobileShareSettings() {
    const res = await fetch(`${API_URL}/api/admin/mobile-share-settings`);
    return handle<ApiMobileShareSettings>(res);
  },

  async updateMobileShareSettings(formData: FormData) {
    const res = await fetch(`${API_URL}/api/admin/mobile-share-settings`, {
      method: "PUT",
      headers: { "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "" },
      body: formData
    });
    return handle<{ message: string; brand_logo_url: string; illustration_url: string }>(res);
  },
};

export function mediaUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
  if (path.startsWith("/uploads")) {
    const apiBase = getApiUrl();
    return `${apiBase}${path}`;
  }
  return path;
}

export function isLandProperty(propertyType?: string | null): boolean {
  if (!propertyType) return false;
  const t = propertyType.toLowerCase().trim();
  return t === "land" || t === "plot / land" || t.includes("land") || t.includes("plot");
}

export function getLandAreaDetails(areaSqft: number, price?: number) {
  const sqft = Number(areaSqft) || 0;
  const cents = sqft / 435.6;
  const acres = sqft / 43560;
  const hasAcres = acres >= 1;

  const formattedAcres = Number(acres.toFixed(2));
  const formattedCents = Number(cents.toFixed(cents % 1 === 0 ? 0 : 2));

  const primary = hasAcres 
    ? `${formattedAcres} Acres` 
    : `${formattedCents} Cents`;

  const secondary = hasAcres 
    ? `${formattedCents} Cents` 
    : `${Math.round(sqft).toLocaleString("en-IN")} SqFt`;

  const fullDisplay = hasAcres 
    ? `${formattedAcres} Acres (${formattedCents} Cents)` 
    : `${formattedCents} Cents (${Math.round(sqft).toLocaleString("en-IN")} SqFt)`;

  let pricePerCent = "—";
  if (price && cents > 0) {
    const rate = Math.round(price / cents);
    if (rate >= 10000000) {
      pricePerCent = `₹${(rate / 10000000).toFixed(2)} Cr / Cent`;
    } else if (rate >= 100000) {
      pricePerCent = `₹${(rate / 100000).toFixed(2)} L / Cent`;
    } else {
      pricePerCent = `₹${rate.toLocaleString("en-IN")} / Cent`;
    }
  }

  let pricePerAcre = "—";
  if (price && acres > 0) {
    const rate = Math.round(price / acres);
    if (rate >= 10000000) {
      pricePerAcre = `₹${(rate / 10000000).toFixed(2)} Cr / Acre`;
    } else if (rate >= 100000) {
      pricePerAcre = `₹${(rate / 100000).toFixed(2)} L / Acre`;
    } else {
      pricePerAcre = `₹${rate.toLocaleString("en-IN")} / Acre`;
    }
  }

  return {
    cents: formattedCents,
    acres: formattedAcres,
    primary,
    secondary,
    fullDisplay,
    pricePerCent,
    pricePerAcre
  };
}

export function formatArea(areaSqft: number, propertyType?: string): string {
  if (isLandProperty(propertyType)) {
    const details = getLandAreaDetails(areaSqft);
    return details.primary;
  }
  return `${(Number(areaSqft) || 0).toLocaleString("en-IN")} sq.ft`;
}

export interface ApiNotification {
  id: number;
  user_id: number;
  sender_id: number | null;
  type: string;
  message: string;
  property_id: number | null;
  is_read: number;
  created_at: string;
  sender_name?: string | null;
  sender_role?: string | null;
  sender_avatar?: string | null;
}

export interface ApiAppDownloadSettings {
  id?: number;
  brand_logo_url: string;
  main_title: string;
  subtitle: string;
  google_play_url: string;
  app_store_url: string;
  safe_secure_title: string;
  safe_secure_desc: string;
  trusted_users_title: string;
  trusted_users_desc: string;
  footer_brand: string;
  footer_tagline: string;
}

export interface ApiMobileShareSettings {
  id?: number;
  brand_name: string;
  brand_logo_url: string;
  tagline: string;
  illustration_url: string;
  description_quote: string;
  button_text: string;
  google_play_url: string;
  app_store_url: string;
  trust_text: string;
  background_image_url?: string;
}

export interface ServiceEnquiryData {
  userId?: number | null;
  name: string;
  email: string;
  city: string;
  userClass: string;
  phone: string;
  serviceName?: string;
}

export async function submitServiceEnquiry(data: ServiceEnquiryData): Promise<{ success: boolean; id: number }> {
  const res = await fetch(`${API_URL}/api/service-enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to submit enquiry request.");
  }
  return res.json();
}

export interface ApiSubscriptionPlan {
  id?: number;
  plan_id?: string;
  name?: string;
  role: "user" | "owner" | "broker" | "agency" | "builder" | string;
  plan_type: string;
  credits: number;
  listing_slots: number;
  enquiry_tokens: number;
  price: string | number;
  discount: string | number;
  description: string;
  duration_months: number;
  features?: string[] | string;
  is_active?: number | boolean;
}

export interface BuilderInquiryPayload {
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  office_address: string;
  city_district?: string;
  active_projects?: string;
  package_preference?: string;
  experience_years?: number;
  message?: string;
}

export interface BuilderProject {
  id: number;
  builder_id: number;
  title: string;
  project_type: string;
  status: "Completed" | "Ongoing" | "Upcoming";
  location: string;
  district: string;
  price_range: string;
  units_config: string;
  area_sqft_range: string;
  possession_date: string;
  cover_image: string;
  gallery_images?: string | string[];
  rera_reg_number: string;
  amenities?: string | string[];
  brochure_url?: string;
  is_featured: number;
  created_at: string;
}

export interface BuilderProfile {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  logo_url: string;
  banner_url: string;
  about: string;
  experience_years: number;
  total_projects: number;
  ongoing_projects: number;
  completed_projects: number;
  upcoming_projects: number;
  rera_id: string;
  office_address: string;
  district: string;
  phone: string;
  email: string;
  website: string;
  is_featured: number;
  is_verified: number;
  project_count?: number;
  created_at: string;
}

export interface BuilderDetailsResponse {
  builder: BuilderProfile;
  projects: BuilderProject[];
  groupedProjects: {
    all: BuilderProject[];
    ongoing: BuilderProject[];
    upcoming: BuilderProject[];
    completed: BuilderProject[];
  };
}

export interface BuilderLeadPayload {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  projectId?: number;
}

export async function submitBuilderInquiry(data: BuilderInquiryPayload): Promise<{ success: boolean; message: string; inquiryId: number }> {
  const res = await fetch(`${API_URL}/api/builders/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to submit builder partnership inquiry.");
  }
  return res.json();
}

export async function fetchBuilders(): Promise<BuilderProfile[]> {
  const res = await fetch(`${API_URL}/api/builders`);
  if (!res.ok) throw new Error("Failed to load builders list.");
  return res.json();
}

export async function fetchBuilderDetails(idOrSlug: string | number): Promise<BuilderDetailsResponse> {
  const res = await fetch(`${API_URL}/api/builders/${idOrSlug}`);
  if (!res.ok) throw new Error("Failed to load builder details.");
  return res.json();
}

export async function submitBuilderLead(builderId: number | string, data: BuilderLeadPayload): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/builders/${builderId}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to submit lead inquiry.");
  }
  return res.json();
}

export async function fetchAllSubscriptionPlans(): Promise<ApiSubscriptionPlan[]> {
  const res = await fetch(`${API_URL}/api/admin/subscription-plans`);
  if (!res.ok) throw new Error("Failed to load subscription plans.");
  return res.json();
}


