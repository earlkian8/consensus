import * as productPlanningService from './product-planning.service.js';

export const getProductPlanning = async (req, res) => {
  try {
    const planning = await productPlanningService.getProductPlanning();
    res.json(planning);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProductPlanning = async (req, res) => {
  try {
    const { date, is_ready_analysis } = req.body;
    const planning = await productPlanningService.createProductPlanning({ date, is_ready_analysis });
    res.status(201).json(planning);
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
