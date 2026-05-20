import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    picture: z.string().url("Invalid picture URL").optional().or(z.literal("")),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
  body: z.object({
    name: z.string().min(1, "Product name is required").optional(),
    picture: z.string().url("Invalid picture URL").optional().or(z.literal("")),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
});

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
