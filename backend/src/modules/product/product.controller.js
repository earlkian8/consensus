import * as productService from "./product.service.js";

export const uploadProductImage = async (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) return res.status(400).json({ error: "Image is required" });
    const url = await productService.uploadProductImage(image, filename ?? "product");
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
    const { name, category, dish_type, batch_solid_count, unit_solid, batch_liquid_volume, unit_liquid, notes, picture } = req.body;
    const product = await productService.createProduct({ name, category, dish_type, batch_solid_count, unit_solid, batch_liquid_volume, unit_liquid, notes, picture });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, dish_type, batch_solid_count, unit_solid, batch_liquid_volume, unit_liquid, notes, picture } = req.body;
    const product = await productService.updateProduct(id, { name, category, dish_type, batch_solid_count, unit_solid, batch_liquid_volume, unit_liquid, notes, picture });
    if (!product) return res.status(404).json({ error: "Product not found" });
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
