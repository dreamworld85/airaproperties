import { getApiUrl } from "./api";

const API_URL = getApiUrl();

function getAdminHeaders() {
  const token = localStorage.getItem("kerala_realty_admin_token") || "";
  return {
    "Content-Type": "application/json",
    "x-admin-auth": token,
  };
}

export interface MetaConversation {
  id: number;
  thread_key: string;
  sender_psid: string;
  sender_name: string | null;
  sender_profile_pic: string | null;
  page_id: string | null;
  channel_type: "marketplace" | "page_dm";
  property_id: number | null;
  listing_ref: string | null;
  listing_title: string | null;
  property_title?: string | null;
  property_price?: number | null;
  property_district?: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  status: "new" | "in_progress" | "resolved";
}

export interface MetaMessage {
  id: number;
  conversation_id: number;
  mid: string | null;
  direction: "inbound" | "outbound";
  sender_psid: string | null;
  message_text: string;
  is_marketplace: number;
  sent_at: string;
}

export interface MetaWebhookStatus {
  success: boolean;
  webhookUrl: string;
  verifyToken: string;
  webhookStatus: string;
  tokenStatus: string;
  tokenExpiresAt: string;
  lastHealthCheck: string;
  subscribedFields: string[];
  appId: string;
  pageId: string;
  recentLogs: Array<{
    id: number;
    event_type: string;
    channel_type: string;
    payload_summary: string;
    created_at: string;
  }>;
}

export const metaLeadsApi = {
  async getConversations(params?: { channel?: string; status?: string; q?: string }): Promise<{
    success: boolean;
    conversations: MetaConversation[];
    counts: {
      total?: number;
      marketplace_count?: number;
      page_dm_count?: number;
      total_unread?: number;
    };
  }> {
    const qs = new URLSearchParams();
    if (params?.channel) qs.set("channel", params.channel);
    if (params?.status) qs.set("status", params.status);
    if (params?.q) qs.set("q", params.q);
    const res = await fetch(`${API_URL}/api/meta/conversations?${qs.toString()}`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch Meta conversations");
    return res.json();
  },

  async getMessages(conversationId: number): Promise<{
    success: boolean;
    conversation: MetaConversation;
    messages: MetaMessage[];
  }> {
    const res = await fetch(`${API_URL}/api/meta/conversations/${conversationId}/messages`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch Meta messages");
    return res.json();
  },

  async replyConversation(conversationId: number, text: string): Promise<{ success: boolean; messageId?: string }> {
    const res = await fetch(`${API_URL}/api/meta/conversations/${conversationId}/reply`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({ text }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to send reply");
    return data;
  },

  async updateStatus(conversationId: number, status: "new" | "in_progress" | "resolved") {
    const res = await fetch(`${API_URL}/api/meta/conversations/${conversationId}/status`, {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },

  async getWebhookStatus(): Promise<MetaWebhookStatus> {
    const res = await fetch(`${API_URL}/api/meta/status`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load Meta webhook status");
    return res.json();
  },

  async saveConfig(payload: { appId?: string; appSecret?: string; verifyToken?: string }) {
    const res = await fetch(`${API_URL}/api/meta/config`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save Meta config");
    return res.json();
  },

  async verifyAndRenew() {
    const res = await fetch(`${API_URL}/api/meta/verify-and-renew`, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    if (!res.ok) throw new Error("Failed to verify & renew Meta webhook");
    return res.json();
  },

  async simulateWebhook(payload: { channelType: "marketplace" | "page_dm"; propertyId?: number; message: string }) {
    const res = await fetch(`${API_URL}/api/meta/test-webhook`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to simulate webhook");
    return res.json();
  },
};
