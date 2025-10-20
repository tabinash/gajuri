import { http } from "./http.js";

const commentCache = new Map();

export const commentRepository = {
  // GET /api/comments/post/{postId}
  getComments: async (postId, { forceRefresh = false } = {}) => {
    const cacheKey = `comments_${postId}`;

    // Return cached data unless forceRefresh is true
    if (!forceRefresh && commentCache.has(cacheKey)) {
      return commentCache.get(cacheKey);
    }

    try {
      const response = await http.get(`/comments/post/${postId}`);
      commentCache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // POST /api/comments with { postId, content } in body
  addComment: async (comment) => {
    try {
      console.log(comment);
      const response = await http.post(`/comments`, comment);
      console.log(response);

      // Invalidate cache for this post's comments
      commentCache.delete(`comments_${comment.postId}`);

      return response;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  // DELETE /api/comments/{commentId}
  deleteComment: async (commentId, postId) => {
    try {
      const response = await http.delete(`/comments/${commentId}`);

      // Invalidate cache for this post's comments
      commentCache.delete(`comments_${postId}`);

      return response;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },
};
