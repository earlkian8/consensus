import { Router } from "express";
import authRoutes from "../modules/auth/auth.route.js";
import productRoutes from "../modules/product/product.route.js";
import productPlanningRoutes from "../modules/product-planning/product-planning.route.js"
const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/product-planning", productPlanningRoutes);

export default router;
