import { z } from 'zod';
import { isProductSku } from '../data/products';
import {
  isValidCanadianPostalCode,
  isValidCanadianProvince,
  normalizePostalCode,
} from './shipping';

export const destinationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(10).max(20),
  addressLine1: z.string().trim().min(3).max(120),
  addressLine2: z.string().trim().max(120).optional(),
  unitNumber: z.string().trim().max(20).optional(),
  city: z.string().trim().min(2).max(80),
  region: z
    .string()
    .trim()
    .toUpperCase()
    .refine(isValidCanadianProvince, 'Invalid Canadian province or territory'),
  postalCode: z
    .string()
    .trim()
    .transform(normalizePostalCode)
    .refine(isValidCanadianPostalCode, 'Invalid Canadian postal code'),
});

export const quoteRequestSchema = z.object({
  sku: z.string().refine(isProductSku, 'Invalid product'),
  destination: destinationSchema,
});

export const checkoutSessionSchema = quoteRequestSchema.extend({
  serviceId: z.string().min(1),
  quoteId: z.string().min(1),
});

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export async function parseJsonBody<T>(request: Request, schema: z.ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ');
    throw new Error(message);
  }

  return parsed.data;
}
