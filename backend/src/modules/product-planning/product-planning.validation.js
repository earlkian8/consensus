import { z } from "zod";

export const createPlanningSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    is_ready_analysis: z.boolean().optional(),
  }),
});

export const updatePlanningSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid planning ID"),
  }),
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    is_ready_analysis: z.boolean().optional(),
  }),
});

export const deletePlanningSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid planning ID"),
  }),
});
