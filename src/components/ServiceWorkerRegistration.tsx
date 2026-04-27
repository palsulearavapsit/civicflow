"use client";

import { useEffect } from "react";

/**
 * Client-side component to handle Service Worker registration.
 * This must be a separate component to keep the RootLayout as a Server Component.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.log("SW registration failed:", err));
    }
  }, []);

  return null;
}
