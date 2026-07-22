import { z } from 'zod';

export const cartItemSchema = z.object({
  sku: z.string().trim().min(1, 'Invalid product'),
  quantity: z.number().int().min(1).max(99),
});

export const cartItemsSchema = z
  .array(cartItemSchema)
  .min(1, 'Your cart is empty')
  .max(20, 'Too many items in cart');

export type CartItemInput = z.infer<typeof cartItemSchema>;
