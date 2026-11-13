import { getApps, initializeApp, cert, getApp, deleteApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseAdminInitialized = false;
let firebaseInitError = null;
let currentServiceAccountConfig = null;
let currentClientEmail = null;
let currentProjectId = "airaproperties";
let hasValidServiceAccount = false;

export async function loadServiceAccountFromDb() {
  try {
    const [[row]] = await pool.query("SELECT `value` FROM settings WHERE `key` = 'firebase_service_account_json'");
    if (row && row.value) {
      const parsed = JSON.parse(row.value.trim());
      if (parsed && (parsed.private_key || parsed.project_id)) {
        return parsed;
      }
    }
  } catch (_e) {}
  return null;
}

export function initFirebaseAdmin(forceReload = false) {
  if (!forceReload && hasValidServiceAccount && getApps().length > 0) {
    return getApp();
  }

  try {
    let credential = null;
    let parsedConfig = currentServiceAccountConfig;

    // 1. In-memory DB config
    if (parsedConfig && parsedConfig.private_key) {
      credential = cert(parsedConfig);
      currentClientEmail = parsedConfig.client_email || null;
      currentProjectId = parsedConfig.project_id || currentProjectId;
    }
    // 2. Raw JSON string in env
    else if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.trim());
        if (parsed.private_key) {
          credential = cert(parsed);
          currentClientEmail = parsed.client_email || null;
          currentProjectId = parsed.project_id || currentProjectId;
        }
      } catch (jsonErr) {
        console.warn("[FIREBASE ADMIN] Invalid JSON in FIREBASE_SERVICE_ACCOUNT:", jsonErr.message);
      }
    } 
    // 3. File path in FIREBASE_SERVICE_ACCOUNT_PATH
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
      try {
        const content = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8");
        const parsed = JSON.parse(content.trim());
        if (parsed.private_key) {
          credential = cert(parsed);
          currentClientEmail = parsed.client_email || null;
          currentProjectId = parsed.project_id || currentProjectId;
        }
      } catch (readErr) {
        console.warn("[FIREBASE ADMIN] Could not load service account from FIREBASE_SERVICE_ACCOUNT_PATH:", readErr.message);
      }
    }
    // 4. File path in FIREBASE_SERVICE_ACCOUNT
    else if (process.env.FIREBASE_SERVICE_ACCOUNT && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT)) {
      try {
        const content = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT, "utf8");
        const parsed = JSON.parse(content.trim());
        if (parsed.private_key) {
          credential = cert(parsed);
          currentClientEmail = parsed.client_email || null;
          currentProjectId = parsed.project_id || currentProjectId;
        }
      } catch (readErr) {
        console.warn("[FIREBASE ADMIN] Could not load service account from FIREBASE_SERVICE_ACCOUNT:", readErr.message);
      }
    }
    // 5. Check candidate file paths
    else {
      const candidatePaths = [
        path.resolve(process.cwd(), "firebase-service-account.json"),
        path.resolve(process.cwd(), "serviceAccountKey.json"),
        path.resolve(process.cwd(), "server", "firebase-service-account.json"),
        path.resolve(process.cwd(), "server", "serviceAccountKey.json"),
        path.resolve(process.cwd(), "..", "firebase-service-account.json"),
        path.resolve(__dirname, "..", "..", "firebase-service-account.json"),
        path.resolve(__dirname, "..", "..", "serviceAccountKey.json"),
      ];

      // Also scan candidate directories for any *adminsdk*.json or *service-account*.json
      const scanDirs = [
        process.cwd(),
        path.resolve(process.cwd(), "server"),
        path.resolve(__dirname, "..", ".."),
        path.resolve(__dirname, "..", "..", "server")
      ];
      for (const d of scanDirs) {
        try {
          if (fs.existsSync(d) && fs.statSync(d).isDirectory()) {
            const files = fs.readdirSync(d);
            for (const f of files) {
              if (f.endsWith(".json") && (f.includes("adminsdk") || f.includes("firebase-service-account") || f.includes("serviceAccount"))) {
                candidatePaths.unshift(path.resolve(d, f));
              }
            }
          }
        } catch (_e) {}
      }
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          try {
            const content = fs.readFileSync(p, "utf8");
            const parsed = JSON.parse(content.trim());
            if (parsed.private_key) {
              credential = cert(parsed);
              currentClientEmail = parsed.client_email || null;
              currentProjectId = parsed.project_id || currentProjectId;
              console.log(`[FIREBASE ADMIN] Loaded service account credential from: ${p}`);
              break;
            }
          } catch (_e) {}
        }
      }
    }

    // Clean up existing app if reinitializing
    if (getApps().length > 0 && forceReload) {
      deleteApp(getApp()).catch(() => {});
    }

    if (credential) {
      const app = initializeApp({
        credential,
        projectId: currentProjectId,
      });
      firebaseAdminInitialized = true;
      hasValidServiceAccount = true;
      firebaseInitError = null;
      console.log(`[FIREBASE ADMIN] Initialized with Service Account for project "${currentProjectId}" (${currentClientEmail || "cert"})`);
      return app;
    }

    // If no credential provided, do not initialize with ApplicationDefault
    hasValidServiceAccount = false;
    firebaseAdminInitialized = false;
    firebaseInitError = "Service Account Key JSON is not configured.";
    return null;
  } catch (err) {
    firebaseInitError = err.message;
    hasValidServiceAccount = false;
    firebaseAdminInitialized = false;
    console.warn(`[FIREBASE ADMIN] Initialization warning: ${err.message}`);
    return null;
  }
}

export async function ensureFirebaseAdminInitialized() {
  if (!hasValidServiceAccount || getApps().length === 0) {
    if (!currentServiceAccountConfig) {
      const dbConfig = await loadServiceAccountFromDb();
      if (dbConfig) {
        currentServiceAccountConfig = dbConfig;
      }
    }
    initFirebaseAdmin(true);
  }
  return hasValidServiceAccount;
}

export function isFirebaseAdminReady() {
  return hasValidServiceAccount;
}

export function getFirebaseAdminDetails() {
  return {
    ready: hasValidServiceAccount,
    hasCredential: hasValidServiceAccount,
    clientEmail: currentClientEmail,
    projectId: currentProjectId,
    error: firebaseInitError,
  };
}

export async function setFirebaseServiceAccount(jsonInput) {
  let parsed;
  if (typeof jsonInput === "string") {
    parsed = JSON.parse(jsonInput.trim());
  } else {
    parsed = jsonInput;
  }

  if (!parsed.private_key) {
    throw new Error("Invalid service account JSON: 'private_key' is required.");
  }
  if (!parsed.client_email) {
    throw new Error("Invalid service account JSON: 'client_email' is required.");
  }

  const jsonString = JSON.stringify(parsed);

  // 1. Save in settings DB table
  await pool.query(
    "INSERT INTO settings (`key`, `value`) VALUES ('firebase_service_account_json', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
    [jsonString]
  );

  // 2. Also write to local file for persistence
  try {
    const filePath = path.resolve(process.cwd(), "firebase-service-account.json");
    fs.writeFileSync(filePath, jsonString, "utf8");
  } catch (_e) {}

  currentServiceAccountConfig = parsed;
  initFirebaseAdmin(true);

  return {
    success: true,
    clientEmail: currentClientEmail,
    projectId: currentProjectId,
  };
}

export function districtToTopic(district) {
  if (!district) return "all_districts";
  const clean = String(district).trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
  return `district_${clean}`;
}

export function formatPrice(price) {
  const num = Number(price);
  if (!num || isNaN(num)) return "₹0";
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} Lakhs`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

export async function sendNotificationToTopic({ topic, title, body, imageUrl, clickAction, data, actions }) {
  const defaultActions = [
    { action: "view", title: "View Property" },
    { action: "dismiss", title: "Dismiss" }
  ];

  const payload = {
    topic: topic || "all_users",
    notification: {
      title,
      body,
      ...(imageUrl ? { imageUrl } : {})
    },
    data: {
      title: String(title || ""),
      body: String(body || ""),
      ...(imageUrl ? { image: String(imageUrl) } : {}),
      ...(clickAction ? { url: String(clickAction), click_action: String(clickAction) } : {}),
      ...(data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v ?? "")])) : {})
    },
    webpush: {
      notification: {
        title,
        body,
        icon: "https://airaproperties.in/app-icon.png",
        badge: "https://airaproperties.in/app-icon.png",
        ...(imageUrl ? { image: imageUrl } : {}),
        actions: actions || defaultActions,
        requireInteraction: true,
      },
      fcmOptions: {
        link: clickAction || "https://airaproperties.in"
      }
    }
  };

  let messageId = null;
  let status = "sent";
  let errorMessage = null;

  try {
    await ensureFirebaseAdminInitialized();
    if (!hasValidServiceAccount) {
      throw new Error("Firebase Service Account key is missing. Please paste your Service Account Key JSON in Admin -> Push Notifications to activate live push sending.");
    }
    const messaging = getMessaging(getApp());
    const response = await messaging.send(payload);
    messageId = response;
    console.log(`[FIREBASE FCM] Notification published successfully to topic "${topic}": ${response}`);
  } catch (err) {
    status = "failed";
    errorMessage = err.message || "FCM send error";
    console.error(`[FIREBASE FCM] Failed sending to topic "${topic}":`, err.message);
  }

  // Record in database
  try {
    await pool.query(
      `INSERT INTO push_notifications 
       (title, body, image_url, click_action, target_type, target_topic, status, error_message)
       VALUES (?, ?, ?, ?, 'topic', ?, ?, ?)`,
      [
        title,
        body,
        imageUrl || null,
        clickAction || null,
        topic,
        status,
        errorMessage
      ]
    );
  } catch (dbErr) {
    console.warn("[FIREBASE FCM] Could not log notification to DB:", dbErr.message);
  }

  return { success: status === "sent", messageId, error: errorMessage };
}

export async function subscribeTokenToTopic(token, topic) {
  if (!token || !topic) return null;
  try {
    await ensureFirebaseAdminInitialized();
    if (!hasValidServiceAccount) {
      console.warn("[FIREBASE FCM] Cannot subscribe token: service account key not configured.");
      return null;
    }
    const messaging = getMessaging(getApp());
    const response = await messaging.subscribeToTopic(token, topic);
    console.log(`[FIREBASE FCM] Subscribed token to topic "${topic}":`, response);
    return response;
  } catch (err) {
    console.warn(`[FIREBASE FCM] Error subscribing token to topic "${topic}":`, err.message);
    return null;
  }
}

export async function sendPropertySubmissionNotification(property, firstMediaUrl = null) {
  if (!property) return null;

  const district = property.district || "Kerala";
  const topic = districtToTopic(district);
  const formattedPrice = formatPrice(property.price);
  
  let imageUrl = firstMediaUrl;
  if (!imageUrl && property.cover_image) {
    imageUrl = property.cover_image;
  }
  if (imageUrl && !imageUrl.startsWith("http")) {
    imageUrl = `https://airaproperties.in${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  }
  if (!imageUrl) {
    imageUrl = "https://airaproperties.in/app-icon.png";
  }

  const title = `New Property in ${district}!`;
  const body = `${property.title} • ${formattedPrice} • ${property.district}`;
  const clickAction = `https://airaproperties.in/property/${property.id}`;

  const notificationData = {
    propertyId: String(property.id),
    name: String(property.title || ""),
    price: String(property.price || ""),
    district: String(district),
    location: String(property.address || district),
    image: String(imageUrl),
    url: String(clickAction)
  };

  console.log(`[FIREBASE FCM] Triggering new property notification for #${property.id} on topic "${topic}"`);

  // Publish to the specific district topic
  const result = await sendNotificationToTopic({
    topic,
    title,
    body,
    imageUrl,
    clickAction,
    data: notificationData,
    actions: [
      { action: "view", title: "View Property" },
      { action: "dismiss", title: "Dismiss" }
    ]
  });

  return result;
}
