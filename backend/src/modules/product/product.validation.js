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
