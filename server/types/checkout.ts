import { z } from 'zod';
import { cartItemsSchema } from '#server/types/cart';
import { destinationSchema } from '#server/types/destination';

export const quoteRequestSchema = z.object({
  items: cartItemsSchema,
  destination: destinationSchema,
});

export const checkoutSessionSchema = quoteRequestSchema.extend({
  quoteId: z.string().min(1, 'Shipping quote has expired'),
  serviceId: z.string().min(1, 'Select a shipping method'),
});
