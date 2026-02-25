// ---------------------------------------------------------------------------
// trackEvent — unified analytics dispatcher for GTM / GA4
// ---------------------------------------------------------------------------
// Usage:
//   import { trackEvent } from "@/lib/trackEvent";
//   trackEvent("login_success", { method: "google", user_id: "abc" });
//
// How it works:
//   1. Pushes { event, ...params } into window.dataLayer (picked up by GTM).
//   2. Fires a CustomEvent "merekapade:track" on window for internal listeners.
//   3. Logs to console in development mode.
// ---------------------------------------------------------------------------

export type TrackEventParams = Record<string, unknown>;

/**
 * Push a custom event into the GTM dataLayer.
 *
 * @param eventName - snake_case event name (e.g. "login_success")
 * @param params    - optional key-value pairs sent alongside the event
 */
export function trackEvent(
  eventName: string,
  params: TrackEventParams = {},
): void {
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...params,
  };

  if (typeof window !== "undefined") {
    // 1. GTM dataLayer
    const w = window as Window & { dataLayer?: unknown[] };
    if (!Array.isArray(w.dataLayer)) {
      w.dataLayer = [];
    }
    w.dataLayer.push(payload);

    // 2. Internal CustomEvent (for in-app listeners / debugging tools)
    window.dispatchEvent(
      new CustomEvent("merekapade:track", { detail: payload }),
    );
  }

  // 3. Dev console
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.info("[TrackEvent]", eventName, params);
  }
}
