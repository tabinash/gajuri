import httpClient from "./http";

export const postRepository = {
  createPost: async (postData) => {
    const response = await httpClient.post("/posts", postData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Create post response:", response.data);
    return response;
  },

  getGeneralPosts: async (page = 0, size = 12) => {
    console.log(`Fetching general posts - Page: ${page},}`);
    const response = await httpClient.get(
      `/posts/general?page=${page}&size=${size}`
    );
    return response;
  },

  getNewsAndNoticePosts: async (page = 0, size = 10) => {
    const response = await httpClient.get(
      `/posts/news-notice?page=${page}&size=${size}`
    );
    return response;
  },

  getComments: async (postId) => {
    const response = await httpClient.get(`/comments/post/${postId}`);
    console.log(`Comments for post ${postId}:`, response.data);
    return response;
  },

  postComment: async (postId, content) => {
    const response = await httpClient.post("/comments", { postId, content });
    console.log("Post comment response:", response.data);
    return response;
  },

  deleteComment: async (commentId) => {
    const response = await httpClient.delete(`/posts/${commentId}`);
    console.log("Delete comment response:", response.data);
    return response;
  },

  myPost: async () => {
    const response = await httpClient.get("/posts/my-posts");
    console.log("My posts response:", response.data);
    return response;
  },

  getPostsByUserId: async (userId, page = 0, size = 10) => {
    if (!userId) throw new Error("User ID is required");

    const response = await httpClient.get(
      `/posts/user/${userId}?page=${page}&size=${size}`
    );
    return response;
  },
};

export default postRepository;
