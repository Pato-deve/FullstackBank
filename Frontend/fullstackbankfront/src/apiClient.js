import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Change to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add the Authorization header if a token is present
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Add token to request headers
  }
  return config; // Return the modified config
}, error => {
  return Promise.reject(error); // Reject the request if error occurs
});

export default apiClient;
