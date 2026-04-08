import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    console.error('[API Error]:', message);
    return Promise.reject(new Error(message));
  }
);

export const kpiService = {
  /**
   * Get aggregated KPIs for all domains or a specific one
   * @param {string} domain - optional domain name
   * @param {string} range - 'today', 'week', 'month'
   */
  getAggregatedData: (domain = 'all', range = 'today') =>
    api.get(`/kpis/${domain}`, { params: { range } }),

  /**
   * Get raw daily records for a time period
   * @param {number} days - number of days to look back
   */
  getDailyData: (days = 30) =>
    api.get('/daily', { params: { days } }),

  /**
   * Get trend data for charts
   * @param {number} days - number of days
   */
  getTrends: (days = 30) =>
    api.get('/trends', { params: { days } }),

  /**
   * Get today's hourly performance
   */
  getHourlyData: () =>
    api.get('/hourly'),

  /**
   * Get 7-day heatmaps
   */
  getHeatmaps: (type = 'revpash') =>
    api.get(`/heatmaps/${type}`),

  /**
   * Get menu engineering data
   */
  getMenuItems: () =>
    api.get('/menu'),

  /**
   * Get staff members & performance metrics
   */
  getStaffData: () =>
    api.get('/staff'),
};

export const alertService = {
  /**
   * List all alerts
   */
  getAlerts: (filters = {}) =>
    api.get('/alerts', { params: filters }),

  /**
   * Acknowledge an alert
   */
  acknowledge: (id) =>
    api.put(`/alerts/${id}/acknowledge`),

  /**
   * Dismiss an alert
   */
  dismiss: (id) =>
    api.put(`/alerts/${id}/dismiss`),

  /**
   * Trigger a demo scenario
   */
  triggerScenario: (scenarioId) =>
    api.post('/alerts/trigger', { scenarioId }),

  /**
   * Reset a scenario
   */
  resetScenario: (scenarioId) =>
    api.post('/alerts/reset-scenario', { scenarioId }),
};

export const settingsService = {
  /**
   * Get alert thresholds
   */
  getThresholds: () =>
    api.get('/settings/thresholds'),

  /**
   * Update a threshold
   */
  updateThreshold: (id, data) =>
    api.put(`/settings/thresholds/${id}`, data),

  /**
   * Bulk update thresholds
   */
  bulkUpdateThresholds: (thresholds) =>
    api.put('/settings/thresholds', { thresholds }),
};

export const exportService = {
  /**
   * Download a domain report as CSV or PDF
   */
  getExportUrl: (domain, format, days = 30) =>
    `${API_BASE_URL}/export/${domain}/${format}?days=${days}`,
};

export default api;
