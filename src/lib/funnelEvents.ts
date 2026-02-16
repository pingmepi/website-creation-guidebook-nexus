export type FunnelEventName =
  | "design_place_order_cta_clicked"
  | "design_place_order_modal_opened"
  | "design_place_order_modal_closed"
  | "design_place_order_modal_submitted"
  | "design_place_order_validation_failed"
  | "design_place_order_created"
  | "design_place_order_failed";

export interface FunnelEventPayload {
  event: FunnelEventName;
  timestamp: string;
  data?: Record<string, unknown>;
}

export const emitFunnelEvent = (
  event: FunnelEventName,
  data: Record<string, unknown> = {},
): void => {
  const payload: FunnelEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("merekapade:funnel", { detail: payload }));

    const maybeDataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
    if (Array.isArray(maybeDataLayer)) {
      maybeDataLayer.push({ ...payload, event: payload.event });
    }
  }

  console.info("[FunnelEvent]", payload);
};
