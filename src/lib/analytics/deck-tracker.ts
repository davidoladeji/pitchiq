export type TrackEventType =
  | "slide_viewed"
  | "slide_time"
  | "scroll_depth"
  | "link_clicked"
  | "deck_completed";

export interface TrackEvent {
  type: TrackEventType;
  slideIndex: number;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface DeckViewSession {
  viewerId: string;
  deckShareId: string;
  startedAt: number;
  events: TrackEvent[];
  slideTimers: Record<number, number>;
  currentSlideIndex: number;
  completed: boolean;
}

const VIEWER_ID_KEY = "piq_viewer_id";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class DeckTracker {
  private session: DeckViewSession;
  private currentSlideStart: number | null = null;
  private viewId: string;
  private boundFlush: () => void;
  private boundVisibility: () => void;

  constructor(deckShareId: string, viewId: string) {
    this.viewId = viewId;
    this.session = {
      viewerId: this.getOrCreateViewerId(),
      deckShareId,
      startedAt: Date.now(),
      events: [],
      slideTimers: {},
      currentSlideIndex: -1,
      completed: false,
    };

    this.boundFlush = () => this.flush();
    this.boundVisibility = () => {
      if (document.visibilityState === "hidden") {
        this.flush();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this.boundFlush);
      document.addEventListener("visibilitychange", this.boundVisibility);
    }
  }

  getOrCreateViewerId(): string {
    if (typeof window === "undefined") return generateUUID();

    const existing = localStorage.getItem(VIEWER_ID_KEY);
    if (existing) return existing;

    const id = generateUUID();
    localStorage.setItem(VIEWER_ID_KEY, id);
    return id;
  }

  trackSlideView(slideIndex: number): void {
    const now = performance.now();

    // Stop timer for previous slide
    if (
      this.session.currentSlideIndex >= 0 &&
      this.currentSlideStart !== null
    ) {
      const elapsed = now - this.currentSlideStart;
      const prev = this.session.currentSlideIndex;
      this.session.slideTimers[prev] =
        (this.session.slideTimers[prev] || 0) + elapsed;
    }

    // Record event
    this.session.events.push({
      type: "slide_viewed",
      slideIndex,
      timestamp: Date.now(),
    });

    // Start timer for new slide
    this.session.currentSlideIndex = slideIndex;
    this.currentSlideStart = now;
  }

  trackLinkClick(url: string, slideIndex: number): void {
    this.session.events.push({
      type: "link_clicked",
      slideIndex,
      timestamp: Date.now(),
      data: { url },
    });
  }

  markCompleted(): void {
    this.session.completed = true;
    this.session.events.push({
      type: "deck_completed",
      slideIndex: this.session.currentSlideIndex,
      timestamp: Date.now(),
    });
  }

  getSlideTimers(): Record<number, number> {
    // Include in-progress slide time
    const timers = { ...this.session.slideTimers };
    if (
      this.session.currentSlideIndex >= 0 &&
      this.currentSlideStart !== null
    ) {
      const elapsed = performance.now() - this.currentSlideStart;
      const idx = this.session.currentSlideIndex;
      timers[idx] = (timers[idx] || 0) + elapsed;
    }
    return timers;
  }

  getSession(): DeckViewSession {
    return { ...this.session, slideTimers: this.getSlideTimers() };
  }

  flush(): void {
    const timers = this.getSlideTimers();
    const totalTime = Object.values(timers).reduce((s, t) => s + t, 0);
    const slideViews = Object.entries(timers).map(([idx, time]) => ({
      slideIndex: Number(idx),
      time: Math.round(time),
    }));

    const payload = JSON.stringify({
      viewId: this.viewId,
      slideViews,
      totalTime: Math.round(totalTime / 1000), // convert ms to seconds
    });

    const url = `/api/decks/${this.session.deckShareId}/analytics`;

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silent fail on flush — best effort
      });
    }
  }

  cleanup(): void {
    // Accumulate final slide time before cleanup
    if (
      this.session.currentSlideIndex >= 0 &&
      this.currentSlideStart !== null
    ) {
      const elapsed = performance.now() - this.currentSlideStart;
      const idx = this.session.currentSlideIndex;
      this.session.slideTimers[idx] =
        (this.session.slideTimers[idx] || 0) + elapsed;
      this.currentSlideStart = null;
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("beforeunload", this.boundFlush);
      document.removeEventListener("visibilitychange", this.boundVisibility);
    }
  }
}
