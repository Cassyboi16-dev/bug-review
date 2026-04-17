"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiHeart, FiMessageCircle, FiTrash2, FiFlag } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";

const PageComments = ({ pageId, session }) => {
  const userId = session?.user?.id || session?.user?.email || "anonymous";
  const userUsername =
    session?.user?.username || session?.user?.name || "Anonymous";

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [showMoreOptions, setShowMoreOptions] = useState(null);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "pageComments", pageId),
      (snapshot) => {
        if (snapshot.exists()) {
          setComments(snapshot.data().comments || []);
        } else {
          setComments([]);
        }
      },
      (error) => {
        console.error("Error fetching comments:", error);
      },
    );

    return () => unsub();
  }, [pageId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const comment = {
        id: Date.now(),
        author: userUsername,
        authorId: userId,
        text: newComment,
        createdAt: Date.now(),
        likes: [],
        replies: [],
      };

      const docRef = doc(db, "pageComments", pageId);
      await updateDoc(docRef, {
        comments: arrayUnion(comment),
      });

      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      if (error.code === "not-found") {
        // Document doesn't exist, create it
        const docRef = doc(db, "pageComments", pageId);
        await updateDoc(docRef, {
          comments: [
            {
              id: Date.now(),
              author: userUsername,
              authorId: userId,
              text: newComment,
              createdAt: Date.now(),
              likes: [],
              replies: [],
            },
          ],
        }).catch(async () => {
          // If still fails, try setting instead of updating
          const comment = {
            id: Date.now(),
            author: userUsername,
            authorId: userId,
            text: newComment,
            createdAt: Date.now(),
            likes: [],
            replies: [],
          };
          const { setDoc } = await import("firebase/firestore");
          await setDoc(docRef, { comments: [comment] });
          setNewComment("");
          toast.success("Comment added!");
        });
      }
    }
  };

  const handleAddReply = async (commentId) => {
    const text = replyText[commentId];
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
      };

      const updatedComments = comments.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c,
      );

      const docRef = doc(db, "pageComments", pageId);
      await updateDoc(docRef, { comments: updatedComments });

      setReplyText({ ...replyText, [commentId]: "" });
      setExpandedCommentId(null);
      toast.success("Reply added!");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const handleLikeComment = async (commentId) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    const liked = comment.likes?.includes(userId);

    try {
      const updatedComments = comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: liked
                ? c.likes.filter((id) => id !== userId)
                : [...(c.likes || []), userId],
            }
          : c,
      );

      const docRef = doc(db, "pageComments", pageId);
      await updateDoc(docRef, { comments: updatedComments });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updatedComments = comments.filter((c) => c.id !== commentId);

      const docRef = doc(db, "pageComments", pageId);
      await updateDoc(docRef, { comments: updatedComments });

      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Just now";

    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return "Older";
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "top") {
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    }
    return b.createdAt - a.createdAt;
  });

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8 space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Comments</h2>
        <p className="text-text-muted text-sm">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </p>
      </div>

      {/* STATS */}
      <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <FiMessageCircle className="text-primary-500" />
          <span className="font-semibold text-foreground text-sm">
            {comments.length} Comments
          </span>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-surface text-foreground text-xs px-2 py-1 rounded border border-border hover:border-primary-400 transition"
        >
          <option value="recent">Recent</option>
          <option value="top">Top</option>
        </select>
      </div>

      {/* NEW COMMENT INPUT */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-lg p-4 space-y-3"
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full bg-background text-foreground placeholder-text-muted border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows="3"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setNewComment("")}
            className="px-4 py-2 text-sm font-semibold text-text-muted hover:text-foreground transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Post Comment
          </button>
        </div>
      </motion.div>

      {/* COMMENTS LIST */}
      <div className="space-y-3">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment, idx) => {
            const isOwnComment = comment.authorId === userId;
            const liked = comment.likes?.includes(userId);

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
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
                      <span className="font-semibold text-foreground text-sm">
                        {comment.author}
                      </span>
                      <div className="text-text-muted text-xs">
                        {getRelativeTime(comment.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* OPTIONS */}
                  {isOwnComment && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-text-muted hover:text-red-500 transition p-1"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  )}
                </div>

                {/* COMMENT BODY */}
                <p className="text-foreground text-sm leading-relaxed">
                  {comment.text}
                </p>

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
                      <FiHeart className="text-sm" />
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
                {comment.replies?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="ml-6 border-l-2 border-border pl-3 space-y-2 mt-3"
                  >
                    {comment.replies.map((reply) => {
                      const replyLiked = reply.likes?.includes(userId);

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
                              {getRelativeTime(reply.createdAt)}
                            </span>
                          </div>

                          <p className="text-foreground text-xs leading-relaxed">
                            {reply.text}
                          </p>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              // Handle reply like
                            }}
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
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* REPLY INPUT */}
                {expandedCommentId === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-background border border-border rounded-lg p-2 space-y-2 mt-3 ml-6"
                  >
                    <textarea
                      value={replyText[comment.id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [comment.id]: e.target.value,
                        })
                      }
                      placeholder="Write a reply..."
                      className="w-full bg-surface text-foreground placeholder-text-muted border border-border rounded p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows="2"
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
                        disabled={!replyText[comment.id]?.trim()}
                        className="px-3 py-1 text-xs font-semibold bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Reply
                      </button>
                    </div>
                  </motion.div>
                )}
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
      </div>
    </section>
  );
};

export default PageComments;
