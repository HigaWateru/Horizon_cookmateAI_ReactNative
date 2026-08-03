import apiClient from './apiClient';
import API_CONFIG from '../config/api';

/**
 * Category Service
 * Manages fetching ingredient food categories.
 */
export const categoryService = {
  /**
   * Get all food categories from the system
   */
  async getAll() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.CATEGORY.BASE);
    return response.data;
  },
};

export default categoryService;
