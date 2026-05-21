import { useState } from 'react';
import axios from 'axios';
import { apiUrl, authHeaders } from '../lib/apiClient';

export default function useAIAssistant(session, profile, workspaceNotes) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message) => {
    if (!message?.trim() || !session?.access_token) return null;
    setLoading(true);
    const userMsg = { role: 'user', content: message };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      const { data } = await axios.post(
        apiUrl('/api/ai-assistant'),
        {
          messages: updatedMessages,
          pageContext: workspaceNotes,
          mbtiType: profile?.mbti_type,
        },
        { headers: authHeaders(session.access_token) }
      );
      const assistantMsg = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, assistantMsg]);
      return assistantMsg;
    } catch (error) {
      console.error('AI assistant failed', error);
      const errorMsg = {
        role: 'assistant',
        content: 'AI is currently unavailable. Please continue with the demo flow.',
      };
      setMessages((prev) => [...prev, errorMsg]);
      return errorMsg;
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage, setMessages };
}
