/*

GET, POST, PATCH, DELETE
EXPORT IN INDEX WITH /PRODUCT
 */

import { Router } from "express";
import * as productController from "./product.controller.js";
import { validate } from "../../shared/middleware/validate.js";
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  createPlanningSchema,
  updatePlanningSchema,
  deletePlanningSchema,
} from "./product.validation.js";

const router = Router();

// Products
router.get("/", productController.getAllProducts);
router.post("/", validate(createProductSchema), productController.createProduct);
router.patch("/:id", validate(updateProductSchema), productController.updateProduct);
router.delete("/:id", validate(deleteProductSchema), productController.deleteProduct);

// PP Product Planning
router.get("/planning", productController.getProductPlanning);
router.post("/planning", validate(createPlanningSchema), productController.createProductPlanning);
router.patch("/planning/:id", validate(updatePlanningSchema), productController.updateProductPlanning);
router.delete("/planning/:id", validate(deletePlanningSchema), productController.deleteProductPlanning);

export default router;
