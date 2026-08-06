import apiClient from './apiClient';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

/**
 * Chat Service
 * Manages sending user messages and conversation history to the backend AI chatbot.
 */
export const chatService = {
  /**
   * Send a chat message with history to the backend
   */
  async sendMessage(message: string, history: ChatMessage[]) {
    const response = await apiClient.post('/chat', { message, history });
    return response.data;
  }
};

export default chatService;
