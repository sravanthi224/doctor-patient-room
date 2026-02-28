import API from "./api";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const sendMessage = async (sessionId, message) => {
  // Matches your ChatRequest schema: { message: str, session_id: int }
  return await API.post("/chat/send", {
    session_id: sessionId,
    message: message
  });
};

export const getChatHistory = async (sessionId) => {
  // Matches your backend route: @router.get("/history/{sessionId}")
  // Note: Ensure your backend actually has this route defined
  return await API.get(`/chat/history/${sessionId}`);
};
