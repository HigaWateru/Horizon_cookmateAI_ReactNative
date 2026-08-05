import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'cookmate_access_token';
const REFRESH_TOKEN_KEY = 'cookmate_refresh_token';

// In-memory fallback dictionary for test or simulated environments
const memoryStorage: Record<string, string> = {};

const safeGetItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    return memoryStorage[key] || null;
  }
};

type AuthListener = (isAuthenticated: boolean) => void;
let authListener: AuthListener | null = null;

const safeSetItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  } else {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      memoryStorage[key] = value;
    }
  }
  if (key === ACCESS_TOKEN_KEY && authListener) {
    authListener(true);
  }
};

const safeRemoveItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
  } else {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      delete memoryStorage[key];
    }
  }
  if (key === ACCESS_TOKEN_KEY && authListener) {
    authListener(false);
  }
};

/**
 * Token Storage Service for CookMate AI
 * Handles secure local persistence of JWT access and refresh tokens.
 */
export const tokenStorage = {
  /**
   * Retrieve the stored Access Token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await safeGetItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token from storage:', error);
      return null;
    }
  },

  /**
   * Save the Access Token
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      await safeSetItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving access token to storage:', error);
    }
  },

  /**
   * Remove the Access Token
   */
  async clearAccessToken(): Promise<void> {
    try {
      await safeRemoveItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing access token from storage:', error);
    }
  },

  /**
   * Retrieve the stored Refresh Token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await safeGetItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token from storage:', error);
      return null;
    }
  },

  /**
   * Save the Refresh Token
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await safeSetItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving refresh token to storage:', error);
    }
  },

  /**
   * Remove the Refresh Token
   */
  async clearRefreshToken(): Promise<void> {
    try {
      await safeRemoveItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing refresh token from storage:', error);
    }
  },

  /**
   * Clear all stored tokens (e.g. on logout or session expiration)
   */
  async clearAllTokens(): Promise<void> {
    try {
      await Promise.all([
        safeRemoveItem(ACCESS_TOKEN_KEY),
        safeRemoveItem(REFRESH_TOKEN_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing all tokens from storage:', error);
    }
  },

  /**
   * Set global listener for authentication changes
   */
  setListener(listener: AuthListener) {
    authListener = listener;
  },
};

export default tokenStorage;
