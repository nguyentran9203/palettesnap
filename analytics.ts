import posthog from "posthog-js";

let hasInitializedAnalytics = false;

function sanitizePath(): string {
  // Only send pathname — strip query string and hash
  return window.location.pathname || "/";
}

function capturePageview() {
  if (!hasInitializedAnalytics) return;
  posthog.capture("$pageview", { $pathname: sanitizePath() });
}

// Only the published production app should report analytics. The same PostHog
// key is baked into the in-editor sandbox dev server and the live preview as
// into the published build, so without this guard a creator's own editing and
// preview traffic would inflate their real visitor numbers. import.meta.env.PROD
// is false under 'vite dev' (what the sandbox and preview run) and true only in
// the published 'vite build'; the host checks are defense-in-depth for direct
// sandbox URLs (*.e2b.app) and local runs.
function isPublishedProductionApp(): boolean {
  if (!import.meta.env.PROD) {
    return false;
  }

  const host = window.location.hostname;
  return (
    host !== "localhost" &&
    host !== "127.0.0.1" &&
    host !== "::1" &&
    !host.endsWith(".e2b.app")
  );
}

export function initAnalytics() {
  if (hasInitializedAnalytics || typeof window === "undefined") {
    return;
  }

  const apiKey = import.meta.env.VITE_POSTHOG_KEY;
  const apiHost = import.meta.env.VITE_POSTHOG_HOST;

  if (!apiKey || !apiHost) {
    return;
  }

  // Skip the sandbox dev server, the live preview, and local runs — only the
  // published app's traffic should count toward the workspace's analytics.
  if (!isPublishedProductionApp()) {
    return;
  }

  posthog.init(apiKey, {
    api_host: apiHost,
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
  });

  hasInitializedAnalytics = true;

  // Stamp every event with the workspace it belongs to. Michii sends all
  // generated apps to one shared analytics project and separates each
  // workspace's numbers by this property, so it must ride on every event.
  const workspaceId = import.meta.env.VITE_WORKSPACE_ID;
  if (workspaceId) {
    posthog.register({ workspace_id: workspaceId });
  }

  // Capture initial pageview
  capturePageview();

  // Listen for navigation changes (SPA)
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args: Parameters<typeof history.pushState>) => {
    originalPushState(...args);
    capturePageview();
  };
  history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
    originalReplaceState(...args);
    capturePageview();
  };
  window.addEventListener("popstate", capturePageview);
}

/**
 * Track a custom analytics event. Only primitive values are allowed in properties.
 */
export function trackAnalyticsEvent(
  name: string,
  properties?: Record<string, string | number | boolean>,
) {
  if (!hasInitializedAnalytics) return;

  const RESERVED_KEYS = new Set(["$set", "$set_once", "$unset", "$add", "$append"]);
  const safeProps: Record<string, string | number | boolean> = {};

  if (properties) {
    for (const [key, value] of Object.entries(properties)) {
      if (RESERVED_KEYS.has(key)) continue;
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        safeProps[key] = value;
      }
    }
  }

  posthog.capture(name, safeProps);
}
