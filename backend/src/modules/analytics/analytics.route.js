import { Router } from "express";
import * as analyticsController from "./analytics.controller.js";

const router = Router();

router.get("/latest", analyticsController.getLatestAnalytics);
router.get("/logs", analyticsController.getAnalyticsLogs);

export default router;
