import * as analyticsService from "./analytics.service.js";

export const getLatestAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getLatestAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalyticsLogs = async (req, res) => {
  try {
    const data = await analyticsService.getAnalyticsLogs();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
