import { Router } from "express";
import * as productPlanningController from "./product-planning.controller.js";
import { validate } from "../../shared/middleware/validate.js";
import {
  createPlanningSchema,
  updatePlanningSchema,
  updateDetailExcessSchema,
  deletePlanningSchema,
} from "./product-planning.validation.js";

const router = Router();

router.get("/latest", productPlanningController.getLatestProductPlanning);
router.get("/logs", productPlanningController.getProductPlanningLogs);
router.post("/", validate(createPlanningSchema), productPlanningController.createProductPlanning);
router.patch("/details/:id/excess", validate(updateDetailExcessSchema), productPlanningController.updateProductDetailExcess);
router.patch("/:id", validate(updatePlanningSchema), productPlanningController.updateProductPlanning);

router.delete("/:id", validate(deletePlanningSchema), productPlanningController.deleteProductPlanning);

export default router;