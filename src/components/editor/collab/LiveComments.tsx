"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  slideIndex: number;
  content: string;
  blockId: string | null;
  resolved: boolean;
  user: { name: string | null; email: string | null; image: string | null };
  replies: Array<{
    id: string;
    content: string;
    user: { name: string | null; email: string | null; image: string | null };
    createdAt: string;
  }>;
  createdAt: string;
}

export default function LiveComments({
  shareId,
  currentSlide,
}: {
  shareId: string;
  currentSlide: number;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/decks/${shareId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const slideComments = comments.filter((c) =>
    c.slideIndex === currentSlide && (showResolved || !c.resolved)
  );

  const totalUnresolved = comments.filter((c) => !c.resolved).length;

  async function handleSubmit() {
    if (!newComment.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/decks/${shareId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideIndex: currentSlide,
          content: newComment.trim(),
        }),
      });

      if (res.ok) {
        setNewComment("");
        await fetchComments();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string) {
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`/api/decks/${shareId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideIndex: currentSlide,
          content: replyText.trim(),
          parentId,
        }),
      });

      if (res.ok) {
        setReplyText("");
        setReplyingTo(null);
        await fetchComments();
      }
    } catch {
      // silently fail
    }
  }

  async function handleResolve(commentId: string, resolved: boolean) {
    try {
      await fetch(`/api/decks/${shareId}/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved }),
      });
      await fetchComments();
    } catch {
      // silently fail
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-navy-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy">
            Comments
            {totalUnresolved > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-electric text-white text-[10px] font-bold">
                {totalUnresolved}
              </span>
            )}
          </h3>
          <button
            type="button"
            onClick={() => setShowResolved(!showResolved)}
            aria-pressed={showResolved}
            className="min-h-[44px] min-w-[44px] px-2 -mr-2 text-[10px] text-navy-400 hover:text-navy font-medium rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            {showResolved ? "Hide resolved" : "Show resolved"}
          </button>
        </div>
        <p className="text-[10px] text-navy-400 mt-0.5">Slide {currentSlide + 1}</p>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2" role="status">
            <span className="sr-only">Loading comments</span>
            <div
              className="w-5 h-5 rounded-full border-2 border-electric border-t-transparent animate-spin motion-reduce:animate-none motion-reduce:border-electric/40"
              aria-hidden
            />
          </div>
        ) : slideComments.length === 0 ? (
          <p className="text-xs text-navy-400 text-center py-6">
            No comments on this slide yet.
          </p>
        ) : (
          slideComments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-xl border p-3 ${
                comment.resolved
                  ? "border-green-100 bg-green-50/30 opacity-60"
                  : "border-navy-100 bg-white"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center shrink-0 mt-0.5">
                  {comment.user.image ? (
                    <img src={comment.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-bold text-navy-400">
                      {(comment.user.name || comment.user.email)?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-navy truncate">
                      {comment.user.name || comment.user.email}
                    </span>
                    <span className="text-[9px] text-navy-400 shrink-0">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-navy-600 mt-0.5">{comment.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-[10px] text-navy-400 hover:text-electric font-medium"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolve(comment.id, !comment.resolved)}
                      className="text-[10px] text-navy-400 hover:text-green-600 font-medium"
                    >
                      {comment.resolved ? "Unresolve" : "Resolve"}
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-2 space-y-2 pl-2 border-l-2 border-navy-100">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="text-[11px]">
                          <span className="font-semibold text-navy">
                            {reply.user.name || reply.user.email}
                          </span>
                          <span className="text-navy-400 ml-1.5">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                          <p className="text-navy-600 mt-0.5">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {replyingTo === comment.id && (
                    <div className="mt-2 flex gap-1.5">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Reply..."
                        onKeyDown={(e) => e.key === "Enter" && handleReply(comment.id)}
                        className="flex-1 px-2 py-1 rounded-md border border-navy-200 text-[11px] text-navy outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyText.trim()}
                        aria-label="Send reply"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-2 py-1 rounded-md bg-electric text-white text-[10px] font-semibold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New comment input */}
      <div className="p-3 border-t border-navy-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={submitting}
            className="flex-1 px-3 py-2 rounded-xl border border-navy-200 text-xs text-navy placeholder:text-navy-400 outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            aria-label={submitting ? "Posting comment…" : "Post comment"}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-electric hover:bg-electric-600 text-white text-xs font-semibold shadow-lg shadow-electric/25 hover:shadow-glow transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {submitting ? "..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
