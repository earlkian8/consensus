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
} from "./product.validation.js";

const router = Router();

// Products
router.get("/", productController.getAllProducts);
router.post("/", validate(createProductSchema), productController.createProduct);
router.patch("/:id", validate(updateProductSchema), productController.updateProduct);
router.delete("/:id", validate(deleteProductSchema), productController.deleteProduct);


export default router;
