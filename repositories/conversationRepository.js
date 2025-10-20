import { http } from "./http.js";

export const conversationRepository = {
  // GET /api/conversations
  getConversations: async () => {
    try {
      const response = await http.get(`/messages/conversations`);
      return response;
    } catch (error) {
      console.error("Error fetching conversations list:", error);
      throw error;
    }
  },

  // GET /api/conversations/{conversationId}
  getConversationById: async (conversationId) => {
    try {
      console.log("fetching conversation by id:", conversationId);
      const response = await http.get(
        `/messages/conversation/${conversationId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching conversation ${conversationId}:`, error);
      throw error;
    }
  },

  // POST /api/messages/send
  sendMessage: async (data) => {
    try {
      console.log(data);
      const response = await http.post(`/messages/send`, {
        receiverId: Number(data.receiverId),
        content: data.content,
      });
      console.log("Message sent:", response);
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};
