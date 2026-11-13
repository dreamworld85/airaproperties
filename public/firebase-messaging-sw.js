// Firebase Cloud Messaging Service Worker
// Handles background notifications when the PWA / browser tab is closed

// 1. Import Firebase compat libraries (required in Service Worker context)
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

// 2. Firebase Web Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2_KrvP7J8oKAFLauY-ketBv8Uvhy_WgU",
  authDomain: "airaproperties.firebaseapp.com",
  projectId: "airaproperties",
  storageBucket: "airaproperties.firebasestorage.app",
  messagingSenderId: "345605747265",
  appId: "1:345605747265:web:5b4db87ea4f28c61640cc0",
  measurementId: "G-NKHKXN8VS1"
};

// 3. Initialize Firebase inside Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 4. Lifecycle listeners: activate immediately without waiting
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 5. Handle Background FCM Messages (Triggered when PWA is in background or closed)
messaging.onBackgroundMessage((payload) => {
  console.log("[FIREBASE SW] Received background FCM message:", payload);

  const title = payload.notification?.title || payload.data?.title || "Aira Properties Alert";
  const body = payload.notification?.body || payload.data?.body || "";
  const imageUrl = payload.notification?.image || payload.data?.image || undefined;
  const clickUrl = payload.data?.url || payload.data?.click_action || payload.fcmOptions?.link || "/";

  const options = {
    body,
    icon: payload.notification?.icon || "/icons/icons-512.png",
    badge: "/icons/favicon-32x32.png",
    image: imageUrl,
    data: {
      url: clickUrl,
      propertyId: payload.data?.propertyId,
      district: payload.data?.district,
      price: payload.data?.price,
    },
    actions: [
      {
        action: "view",
        title: "View Property"
      },
      {
        action: "dismiss",
        title: "Dismiss"
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: true,
    tag: payload.data?.propertyId ? `prop-${payload.data.propertyId}` : `aira-alert-${Date.now()}`,
    renotify: true
  };

  return self.registration.showNotification(title, options);
});

// 6. Handle Notification Clicks and Action Buttons
self.addEventListener("notificationclick", (event) => {
  // Always close the notification banner on interaction
  event.notification.close();

  // If user clicked the "Dismiss" action button, simply exit
  if (event.action === "dismiss") {
    console.log("[FIREBASE SW] Notification dismissed by user.");
    return;
  }

  // Target URL to navigate to (e.g. /property/123 or /)
  const targetPath = event.notification.data?.url || "/";
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a browser tab or PWA window is already open, navigate and focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If PWA is closed (no open windows), open a new window to the target URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
