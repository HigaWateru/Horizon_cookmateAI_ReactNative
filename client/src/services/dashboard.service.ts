import apiClient from './apiClient';
import API_CONFIG from '../config/api';

export interface GroupStats {
  name: string;
  count: number;
  amount?: number;
  percentage?: number;
  icon: string;
}

export interface DaySpend {
  date: string;
  amount: number;
}

export interface MonthSpend {
  month: string;
  amount: number;
}

export interface DashboardStatsResponse {
  totalIngredients: number;
  expiringIngredientsCount: number;
  expiredIngredientsCount: number;
  totalIngredientValue: number;
  budgetLimit: number;
  totalSpent: number;
  remainingBudget: number;
  budgetStatus: 'NORMAL' | 'WARNING' | 'EXCEEDED';
  wastedValueEstimation: number;

  categorySpentBreakdown: GroupStats[];
  storageLocationBreakdown: GroupStats[];
  categoryIngredientBreakdown: GroupStats[];
  dailySpendHistory: DaySpend[];
  monthlySpendHistory: MonthSpend[];
}

export const dashboardService = {
  /**
   * Get overall dashboard and statistics
   */
  async getStatistics(): Promise<{ result: DashboardStatsResponse }> {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.STATISTICS);
    return response.data;
  },
};

export default dashboardService;
