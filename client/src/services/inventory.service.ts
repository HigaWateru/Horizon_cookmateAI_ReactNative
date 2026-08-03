import apiClient from './apiClient';
import API_CONFIG from '../config/api';

export interface InventoryQueryParams {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  storageLocation?: string;
  sortBy?: 'expiryDate' | 'daysLeft' | 'quantity';
  order?: 'asc' | 'desc';
}

export interface IngredientPayload {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  storageLocation: string;
  icon?: string;
  category?: string;
  expiryDays: number;
  note?: string;
}

/**
 * Inventory Service
 * Manages kitchen ingredients storage, search, filter, and CRUD operations.
 */
export const inventoryService = {
  /**
   * Get list of ingredients with pagination, filtering and sorting
   */
  async getAll(params: InventoryQueryParams = {}) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.INVENTORY.BASE, {
      params,
    });
    return response.data;
  },

  /**
   * Get detailed information of a single ingredient by ID
   */
  async getById(id: string) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.INVENTORY.DETAIL(id));
    return response.data;
  },

  /**
   * Add a new ingredient to the user's inventory
   */
  async create(data: IngredientPayload) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.INVENTORY.BASE, data);
    return response.data;
  },

  /**
   * Update details of an existing ingredient
   */
  async update(id: string, data: Partial<IngredientPayload>) {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.INVENTORY.DETAIL(id), data);
    return response.data;
  },

  /**
   * Delete an ingredient from the user's inventory
   */
  async delete(id: string) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.INVENTORY.DETAIL(id));
    return response.data;
  },
};

export default inventoryService;
