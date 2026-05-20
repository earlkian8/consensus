import { z } from "zod";

const DISH_TYPES = ["BY_PIECE", "SOUP_STEW", "SOLID_IN_SOUP", "DRY_SCOOPED", "SAUCE_BASED"];

const productBodySchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().optional(),
  dish_type: z.enum(DISH_TYPES, { errorMap: () => ({ message: "Invalid dish type" }) }),
  batch_solid_count: z.number().positive().nullable().optional(),
  unit_solid: z.string().nullable().optional(),
  batch_liquid_volume: z.number().positive().nullable().optional(),
  unit_liquid: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  picture: z.string().nullable().optional(),
});

export const createProductSchema = z.object({
  body: productBodySchema,
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
  body: productBodySchema.partial(),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
});
