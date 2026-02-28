import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Computer's IP
export const BASE_URL = 'http://192.168.43.50:8000'; 

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout for reliability
});

// REQUEST INTERCEPTOR: Inject the token automatically
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// RESPONSE INTERCEPTOR: Handle expired tokens
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If the backend returns 401, the user's token is invalid or expired
    if (error.response && error.response.status === 401) {
      await AsyncStorage.clear();
      // Note: Navigating from a service file is tricky, 
      // but clearing storage ensures the next reload forces a login.
    }
    return Promise.reject(error);
  }
);

export default API;