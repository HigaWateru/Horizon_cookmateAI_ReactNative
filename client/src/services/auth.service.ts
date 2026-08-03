import apiClient from './apiClient';
import API_CONFIG from '../config/api';
import tokenStorage from './tokenStorage';

/**
 * Authentication Service
 * Manages registration, login, logout, verification, and password resets.
 */
export const authService = {
  /**
   * Register a new account
   */
  async register(name: string, email: string, password: string) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      name,
      email,
      password,
    });
    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    
    // Check if access token is returned inside standard envelope
    const authData = response.data?.data;
    if (authData?.accessToken) {
      await tokenStorage.setAccessToken(authData.accessToken);
      if (authData.refreshToken) {
        await tokenStorage.setRefreshToken(authData.refreshToken);
      }
    }
    
    return response.data;
  },

  /**
   * Verify email using OTP code
   */
  async verifyEmail(email: string, code: string) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, {
      email,
      code,
    });
    return response.data;
  },

  /**
   * Trigger forgot password flow
   */
  async forgotPassword(email: string) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with OTP and new password
   */
  async resetPassword(payload: { email: string; otp: string; newPassword: any }) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, payload);
    return response.data;
  },

  /**
   * Logout user, clear tokens, and blacklist token in backend
   */
  async logout() {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Backend logout request failed, clearing local tokens anyway.', error);
    } finally {
      await tokenStorage.clearAllTokens();
    }
  },
};

export default authService;
