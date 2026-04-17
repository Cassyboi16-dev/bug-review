"use client";

import { useState, useCallback } from "react";
import {
  FiHeart,
  FiMessageCircle,
  FiTrash2,
  FiFlag,
  FiMoreHorizontal,
  FiEdit2,
  FiCopy,
} from "react-icons/fi";
import { MdPushPin } from "react-icons/md";
import { AiFillHeart } from "react-icons/ai";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/config/firebase.config";

const CommentSystem = ({
  post,
  session,
  onCommentAdded,
  onReplyAdded,
  onCommentDeleted,
  getRelativeTime,
  getDateObj,
}) => {
  const userId = session?.user?.id || session?.user?.email || "anonymous";
  const userUsername =
    session?.user?.username || session?.user?.name || "Anonymous";

  const [newComment, setNewComment] = useState("");
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [expandedReplyIds, setExpandedReplyIds] = useState(new Set());
  const [showMoreOptions, setShowMoreOptions] = useState(null);
  const [sortBy, setSortBy] = useState("recent");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loadingCommentId, setLoadingCommentId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showNewCommentInput, setShowNewCommentInput] = useState(false);

  const MAX_COMMENT_LENGTH = 500;

  const isPostAuthor = post.authorId === userId;
  const commentsDisabled = post.commentsDisabled || false;

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (newComment.length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment exceeds ${MAX_COMMENT_LENGTH} characters`);
      return;
    }

    if (commentsDisabled && !isPostAuthor) {
      toast.error("Comments are disabled on this post");
      return;
    }

    setLoadingCommentId("new");
    try {
      const comment = {
        id: Date.now(),
        author: userUsername,
        authorId: userId,
        text: newComment,
        createdAt: Date.now(),
        likes: [],
        replies: [],
        edited: false,
        editedAt: null,
      };

      await updateDoc(doc(db, "bugPosts", post.id), {
        comments: arrayUnion(comment),
      });

      setNewComment("");
      setShowNewCommentInput(false);
      toast.success("Comment added!");
      onCommentAdded?.();
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setLoadingCommentId(null);
    }
  };

  const handleAddReply = async (commentId, parentReplyId = null) => {
    const replyKey = parentReplyId
      ? `${commentId}-${parentReplyId}`
      : commentId;
    const text = replyText[replyKey];

    if (!text?.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      const reply = {
        id: Date.now(),
        author: userUsername,
        authorId: userId,
        text,
        createdAt: Date.now(),
        likes: [],
        replies: [], // Support nested replies
      };

      if (parentReplyId) {
        // Reply to a reply
        const updatedComments = post.comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === parentReplyId
                    ? {
                        ...r,
                        replies: [...(r.replies || []), reply],
                      }
                    : r,
                ),
              }
            : c,
        );

        await updateDoc(doc(db, "bugPosts", post.id), {
          comments: updatedComments,
        });
      } else {
        // Reply to a comment
        const updatedComments = post.comments.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c,
        );

        await updateDoc(doc(db, "bugPosts", post.id), {
          comments: updatedComments,
        });
      }

      setReplyText({ ...replyText, [replyKey]: "" });
      setExpandedCommentId(null);
      setExpandedReplyIds(new Set());
      toast.success("Reply added!");
      onReplyAdded?.();
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const handleLikeComment = async (commentId) => {
    const comment = post.comments?.find((c) => c.id === commentId);
    if (!comment) return;

    const liked = comment.likes?.includes(userId);

    try {
      const updatedComments = post.comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: liked
                ? c.likes.filter((id) => id !== userId)
                : [...(c.likes || []), userId],
            }
          : c,
      );

      await updateDoc(doc(db, "bugPosts", post.id), {
        comments: updatedComments,
      });
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error("Failed to like comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updatedComments = post.comments.filter((c) => c.id !== commentId);

      await updateDoc(doc(db, "bugPosts", post.id), {
        comments: updatedComments,
      });

      toast.success("Comment deleted");
      onCommentDeleted?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleLikeReply = async (commentId, replyId, nestedReplyId = null) => {
    try {
      if (nestedReplyId) {
        // Like a nested reply (reply to reply)
        const updatedComments = post.comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === replyId
                    ? {
                        ...r,
                        replies: r.replies.map((nr) =>
                          nr.id === nestedReplyId
                            ? {
                                ...nr,
                                likes: nr.likes?.includes(userId)
                                  ? nr.likes.filter((id) => id !== userId)
                                  : [...(nr.likes || []), userId],
                              }
                            : nr,
                        ),
                      }
                    : r,
                ),
              }
            : c,
        );

        await updateDoc(doc(db, "bugPosts", post.id), {
          comments: updatedComments,
        });
      } else {
        // Like a direct reply
        const updatedComments = post.comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === replyId
                    ? {
                        ...r,
                        likes: r.likes?.includes(userId)
                          ? r.likes.filter((id) => id !== userId)
                          : [...(r.likes || []), userId],
                      }
                    : r,
                ),
              }
            : c,
        );

        await updateDoc(doc(db, "bugPosts", post.id), {
          comments: updatedComments,
        });
      }
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  const toggleCommentsDisabled = async () => {
    try {
      await updateDoc(doc(db, "bugPosts", post.id), {
        commentsDisabled: !commentsDisabled,
      });

      toast.success(
        commentsDisabled ? "Comments enabled" : "Comments disabled",
      );
    } catch (error) {
      console.error("Error toggling comments:", error);
      toast.error("Failed to update comment settings");
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (editingText.length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment exceeds ${MAX_COMMENT_LENGTH} characters`);
      return;
    }

    setLoadingCommentId(commentId);
    try {
      const updatedComments = post.comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              text: editingText,
              edited: true,
              editedAt: Date.now(),
            }
          : c,
      );

      await updateDoc(doc(db, "bugPosts", post.id), {
        comments: updatedComments,
      });

      setEditingCommentId(null);
      setEditingText("");
      toast.success("Comment updated!");
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setLoadingCommentId(null);
    }
  };

  const handlePinComment = async (commentId) => {
    try {
      const isPinned = post.pinnedCommentId === commentId;
      await updateDoc(doc(db, "bugPosts", post.id), {
        pinnedCommentId: isPinned ? null : commentId,
      });

      toast.success(isPinned ? "Comment unpinned" : "Comment pinned!");
    } catch (error) {
      console.error("Error pinning comment:", error);
      toast.error("Failed to pin comment");
    }
  };

  const copyCommentLink = (commentId) => {
    const link = `${window.location.href}#comment-${commentId}`;
    navigator.clipboard.writeText(link);
    toast.success("Comment link copied!");
  };

  const sortedComments = [...(post.comments || [])]
    .sort((a, b) => {
      if (sortBy === "top") {
        return (b.likes?.length || 0) - (a.likes?.length || 0);
      }
      return b.createdAt - a.createdAt;
    })
    .sort((a, b) => {
      // Pin pinned comment to top
      if (post.pinnedCommentId === a.id) return -1;
      if (post.pinnedCommentId === b.id) return 1;
      return 0;
    });

  // Recursive component for nested replies
  const ReplyThread = ({
    replies,
    commentId,
    parentReplyId = null,
    depth = 0,
  }) => {
    if (!replies || replies.length === 0) return null;

    const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 16)}` : "ml-6";

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className={`${indentClass} border-l-2 border-border pl-3 space-y-2 mt-3`}
      >
        {replies.map((reply) => {
          const replyLiked = reply.likes?.includes(userId);
          const replyKey = parentReplyId
            ? `${commentId}-${parentReplyId}-${reply.id}`
            : `${commentId}-${reply.id}`;

          return (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-background rounded-lg p-2 space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xs font-bold">
                    {reply.author?.[0]?.toUpperCase() || "A"}
                  </div>
                  <span className="font-semibold text-foreground text-xs">
                    {reply.author}
                  </span>
                </div>
                <span className="text-text-muted text-xs">
                  {getRelativeTime(getDateObj(reply.createdAt))}
                </span>
              </div>

              <p className="text-foreground text-xs leading-relaxed">
                {reply.text}
              </p>

              <div className="flex items-center gap-3 pt-1">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    handleLikeReply(commentId, parentReplyId || reply.id)
                  }
                  className="flex items-center gap-1 text-text-muted hover:text-red-500 transition text-xs"
                >
                  {replyLiked ? (
                    <AiFillHeart className="text-red-500" />
                  ) : (
                    <FiHeart />
                  )}
                  <span className="font-semibold">
                    {reply.likes?.length || 0}
                  </span>
                </motion.button>

                <button
                  onClick={() => {
                    const newExpandedSet = new Set(expandedReplyIds);
                    if (newExpandedSet.has(replyKey)) {
                      newExpandedSet.delete(replyKey);
                    } else {
                      newExpandedSet.add(replyKey);
                    }
                    setExpandedReplyIds(newExpandedSet);
                  }}
                  className="flex items-center gap-1 text-text-muted hover:text-primary-500 transition text-xs font-semibold"
                >
                  <FiMessageCircle className="text-xs" />
                  Reply
                </button>
              </div>

              {/* Nested reply input */}
              <AnimatePresence mode="wait">
                {expandedReplyIds.has(replyKey) && (
                  <motion.div
                    key={`nested-reply-${replyKey}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-surface border border-border rounded-lg p-2 space-y-2 mt-2"
                  >
                    <textarea
                      autoFocus
                      value={replyText[replyKey] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [replyKey]: e.target.value.slice(
                            0,
                            MAX_COMMENT_LENGTH,
                          ),
                        })
                      }
                      placeholder="Write a reply..."
                      className="w-full bg-background text-foreground placeholder-text-muted border border-border rounded p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows="2"
                      maxLength={MAX_COMMENT_LENGTH}
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          const newExpandedSet = new Set(expandedReplyIds);
                          newExpandedSet.delete(replyKey);
                          setExpandedReplyIds(newExpandedSet);
                          setReplyText({
                            ...replyText,
                            [replyKey]: "",
                          });
                        }}
                        className="px-2 py-1 text-xs font-semibold text-text-muted hover:text-foreground transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleAddReply(commentId, parentReplyId || reply.id)
                        }
                        disabled={
                          !replyText[replyKey]?.trim() ||
                          (replyText[replyKey] || "").length >
                            MAX_COMMENT_LENGTH
                        }
                        className="px-2 py-1 text-xs font-semibold bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Reply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recursive nested replies */}
              {reply.replies && reply.replies.length > 0 && (
                <ReplyThread
                  replies={reply.replies}
                  commentId={commentId}
                  parentReplyId={reply.id}
                  depth={depth + 1}
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  if (commentsDisabled && !isPostAuthor) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-text-muted text-sm">
            Comments are disabled on this post
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* COMMENT STATS */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-surface to-surface-muted rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FiMessageCircle className="text-primary-500" />
            <span className="font-semibold text-foreground text-sm">
              {post.comments?.length || 0} Comments
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-surface text-foreground text-xs px-2 py-1 rounded border border-border hover:border-primary-400 transition"
          >
            <option value="recent">Recent</option>
            <option value="top">Top</option>
          </select>

          {isPostAuthor && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleCommentsDisabled}
              className={`px-2 py-1 text-xs font-semibold rounded transition ${
                commentsDisabled
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-primary-500/20 text-primary-400 hover:bg-primary-500/30"
              }`}
            >
              {commentsDisabled ? "Enable Comments" : "Disable Comments"}
            </motion.button>
          )}
        </div>
      </div>

      {/* ADD COMMENT BUTTON */}
      {!showNewCommentInput && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowNewCommentInput(true)}
          className="w-full bg-surface border border-border rounded-lg p-4 text-foreground font-semibold hover:border-primary-500 transition text-center"
        >
          + Add a Comment
        </motion.button>
      )}

      {/* NEW COMMENT INPUT */}
      <AnimatePresence>
        {showNewCommentInput && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Add a Comment</h3>
              <span
                className={`text-xs font-semibold ${
                  newComment.length > MAX_COMMENT_LENGTH * 0.9
                    ? "text-red-500"
                    : "text-text-muted"
                }`}
              >
                {newComment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>

            <textarea
              autoFocus
              value={newComment}
              onChange={(e) =>
                setNewComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))
              }
              placeholder="Share your thoughts... (tip: use `code` for code blocks)"
              className="w-full bg-background text-foreground placeholder-text-muted border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows="3"
              maxLength={MAX_COMMENT_LENGTH}
            />

            <div className="flex justify-between items-center">
              <p className="text-xs text-text-muted">Markdown supported</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setNewComment("");
                    setShowNewCommentInput(false);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-text-muted hover:text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={
                    !newComment.trim() ||
                    newComment.length > MAX_COMMENT_LENGTH ||
                    loadingCommentId === "new"
                  }
                  className="px-4 py-2 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loadingCommentId === "new" ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMENTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence>
          {sortedComments.length > 0 ? (
            sortedComments.map((comment, idx) => {
              const isAuthor = comment.authorId === post.authorId;
              const isOwnComment = comment.authorId === userId;
              const liked = comment.likes?.includes(userId);

              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-surface border border-border rounded-lg p-3 space-y-2 hover:border-border-muted transition"
                >
                  {/* COMMENT HEADER */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {comment.author?.[0]?.toUpperCase() || "A"}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            {comment.author}
                          </span>
                          {isAuthor && (
                            <span className="bg-accent-500/20 text-accent-600 px-2 py-0.5 rounded text-xs font-semibold">
                              OP
                            </span>
                          )}
                        </div>
                        <span className="text-text-muted text-xs">
                          {getRelativeTime(getDateObj(comment.createdAt))}
                        </span>
                      </div>
                    </div>

                    {/* OPTIONS */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowMoreOptions(
                            showMoreOptions === comment.id ? null : comment.id,
                          )
                        }
                        className="text-text-muted hover:text-foreground transition p-1"
                      >
                        <FiMoreHorizontal />
                      </button>

                      <AnimatePresence>
                        {showMoreOptions === comment.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-max"
                          >
                            {isOwnComment && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditingText(comment.text);
                                    setShowMoreOptions(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-primary-600 hover:bg-primary-500/10 transition flex items-center gap-2"
                                >
                                  <FiEdit2 className="text-sm" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteComment(comment.id);
                                    setShowMoreOptions(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 transition flex items-center gap-2"
                                >
                                  <FiTrash2 className="text-sm" />
                                  Delete
                                </button>
                              </>
                            )}

                            {isPostAuthor && !isOwnComment && (
                              <button
                                onClick={() => {
                                  handlePinComment(comment.id);
                                  setShowMoreOptions(null);
                                }}
                                className={`w-full px-4 py-2 text-left text-sm transition flex items-center gap-2 ${
                                  post.pinnedCommentId === comment.id
                                    ? "text-yellow-600 hover:bg-yellow-500/10"
                                    : "text-foreground hover:bg-background"
                                }`}
                              >
                                <MdPushPin className="text-sm" />
                                {post.pinnedCommentId === comment.id
                                  ? "Unpin"
                                  : "Pin"}
                              </button>
                            )}

                            <button
                              onClick={() => {
                                copyCommentLink(comment.id);
                                setShowMoreOptions(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-background transition flex items-center gap-2"
                            >
                              <FiCopy className="text-sm" />
                              Copy Link
                            </button>

                            <button
                              onClick={() => {
                                toast.success("Comment reported");
                                setShowMoreOptions(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-text-muted hover:bg-background transition flex items-center gap-2"
                            >
                              <FiFlag className="text-sm" />
                              Report
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* PINNED BADGE */}
                  {post.pinnedCommentId === comment.id && (
                    <div className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-600 text-xs font-semibold px-2 py-1 rounded-full w-fit">
                      <MdPushPin className="w-3 h-3" />
                      Pinned
                    </div>
                  )}

                  {/* COMMENT BODY / EDIT MODE */}
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) =>
                          setEditingText(
                            e.target.value.slice(0, MAX_COMMENT_LENGTH),
                          )
                        }
                        className="w-full bg-background text-foreground border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        rows="3"
                        maxLength={MAX_COMMENT_LENGTH}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingText("");
                          }}
                          className="px-3 py-1 text-xs font-semibold text-text-muted hover:text-foreground transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          disabled={loadingCommentId === comment.id}
                          className="px-3 py-1 text-xs font-semibold bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 transition"
                        >
                          {loadingCommentId === comment.id
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {comment.text}
                      </p>
                      {comment.edited && (
                        <p className="text-text-muted text-xs">
                          edited {getRelativeTime(getDateObj(comment.editedAt))}
                        </p>
                      )}
                    </div>
                  )}

                  {/* COMMENT ACTIONS */}
                  <div className="flex items-center gap-4 pt-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex items-center gap-1.5 text-text-muted hover:text-red-500 transition group"
                    >
                      {liked ? (
                        <AiFillHeart className="text-red-500 text-sm" />
                      ) : (
                        <FiHeart className="text-sm group-hover:scale-110 transition" />
                      )}
                      <span className="text-xs font-semibold">
                        {comment.likes?.length || 0}
                      </span>
                    </motion.button>

                    <button
                      onClick={() =>
                        setExpandedCommentId(
                          expandedCommentId === comment.id ? null : comment.id,
                        )
                      }
                      className="flex items-center gap-1.5 text-text-muted hover:text-primary-500 transition text-sm font-semibold"
                    >
                      <FiMessageCircle className="text-sm" />
                      Reply
                    </button>
                  </div>

                  {/* REPLIES */}
                  <AnimatePresence>
                    {comment.replies?.length > 0 && (
                      <ReplyThread
                        replies={comment.replies}
                        commentId={comment.id}
                      />
                    )}
                  </AnimatePresence>

                  {/* REPLY INPUT */}
                  <AnimatePresence mode="wait">
                    {expandedCommentId === comment.id && (
                      <motion.div
                        key={`reply-input-${comment.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-background border border-border rounded-lg p-3 space-y-2 mt-3 ml-6"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-text-muted">
                            Replying to{" "}
                            <span className="text-primary-500">
                              @{comment.author}
                            </span>
                          </p>
                          <span className="text-xs text-text-muted">
                            {(replyText[comment.id] || "").length}/
                            {MAX_COMMENT_LENGTH}
                          </span>
                        </div>

                        <textarea
                          autoFocus
                          value={replyText[comment.id] || ""}
                          onChange={(e) =>
                            setReplyText({
                              ...replyText,
                              [comment.id]: e.target.value.slice(
                                0,
                                MAX_COMMENT_LENGTH,
                              ),
                            })
                          }
                          placeholder="Write a reply..."
                          className="w-full bg-surface text-foreground placeholder-text-muted border border-border rounded p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          rows="2"
                          maxLength={MAX_COMMENT_LENGTH}
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setExpandedCommentId(null);
                              setReplyText({
                                ...replyText,
                                [comment.id]: "",
                              });
                            }}
                            className="px-3 py-1 text-xs font-semibold text-text-muted hover:text-foreground transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddReply(comment.id)}
                            disabled={
                              !replyText[comment.id]?.trim() ||
                              (replyText[comment.id] || "").length >
                                MAX_COMMENT_LENGTH
                            }
                            className="px-3 py-1 text-xs font-semibold bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            Reply
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-text-muted text-sm">
                No comments yet. Be the first!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentSystem;
