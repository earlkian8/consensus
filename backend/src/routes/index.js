import { Router } from "express";
import authRoutes from "../modules/auth/auth.route.js";
import productRoutes from "../modules/product/product.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);

export default router;
