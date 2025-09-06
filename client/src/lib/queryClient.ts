import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

// API request function for mutations  
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await axios.request({
    url,
    method: options.method || 'GET',
    data: options.body ? JSON.parse(options.body as string) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    withCredentials: true,
  });
  return response.data;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        try {
          const response = await axios.get(queryKey[0] as string, { withCredentials: true });
          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const message = error.response?.data?.message || error.message;

            if (status && status >= 500) {
              throw new Error(`${status}: ${message}`);
            }

            if (status === 401) {
              throw new Error(`${status}: Unauthorized`);
            }

            if (status === 404) {
              throw new Error(`${status}: Not Found`);
            }

            throw new Error(`${status}: ${message}`);
          }
          throw error;
        }
      },
    },
  },
});