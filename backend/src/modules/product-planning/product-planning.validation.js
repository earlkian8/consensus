import { z } from "zod";

export const createPlanningSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Plan name is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format").optional(),
    is_ready_analysis: z.boolean().optional(),
    details: z.array(
      z.object({
        p_fk: z.string().uuid("Invalid product ID"),
        amount: z.number({ required_error: "Amount is required" }).positive("Amount must be positive"),
        excess: z.number().optional(),
      })
    ).min(1, "At least one production detail is required"),
  }),
});

export const updateDetailExcessSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid plan ID"),
  }),
  body: z.object({
    details: z.array(
      z.object({
        id: z.string().uuid("Invalid detail ID"),
        excess: z.number({ required_error: "Excess is required" }).min(0),
        condition: z.string().optional(),
      })
    ).min(1, "At least one detail is required"),
  }),
});

export const updateDetailAmountSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid detail ID"),
  }),
  body: z.object({
    amount: z.number({ required_error: "Amount is required" }).positive(),
  }),
});

export const updatePlanStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid plan ID"),
  }),
  body: z.object({
    status: z.enum(["idle", "active", "ended"]),
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
