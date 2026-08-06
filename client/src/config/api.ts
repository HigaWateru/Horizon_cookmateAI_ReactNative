/**
 * Centered API Configuration for CookMate AI
 * Manage endpoints, base URL, version, timeout and environments.
 */

// Retrieve the base API URL from Expo public environment variables
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

// Assert environment variable presence to prevent silent failures in Dev/Staging/Production
if (!rawApiUrl) {
  console.error("=========================================================================");
  console.error(" [ERROR] Missing EXPO_PUBLIC_API_URL environment variable!");
  console.error(" Please create a .env file in the client root directory and define it.");
  console.error(" Example: EXPO_PUBLIC_API_URL=http://192.168.1.10:8080/api/v1");
  console.error(" Refer to the client/README.md or GUIDE.md for more details.");
  console.error("=========================================================================");
  throw new Error(
    "Missing environment variable: EXPO_PUBLIC_API_URL is required to run this application."
  );
}

// Ensure base URL configuration is clean
const BASE_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

export const API_CONFIG = {
  // Connection details
  BASE_URL,
  API_VERSION: 'v1',
  TIMEOUT: 10000, // 10 seconds request timeout

  // Environment-specific adjustments (easily expandable)
  ENV: process.env.NODE_ENV || 'development', // 'development' | 'staging' | 'production'

  // Centralized Common Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      VERIFY_EMAIL: '/auth/verify-email',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      REFRESH_TOKEN: '/auth/refresh', // Token refresh endpoint
    },
    INVENTORY: {
      BASE: '/inventory',
      DETAIL: (id: string) => `/inventory/${id}`,
    },
    CATEGORY: {
      BASE: '/categories',
    },
    TRANSACTION: {
      BASE: '/transactions',
      SUMMARY: '/transactions/summary',
    },
    RECIPES: {
      RECOMMEND: '/recipes/recommend',
    },
    DASHBOARD: {
      STATISTICS: '/dashboard/statistics',
    },
  },
};

export default API_CONFIG;
