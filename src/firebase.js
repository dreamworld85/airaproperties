// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2_KrvP7J8oKAFLauY-ketBv8Uvhy_WgU",
  authDomain: "airaproperties.firebaseapp.com",
  projectId: "airaproperties",
  storageBucket: "airaproperties.firebasestorage.app",
  messagingSenderId: "345605747265",
  appId: "1:345605747265:web:5b4db87ea4f28c61640cc0",
  measurementId: "G-NKHKXN8VS1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Initialize Messaging conditionally
let messaging = null;

export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  if (messaging) return messaging;
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    }
  } catch (err) {
    console.warn("[FIREBASE] Messaging not supported or blocked in this browser:", err);
  }
  return null;
}

export async function requestNotificationPermissionAndGetToken(vapidKey = null) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { success: false, error: "Notifications not supported in this browser" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Notification permission denied" };
    }

    const msg = await getFirebaseMessaging();
    if (!msg) {
      return { success: false, error: "Firebase messaging not initialized" };
    }

    // Register service worker if available
    let swRegistration = undefined;
    if ("serviceWorker" in navigator) {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    }

    const token = await getToken(msg, {
      serviceWorkerRegistration: swRegistration,
      vapidKey: vapidKey || undefined
    });

    return { success: true, token };
  } catch (err) {
    console.error("[FIREBASE] Error requesting notification token:", err);
    return { success: false, error: err.message };
  }
}

export async function onMessageListener(callback) {
  const msg = await getFirebaseMessaging();
  if (!msg) return () => {};
  return onMessage(msg, (payload) => {
    if (callback) callback(payload);
  });
}

export async function registerTokenWithServer(token, userId = null, district = null) {
  if (!token) return;
  try {
    const { getApiUrl } = await import("./lib/api");
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/notifications/register-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId, district })
    });
    return await res.json();
  } catch (err) {
    console.warn("[FIREBASE] Could not register token with server:", err);
    return null;
  }
}

export { app, analytics, messaging, firebaseConfig };
export default app;
