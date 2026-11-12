import { Router } from "express";
import crypto from "crypto";
import { pool } from "../db.js";

const router = Router();

const GRAPH_VERSION = "v20.0";
const DEFAULT_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "aira_meta_webhook_2026";

function isAuthorizedAdmin(req) {
  const adminToken = req.headers["x-admin-auth"] || req.headers["authorization"];
  const expected = process.env.ADMIN_SECRET_TOKEN || "KeralaRealtyAdminSecretToken2026";
  return adminToken === expected || adminToken === `Bearer ${expected}`;
}

async function getSettingValue(key, fallback = "") {
  try {
    const [[row]] = await pool.query("SELECT `value` FROM settings WHERE `key` = ?", [key]);
    return row && row.value !== undefined && row.value !== null ? row.value : fallback;
  } catch {
    return fallback;
  }
}

async function upsertSetting(key, value) {
  await pool.query(
    "INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
    [key, String(value ?? "")]
  );
}

/**
 * Extract property ID & listing ref from Meta Messenger event (referral, attachments, or text).
 * Distinguishes Marketplace threads from standard Page DMs.
 */
function classifyAndExtractListing(event) {
  const referral = event.referral || event.postback?.referral || null;
  const message = event.message || {};
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  const text = String(message.text || event.postback?.title || event.postback?.payload || "");

  let isMarketplace = false;
  let listingRef = null;
  let propertyId = null;

  // 1. Direct Meta referral markers
  if (referral) {
    const refSource = String(referral.source || "").toUpperCase();
    const refType = String(referral.type || "").toUpperCase();
    if (
      refSource === "MARKETPLACE" ||
      refSource.includes("MARKETPLACE") ||
      referral.product_id ||
      referral.listing_id ||
      (refType === "OPEN_THREAD" && (referral.ref || "").toLowerCase().includes("marketplace"))
    ) {
      isMarketplace = true;
    }
    listingRef =
      referral.product_id ||
      referral.listing_id ||
      referral.ref ||
      referral.ad_id ||
      null;
  }

  // 2. Attachments (Marketplace product cards, fallback links, commerce templates)
  for (const att of attachments) {
    const attType = String(att.type || "").toLowerCase();
    const payload = att.payload || {};
    const attUrl = String(att.url || payload.url || "");
    if (
      attType === "product" ||
      payload.product ||
      attUrl.includes("facebook.com/marketplace") ||
      attUrl.includes("fb.com/marketplace")
    ) {
      isMarketplace = true;
    }
    if (payload.product?.id) {
      listingRef = listingRef || String(payload.product.id);
    }
    if (attUrl && !listingRef) {
      const mItem = attUrl.match(/marketplace\/item\/(\d+)/i);
      if (mItem) listingRef = `fb_item_${mItem[1]}`;
    }
  }

  // 3. Extract Aira property ID (aira_37 or /property/37) from referral, attachments, or message text
  const combinedHaystack = [
    listingRef,
    referral?.ref,
    text,
    ...attachments.map((a) => `${a.url || ""} ${a.title || ""} ${JSON.stringify(a.payload || {})}`),
  ]
    .filter(Boolean)
    .join(" ");

  const airaMatch = combinedHaystack.match(/\baira_(\d+)\b/i);
  if (airaMatch) {
    propertyId = Number(airaMatch[1]);
    listingRef = listingRef || `aira_${propertyId}`;
    isMarketplace = true;
  } else {
    const propUrlMatch = combinedHaystack.match(/airaproperties\.in\/property\/(\d+)/i);
    if (propUrlMatch) {
      propertyId = Number(propUrlMatch[1]);
      listingRef = listingRef || `aira_${propertyId}`;
    }
  }

  // 4. Heuristic for Marketplace phrasing when referral metadata is stripped
  if (
    !isMarketplace &&
    /\b(is this still available|available\?|marketplace)\b/i.test(text) &&
    (propertyId || attachments.length > 0)
  ) {
    isMarketplace = true;
  }

  return {
    channelType: isMarketplace ? "marketplace" : "page_dm",
    propertyId,
    listingRef: listingRef ? String(listingRef).slice(0, 160) : null,
  };
}

/**
 * Fetch buyer profile from Meta Graph API when Page Access Token is available.
 */
async function fetchBuyerProfile(psid, pageAccessToken) {
  if (!psid || !pageAccessToken) return { name: null, profilePic: null };
  try {
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(psid)}?fields=first_name,last_name,name,profile_pic&access_token=${encodeURIComponent(pageAccessToken)}`;
    const resp = await fetch(url);
    if (!resp.ok) return { name: null, profilePic: null };
    const data = await resp.json();
    const fullName =
      data.name ||
      [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
      null;
    return {
      name: fullName,
      profilePic: data.profile_pic || null,
    };
  } catch {
    return { name: null, profilePic: null };
  }
}

/**
 * Process a single Meta messaging event and persist conversation + message into MySQL.
 */
export async function processMetaMessagingEvent(event, pageId) {
  const senderPsid = event.sender?.id ? String(event.sender.id) : null;
  const recipientId = event.recipient?.id ? String(event.recipient.id) : String(pageId || "");

  if (!senderPsid) return { skipped: true, reason: "Missing sender.id" };

  // Ignore echo messages from the page itself unless it has a message
  const isEcho = Boolean(event.message?.is_echo);
  const direction = isEcho ? "outbound" : "inbound";
  const buyerPsid = isEcho ? recipientId : senderPsid;

  const { channelType, propertyId, listingRef } = classifyAndExtractListing(event);

  let resolvedPropertyTitle = null;
  let resolvedPropertyId = propertyId;

  if (resolvedPropertyId) {
    const [[prop]] = await pool.query("SELECT id, title FROM properties WHERE id = ?", [resolvedPropertyId]);
    if (prop) {
      resolvedPropertyTitle = prop.title;
    } else {
      resolvedPropertyId = null;
    }
  }

  const threadKey = resolvedPropertyId
    ? `${buyerPsid}:prop_${resolvedPropertyId}`
    : listingRef
    ? `${buyerPsid}:ref_${listingRef.slice(0, 60)}`
    : `${buyerPsid}:${channelType}`;

  const messageText =
    event.message?.text ||
    event.postback?.title ||
    (event.message?.attachments?.length ? "[Attachment]" : "[Interaction]");

  const mid = event.message?.mid ? String(event.message.mid) : null;
  const attachmentsJson = event.message?.attachments ? JSON.stringify(event.message.attachments) : null;
  const referralJson = event.referral || event.postback?.referral
    ? JSON.stringify(event.referral || event.postback?.referral)
    : null;

  // Check if conversation exists
  const [[existingConv]] = await pool.query(
    "SELECT id, sender_name, channel_type, property_id FROM fb_conversations WHERE thread_key = ?",
    [threadKey]
  );

  let conversationId;
  if (!existingConv) {
    const pageToken = await getSettingValue("facebook_page_access_token");
    const profile = await fetchBuyerProfile(buyerPsid, pageToken);
    const buyerName = profile.name || `FB User ${buyerPsid.slice(-6)}`;

    const [ins] = await pool.query(
      `INSERT INTO fb_conversations
       (thread_key, sender_psid, sender_name, sender_profile_pic, page_id, channel_type, property_id, listing_ref, listing_title, last_message, last_message_at, unread_count, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'new')`,
      [
        threadKey,
        buyerPsid,
        buyerName,
        profile.profilePic,
        pageId || recipientId,
        channelType,
        resolvedPropertyId,
        listingRef,
        resolvedPropertyTitle,
        messageText.slice(0, 1000),
        direction === "inbound" ? 1 : 0,
      ]
    );
    conversationId = ins.insertId;
  } else {
    conversationId = existingConv.id;
    // Upgrade channel_type to marketplace if a marketplace referral arrives on an existing thread
    const nextChannel =
      existingConv.channel_type === "marketplace" || channelType === "marketplace"
        ? "marketplace"
        : "page_dm";

    await pool.query(
      `UPDATE fb_conversations
       SET channel_type = ?,
           property_id = COALESCE(property_id, ?),
           listing_ref = COALESCE(listing_ref, ?),
           listing_title = COALESCE(listing_title, ?),
           last_message = ?,
           last_message_at = NOW(),
           unread_count = unread_count + ?
       WHERE id = ?`,
      [
        nextChannel,
        resolvedPropertyId,
        listingRef,
        resolvedPropertyTitle,
        messageText.slice(0, 1000),
        direction === "inbound" ? 1 : 0,
        conversationId,
      ]
    );
  }

  // Insert message with mid deduplication
  if (mid) {
    const [[dup]] = await pool.query("SELECT id FROM fb_messages WHERE mid = ?", [mid]);
    if (dup) return { skipped: true, reason: "Duplicate mid", conversationId };
  }

  await pool.query(
    `INSERT INTO fb_messages
     (conversation_id, mid, direction, sender_psid, message_text, attachments_json, referral_json, is_marketplace, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      conversationId,
      mid,
      direction,
      senderPsid,
      messageText,
      attachmentsJson,
      referralJson,
      channelType === "marketplace" ? 1 : 0,
    ]
  );

  await pool.query(
    "INSERT INTO fb_webhook_logs (event_type, channel_type, payload_summary) VALUES (?, ?, ?)",
    [
      isEcho ? "message_echo" : event.postback ? "postback" : "message",
      channelType,
      `${buyerPsid}: ${messageText.slice(0, 180)}`,
    ]
  );

  return { skipped: false, conversationId, channelType, propertyId: resolvedPropertyId };
}

/**
 * Verify active Meta webhook subscriptions & check/renew Page/App token.
 * Safe to run both on-demand from Admin UI and via scheduled interval.
 */
export async function verifyWebhookAndRenewToken() {
  const result = {
    checkedAt: new Date().toISOString(),
    webhookSubscribed: false,
    subscribedFields: [],
    tokenValid: false,
    tokenRenewed: false,
    tokenExpiresAt: null,
    errors: [],
  };

  try {
    const pageId = await getSettingValue("facebook_page_id");
    let pageToken = await getSettingValue("facebook_page_access_token");
    const appId = await getSettingValue("facebook_app_id", process.env.FACEBOOK_APP_ID || "");
    const appSecret = await getSettingValue("facebook_app_secret", process.env.FACEBOOK_APP_SECRET || "");

    if (!pageId || !pageToken) {
      result.errors.push("Missing facebook_page_id or facebook_page_access_token in settings.");
      await upsertSetting("facebook_webhook_status", "not_configured");
      await upsertSetting("facebook_token_status", "missing");
      await upsertSetting("facebook_last_health_check", result.checkedAt);
      return result;
    }

    // 1. Debug / verify token & renew if expiring within 7 days and app credentials exist
    if (appId && appSecret) {
      try {
        const appToken = `${appId}|${appSecret}`;
        const debugRes = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/debug_token?input_token=${encodeURIComponent(pageToken)}&access_token=${encodeURIComponent(appToken)}`
        );
        const debugJson = await debugRes.json();
        const tokenData = debugJson.data;
        if (tokenData && tokenData.is_valid) {
          result.tokenValid = true;
          const expiresAtSec = Number(tokenData.expires_at || 0);
          result.tokenExpiresAt = expiresAtSec > 0 ? new Date(expiresAtSec * 1000).toISOString() : "never";
          await upsertSetting("facebook_token_expires_at", result.tokenExpiresAt);

          const sevenDaysSec = 7 * 24 * 60 * 60;
          const nowSec = Math.floor(Date.now() / 1000);
          if (expiresAtSec > 0 && expiresAtSec - nowSec < sevenDaysSec) {
            // Attempt long-lived token exchange
            const exchangeUrl =
              `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?` +
              `grant_type=fb_exchange_token&client_id=${encodeURIComponent(appId)}` +
              `&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(pageToken)}`;
            const exRes = await fetch(exchangeUrl);
            const exJson = await exRes.json();
            if (exJson.access_token) {
              pageToken = exJson.access_token;
              await upsertSetting("facebook_page_access_token", pageToken);
              result.tokenRenewed = true;
              if (exJson.expires_in) {
                const nextExp = new Date(Date.now() + Number(exJson.expires_in) * 1000).toISOString();
                result.tokenExpiresAt = nextExp;
                await upsertSetting("facebook_token_expires_at", nextExp);
              }
            } else if (exJson.error) {
              result.errors.push(`Token renewal failed: ${exJson.error.message}`);
            }
          }
        } else {
          result.errors.push(tokenData?.error?.message || "Facebook token is invalid or expired.");
        }
      } catch (err) {
        result.errors.push(`Token debug check error: ${err.message}`);
      }
    } else {
      // Fallback: lightweight /me check without app secret
      try {
        const meRes = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}?fields=id,name&access_token=${encodeURIComponent(pageToken)}`
        );
        const meJson = await meRes.json();
        if (meJson.id) {
          result.tokenValid = true;
          result.tokenExpiresAt = await getSettingValue("facebook_token_expires_at", "unknown (add App ID/Secret for expiry)");
        } else {
          result.errors.push(meJson.error?.message || "Page token check failed.");
        }
      } catch (err) {
        result.errors.push(`Page token check error: ${err.message}`);
      }
    }

    // 2. Verify active webhook subscription on the Page
    try {
      const subRes = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}/subscribed_apps?access_token=${encodeURIComponent(pageToken)}`
      );
      const subJson = await subRes.json();
      if (Array.isArray(subJson.data) && subJson.data.length > 0) {
        const fields = subJson.data.flatMap((app) => app.subscribed_fields || []);
        result.subscribedFields = Array.from(new Set(fields));
        const required = ["messages", "messaging_postbacks", "messaging_referrals"];
        const missing = required.filter((f) => !result.subscribedFields.includes(f));

        if (missing.length === 0) {
          result.webhookSubscribed = true;
        } else {
          // Attempt to subscribe required Messenger/Marketplace fields automatically
          const postSub = await fetch(
            `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,messaging_referrals,message_echoes&access_token=${encodeURIComponent(pageToken)}`,
            { method: "POST" }
          );
          const postSubJson = await postSub.json();
          if (postSubJson.success) {
            result.webhookSubscribed = true;
            result.subscribedFields = Array.from(new Set([...result.subscribedFields, ...required, "message_echoes"]));
          } else {
            result.errors.push(postSubJson.error?.message || `Missing webhook fields: ${missing.join(", ")}`);
          }
        }
      } else {
        // Attempt initial subscription
        const postSub = await fetch(
          `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,messaging_referrals,message_echoes&access_token=${encodeURIComponent(pageToken)}`,
          { method: "POST" }
        );
        const postSubJson = await postSub.json();
        if (postSubJson.success) {
          result.webhookSubscribed = true;
          result.subscribedFields = ["messages", "messaging_postbacks", "messaging_referrals", "message_echoes"];
        } else {
          result.errors.push(subJson.error?.message || postSubJson.error?.message || "No active webhook subscription on Page.");
        }
      }
    } catch (err) {
      result.errors.push(`Webhook subscription check error: ${err.message}`);
    }

    await upsertSetting("facebook_webhook_status", result.webhookSubscribed ? "active" : "error");
    await upsertSetting("facebook_token_status", result.tokenValid ? "valid" : "invalid");
    await upsertSetting("facebook_last_health_check", result.checkedAt);
    await upsertSetting("facebook_subscribed_fields", JSON.stringify(result.subscribedFields));

    return result;
  } catch (err) {
    result.errors.push(err.message);
    return result;
  }
}

// ==========================================
// 1. META WEBHOOK VERIFICATION (GET)
// ==========================================
router.get("/webhook", async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const expectedToken = await getSettingValue("facebook_webhook_verify_token", DEFAULT_VERIFY_TOKEN);

  if (mode === "subscribe" && token === expectedToken) {
    console.log("[META WEBHOOK] Verification succeeded.");
    return res.status(200).send(challenge);
  }
  console.warn("[META WEBHOOK] Verification failed. Received token:", token);
  return res.sendStatus(403);
});

// ==========================================
// 2. META WEBHOOK RECEIVER (POST)
// ==========================================
router.post("/webhook", async (req, res) => {
  try {
    // Optional X-Hub-Signature-256 verification if App Secret is configured
    const sigHeader = req.headers["x-hub-signature-256"];
    const appSecret = await getSettingValue("facebook_app_secret", process.env.FACEBOOK_APP_SECRET || "");
    if (sigHeader && appSecret && req.rawBody) {
      const expectedSig =
        "sha256=" + crypto.createHmac("sha256", appSecret).update(req.rawBody).digest("hex");
      if (sigHeader !== expectedSig) {
        console.warn("[META WEBHOOK] Invalid signature.");
        return res.sendStatus(403);
      }
    }

    const body = req.body;
    if (!body || body.object !== "page") {
      return res.status(200).send("EVENT_RECEIVED");
    }

    const entries = Array.isArray(body.entry) ? body.entry : [];
    for (const entry of entries) {
      const pageId = entry.id ? String(entry.id) : "";
      const messagingEvents = [
        ...(Array.isArray(entry.messaging) ? entry.messaging : []),
        ...(Array.isArray(entry.standby) ? entry.standby : []),
      ];

      for (const event of messagingEvents) {
        try {
          await processMetaMessagingEvent(event, pageId);
        } catch (err) {
          console.error("[META WEBHOOK] Error processing event:", err);
        }
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  } catch (err) {
    console.error("[META WEBHOOK] Fatal error:", err);
    return res.status(200).send("EVENT_RECEIVED");
  }
});

// ==========================================
// 3. ADMIN APIs FOR CONVERSATIONS & HEALTH
// ==========================================
router.get("/conversations", async (req, res) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized admin" });
  try {
    const { channel, status, q } = req.query;
    const conditions = [];
    const params = [];

    if (channel && channel !== "all") {
      conditions.push("c.channel_type = ?");
      params.push(channel);
    }
    if (status && status !== "all") {
      conditions.push("c.status = ?");
      params.push(status);
    }
    if (q && String(q).trim()) {
      conditions.push("(c.sender_name LIKE ? OR c.last_message LIKE ? OR c.listing_title LIKE ? OR c.listing_ref LIKE ?)");
      const like = `%${String(q).trim()}%`;
      params.push(like, like, like, like);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `SELECT c.*, p.title AS property_title, p.price AS property_price, p.district AS property_district
       FROM fb_conversations c
       LEFT JOIN properties p ON c.property_id = p.id
       ${whereSql}
       ORDER BY c.last_message_at DESC
       LIMIT 200`,
      params
    );

    const [[counts]] = await pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN channel_type = 'marketplace' THEN 1 ELSE 0 END) AS marketplace_count,
        SUM(CASE WHEN channel_type = 'page_dm' THEN 1 ELSE 0 END) AS page_dm_count,
        SUM(unread_count) AS total_unread
       FROM fb_conversations`
    );

    res.json({ success: true, conversations: rows, counts: counts || {} });
  } catch (err) {
    console.error("Fetch Meta conversations error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/conversations/:id/messages", async (req, res) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized admin" });
  try {
    const { id } = req.params;
    const [[conv]] = await pool.query("SELECT * FROM fb_conversations WHERE id = ?", [id]);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const [messages] = await pool.query(
      "SELECT * FROM fb_messages WHERE conversation_id = ? ORDER BY sent_at ASC, id ASC",
      [id]
    );

    await pool.query("UPDATE fb_conversations SET unread_count = 0 WHERE id = ?", [id]);
    res.json({ success: true, conversation: conv, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/conversations/:id/reply", async (req, res) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized admin" });
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "Reply text is required" });
    }

    const [[conv]] = await pool.query("SELECT * FROM fb_conversations WHERE id = ?", [id]);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const pageToken = await getSettingValue("facebook_page_access_token");
    if (!pageToken) {
      return res.status(400).json({ error: "Facebook Page Access Token is not configured." });
    }

    const sendRes = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/me/messages?access_token=${encodeURIComponent(pageToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: conv.sender_psid },
          messaging_type: "RESPONSE",
          message: { text: String(text).trim() },
        }),
      }
    );

    const sendJson = await sendRes.json();
    if (!sendRes.ok || sendJson.error) {
      return res.status(400).json({
        error: sendJson.error?.message || "Failed to send Messenger reply",
      });
    }

    const mid = sendJson.message_id || null;
    await pool.query(
      `INSERT INTO fb_messages
       (conversation_id, mid, direction, sender_psid, message_text, is_marketplace, sent_at)
       VALUES (?, ?, 'outbound', ?, ?, ?, NOW())`,
      [conv.id, mid, conv.page_id || "page", String(text).trim(), conv.channel_type === "marketplace" ? 1 : 0]
    );

    await pool.query(
      "UPDATE fb_conversations SET last_message = ?, last_message_at = NOW(), status = 'in_progress' WHERE id = ?",
      [String(text).trim().slice(0, 1000), conv.id]
    );

    res.json({ success: true, messageId: mid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/conversations/:id/status", async (req, res) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized admin" });
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["new", "in_progress", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    await pool.query("UPDATE fb_conversations SET status = ? WHERE id = ?", [status, id]);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/status", async (req, res) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized admin" });
  try {
    const verifyToken = await getSettingValue("facebook_webhook_verify_token", DEFAULT_VERIFY_TOKEN);
    const webhookStatus = await getSettingValue("facebook_webhook_status", "unknown");
    const tokenStatus = await getSettingValue("facebook_token_status", "unknown");
    const tokenExpiresAt = await getSettingValue("facebook_token_expires_at", "");
    const lastHealthCheck = await getSettingValue("facebook_last_health_check", "");
    const subscribedFieldsRaw = await getSettingValue("facebook_subscribed_fields", "[]");
    const appId = await getSettingValue("facebook_app_id", "");
    const pageId = await getSettingValue("facebook_page_id", "");

    let subscribedFields = [];
    try {
      subscribedFields = JSON.parse(subscribedFieldsRaw);
    } catch {
      subscribedFields = [];
    }

    const [recentLogs] = await pool.query(
      "SELECT * FROM fb_webhook_logs ORDER BY created_at DESC LIMIT 15"
    );

    res.json({
      success: true,
      webhookUrl: "https://api.airaproperties.in/api/meta/webhook",
      verifyToken,
      webhookStatus,
      tokenStatus,
      tokenExpiresAt,
      lastHealthCheck,
      subscribedFields,
      appId,
      pageId,
      recentLogs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/config", async (req, res) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized admin" });
  try {
    const { appId, appSecret, verifyToken } = req.body;
    if (appId !== undefined) await upsertSetting("facebook_app_id", String(appId).trim());
    if (appSecret !== undefined && String(appSecret).trim() !== "") {
      await upsertSetting("facebook_app_secret", String(appSecret).trim());
    }
    if (verifyToken !== undefined && String(verifyToken).trim() !== "") {
      await upsertSetting("facebook_webhook_verify_token", String(verifyToken).trim());
    }
    res.json({ success: true, message: "Meta webhook & app settings saved." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify-and-renew", async (req, res) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized admin" });
  const result = await verifyWebhookAndRenewToken();
  res.json({ success: true, ...result });
});

router.post("/test-webhook", async (req, res) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: "Unauthorized admin" });
  try {
    const { channelType = "marketplace", propertyId = 37, message = "Hi, is this property still available?" } = req.body || {};
    const pageId = await getSettingValue("facebook_page_id", "1385544157967865");

    const mockEvent = {
      sender: { id: `test_buyer_${Date.now().toString().slice(-6)}` },
      recipient: { id: pageId },
      timestamp: Date.now(),
      referral:
        channelType === "marketplace"
          ? {
              source: "MARKETPLACE",
              type: "OPEN_THREAD",
              product_id: `aira_${propertyId}`,
              ref: `aira_${propertyId}`,
            }
          : undefined,
      message: {
        mid: `test_mid_${Date.now()}`,
        text: message,
      },
    };

    const processed = await processMetaMessagingEvent(mockEvent, pageId);
    res.json({ success: true, processed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
