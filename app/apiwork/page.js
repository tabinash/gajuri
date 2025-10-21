"use client";

import { useState, useEffect } from "react";
import { commentRepository } from "../../repositories/commentRepository";

export default function ContentModal() {
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  useEffect(() => {
   
      loadComments();

  }, []);

  const loadComments = async () => {
    try {
      const response = await commentRepository.getComments(55);
      console.log(response.data);
      setComments(response.data);
      setIsLoadingComments(false);
    } catch (error) {
      console.error("Failed to load comments:", error);
      setComments([]);
      setIsLoadingComments(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setIsCommentSubmitting(true);
    try {
      await commentRepository.addComment({
        postId: content.id,
        content: newComment.trim(),
      });
      await loadComments();
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  return <div>hello</div>;
}
