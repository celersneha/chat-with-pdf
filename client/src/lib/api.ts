import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Normal (non-hook) axios instance generator with token param
export const axiosInstance = (token?: string): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Response interceptor for error normalization
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      // Normalize error object
      let normalizedError = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        isNetworkError: !error.response,
      };
      // You can add more normalization logic here if needed
      return Promise.reject(normalizedError);
    }
  );

  return api;
};
