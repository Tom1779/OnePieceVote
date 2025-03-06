// components/BrowserDetection.js
import { useState, useEffect } from "react";

export default function BrowserDetection() {
  const [isTwitterBrowser, setIsTwitterBrowser] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent || "";

      // Check for Twitter's in-app browser signatures
      const isTwitter =
        userAgent.includes("Twitter") ||
        userAgent.includes("TwitterWebView") ||
        (userAgent.includes("Mobile") &&
          document.referrer.includes("twitter.com"));

      setIsTwitterBrowser(isTwitter);
    }
  }, []);

  // If not in Twitter browser, don't render anything
  if (!isTwitterBrowser) {
    return null;
  }

  // Get the current URL to use as the redirect target
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const openInBrowser = () => {
    // This will open the link in the default browser
    window.open(currentUrl, "_blank");
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-blue-600 text-white p-4 z-50 text-center">
      <p className="mb-2 font-medium">
        Having trouble signing in? Twitter's browser can cause authentication
        issues.
      </p>
      <button
        onClick={openInBrowser}
        className="bg-white text-blue-600 px-4 py-2 rounded-md font-bold"
      >
        Open in Default Browser
      </button>
    </div>
  );
}
