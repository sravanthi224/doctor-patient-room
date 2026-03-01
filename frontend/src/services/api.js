import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Render Backend URL (Updated from Local IP)
export const BASE_URL = 'https://doctor-patient-room-backend.onrender.com'; 

const API = axios.create({
  baseURL: BASE_URL,
  // Increased to 30s because Render Free Tier needs time to "wake up" on the first request
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Inject the token automatically
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
}, (error) => {
  return Promise.reject(error);
});

// RESPONSE INTERCEPTOR: Handle expired tokens & Server Sleep
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token Expired or Invalid)
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Clearing storage...");
      await AsyncStorage.multiRemove(['access_token', 'user_role', 'user_id']);
      // The app's AuthContext should ideally listen for storage changes to redirect to Login
    }

    // Handle Render's "Service Unavailable" or Timeouts during wake-up
    if (!error.response) {
      console.error("Network error or Server is waking up. Please wait.");
    }

    return Promise.reject(error);
  }
);

export default API;
