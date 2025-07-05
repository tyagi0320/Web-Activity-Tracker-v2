const sessionId = crypto.randomUUID();

async function getBrowserInfo() {
  if (navigator.brave && await navigator.brave.isBrave()) return "Brave";

  const ua = navigator.userAgent;

  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";

  return "Other";
}

function getPlatform() {
  const ua = navigator.userAgent;

  if (/Win/.test(ua)) return "Windows";
  if (/Mac/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";

  return "Unknown";
}

console.log("Extension loaded");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    (async () => {
      const activity = {
        event: "page_visit",
        url: tab.url,
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        browser: await getBrowserInfo(),   // 👈 Await here
        platform: getPlatform()
      };

      console.log("Sending event:", activity);

      fetch("http://monitor.global-dev.tech/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activity)
      }).catch(err => console.error("Tracking failed:", err));
    })();
  }
});
