export type ActivityCompletionDetail = {
  reason: string;
  datos?: Record<string, unknown>;
  [key: string]: unknown;
};

export const ACTIVITY_READY_EVENT = "bienestar-activity-ready";
export const ACTIVITY_INTERACTION_EVENT = "bienestar-interaccion-data";

export function notifyActivityReady(detail: ActivityCompletionDetail) {
  window.dispatchEvent(
    new CustomEvent(ACTIVITY_READY_EVENT, {
      detail,
    })
  );
}

export function notifyActivityInteraction(detail: Record<string, unknown>) {
  window.dispatchEvent(
    new CustomEvent(ACTIVITY_INTERACTION_EVENT, {
      detail,
    })
  );
}
