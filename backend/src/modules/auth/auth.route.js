import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../shared/middleware/validate.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);

export default router;
