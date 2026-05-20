import { Router } from "express";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

export default router;
