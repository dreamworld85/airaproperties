// Firebase Messaging Service Worker for background notifications & action buttons
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyD2_KrvP7J8oKAFLauY-ketBv8Uvhy_WgU",
  authDomain: "airaproperties.firebaseapp.com",
  projectId: "airaproperties",
  storageBucket: "airaproperties.firebasestorage.app",
  messagingSenderId: "345605747265",
  appId: "1:345605747265:web:5b4db87ea4f28c61640cc0",
  measurementId: "G-NKHKXN8VS1"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[FIREBASE SW] Received background message: ", payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || "Aira Properties Alert";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: payload.notification?.icon || "/app-icon.png",
    badge: "/app-icon.png",
    image: payload.notification?.image || payload.data?.image || undefined,
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || "/",
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
    requireInteraction: true,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click and action buttons
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // If user clicked the Dismiss action button, simply close the alert
  if (event.action === "dismiss") {
    console.log("[FIREBASE SW] User dismissed notification.");
    return;
  }

  // If user clicked 'View Property' or the notification body itself, open target URL
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if open
      for (const client of windowClients) {
        if (client.url.includes("airaproperties.in") && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
