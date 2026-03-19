"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "./state/editorStore";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommentUser {
  name: string | null;
  email: string;
  image: string | null;
}

interface CommentReply {
  id: string;
  content: string;
  user: CommentUser;
  createdAt: string;
}

interface Comment {
  id: string;
  slideIndex: number;
  content: string;
  blockId: string | null;
  resolved: boolean;
  user: CommentUser;
  replies: CommentReply[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function initials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Avatar                                                             */
/* ------------------------------------------------------------------ */

const focusRingDark =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F14]";

const primaryCtaDark = `min-h-[44px] rounded-xl bg-electric px-4 text-xs font-semibold text-white shadow-lg shadow-electric/25 transition-all hover:-translate-y-0.5 hover:bg-electric-600 hover:shadow-glow active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focusRingDark}`;

function UserAvatar({ user }: { user: CommentUser }) {
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name || user.email}
        className="h-7 w-7 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-electric/20 text-[10px] font-medium text-electric">
      {initials(user.name, user.email)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CommentsPanel                                                      */
/* ------------------------------------------------------------------ */

export default function CommentsPanel({ shareId }: { shareId: string }) {
  const selectedSlideIndex = useEditorStore((s) => s.selectedSlideIndex);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectSlide = useEditorStore((s) => s.selectSlide);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unresolved">("all");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  /* Fetch comments */
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/decks/${shareId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /* Add comment */
  const handleAdd = async () => {
    const trimmed = newContent.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/decks/${shareId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideIndex: selectedSlideIndex,
          content: trimmed,
          blockId: selectedBlockId || undefined,
        }),
      });
      if (res.ok) {
        setNewContent("");
        await fetchComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* Reply */
  const handleReply = async (parentId: string) => {
    const trimmed = replyContent.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    const parent = comments.find((c) => c.id === parentId);
    try {
      const res = await fetch(`/api/decks/${shareId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideIndex: parent?.slideIndex ?? selectedSlideIndex,
          content: trimmed,
          parentId,
        }),
      });
      if (res.ok) {
        setReplyContent("");
        setReplyingTo(null);
        await fetchComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* Resolve */
  const handleResolve = async (commentId: string) => {
    try {
      await fetch(`/api/decks/${shareId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      });
      await fetchComments();
    } catch {
      // silent
    }
  };

  /* Filter + group */
  const filtered =
    filter === "unresolved"
      ? comments.filter((c) => !c.resolved)
      : comments;

  const grouped = filtered.reduce<Record<number, Comment[]>>((acc, c) => {
    if (!acc[c.slideIndex]) acc[c.slideIndex] = [];
    acc[c.slideIndex].push(c);
    return acc;
  }, {});

  const sortedSlideIndexes = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <section
      className="flex h-full flex-col bg-[#0F0F14]"
      aria-labelledby="comments-panel-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 id="comments-panel-heading" className="text-sm font-semibold text-white">
            Comments
          </h3>
          <span className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-white/60">
            {comments.length}
          </span>
        </div>
        <div
          className="flex gap-1"
          role="group"
          aria-label="Filter comments"
        >
          <button
            type="button"
            onClick={() => setFilter("all")}
            aria-pressed={filter === "all"}
            className={`min-h-[44px] rounded-lg px-3 text-[11px] font-medium transition-colors motion-reduce:transition-none ${focusRingDark} ${
              filter === "all"
                ? "bg-white/[0.08] text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unresolved")}
            aria-pressed={filter === "unresolved"}
            className={`min-h-[44px] rounded-lg px-3 text-[11px] font-medium transition-colors motion-reduce:transition-none ${focusRingDark} ${
              filter === "unresolved"
                ? "bg-white/[0.08] text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            Unresolved{unresolvedCount > 0 && ` (${unresolvedCount})`}
          </button>
        </div>
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading ? (
          <div
            className="flex items-center justify-center py-12"
            role="status"
            aria-live="polite"
          >
            <span className="sr-only">Loading comments</span>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60 motion-reduce:animate-none" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-xs text-white/40">
            No comments yet. Add one to start the discussion.
          </p>
        ) : (
          sortedSlideIndexes.map((slideIdx) => (
            <div key={slideIdx} className="mb-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                Slide {slideIdx + 1}
              </p>
              <div className="space-y-2">
                {grouped[slideIdx].map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-xl border bg-white/[0.04] ${
                      comment.resolved
                        ? "border-white/[0.06] opacity-50"
                        : "border-l-2 border-l-[#4361EE] border-t-white/[0.06] border-r-white/[0.06] border-b-white/[0.06]"
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full p-3 text-left"
                      onClick={() => selectSlide(comment.slideIndex)}
                    >
                      {/* Header */}
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={comment.user} />
                          <span className="text-xs font-medium text-white">
                            {comment.user.name || comment.user.email}
                          </span>
                          <span className="text-[10px] text-white/30">
                            {timeAgo(comment.createdAt)}
                          </span>
                        </div>
                        {!comment.resolved && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(comment.id);
                            }}
                            aria-label="Mark comment resolved"
                            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.08] hover:text-green-400 motion-reduce:transition-none ${focusRingDark}`}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-xs leading-relaxed text-white/70">
                        {comment.content}
                      </p>

                      {/* Block ref */}
                      {comment.blockId && (
                        <span className="mt-1.5 inline-block rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/30">
                          Block: {comment.blockId}
                        </span>
                      )}
                    </button>

                    {/* Reply toggle */}
                    {!comment.resolved && (
                      <div className="border-t border-white/[0.06] px-3 py-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === comment.id ? null : comment.id
                            )
                          }
                          className="text-[11px] text-white/40 transition-colors hover:text-white/60"
                        >
                          Reply
                        </button>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="ml-6 border-t border-white/[0.06] px-3 py-2 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <UserAvatar user={reply.user} />
                              <span className="text-[11px] font-medium text-white">
                                {reply.user.name || reply.user.email}
                              </span>
                              <span className="text-[10px] text-white/30">
                                {timeAgo(reply.createdAt)}
                              </span>
                            </div>
                            <p className="ml-9 text-xs leading-relaxed text-white/70">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline reply form */}
                    {replyingTo === comment.id && (
                      <div className="border-t border-white/[0.06] px-3 py-2">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          rows={2}
                          className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#4361EE]/40 focus:outline-none"
                        />
                        <div className="mt-1.5 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                            className={`min-h-[44px] rounded-lg px-2.5 text-[11px] text-white/40 hover:text-white/60 ${focusRingDark}`}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyContent.trim() || submitting}
                            aria-label={submitting ? "Posting reply…" : "Post reply"}
                            aria-busy={submitting}
                            className={`${primaryCtaDark} px-3`}
                          >
                            {submitting ? (
                              <span className="inline-flex items-center gap-2">
                                <span
                                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
                                  aria-hidden
                                />
                                <span className="sr-only">Posting</span>
                                …
                              </span>
                            ) : (
                              "Reply"
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <div className="border-t border-white/10 px-3 py-3">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder={`Add a comment on slide ${selectedSlideIndex + 1}...`}
          rows={2}
          className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#4361EE]/40 focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newContent.trim() || submitting}
            aria-label={submitting ? "Posting comment…" : "Post comment on current slide"}
            aria-busy={submitting}
            className={primaryCtaDark}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
                  aria-hidden
                />
                <span>Posting…</span>
                <span className="sr-only">Please wait</span>
              </span>
            ) : (
              "Comment"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
