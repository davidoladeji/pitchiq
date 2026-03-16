"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import SlideRenderer from "@/components/SlideRenderer";
import { SlideData } from "@/lib/types";
import type { PracticeFeedback } from "@/lib/practice-feedback";

interface SlideTiming {
  slideIndex: number;
  duration: number;
  transcript?: string;
}

interface PastSession {
  id: string;
  duration: number;
  score: number | null;
  status: string;
  createdAt: string;
}

interface DeckInfo {
  id: string;
  shareId: string;
  title: string;
  companyName: string;
  slides: SlideData[];
  themeId: string;
}

type Phase = "setup" | "practice" | "review";

const TARGET_OPTIONS = [
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
  { label: "10 min", value: 600 },
  { label: "Custom", value: 0 },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-500"
      : score >= 60
        ? "text-amber-500"
        : "text-red-500";
  const bgColor =
    score >= 80
      ? "bg-emerald-50 border-emerald-200"
      : score >= 60
        ? "bg-amber-50 border-amber-200"
        : "bg-red-50 border-red-200";

  return (
    <div className={`inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 ${bgColor}`}>
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-navy-400 font-medium">/ 100</span>
    </div>
  );
}

export default function PitchPracticeClient({
  deck,
  pastSessions: initialPastSessions,
}: {
  deck: DeckInfo;
  pastSessions: PastSession[];
}) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [targetDuration, setTargetDuration] = useState(300);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [isCustom, setIsCustom] = useState(false);

  // Practice state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [slideElapsed, setSlideElapsed] = useState(0);
  const [slideTimings, setSlideTimings] = useState<SlideTiming[]>([]);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");

  // Review state
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [pastSessions, setPastSessions] = useState<PastSession[]>(initialPastSessions);

  // API error
  const [apiError, setApiError] = useState("");

  // Refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideStartRef = useRef<number>(Date.now());
  const recognitionRef = useRef<unknown>(null);
  const transcriptsRef = useRef<Record<number, string>>({});
  const slideTimingsRef = useRef<SlideTiming[]>([]);

  const slideCount = deck.slides.length;
  const recommendedPerSlide = Math.round(targetDuration / slideCount);

  // Check speech recognition support
  useEffect(() => {
    try {
      const SpeechRecognition =
        (window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    } catch {
      // Not supported
    }
  }, []);

  // Timer
  useEffect(() => {
    if (phase === "practice") {
      timerRef.current = setInterval(() => {
        setTotalElapsed((p) => p + 1);
        setSlideElapsed((p) => p + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Keyboard navigation during practice
  useEffect(() => {
    if (phase !== "practice") return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowEndConfirm(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentSlide]);

  const recordSlideTime = useCallback(
    (slideIndex: number) => {
      const elapsed = Math.round((Date.now() - slideStartRef.current) / 1000);
      const transcript = transcriptsRef.current[slideIndex] || undefined;

      setSlideTimings((prev) => {
        const existing = prev.findIndex((t) => t.slideIndex === slideIndex);
        let updated: SlideTiming[];
        if (existing >= 0) {
          updated = [...prev];
          updated[existing] = {
            slideIndex,
            duration: prev[existing].duration + elapsed,
            transcript: transcript
              ? (prev[existing].transcript || "") + " " + transcript
              : prev[existing].transcript,
          };
        } else {
          updated = [...prev, { slideIndex, duration: elapsed, transcript }];
        }
        slideTimingsRef.current = updated;
        return updated;
      });

      slideStartRef.current = Date.now();
      setSlideElapsed(0);
      // Clear transcript for new slide
      transcriptsRef.current[slideIndex] = "";
    },
    []
  );

  const goToNextSlide = useCallback(() => {
    if (currentSlide < slideCount - 1) {
      recordSlideTime(currentSlide);
      setCurrentSlide((p) => p + 1);
    }
  }, [currentSlide, slideCount, recordSlideTime]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      recordSlideTime(currentSlide);
      setCurrentSlide((p) => p - 1);
    }
  }, [currentSlide, recordSlideTime]);

  // Speech recognition
  const startListening = useCallback(() => {
    if (!speechSupported) return;
    try {
      const SpeechRecognition =
        (window as unknown as Record<string, unknown>).SpeechRecognition ||
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const last = event.results[event.results.length - 1];
        if (last.isFinal) {
          const text = last[0].transcript;
          transcriptsRef.current[currentSlide] =
            (transcriptsRef.current[currentSlide] || "") + " " + text;
          setCurrentTranscript((p) => p + " " + text);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setCurrentTranscript("");
    } catch {
      setSpeechSupported(false);
    }
  }, [speechSupported, currentSlide]);

  const stopListening = useCallback(() => {
    try {
      if (recognitionRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (recognitionRef.current as any).stop();
      }
    } catch {
      // ignore
    }
    setIsListening(false);
    recognitionRef.current = null;
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Start practice session
  const handleStart = async () => {
    setApiError("");
    const effectiveTarget = isCustom ? customMinutes * 60 : targetDuration;

    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId: deck.id,
          targetDuration: effectiveTarget,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setApiError(data.error || "Failed to start session");
        return;
      }

      const data = await res.json();
      setSessionId(data.id);
      setTargetDuration(effectiveTarget);
      setCurrentSlide(0);
      setTotalElapsed(0);
      setSlideElapsed(0);
      setSlideTimings([]);
      slideTimingsRef.current = [];
      transcriptsRef.current = {};
      slideStartRef.current = Date.now();
      setPhase("practice");
    } catch {
      setApiError("Network error. Please try again.");
    }
  };

  // End practice and move to review
  const handleEndPractice = async () => {
    // Record final slide time
    recordSlideTime(currentSlide);
    stopListening();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setShowEndConfirm(false);
    setPhase("review");
    setFeedbackLoading(true);
    setFeedbackError("");

    // Use ref for latest timings since state may not be updated yet
    const finalTimings = slideTimingsRef.current;

    if (!sessionId) {
      setFeedbackError("No session ID found");
      setFeedbackLoading(false);
      return;
    }

    try {
      // Save progress first
      await fetch(`/api/practice/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideTimings: finalTimings,
          duration: totalElapsed,
          status: "completed",
        }),
      });

      // Request AI feedback
      const res = await fetch(`/api/practice/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideTimings: finalTimings,
          totalDuration: totalElapsed,
          targetDuration,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate feedback");
      }

      const data = await res.json();
      setFeedback(data.feedback);

      // Update past sessions list
      setPastSessions((prev) => [
        {
          id: sessionId,
          duration: totalElapsed,
          score: data.feedback.overallScore,
          status: "completed",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setFeedbackError(
        err instanceof Error ? err.message : "Failed to generate feedback"
      );
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handlePracticeAgain = () => {
    setPhase("setup");
    setSessionId(null);
    setFeedback(null);
    setFeedbackError("");
    setCurrentSlide(0);
    setTotalElapsed(0);
    setSlideElapsed(0);
    setSlideTimings([]);
    slideTimingsRef.current = [];
    transcriptsRef.current = {};
    setCurrentTranscript("");
    setShowEndConfirm(false);
  };

  // -- SETUP PHASE --
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-navy-50">
        <AppNav />
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-navy">Pitch Practice</h1>
              <p className="text-sm text-navy-500 mt-1">
                {deck.title} &middot; {slideCount} slides
              </p>
            </div>
            <Link
              href={`/deck/${deck.shareId}`}
              className="px-4 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy hover:bg-white transition-colors"
            >
              View Deck
            </Link>
          </div>

          {/* Deck Preview */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 space-y-5">
            <h2 className="text-base font-bold text-navy">Deck Preview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {deck.slides.map((slide, i) => (
                <div
                  key={i}
                  className="aspect-[16/9] rounded-lg border border-navy-100 overflow-hidden bg-navy-50 relative group"
                >
                  <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%]">
                    <SlideRenderer
                      slides={[slide]}
                      companyName={deck.companyName}
                      showBranding={false}
                      themeId={deck.themeId}
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                    <span className="text-[10px] text-white font-medium">
                      {i + 1}. {slide.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="rounded-2xl border border-navy-100 bg-white p-6 space-y-5">
            <h2 className="text-base font-bold text-navy">Practice Settings</h2>

            <div>
              <label className="text-sm font-medium text-navy-600 mb-2 block">
                Target Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {TARGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      if (opt.value === 0) {
                        setIsCustom(true);
                      } else {
                        setIsCustom(false);
                        setTargetDuration(opt.value);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      (!isCustom && targetDuration === opt.value) ||
                      (isCustom && opt.value === 0)
                        ? "bg-electric text-white border-electric"
                        : "bg-white text-navy border-navy-200 hover:border-navy-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {isCustom && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={customMinutes}
                    onChange={(e) =>
                      setCustomMinutes(
                        Math.max(1, Math.min(60, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-20 px-3 py-2 rounded-lg border border-navy-200 text-sm bg-white focus:ring-2 focus:ring-electric/30 focus:border-electric outline-none"
                  />
                  <span className="text-sm text-navy-500">minutes</span>
                </div>
              )}

              <p className="text-xs text-navy-400 mt-2">
                ~{Math.round((isCustom ? customMinutes * 60 : targetDuration) / slideCount)}s per slide recommended
              </p>
            </div>

            {apiError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                {apiError}
              </div>
            )}

            <button
              onClick={handleStart}
              className="px-8 py-3 rounded-xl bg-electric text-white font-bold text-base hover:bg-electric-light transition-colors shadow-sm"
            >
              Start Practice
            </button>
          </div>

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div className="rounded-2xl border border-navy-100 bg-white p-6 space-y-4">
              <h2 className="text-base font-bold text-navy">Past Sessions</h2>
              <div className="space-y-2">
                {pastSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-navy-100 hover:bg-navy-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          s.status === "completed"
                            ? "bg-emerald-400"
                            : s.status === "in_progress"
                              ? "bg-amber-400"
                              : "bg-navy-300"
                        }`}
                      />
                      <div>
                        <span className="text-sm font-medium text-navy">
                          {formatTime(s.duration)}
                        </span>
                        <span className="text-xs text-navy-400 ml-2">
                          {formatDate(s.createdAt)}
                        </span>
                      </div>
                    </div>
                    {s.score !== null && (
                      <span
                        className={`text-sm font-bold ${
                          s.score >= 80
                            ? "text-emerald-600"
                            : s.score >= 60
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        {s.score}/100
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // -- PRACTICE PHASE --
  if (phase === "practice") {
    const overTarget = totalElapsed > targetDuration;
    const slideOverTarget = slideElapsed > recommendedPerSlide;
    const slideWarning = slideElapsed > recommendedPerSlide * 0.8;

    return (
      <div className="min-h-screen bg-navy-900 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-navy-800/80 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white/60">
              Slide {currentSlide + 1} of {slideCount}
            </span>
            {speechSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  isListening
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "bg-white/10 text-white/60 hover:bg-white/20 border border-white/10"
                }`}
              >
                {isListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    Listening...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    Mic Off
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-6">
            {/* Slide timer */}
            <div className="text-center">
              <span className="text-[10px] text-white/40 block">Slide</span>
              <span
                className={`text-lg font-mono font-bold ${
                  slideOverTarget
                    ? "text-red-400"
                    : slideWarning
                      ? "text-amber-400"
                      : "text-white"
                }`}
              >
                {formatTime(slideElapsed)}
              </span>
              <span className="text-[10px] text-white/30 block">
                / {formatTime(recommendedPerSlide)}
              </span>
            </div>

            {/* Total timer */}
            <div className="text-center">
              <span className="text-[10px] text-white/40 block">Total</span>
              <span
                className={`text-lg font-mono font-bold ${
                  overTarget ? "text-red-400" : "text-white"
                }`}
              >
                {formatTime(totalElapsed)}
              </span>
              <span className="text-[10px] text-white/30 block">
                / {formatTime(targetDuration)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowEndConfirm(true)}
            className="px-4 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30 hover:bg-red-500/30 transition-colors"
          >
            End Practice
          </button>
        </div>

        {/* Slide area — render only the current slide to avoid SlideRenderer's internal nav conflicts */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-5xl">
            <div className="relative aspect-[16/9] w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-premium-lg border border-white/10">
              <SlideRenderer
                slides={[deck.slides[currentSlide]]}
                companyName={deck.companyName}
                showBranding={false}
                themeId={deck.themeId}
              />
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-center gap-4 px-4 py-4 bg-navy-800/80 backdrop-blur-sm border-t border-white/10">
          <button
            onClick={goToPrevSlide}
            disabled={currentSlide === 0}
            className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-medium disabled:opacity-25 hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex gap-1.5">
            {deck.slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  recordSlideTime(currentSlide);
                  setCurrentSlide(i);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentSlide
                    ? "bg-electric w-6"
                    : i < currentSlide
                      ? "bg-white/40"
                      : "bg-white/15"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {currentSlide < slideCount - 1 ? (
            <button
              onClick={goToNextSlide}
              className="px-5 py-2.5 rounded-xl bg-electric text-white font-medium hover:bg-electric-light transition-colors flex items-center gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleEndPractice}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors flex items-center gap-2"
            >
              Finish
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Live transcript preview */}
        {isListening && currentTranscript && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-lg px-4 py-2 rounded-xl bg-black/70 backdrop-blur-sm text-white/80 text-xs text-center">
            {currentTranscript.slice(-200)}
          </div>
        )}

        {/* End confirmation modal */}
        {showEndConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="rounded-2xl bg-white p-6 max-w-sm w-full mx-4 space-y-4">
              <h3 className="text-lg font-bold text-navy">End Practice?</h3>
              <p className="text-sm text-navy-500">
                You&apos;ve been practicing for {formatTime(totalElapsed)}. End now and get AI feedback?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold text-navy hover:bg-navy-50 transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={handleEndPractice}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-light transition-colors"
                >
                  End & Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -- REVIEW PHASE --
  // Build final timings for chart (use slideTimingsRef for most up-to-date)
  const finalTimings = slideTimingsRef.current;

  return (
    <div className="min-h-screen bg-navy-50">
      <AppNav />
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Practice Review</h1>
            <p className="text-sm text-navy-500 mt-1">
              {deck.title} &middot; {formatTime(totalElapsed)} total
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePracticeAgain}
              className="px-4 py-2 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-light transition-colors"
            >
              Practice Again
            </button>
            <Link
              href={`/deck/${deck.shareId}`}
              className="px-4 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy hover:bg-white transition-colors"
            >
              View Deck
            </Link>
          </div>
        </div>

        {feedbackLoading && (
          <div className="rounded-2xl border border-navy-100 bg-white p-12 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-electric border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-navy-500">AI is analyzing your practice session...</p>
            <p className="text-xs text-navy-400">This may take up to 30 seconds</p>
          </div>
        )}

        {feedbackError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
            <p className="text-sm text-red-700">{feedbackError}</p>
            <button
              onClick={handlePracticeAgain}
              className="px-4 py-2 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-light transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {feedback && (
          <>
            {/* Overall Score + Pacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-navy-100 bg-white p-6 flex flex-col items-center justify-center space-y-3">
                <h2 className="text-base font-bold text-navy">Overall Score</h2>
                <ScoreGauge score={feedback.overallScore} />
                <p className="text-xs text-navy-400 text-center">
                  {feedback.overallScore >= 80
                    ? "Great practice session!"
                    : feedback.overallScore >= 60
                      ? "Good effort, room to improve."
                      : "Keep practicing to improve your timing."}
                </p>
              </div>

              <div className="rounded-2xl border border-navy-100 bg-white p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-navy">Pacing</h2>
                  <span
                    className={`text-sm font-bold ${
                      feedback.pacing.score >= 80
                        ? "text-emerald-600"
                        : feedback.pacing.score >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {feedback.pacing.score}/100
                  </span>
                </div>
                <p className="text-sm text-navy-600 leading-relaxed">
                  {feedback.pacing.feedback}
                </p>
              </div>
            </div>

            {/* Per-slide time breakdown */}
            <div className="rounded-2xl border border-navy-100 bg-white p-6 space-y-4">
              <h2 className="text-base font-bold text-navy">Slide Timing Breakdown</h2>
              <div className="space-y-2">
                {deck.slides.map((slide, i) => {
                  const timing = finalTimings.find((t) => t.slideIndex === i);
                  const actual = timing?.duration || 0;
                  const maxBarTime = Math.max(
                    recommendedPerSlide * 2,
                    ...finalTimings.map((t) => t.duration)
                  );
                  const actualPct = Math.min(100, (actual / maxBarTime) * 100);
                  const recommendedPct = Math.min(
                    100,
                    (recommendedPerSlide / maxBarTime) * 100
                  );
                  const isOver = actual > recommendedPerSlide * 1.3;
                  const isUnder = actual < recommendedPerSlide * 0.5;

                  const perSlideInfo = feedback.perSlide.find(
                    (p) => p.slideIndex === i
                  );

                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-navy truncate max-w-[60%]">
                          {i + 1}. {slide.title}
                        </span>
                        <span
                          className={`font-mono font-semibold ${
                            isOver
                              ? "text-red-500"
                              : isUnder
                                ? "text-amber-500"
                                : "text-emerald-600"
                          }`}
                        >
                          {formatTime(actual)}
                          <span className="text-navy-300 font-normal">
                            {" "}
                            / {formatTime(recommendedPerSlide)}
                          </span>
                        </span>
                      </div>
                      <div className="relative h-3 bg-navy-100 rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                            isOver
                              ? "bg-red-400"
                              : isUnder
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                          }`}
                          style={{ width: `${actualPct}%` }}
                        />
                        <div
                          className="absolute inset-y-0 w-0.5 bg-navy-400/50"
                          style={{ left: `${recommendedPct}%` }}
                          title={`Recommended: ${formatTime(recommendedPerSlide)}`}
                        />
                      </div>
                      {perSlideInfo && (
                        <p className="text-[10px] text-navy-400 leading-snug">
                          {perSlideInfo.timeFeedback}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-navy-100 bg-white p-6 space-y-3">
                <h2 className="text-base font-bold text-navy flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Strengths
                </h2>
                <ul className="space-y-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-navy-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-navy-100 bg-white p-6 space-y-3">
                <h2 className="text-base font-bold text-navy flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  Areas to Improve
                </h2>
                <ul className="space-y-2">
                  {feedback.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-navy-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Confidence Indicators */}
            <div className="rounded-2xl border border-navy-100 bg-white p-6 space-y-3">
              <h2 className="text-base font-bold text-navy flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                Confidence Analysis
              </h2>
              <p className="text-sm text-navy-600 leading-relaxed">
                {feedback.confidenceIndicators}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
