import { getApiUrl } from "./api";

const API_URL = getApiUrl();

function getAdminHeaders() {
  const token = localStorage.getItem("kerala_realty_admin_token") || "";
  return {
    "Content-Type": "application/json",
    "x-admin-auth": token,
  };
}

export interface AdminStats {
  users: number;
  properties: number;
  pending: number;
  reports: number;
  usersSignedToday: number;
  propertiesPostedToday: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role?: string | null;
  state?: string | null;
  district?: string | null;
  address?: string | null;
  location?: string | null;
  is_disabled: number;
  custom_trial_expiry?: string | null;
  trial_ends_at?: string | null;
  is_free_subscription_granted?: number;
  enquiry_credits_left?: number;
  listing_slots_left?: number;
  created_at: string;
  listings?: number;
  enquiries?: number;
  saved?: number;
  messages?: number;
  reviews?: number;
  properties?: any[];
  uploadedPhotos?: any[];
}

export interface AdminProperty {
  id: number;
  ownerId?: number;
  owner_id?: number;
  uploader_name: string;
  user_role?: string;
  uploader_avatar?: string | null;
  uploader_phone?: string | null;
  uploader_email?: string | null;
  contact_number?: string | null;
  whatsapp_number?: string | null;
  owner_name?: string | null;
  owner_phone?: string | null;
  title: string;
  propertyType?: string;
  property_type?: string;
  purpose: string;
  price: number | string;
  areaSqft?: number;
  area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  state?: string;
  district: string;
  listing_role?: string;
  status: "Draft" | "Pending" | "Active" | "Inactive" | "Rejected" | "Sold";
  images: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AdminCustomerReview {
  id: number;
  target_user_id: number;
  reviewer_id?: number | null;
  reviewer_name: string;
  reviewer_phone?: string | null;
  reviewer_email?: string | null;
  rating: number;
  comment: string;
  is_confirmed: number;
  created_at: string;
  updated_at?: string;
  target_user_name: string;
  target_user_email?: string | null;
  target_user_phone?: string | null;
  target_user_role?: string | null;
  target_agency_name?: string | null;
  reviewer_avatar?: string | null;
}

export interface AdminReport {
  id: number;
  reason: string;
  status: "Pending" | "Resolved";
  created_at: string;
  property_id: number;
  property_title: string;
  reporter_name: string;
}

export interface AdminLog {
  id: number;
  action: string;
  category: "Users" | "Properties" | "System";
  created_at: string;
}

export interface AdminAnalytics {
  userGrowth: { label: string; value: number }[];
  categories: { name: string; count: number }[];
  locations: { name: string; count: number }[];
}

export const adminApi = {
  async login(password: string): Promise<string> {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Invalid admin password.");
    }
    const data = await res.json();
    return data.token;
  },

  async getStats(): Promise<AdminStats> {
    const res = await fetch(`${API_URL}/api/admin/stats`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load statistics.");
    return res.json();
  },

  async getUsers(search = "", role = "All"): Promise<AdminUser[]> {
    const params = new URLSearchParams({ search, role });
    const res = await fetch(`${API_URL}/api/admin/users?${params}`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load users list.");
    return res.json();
  },

  async getUserDetails(id: number | string): Promise<AdminUser> {
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load user details.");
    return res.json();
  },

  async updateUserProfile(id: number | string, data: { name?: string; email?: string; phone?: string; state?: string; district?: string; address?: string; location?: string }): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/users/${id}/profile`, {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update user profile.");
    }
  },

  async updateUserStatus(id: number | string, disabled: boolean): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/users/${id}/status`, {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify({ is_disabled: disabled ? 1 : 0 }),
    });
    if (!res.ok) throw new Error("Failed to update user status.");
  },

  async deleteUser(id: number | string): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete user.");
  },

  async getProperties(search = "", status = "All"): Promise<AdminProperty[]> {
    const params = new URLSearchParams({ search, status });
    const res = await fetch(`${API_URL}/api/admin/properties?${params}`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load properties list.");
    return res.json();
  },

  async getProperty(id: number | string): Promise<any> {
    const res = await fetch(`${API_URL}/api/admin/properties/${id}`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load property details.");
    return res.json();
  },

  async updateProperty(id: number | string, data: FormData | object): Promise<void> {
    let headers: Record<string, string> = {
      "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "",
    };
    let body: any;
    if (data instanceof FormData) {
      body = data;
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }
    const res = await fetch(`${API_URL}/api/admin/properties/${id}`, {
      method: "PUT",
      headers,
      body,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update property.");
    }
  },

  async deletePropertyMedia(id: number | string, mediaId: number | string): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/properties/${id}/media/${mediaId}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete media.");
  },

  async updatePropertyStatus(id: number | string, status: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/properties/${id}/status`, {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update property status.");
  },

  async deleteProperty(id: number | string): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/properties/${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete property.");
  },

  async getReports(): Promise<AdminReport[]> {
    const res = await fetch(`${API_URL}/api/admin/reports`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load reports.");
    return res.json();
  },

  async resolveReport(id: number | string): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/reports/${id}/resolve`, {
      method: "PUT",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to resolve report.");
  },

  async getLogs(category = "All", search = ""): Promise<AdminLog[]> {
    const params = new URLSearchParams({ category, search });
    const res = await fetch(`${API_URL}/api/admin/logs?${params}`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load activity logs.");
    return res.json();
  },

  async getActivityLogs(): Promise<{
    propertyViews: any[];
    contactClicks: any[];
  }> {
    const res = await fetch(`${API_URL}/api/admin/activity-logs`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load user activity logs.");
    return res.json();
  },

  async getAnalytics(): Promise<AdminAnalytics> {
    const res = await fetch(`${API_URL}/api/admin/analytics`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load analytics.");
    return res.json();
  },

  async getSettings(): Promise<Record<string, string>> {
    const res = await fetch(`${API_URL}/api/admin/settings`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load settings.");
    return res.json();
  },

  async getSetting(key: string): Promise<{ key: string; value: string }> {
    const res = await fetch(`${API_URL}/api/admin/settings/${key}`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error(`Failed to load setting: ${key}`);
    return res.json();
  },

  async updateSetting(key: string, value: string | File): Promise<{ key: string; value: string }> {
    const headers: Record<string, string> = {
      "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "",
    };
    
    let body: any;
    if (value instanceof File) {
      body = new FormData();
      body.append("banner", value);
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({ value });
    }

    const res = await fetch(`${API_URL}/api/admin/settings/${key}`, {
      method: "PUT",
      headers,
      body,
    });
    if (!res.ok) throw new Error("Failed to update setting.");
    return res.json();
  },

  async getUserReviews(userId: number | string): Promise<any[]> {
    const res = await fetch(`${API_URL}/api/admin/users/${userId}/reviews`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load user reviews.");
    return res.json();
  },

  async getCustomerReviews(): Promise<AdminCustomerReview[]> {
    const res = await fetch(`${API_URL}/api/admin/customer-reviews`, { headers: getAdminHeaders() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to load customer reviews.");
    }
    return res.json();
  },

  async toggleCustomerReviewConfirm(reviewId: number): Promise<{ success: boolean; is_confirmed: number }> {
    const res = await fetch(`${API_URL}/api/admin/customer-reviews/${reviewId}/toggle-confirm`, {
      method: "PATCH",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to toggle review confirmation.");
    return res.json();
  },

  async updateCustomerReview(
    reviewId: number,
    data: {
      reviewer_name?: string;
      reviewer_phone?: string;
      reviewer_email?: string;
      rating?: number;
      comment?: string;
      is_confirmed?: number | boolean;
    }
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_URL}/api/admin/customer-reviews/${reviewId}`, {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update review.");
    return res.json();
  },

  async deleteCustomerReview(reviewId: number): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/customer-reviews/${reviewId}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete customer review.");
  },

  async deleteReview(reviewId: number | string): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/reviews/${reviewId}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete review.");
  },

  async updateUserSubscriptionOverride(
    userId: number | string,
    customTrialExpiry: string | null,
    isFreeSubscriptionGranted: boolean,
    enquiryCreditsLeft?: number,
    listingSlotsLeft?: number
  ): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/users/${userId}/subscription-override`, {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify({
        custom_trial_expiry: customTrialExpiry,
        is_free_subscription_granted: isFreeSubscriptionGranted,
        enquiry_credits_left: enquiryCreditsLeft,
        listing_slots_left: listingSlotsLeft,
      }),
    });
    if (!res.ok) throw new Error("Failed to update user subscription overrides.");
  },

  async getNotifications(): Promise<{
    id: string;
    type: "Registration" | "Activation" | "RoleUpgrade";
    title: string;
    message: string;
    time: string;
    link: string;
  }[]> {
    const res = await fetch(`${API_URL}/api/admin/notifications`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load notifications.");
    return res.json();
  },

  async getServiceEnquiries(): Promise<ServiceEnquiry[]> {
    const res = await fetch(`${API_URL}/api/admin/service-enquiries`, { headers: getAdminHeaders() });
    if (!res.ok) throw new Error("Failed to load service enquiries.");
    return res.json();
  },

  async updateServiceEnquiryStatus(id: number, status: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/service-enquiries/${id}/status`, {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update enquiry status.");
  },

  async deleteServiceEnquiry(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/service-enquiries/${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete service enquiry.");
  },

  async getBuilderInquiries(params?: { status?: string; search?: string }): Promise<AdminBuilderInquiry[]> {
    const q = new URLSearchParams();
    if (params?.status && params.status !== "All") q.append("status", params.status);
    if (params?.search) q.append("search", params.search);
    const res = await fetch(`${API_URL}/api/builders/admin/inquiries?${q.toString()}`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load builder inquiries.");
    return res.json();
  },

  async updateBuilderInquiryStatus(id: number, status: string, admin_notes?: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/builders/admin/inquiries/${id}/status`, {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify({ status, admin_notes }),
    });
    if (!res.ok) throw new Error("Failed to update builder inquiry status.");
  },

  async approveBuilderInquiry(id: number): Promise<{ success: boolean; message: string; builderId?: number; slug?: string }> {
    const res = await fetch(`${API_URL}/api/builders/admin/inquiries/${id}/approve`, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to approve builder inquiry.");
    return res.json();
  },

  async deleteBuilderInquiry(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/api/builders/admin/inquiries/${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete builder inquiry.");
  },

  async getPropertyRequests(params?: { requestType?: string; location?: string; status?: string; search?: string }): Promise<PropertyRequestItem[]> {
    const q = new URLSearchParams();
    if (params?.requestType && params.requestType !== "All") q.append("requestType", params.requestType);
    if (params?.location && params.location !== "All") q.append("location", params.location);
    if (params?.status && params.status !== "All") q.append("status", params.status);
    if (params?.search) q.append("search", params.search);
    const res = await fetch(`${API_URL}/api/property-requests/admin?${q.toString()}`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load property requests.");
    return res.json();
  },

  async updatePropertyRequestStatus(id: number, status: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/property-requests/admin/${id}/status`, {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status.");
  },

  async deletePropertyRequest(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/api/property-requests/admin/${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete property request.");
  },

  async getAccountReports(params?: { state?: string; search?: string; planType?: string }): Promise<AccountReportsResponse> {
    const q = new URLSearchParams();
    if (params?.state && params.state !== "All") q.append("state", params.state);
    if (params?.search) q.append("search", params.search);
    if (params?.planType && params.planType !== "all") q.append("planType", params.planType);
    const res = await fetch(`${API_URL}/api/admin/account-reports?${q.toString()}`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load account reports.");
    return res.json();
  },

  async fetchPropertyTypes(): Promise<any[]> {
    const res = await fetch(`${API_URL}/api/admin/property-types`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load property types.");
    return res.json();
  },

  async addPropertyType(data: FormData | { name: string; category?: string; for_sale?: boolean; for_rent?: boolean; show_pc_header?: boolean; show_mobile_header?: boolean; icon_url?: string }): Promise<any> {
    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = {
      "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "",
    };
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(`${API_URL}/api/admin/property-types`, {
      method: "POST",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to add property type.");
    }
    return res.json();
  },

  async updatePropertyType(id: number, data: FormData | { name?: string; category?: string; for_sale?: boolean; for_rent?: boolean; show_pc_header?: boolean; show_mobile_header?: boolean; icon_url?: string }): Promise<any> {
    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = {
      "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "",
    };
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(`${API_URL}/api/admin/property-types/${id}`, {
      method: "PUT",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update property type.");
    }
    return res.json();
  },

  async reorderPropertyTypes(order: number[]): Promise<any> {
    const res = await fetch(`${API_URL}/api/admin/property-types/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-auth": localStorage.getItem("kerala_realty_admin_token") || "",
      },
      body: JSON.stringify({ order }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to reorder property types.");
    }
    return res.json();
  },

    async deletePropertyType(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/api/admin/property-types/${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete property type.");
    return res.json();
  },

  async publishToFacebook(id: number | string): Promise<{ success: boolean; postId: string; postUrl: string; message: string }> {
    const res = await fetch(`${API_URL}/api/admin/properties/${id}/facebook-publish`, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to publish property to Facebook.");
    }
    return res.json();
  },

  async getFbMarketplaceStatus(): Promise<{
    success: boolean;
    totalActiveListings: number;
    feedUrlXml: string;
    feedUrlCsv: string;
    autoSync: boolean;
    catalogId: string | null;
    instructions: string[];
  }> {
    const res = await fetch(`${API_URL}/api/feeds/status`);
    if (!res.ok) throw new Error("Failed to fetch Marketplace feed status");
    return res.json();
  },

  async toggleFbMarketplaceAutoSync(): Promise<{ success: boolean; autoSync: boolean; message: string }> {
    const res = await fetch(`${API_URL}/api/feeds/toggle-auto-sync`, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to toggle Marketplace auto-sync");
    return res.json();
  },

  async pushToFbMarketplace(propertyId: number | string): Promise<{
    success: boolean;
    marketplaceCreateUrl: string;
    property: {
      id: number;
      title: string;
      price: number;
      formattedPrice: string;
      isRent: boolean;
      propertyType: string;
      bedrooms: string | number;
      bathrooms: string | number;
      areaSqft: string | number;
      location: string;
      district: string;
      description: string;
      listingUrl: string;
      images: string[];
    };
    directCatalogResult?: any;
  }> {
    const res = await fetch(`${API_URL}/api/feeds/push/${propertyId}`, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to push to Marketplace");
    }
    return res.json();
  },
};

export interface AccountReportTransaction {
  id: number;
  credit_type: "enquiry" | "listing_slot";
  transaction_type: "purchase" | "bonus" | "usage" | "admin_adjustment";
  amount_credits: number;
  balance_after: number;
  price_paid: number;
  payment_id: string | null;
  order_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface AdminAccountUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  state: string;
  location: string | null;
  enquiry_credits_left: number;
  listing_slots_left: number;
  subscription_status: string;
  total_paid: number;
  is_paid: boolean;
  plan_name: string;
  latest_payment_id: string | null;
  latest_order_id: string | null;
  last_package_date: string;
  created_at: string;
  transactions: AccountReportTransaction[];
}

export interface AccountReportsSummary {
  totalAmountPaidAllUsers: number;
  totalPayingUsers: number;
  totalPackagesTaken: number;
  totalListingSlots: number;
  totalEnquiryTokens: number;
  filteredUsersCount: number;
}

export interface AccountReportsResponse {
  users: AdminAccountUser[];
  summary: AccountReportsSummary;
  availableStates: string[];
}

export interface ServiceEnquiry {
  id: number;
  user_id: number | null;
  name: string;
  email: string;
  city: string;
  user_class: string;
  phone: string;
  service_name: string;
  status: string;
  created_at: string;
}

export interface AdminBuilderInquiry {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  office_address: string;
  city_district: string;
  active_projects: string;
  package_preference: string;
  experience_years: number;
  message: string;
  status: "Pending" | "Contacted" | "Approved" | "Rejected";
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyRequestItem {
  id: number;
  user_id: number | null;
  full_name: string;
  phone: string;
  email: string | null;
  request_type: string;
  property_type: string;
  preferred_location: string;
  bedrooms: string | null;
  budget_range: string;
  move_in_date: string | null;
  furnished: string | null;
  description: string;
  special_requirements: string | null;
  contact_preference: string | null;
  best_time_to_contact: string | null;
  status: string;
  created_at: string;
}


export interface PushNotificationLog {
  id: number;
  title: string;
  body: string;
  image_url?: string | null;
  click_action?: string | null;
  target_type: string;
  target_topic?: string | null;
  status: string;
  error_message?: string | null;
  created_at: string;
}

export interface PushNotificationStatus {
  ready: boolean;
  hasCredential?: boolean;
  clientEmail?: string | null;
  projectId?: string;
  error?: string | null;
  registeredTokens: number;
  totalNotificationsSent: number;
}

export interface SendPushPayload {
  title: string;
  body: string;
  imageUrl?: string;
  clickAction?: string;
  targetType: "all" | "district" | "topic";
  district?: string;
  targetTopic?: string;
}

export async function getPushNotificationStatus(): Promise<PushNotificationStatus> {
  const res = await fetch(`${API_URL}/api/admin/push-notifications/status`, {
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch push notification status");
  return res.json();
}

export async function getPushNotificationLogs(): Promise<PushNotificationLog[]> {
  const res = await fetch(`${API_URL}/api/admin/push-notifications/logs`, {
    headers: getAdminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch push notification logs");
  return res.json();
}

export async function sendCustomPushNotification(payload: SendPushPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  topic?: string;
}> {
  const res = await fetch(`${API_URL}/api/admin/push-notifications/send`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send push notification");
  return data;
}


export async function saveServiceAccountKey(serviceAccountJson: string): Promise<{
  success: boolean;
  clientEmail?: string;
  projectId?: string;
}> {
  const res = await fetch(`${API_URL}/api/admin/push-notifications/service-account`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({ serviceAccountJson }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save service account key");
  return data;
}
