import * as productPlanningService from './product-planning.service.js';

export const getLatestProductPlanning = async (req, res) => {
  try {
    const planning = await productPlanningService.getLatestProductPlanning();
    res.json(planning);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductPlanningLogs = async (req, res) => {
  try {
    const logs = await productPlanningService.getProductPlanningLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProductPlanning = async (req, res) => {
  try {
    const { name, date, end_time, is_ready_analysis, details } = req.body;
    const planning = await productPlanningService.createProductPlanning({ name, date, end_time, is_ready_analysis, details });
    res.status(201).json(planning);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProductDetailAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const detail = await productPlanningService.updateProductDetailAmount(id, amount);
    res.json(detail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProductDetailExcess = async (req, res) => {
  try {
    const { id } = req.params;
    const { details } = req.body;
    const result = await productPlanningService.updateProductDetailExcess(id, details);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const plan = await productPlanningService.updatePlanStatus(id, status);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProductPlanning = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, is_ready_analysis } = req.body;
    const planning = await productPlanningService.updateProductPlanning(id, { date, is_ready_analysis });
    if (!planning) {
      return res.status(404).json({ error: "Production plan not found" });
    }
    res.json(planning);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProductPlanning = async (req, res) => {
  try {
    const { id } = req.params;
    const planning = await productPlanningService.deleteProductPlanning(id);
    if (!planning) {
      return res.status(404).json({ error: "Production plan not found" });
    }
    res.json({ message: "Production plan deleted successfully", planning });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
