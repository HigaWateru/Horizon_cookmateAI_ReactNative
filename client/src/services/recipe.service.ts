import apiClient from './apiClient';
import API_CONFIG from '../config/api';

/**
 * Recipe Service
 * Manages fetching recipe recommendations and AI recipes from the backend.
 */
export const recipeService = {
  /**
   * Get list of recommended recipes based on user's current inventory
   */
  async getRecommendations() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.RECIPES.RECOMMEND);
    return response.data;
  }
};

export default recipeService;
