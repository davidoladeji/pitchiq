/**
 * Product event tracking — internal analytics for PitchIQ success signals.
 *
 * This is separate from deck-tracker.ts which handles viewer-side events.
 * Works isomorphically on both client and server.
 */

/* ------------------------------------------------------------------ */
/*  Event types                                                        */
/* ------------------------------------------------------------------ */

export type ProductEvent =
  | { event: "deck.created" }
  | { event: "deck.completed"; properties: { slideCount: number } }
  | { event: "suggestion.shown"; properties: { type: string; slideIndex: number } }
  | { event: "suggestion.accepted"; properties: { type: string; slideIndex: number } }
  | { event: "suggestion.dismissed"; properties: { type: string; slideIndex: number } }
  | { event: "score.viewed"; properties: { score: number } }
  | { event: "score.improved"; properties: { delta: number; from: number; to: number } }
  | { event: "investor.matched"; properties: { count: number; source?: string } }
  | { event: "investor.saved_to_pipeline"; properties: { investorName: string } }
  | { event: "crm.followup_set"; properties: { contactId: string } }
  | { event: "crm.followup_completed"; properties: { contactId: string } }
  | { event: "analytics.viewed"; properties: { deckId: string } }
  | { event: "analytics.recommendation_acted"; properties: { type: string } }
  | { event: "version.restored"; properties: { versionId: string } }
  | { event: "autosave.triggered" }
  | { event: "autosave.completed" };

/* ------------------------------------------------------------------ */
/*  Buffered event with timestamp                                      */
/* ------------------------------------------------------------------ */

export interface BufferedEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

/* ------------------------------------------------------------------ */
/*  In-memory ring buffer (last 100 events)                            */
/* ------------------------------------------------------------------ */

const MAX_BUFFER_SIZE = 100;
const eventBuffer: BufferedEvent[] = [];

/* ------------------------------------------------------------------ */
/*  trackEvent — main entry point                                      */
/* ------------------------------------------------------------------ */

export function trackEvent(productEvent: ProductEvent): void {
  const entry: BufferedEvent = {
    event: productEvent.event,
    properties: "properties" in productEvent ? productEvent.properties : undefined,
    timestamp: Date.now(),
  };

  // Push to ring buffer
  eventBuffer.push(entry);
  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.shift();
  }

  // Dev-mode console logging
  if (process.env.NODE_ENV === "development") {
    const props = entry.properties ? ` ${JSON.stringify(entry.properties)}` : "";
    // eslint-disable-next-line no-console
    console.log(`[PIQ Event] ${entry.event}${props}`);
  }
}

/* ------------------------------------------------------------------ */
/*  getEventBuffer — read buffered events (for debugging / tests)      */
/* ------------------------------------------------------------------ */

export function getEventBuffer(): ReadonlyArray<BufferedEvent> {
  return [...eventBuffer];
}

/* ------------------------------------------------------------------ */
/*  flush — stub for future analytics service integration              */
/* ------------------------------------------------------------------ */

export async function flush(): Promise<void> {
  // TODO: Send eventBuffer contents to an external analytics service
  // e.g. POST to /api/analytics/ingest or a third-party SDK.
  //
  // For now this is a no-op stub. When implemented, it should:
  // 1. Copy the current buffer
  // 2. Clear the buffer
  // 3. Send the copied events to the analytics backend
  // 4. On failure, re-add events to the buffer
}
