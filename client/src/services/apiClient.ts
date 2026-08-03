import axios, { 
  AxiosError, 
  AxiosInstance, 
  AxiosResponse, 
  InternalAxiosRequestConfig 
} from 'axios';
import API_CONFIG from '../config/api';
import tokenStorage from './tokenStorage';

// Extended request configuration to track retries
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Queue item definition for requests waiting for token refresh
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

// Create a standalone instance for token refresh to avoid interceptor loops
const refreshClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create the main API Client instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// State variables for refreshing mechanism
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

/**
 * Helper to process all requests in the queue once the token is refreshed
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

/**
 * 1. Request Interceptor
 * Attach the Authorization Bearer token to all outgoing requests if available.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 2. Response Interceptor
 * Process successful responses (can unwrap data envelope here).
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return standard response or unwrap `data` field depending on API envelope
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig;

    // Check if error response is 401 (Unauthorized) and request has not been retried yet
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Avoid refreshing token for Auth endpoints (login, register, reset-password, etc.)
      const isAuthEndpoint = originalRequest.url?.includes('/auth/') && 
                            !originalRequest.url?.includes('/auth/logout');

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If refresh is already in progress, queue the request and resolve it later
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Start token refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Request refresh token endpoint
        const refreshResponse = await refreshClient.post(
          API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, 
          { refreshToken }
        );

        const { data } = refreshResponse.data; // Adapts to ApiResponse envelope
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        // Store new tokens
        await tokenStorage.setAccessToken(newAccessToken);
        if (newRefreshToken) {
          await tokenStorage.setRefreshToken(newRefreshToken);
        }

        // Update Authorization header for the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Resolve queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear session and reject
        processQueue(refreshError, null);
        await tokenStorage.clearAllTokens();
        
        console.error('Session expired, please log in again.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Generic error handling (Staging / Dev / Prod error formatting)
    if (API_CONFIG.ENV === 'development') {
      console.warn(`[API Client Error] URL: ${originalRequest?.url}`, error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
