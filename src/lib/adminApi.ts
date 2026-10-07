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
  ownerId: number;
  uploader_name: string;
  title: string;
  propertyType: string;
  purpose: string;
  price: number;
  areaSqft: number;
  address: string;
  state?: string;
  district: string;
  status: "Draft" | "Pending" | "Active" | "Inactive" | "Rejected";
  images: string[];
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

  async updateUserProfile(id: number | string, data: { name?: string; email?: string; phone?: string }): Promise<void> {
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
};

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

