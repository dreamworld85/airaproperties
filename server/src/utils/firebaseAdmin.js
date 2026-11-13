import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseAdminInitialized = false;
let firebaseInitError = null;

export function initFirebaseAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    firebaseAdminInitialized = true;
    return getApp();
  }

  try {
    let credential = null;

    // 1. Check for raw JSON string in env
    if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith("{")) {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.trim());
      credential = cert(parsed);
    } 
    // 2. Check for file path in env
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
      credential = cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      console.log(`[FIREBASE ADMIN] Loaded service account credential from FIREBASE_SERVICE_ACCOUNT_PATH: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}`);
    }
    else if (process.env.FIREBASE_SERVICE_ACCOUNT && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT)) {
      credential = cert(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log(`[FIREBASE ADMIN] Loaded service account credential from FIREBASE_SERVICE_ACCOUNT: ${process.env.FIREBASE_SERVICE_ACCOUNT}`);
    }
    // 3. Check for standard service account file in server/ or root
    else {
      const candidatePaths = [
        path.resolve(process.cwd(), "firebase-service-account.json"),
        path.resolve(process.cwd(), "serviceAccountKey.json"),
        path.resolve(process.cwd(), "server", "firebase-service-account.json"),
        path.resolve(process.cwd(), "server", "serviceAccountKey.json"),
        path.resolve(process.cwd(), "..", "firebase-service-account.json"),
        path.resolve(__dirname, "..", "..", "firebase-service-account.json"),
        path.resolve(__dirname, "..", "..", "serviceAccountKey.json"),
        path.resolve(__dirname, "..", "..", "..", "firebase-service-account.json"),
      ];
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          credential = cert(p);
          console.log(`[FIREBASE ADMIN] Loaded service account credential from: ${p}`);
          break;
        }
      }
    }

    if (credential) {
      const app = initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID || "airaproperties",
      });
      firebaseAdminInitialized = true;
      console.log("[FIREBASE ADMIN] Initialized with Service Account certificate successfully.");
      return app;
    }

    // Fallback: Initialize with project id
    const projectId = process.env.FIREBASE_PROJECT_ID || "airaproperties";
    const app = initializeApp({ projectId });
    firebaseAdminInitialized = true;
    console.log(`[FIREBASE ADMIN] Initialized with Project ID: ${projectId}`);
    return app;
  } catch (err) {
    firebaseInitError = err.message;
    console.warn(`[FIREBASE ADMIN] Initialization warning: ${err.message}. Push notifications will run in dry-run mode until valid service account credentials are provided.`);
    return null;
  }
}

export function isFirebaseAdminReady() {
  if (!firebaseAdminInitialized && getApps().length === 0) {
    initFirebaseAdmin();
  }
  return firebaseAdminInitialized && !firebaseInitError;
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
    initFirebaseAdmin();
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
    initFirebaseAdmin();
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
