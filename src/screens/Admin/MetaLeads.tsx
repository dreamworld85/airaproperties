import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Store,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Copy,
  Check,
  Settings2,
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  metaLeadsApi,
  MetaConversation,
  MetaMessage,
  MetaWebhookStatus,
} from "@/lib/metaLeadsApi";

export default function AdminMetaLeads() {
  const [conversations, setConversations] = useState<MetaConversation[]>([]);
  const [counts, setCounts] = useState<{
    total?: number;
    marketplace_count?: number;
    page_dm_count?: number;
    total_unread?: number;
  }>({});
  const [selectedConv, setSelectedConv] = useState<MetaConversation | null>(null);
  const [messages, setMessages] = useState<MetaMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [channelFilter, setChannelFilter] = useState<"all" | "marketplace" | "page_dm">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [webhookStatus, setWebhookStatus] = useState<MetaWebhookStatus | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<string | null>(null);

  const [showConfig, setShowConfig] = useState(false);
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await metaLeadsApi.getConversations({
        channel: channelFilter,
        status: statusFilter,
        q: searchQuery,
      });
      setConversations(res.conversations || []);
      setCounts(res.counts || {});
    } catch (err) {
      console.error("Failed to load Meta conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWebhookStatus = async () => {
    try {
      const status = await metaLeadsApi.getWebhookStatus();
      setWebhookStatus(status);
      setAppId(status.appId || "");
      setVerifyToken(status.verifyToken || "");
    } catch (err) {
      console.error("Failed to load Meta status:", err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [channelFilter, statusFilter]);

  useEffect(() => {
    loadWebhookStatus();
  }, []);

  const handleSelectConversation = async (conv: MetaConversation) => {
    setSelectedConv(conv);
    setLoadingMsgs(true);
    try {
      const res = await metaLeadsApi.getMessages(conv.id);
      setMessages(res.messages || []);
      setSelectedConv(res.conversation);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim()) return;
    try {
      setSendingReply(true);
      await metaLeadsApi.replyConversation(selectedConv.id, replyText.trim());
      setReplyText("");
      const res = await metaLeadsApi.getMessages(selectedConv.id);
      setMessages(res.messages || []);
      loadConversations();
    } catch (err: any) {
      alert(err.message || "Failed to send Messenger reply");
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (convId: number, status: "new" | "in_progress" | "resolved") => {
    try {
      await metaLeadsApi.updateStatus(convId, status);
      setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, status } : c)));
      if (selectedConv?.id === convId) {
        setSelectedConv({ ...selectedConv, status });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleVerifyAndRenew = async () => {
    try {
      setVerifying(true);
      setVerifyFeedback(null);
      const res = await metaLeadsApi.verifyAndRenew();
      await loadWebhookStatus();
      if (res.errors && res.errors.length > 0) {
        setVerifyFeedback(`⚠️ ${res.errors.join(" | ")}`);
      } else {
        setVerifyFeedback(
          `✅ Webhook ${res.webhookSubscribed ? "Active" : "Checked"} • Token ${
            res.tokenRenewed ? "Renewed" : res.tokenValid ? "Valid" : "Checked"
          }`
        );
      }
    } catch (err: any) {
      setVerifyFeedback(`❌ ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      await metaLeadsApi.saveConfig({ appId, appSecret, verifyToken });
      setAppSecret("");
      await loadWebhookStatus();
      setVerifyFeedback("✅ Meta webhook & token renewal settings saved.");
    } catch (err: any) {
      alert(err.message || "Failed to save config");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSimulate = async (type: "marketplace" | "page_dm") => {
    try {
      const msg =
        type === "marketplace"
          ? "Hi, is this property (aira_37) still available? Looking to schedule a visit."
          : "Hello! Can you share more details about your listings in Kerala?";
      await metaLeadsApi.simulateWebhook({
        channelType: type,
        propertyId: type === "marketplace" ? 37 : undefined,
        message: msg,
      });
      await loadConversations();
      await loadWebhookStatus();
    } catch (err: any) {
      alert(err.message || "Simulation failed");
    }
  };

  const copyText = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header & Webhook Health Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <Store size={20} />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900">
                  Meta Marketplace & Messenger Leads
                </h1>
                <p className="text-xs text-slate-500">
                  Real-time webhook capture distinguishing Marketplace listing threads from standard Page DMs
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Webhook Status Pill */}
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                webhookStatus?.webhookStatus === "active"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {webhookStatus?.webhookStatus === "active" ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertTriangle size={14} />
              )}
              <span>
                Webhook: {webhookStatus?.webhookStatus === "active" ? "Subscribed" : webhookStatus?.webhookStatus || "Checking"}
              </span>
            </div>

            {/* Token Status Pill */}
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                webhookStatus?.tokenStatus === "valid"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              <ShieldCheck size={14} />
              <span>
                Token: {webhookStatus?.tokenStatus === "valid" ? "Active" : webhookStatus?.tokenStatus || "Unknown"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleVerifyAndRenew}
              disabled={verifying}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw size={13} className={verifying ? "animate-spin" : ""} />
              <span>{verifying ? "Verifying..." : "Verify & Renew Token"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Settings2 size={14} />
              <span>Webhook Setup</span>
            </button>
          </div>
        </div>

        {verifyFeedback && (
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            {verifyFeedback}
          </div>
        )}

        {/* Expandable Webhook Setup & Token Renewal Config */}
        {showConfig && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">Meta App Webhook Endpoint</p>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Callback URL</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px] truncate">
                    {webhookStatus?.webhookUrl || "https://api.airaproperties.in/api/meta/webhook"}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        "url",
                        webhookStatus?.webhookUrl || "https://api.airaproperties.in/api/meta/webhook"
                      )
                    }
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 flex items-center gap-1"
                  >
                    {copiedField === "url" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Verify Token</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                    {webhookStatus?.verifyToken || "aira_meta_webhook_2026"}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      copyText("token", webhookStatus?.verifyToken || "aira_meta_webhook_2026")
                    }
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 flex items-center gap-1"
                  >
                    {copiedField === "token" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSimulate("marketplace")}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Test Marketplace Lead</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulate("page_dm")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare size={12} />
                  <span>Test Page DM</span>
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSaveConfig}
              className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs"
            >
              <p className="font-bold text-slate-900">Auto-Renewal App Credentials (Optional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Meta App ID</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="e.g. 123456789012345"
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Meta App Secret</label>
                  <input
                    type="password"
                    value={appSecret}
                    onChange={(e) => setAppSecret(e.target.value)}
                    placeholder="Leave blank to keep existing"
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Webhook Verify Token</label>
                <input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={savingConfig}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {savingConfig ? "Saving..." : "Save Webhook Settings"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setChannelFilter("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              channelFilter === "all"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Threads ({counts.total || 0})
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter("marketplace")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              channelFilter === "marketplace"
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-teal-700 border-teal-200 hover:bg-teal-50"
            }`}
          >
            <Store size={14} />
            <span>Marketplace Leads ({counts.marketplace_count || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter("page_dm")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              channelFilter === "page_dm"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
            }`}
          >
            <MessageSquare size={14} />
            <span>Page DMs ({counts.page_dm_count || 0})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadConversations()}
              placeholder="Search buyer or listing..."
              className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs w-52"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Split Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[540px]">
        {/* Thread List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[650px]">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Conversations
            </span>
            <button
              type="button"
              onClick={loadConversations}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">No Messenger or Marketplace leads yet.</p>
                <p>Configure your Meta Webhook above or click "Test Marketplace Lead" to verify.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedConv?.id === conv.id ? "bg-teal-50/60 border-l-4 border-l-teal-600" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {conv.sender_name || `Buyer ${conv.sender_psid.slice(-6)}`}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            conv.channel_type === "marketplace"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {conv.channel_type === "marketplace" ? "Marketplace" : "Page DM"}
                        </span>
                      </div>
                      {(conv.property_title || conv.listing_title || conv.listing_ref) && (
                        <p className="text-[11px] font-semibold text-teal-700 truncate mt-0.5">
                          🏠 {conv.property_title || conv.listing_title || conv.listing_ref}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 truncate mt-1">
                        {conv.last_message || "No message preview"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.last_message_at).toLocaleDateString()}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="px-1.5 py-0.5 bg-teal-600 text-white rounded-full text-[10px] font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread Detail */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 flex flex-col max-h-[650px] overflow-hidden">
          {!selectedConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare size={36} className="mb-2 opacity-40" />
              <p className="text-sm font-semibold text-slate-600">Select a conversation</p>
              <p className="text-xs mt-1">
                Marketplace buyer inquiries and Page DMs appear here in real time.
              </p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-slate-900">
                      {selectedConv.sender_name || `Buyer ${selectedConv.sender_psid}`}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        selectedConv.channel_type === "marketplace"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedConv.channel_type === "marketplace"
                        ? "FB Marketplace Lead"
                        : "Facebook Page DM"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    PSID: {selectedConv.sender_psid}
                    {selectedConv.listing_ref ? ` • Ref: ${selectedConv.listing_ref}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedConv.property_id && (
                    <Link
                      to={`/admin/properties/${selectedConv.property_id}`}
                      className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <span>View Property #{selectedConv.property_id}</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}
                  <select
                    value={selectedConv.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedConv.id,
                        e.target.value as "new" | "in_progress" | "resolved"
                      )
                    }
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                {loadingMsgs ? (
                  <div className="text-center text-xs text-slate-500 py-8">Loading messages...</div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                          m.direction === "outbound"
                            ? "bg-slate-900 text-white rounded-br-xs"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{m.message_text}</p>
                        <span
                          className={`block text-[10px] mt-1 ${
                            m.direction === "outbound" ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {new Date(m.sent_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Box */}
              <form
                onSubmit={handleSendReply}
                className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Reply to buyer via Facebook Messenger..."
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{sendingReply ? "Sending..." : "Send"}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
