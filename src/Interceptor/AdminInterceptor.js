// axiosConfig.js
import axios from 'axios';

// Create an Axios instance with a base URL (adjust as needed)
const endpoint = process.env.NEXT_PUBLIC_BASE_URL
const axiosInstance = axios.create({
  baseURL: `${endpoint}`, // replace with your API endpoint
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // For example, attach a token from localStorage if available
    const token = localStorage.getItem('Admintoken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // You can also modify the config here (e.g., add custom headers)
    return config;
  },
  (error) => {
    // Handle request errors here
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Process the response data as needed before it reaches your components
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response && error.response.status === 401) {
      // Optionally, handle unauthorized access (e.g., redirect to login)
      console.error('Unauthorized access - perhaps redirect to login.');
    }
    // You can add more error handling based on status codes or error types
    return Promise.reject(error);
  }
);

export default axiosInstance;
