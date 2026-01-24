import { apiClient } from './client';

/**
 * Dashboard API
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   * @returns {Promise<{total_words: number, total_collections: number, today_learned: number, to_review: number}>}
   */
  getStats: () => {
    return apiClient.get('/api/dashboard/stats');
  },
};
