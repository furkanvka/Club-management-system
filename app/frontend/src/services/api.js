import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = "eW91ci12ZXJ5LXNlY3VyZS1hbmQtbG9uZy1qYXdhLXRva2VuLXNlY3JldC1rZXktZm9yLWRldmVsb3BtZW50";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
