import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'cookmate_access_token';
const REFRESH_TOKEN_KEY = 'cookmate_refresh_token';

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
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
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
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving access token to storage:', error);
    }
  },

  /**
   * Remove the Access Token
   */
  async clearAccessToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing access token from storage:', error);
    }
  },

  /**
   * Retrieve the stored Refresh Token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
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
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving refresh token to storage:', error);
    }
  },

  /**
   * Remove the Refresh Token
   */
  async clearRefreshToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
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
        AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing all tokens from storage:', error);
    }
  },
};

export default tokenStorage;
