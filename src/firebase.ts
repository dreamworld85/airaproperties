// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported, Messaging, MessagePayload } from "firebase/messaging";

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
const app: FirebaseApp = initializeApp(firebaseConfig);
const analytics: Analytics | null = typeof window !== "undefined" ? getAnalytics(app) : null;

// Initialize Messaging conditionally
let messaging: Messaging | null = null;

export async function getFirebaseMessaging(): Promise<Messaging | null> {
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

export interface PushTokenResult {
  success: boolean;
  token?: string;
  error?: string;
  serverRes?: any;
}

export async function requestNotificationPermissionAndGetToken(vapidKey: string | null = null): Promise<PushTokenResult> {
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

    // Register service worker if available and ensure it's active
    let swRegistration: ServiceWorkerRegistration | undefined = undefined;
    if ("serviceWorker" in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
        
        // Wait until service worker is active
        if (swRegistration.installing || swRegistration.waiting) {
          const worker = swRegistration.installing || swRegistration.waiting;
          if (worker && worker.state !== "activated") {
            await new Promise<void>((resolve) => {
              worker.addEventListener("statechange", () => {
                if (worker.state === "activated") resolve();
              });
              setTimeout(resolve, 2000); // Safety timeout
            });
          }
        }
      } catch (swErr) {
        console.warn("[FIREBASE] Service worker registration warning:", swErr);
      }
    }

    const DEFAULT_VAPID_KEY = "BAuy2Qbz3juySoVyEGDKvFkzDgofsNhL6TD_nTpEs_m9qZSaEMj_8l3_sMYIrGn-Fh-PJMXpSCY6iw32y1FWWKk";
    const effectiveVapidKey = vapidKey || (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY || DEFAULT_VAPID_KEY;

    let token: string | undefined;
    try {
      token = await getToken(msg, {
        serviceWorkerRegistration: swRegistration,
        vapidKey: effectiveVapidKey
      });
    } catch (tokenErr: any) {
      console.warn("[FIREBASE] Initial getToken attempt failed:", tokenErr);
      
      // Auto-recovery: If push service error or stale subscription conflict, unsubscribe and retry cleanly
      if (swRegistration?.pushManager) {
        try {
          const staleSub = await swRegistration.pushManager.getSubscription();
          if (staleSub) {
            console.log("[FIREBASE] Unsubscribing stale push subscription...");
            await staleSub.unsubscribe();
          }
          try {
            await swRegistration.update();
          } catch (_updErr) {
            // ignore update error
          }
          token = await getToken(msg, {
            serviceWorkerRegistration: swRegistration,
            vapidKey: effectiveVapidKey
          });
        } catch (retryErr: any) {
          console.error("[FIREBASE] Retry getToken also failed:", retryErr);
          const isBrave = !!(navigator as any).brave || navigator.userAgent.toLowerCase().includes("brave");
          if (isBrave) {
            throw new Error("Brave blocks push notifications by default. In brave://settings/privacy, enable 'Use Google services for push messaging', then restart Brave.");
          }
          const msgStr = retryErr?.message || tokenErr?.message || "";
          if (msgStr.toLowerCase().includes("push service error")) {
            throw new Error("Google Push Service error. Please refresh the page and try again (ensure ad blockers or strict privacy shields are paused for this site).");
          }
          throw retryErr || tokenErr;
        }
      } else {
        throw tokenErr;
      }
    }

    return { success: true, token };
  } catch (err: any) {
    console.error("[FIREBASE] Error requesting notification token:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function onMessageListener(callback: (payload: MessagePayload) => void): Promise<() => void> {
  const msg = await getFirebaseMessaging();
  if (!msg) return () => {};
  return onMessage(msg, (payload) => {
    if (callback) callback(payload);
  });
}

export async function registerTokenWithServer(
  token: string,
  userId: number | string | null = null,
  district: string | null = null
): Promise<any> {
  if (!token) return null;
  try {
    const { getApiUrl } = await import("./lib/api");
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/notifications/register-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId: userId || null, district: district || null })
    });
    return await res.json();
  } catch (err) {
    console.warn("[FIREBASE] Could not register token with server:", err);
    return null;
  }
}

export async function enablePushNotifications(
  userId: number | string | null = null,
  district: string | null = null,
  vapidKey: string | null = null
): Promise<PushTokenResult> {
  // If running inside Android Native App wrapper with Native FCM
  if (typeof window !== "undefined") {
    const nativeBridge = (window as any).AiraNativeApp;
    const nativeToken = nativeBridge?.getNativeFcmToken?.() || (window as any).__AIRA_NATIVE_FCM_TOKEN;
    if (nativeBridge || nativeToken) {
      if (district && nativeBridge?.subscribeDistrict) {
        nativeBridge.subscribeDistrict(district);
      }
      if (nativeToken) {
        const serverRes = await registerTokenWithServer(nativeToken, userId, district);
        return { success: true, token: nativeToken, serverRes };
      }
      return { success: true };
    }
  }

  const result = await requestNotificationPermissionAndGetToken(vapidKey);
  if (result.success && result.token) {
    const serverRes = await registerTokenWithServer(result.token, userId, district);
    return { ...result, serverRes };
  }
  return result;
}

export { app, analytics, messaging, firebaseConfig };
export default app;
