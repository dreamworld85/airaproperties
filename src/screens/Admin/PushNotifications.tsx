import { useEffect, useState } from "react";
import { 
  Bell, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  MapPin, 
  Radio, 
  Users, 
  Layers, 
  Clock, 
  X, 
  ExternalLink,
  Flame,
  Search
} from "lucide-react";
import { 
  getPushNotificationLogs, 
  getPushNotificationStatus, 
  sendCustomPushNotification, 
  saveServiceAccountKey,
  deletePushNotificationLog,
  clearAllPushNotificationLogs,
  PushNotificationLog, 
  PushNotificationStatus 
} from "@/lib/adminApi";
import { 
  Key, 
  Upload, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Trash2
} from "lucide-react";

const KERALA_DISTRICTS = [
  "Alappuzha",
  "Ernakulam",
  "Idukki",
  "Kannur",
  "Kasaragod",
  "Kollam",
  "Kottayam",
  "Kozhikode",
  "Malappuram",
  "Palakkad",
  "Pathanamthitta",
  "Thiruvananthapuram",
  "Thrissur",
  "Wayanad",
];

export default function PushNotifications() {
  const [logs, setLogs] = useState<PushNotificationLog[]>([]);
  const [status, setStatus] = useState<PushNotificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form inputs
  const [targetType, setTargetType] = useState<"district" | "all" | "topic">("district");
  const [selectedDistrict, setSelectedDistrict] = useState("Wayanad");
  const [customTopic, setCustomTopic] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [clickAction, setClickAction] = useState("https://airaproperties.in");

  // Service Account Key state
  const [showKeyCard, setShowKeyCard] = useState(false);
  const [keyJsonInput, setKeyJsonInput] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filter logs & delete state
  const [searchLog, setSearchLog] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [logFeedback, setLogFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    try {
      const [logsData, statusData] = await Promise.all([
        getPushNotificationLogs().catch(() => []),
        getPushNotificationStatus().catch(() => null),
      ]);
      setLogs(logsData);
      setStatus(statusData);
    } catch (err: any) {
      console.error("Failed fetching notification data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setKeyJsonInput(text);
      setKeyFeedback(null);
    };
    reader.readAsText(file);
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyJsonInput.trim()) {
      setKeyFeedback({ type: "error", message: "Please paste your Service Account Key JSON or upload the file." });
      return;
    }
    setSavingKey(true);
    setKeyFeedback(null);
    try {
      const res = await saveServiceAccountKey(keyJsonInput.trim());
      setKeyFeedback({
        type: "success",
        message: `Firebase Admin successfully authenticated for project "${res.projectId || "airaproperties"}" (${res.clientEmail || "Active"})! You can now send push notifications.`
      });
      setKeyJsonInput("");
      fetchData();
    } catch (err: any) {
      setKeyFeedback({ type: "error", message: err.message || "Failed to save and verify service account key." });
    } finally {
      setSavingKey(false);
    }
  };

  const handleDeleteLog = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete broadcast log record #${id}?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deletePushNotificationLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setLogFeedback({ type: "success", message: `Log #${id} deleted successfully.` });
      setTimeout(() => setLogFeedback(null), 4000);
    } catch (err: any) {
      setLogFeedback({ type: "error", message: err.message || "Failed to delete log." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllLogs = async () => {
    if (!window.confirm("Are you sure you want to delete ALL notification broadcast logs? This action cannot be undone.")) {
      return;
    }
    setClearingAll(true);
    try {
      await clearAllPushNotificationLogs();
      setLogs([]);
      setLogFeedback({ type: "success", message: "All notification broadcast logs have been cleared." });
      setTimeout(() => setLogFeedback(null), 4000);
    } catch (err: any) {
      setLogFeedback({ type: "error", message: err.message || "Failed to clear logs." });
    } finally {
      setClearingAll(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFeedback({ type: "error", message: "Please provide both a notification title and body message." });
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      const res = await sendCustomPushNotification({
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        clickAction: clickAction.trim() || "https://airaproperties.in",
        targetType,
        district: targetType === "district" ? selectedDistrict : undefined,
        targetTopic: targetType === "topic" ? customTopic.trim() : undefined,
      });

      if (res.success) {
        setFeedback({ 
          type: "success", 
          message: `Notification broadcasted successfully to topic "${res.topic}"! FCM Message ID: ${res.messageId || "generated"}` 
        });
        // Clear inputs
        setTitle("");
        setBody("");
        setImageUrl("");
        // Refresh logs
        fetchData();
      } else {
        setFeedback({ 
          type: "error", 
          message: `Notification logged, but Firebase delivery failed: ${res.error || "Unknown error"}` 
        });
        fetchData();
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to dispatch notification." });
    } finally {
      setSending(false);
    }
  };

  const applyPreset = (presetTitle: string, presetBody: string, sampleImage?: string) => {
    setTitle(presetTitle);
    setBody(presetBody);
    if (sampleImage) setImageUrl(sampleImage);
  };

  const filteredLogs = logs.filter(l => {
    if (!searchLog) return true;
    const q = searchLog.toLowerCase();
    return (
      (l.title && l.title.toLowerCase().includes(q)) ||
      (l.body && l.body.toLowerCase().includes(q)) ||
      (l.target_topic && l.target_topic.toLowerCase().includes(q)) ||
      (l.status && l.status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Bell className="w-5 h-5 text-emerald-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Push Notifications & Alerts</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Broadcast custom push alerts to web and mobile subscribers via Firebase Cloud Messaging, and view automated property triggers.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Service Account Setup Banner / Modal Card */}
      {(!status?.hasCredential || showKeyCard) && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                <Key className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-base font-bold text-amber-950">
                  Firebase Service Account Key Configuration
                </h2>
                <p className="text-xs text-amber-800 mt-0.5">
                  Google requires your Firebase service account private key to authorize push notification broadcasts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://console.firebase.google.com/project/airaproperties/settings/serviceaccounts/adminsdk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Get Key from Firebase Console
              </a>
              {status?.hasCredential && (
                <button
                  type="button"
                  onClick={() => setShowKeyCard(false)}
                  className="p-1.5 text-amber-700 hover:text-amber-900 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {keyFeedback && (
            <div className={`p-3.5 rounded-lg flex items-start gap-2.5 text-xs border ${
              keyFeedback.type === "success" 
                ? "bg-emerald-50 border-emerald-300 text-emerald-900" 
                : "bg-rose-50 border-rose-300 text-rose-900"
            }`}>
              {keyFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{keyFeedback.message}</div>
              <button onClick={() => setKeyFeedback(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSaveKey} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Paste Service Account Key JSON
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 cursor-pointer underline">
                  <Upload className="w-3.5 h-3.5" />
                  Or Upload .json file
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={4}
                value={keyJsonInput}
                onChange={(e) => setKeyJsonInput(e.target.value)}
                placeholder='Paste contents of your downloaded service account JSON file here: {"type": "service_account", "project_id": "airaproperties", "private_key": "-----BEGIN PRIVATE KEY-----...", "client_email": "..."}'
                className="w-full font-mono text-xs p-3 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-amber-800">
                🔒 Stored securely in database and never exposed to the public.
              </span>
              <button
                type="submit"
                disabled={savingKey || !keyJsonInput.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {savingKey ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Validating & Saving...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify & Activate Service Account Key
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Firebase Ready */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">FCM Service Status</p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${status?.hasCredential ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-base font-bold text-gray-900 truncate">
                {status?.hasCredential ? "Active & Authenticated" : "Key Required"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1 truncate" title={status?.clientEmail || status?.projectId || "airaproperties"}>
              {status?.clientEmail || `Project: ${status?.projectId || "airaproperties"}`}
            </p>
            <button
              type="button"
              onClick={() => setShowKeyCard(!showKeyCard)}
              className="mt-2 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 block underline"
            >
              {status?.hasCredential ? "Replace / Rotate Key" : "Configure Key Now →"}
            </button>
          </div>
          <div className={`p-2.5 rounded-lg shrink-0 ${status?.hasCredential ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
            {status?.hasCredential ? <CheckCircle2 className="w-5 h-5" /> : <Key className="w-5 h-5" />}
          </div>
        </div>

        {/* Registered Tokens */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscribed Devices</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">
              {status?.registeredTokens ?? 0}
            </h3>
            <p className="text-xs text-gray-400 mt-1">FCM device tokens saved</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        {/* Total Broadcasts */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Dispatched</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">
              {status?.totalNotificationsSent ?? logs.length}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Push notifications sent</p>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Send className="w-5 h-5" />
          </div>
        </div>

        {/* Automated District Triggers */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto Property Triggers</p>
            <h3 className="text-base font-bold text-gray-900 mt-2">
              14 District Topics
            </h3>
            <p className="text-xs text-gray-400 mt-1">Auto-notifies on submission</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Composer & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Push Composer (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Compose Push Notification</h2>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              Firebase Cloud Messaging
            </span>
          </div>

          {/* Feedback message banner */}
          {feedback && (
            <div className={`mb-5 p-4 rounded-lg flex items-start gap-3 border ${
              feedback.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}>
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-sm flex-1">{feedback.message}</div>
              <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Presets */}
          <div className="mb-5 bg-gray-50 p-3.5 rounded-lg border border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Quick Templates
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset(
                  `Exclusive Property in ${selectedDistrict}!`,
                  `Featured 3 BHK luxury home available at special pricing. Tap to explore specs & photos.`,
                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                )}
                className="text-xs font-medium px-2.5 py-1.5 bg-white border border-gray-300 rounded-md hover:border-emerald-500 hover:text-emerald-700 transition"
              >
                🏠 New Listing Alert
              </button>
              <button
                type="button"
                onClick={() => applyPreset(
                  `Price Reduced Alert - ${selectedDistrict}`,
                  `Hot deal! Premium commercial property price dropped by ₹5 Lakhs for limited time.`,
                  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                )}
                className="text-xs font-medium px-2.5 py-1.5 bg-white border border-gray-300 rounded-md hover:border-emerald-500 hover:text-emerald-700 transition"
              >
                📉 Price Drop Alert
              </button>
              <button
                type="button"
                onClick={() => applyPreset(
                  "Weekend Property Showcase ✨",
                  "Over 50+ new certified properties listed across Kerala this weekend. Find your dream home now!",
                  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
                )}
                className="text-xs font-medium px-2.5 py-1.5 bg-white border border-gray-300 rounded-md hover:border-emerald-500 hover:text-emerald-700 transition"
              >
                ✨ Weekend Digest
              </button>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Target Audience selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetType("district")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition ${
                    targetType === "district"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  District Topic
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("all")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition ${
                    targetType === "all"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  All Subscribers
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("topic")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition ${
                    targetType === "topic"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Custom Topic
                </button>
              </div>

              {/* District Dropdown */}
              {targetType === "district" && (
                <div className="mt-3">
                  <label className="block text-xs text-gray-600 mb-1 font-medium">
                    Choose Kerala District:
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d} (Topic: district_{d.toLowerCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Topic Input */}
              {targetType === "topic" && (
                <div className="mt-3">
                  <label className="block text-xs text-gray-600 mb-1 font-medium">
                    FCM Topic Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. investors_kerala, premium_leads"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Notification Title *
              </label>
              <input
                type="text"
                placeholder="e.g. New Luxury Villa in Wayanad!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Notification Message *
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Prime highway location • ₹85 Lakhs • 4 BHK with 15 cents land"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Property Image or Banner URL (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://example.com/property-banner.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Click Action Link */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Target URL / Click Action
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://airaproperties.in/property/123"
                  value={clickAction}
                  onChange={(e) => setClickAction(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Send Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-md transition disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Publishing Notification to Topic...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Push Notification Now
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview & Action Buttons (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-gray-700" />
                <h3 className="text-base font-bold text-gray-900">Live Alert Preview</h3>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                Interactive
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Here is exactly how subscribers see your push notification on Android, macOS, and Windows with action buttons.
            </p>

            {/* Simulated Push Notification Card */}
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-300 shadow-lg space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-[10px]">
                    A
                  </div>
                  <span className="text-xs font-semibold text-gray-800">Aira Properties</span>
                </div>
                <span className="text-[10px] text-gray-400">now</span>
              </div>

              {/* Title & Body */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">
                  {title || "New Property in Wayanad!"}
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {body || "3 BHK Luxury Villa • ₹85 Lakhs • Wayanad. Tap to view floor plan and photos."}
                </p>
              </div>

              {/* Property Image if present */}
              {(imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80") && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 max-h-44 bg-gray-200">
                  <img
                    src={imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"}
                    alt="Notification Preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-sm">
                    {targetType === "district" ? selectedDistrict : (targetType === "all" ? "All Users" : customTopic || "Topic")}
                  </div>
                </div>
              )}

              {/* Action Buttons: View Property & Dismiss */}
              <div className="pt-2 border-t border-gray-200/70 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Property
                </button>
                <button
                  type="button"
                  className="w-full py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Dismiss
                </button>
              </div>
            </div>

            {/* Explanation box */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold block mb-1">⚡ Automatic Submission Trigger:</span>
              When any user posts a property, our backend automatically extracts the district (e.g. <strong>{selectedDistrict}</strong>), formats the price, attaches the property photo, and broadcasts to <code>district_{selectedDistrict.toLowerCase()}</code>.
            </div>
          </div>
        </div>
      </div>

      {/* Push Notification History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Push Notification Broadcast Logs</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              History of all manual campaigns and automatic property triggers sent through Firebase Admin SDK.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllLogs}
                disabled={clearingAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-700 bg-rose-50/70 hover:bg-rose-100 rounded-lg text-xs font-semibold transition shrink-0"
                title="Delete all broadcast logs"
              >
                {clearingAll ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Clear All Logs
              </button>
            )}

            <div className="relative min-w-[220px]">
              <input
                type="text"
                placeholder="Filter by title, topic or status..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {logFeedback && (
          <div className={`mx-5 mt-4 p-3 rounded-lg flex items-center justify-between text-xs border ${
            logFeedback.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <div className="flex items-center gap-2">
              {logFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span className="font-medium">{logFeedback.message}</span>
            </div>
            <button onClick={() => setLogFeedback(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            Loading push notification history...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            No push notifications recorded yet. Send your first broadcast or post a property to see live triggers!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Target Topic</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(log.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {log.image_url ? (
                        <img
                          src={log.image_url}
                          alt="Thumbnail"
                          className="w-12 h-10 object-cover rounded border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          N/A
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-gray-900 text-sm">{log.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{log.body}</div>
                      {log.click_action && (
                        <a
                          href={log.click_action}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-800 mt-1 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {log.click_action}
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Radio className="w-3 h-3 text-emerald-600" />
                        {log.target_topic || "all_users"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.status === "sent" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Sent
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Failed
                          </span>
                          {log.error_message && (
                            <div className="text-[10px] text-rose-600 max-w-xs mt-1 truncate" title={log.error_message}>
                              {log.error_message}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={deletingId === log.id}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete log record"
                      >
                        {deletingId === log.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
