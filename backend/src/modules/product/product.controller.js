import * as productService from "./product.service.js";

// Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, picture } = req.body;
    const product = await productService.createProduct({ name, picture });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, picture } = req.body;
    const product = await productService.updateProduct(id, { name, picture });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.deleteProduct(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PP Product Planning
export const getProductPlanning = async (req, res) => {
  try {
    const planning = await productService.getProductPlanning();
    res.json(planning);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProductPlanning = async (req, res) => {
  try {
    const { date, is_ready_analysis } = req.body;
    const planning = await productService.createProductPlanning({ date, is_ready_analysis });
    res.status(201).json(planning);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProductPlanning = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, is_ready_analysis } = req.body;
    const planning = await productService.updateProductPlanning(id, { date, is_ready_analysis });
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
    const planning = await productService.deleteProductPlanning(id);
    if (!planning) {
      return res.status(404).json({ error: "Production plan not found" });
    }
    res.json({ message: "Production plan deleted successfully", planning });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
