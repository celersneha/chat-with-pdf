import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { useAuth } from "@clerk/nextjs";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Custom hook to get an Axios instance with Clerk token attached
export const axiosInstance = (): AxiosInstance => {
  const { getToken } = useAuth();

  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  // Attach Clerk token to every request
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

  // (Optional) Add response interceptor for error handling, refresh, etc.
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      // Custom error handling can go here
      return Promise.reject(error);
    }
  );

  return api;
};
