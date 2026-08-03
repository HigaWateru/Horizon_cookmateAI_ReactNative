import apiClient from './apiClient';
import API_CONFIG from '../config/api';

export interface TransactionPayload {
  name: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

/**
 * Transaction Service
 * Manages expense logs, budget allocations and financial statistics.
 */
export const transactionService = {
  /**
   * Get all expense transactions
   */
  async getAll() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.TRANSACTION.BASE);
    return response.data;
  },

  /**
   * Get budget summary and spending statistics
   */
  async getSummary() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.TRANSACTION.SUMMARY);
    return response.data;
  },

  /**
   * Add a new expense transaction
   */
  async create(data: TransactionPayload) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.TRANSACTION.BASE, data);
    return response.data;
  },

  /**
   * Update details of an existing transaction
   */
  async update(id: string, data: Partial<TransactionPayload>) {
    const response = await apiClient.put(`${API_CONFIG.ENDPOINTS.TRANSACTION.BASE}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a transaction record
   */
  async delete(id: string) {
    const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.TRANSACTION.BASE}/${id}`);
    return response.data;
  },
};

export default transactionService;
