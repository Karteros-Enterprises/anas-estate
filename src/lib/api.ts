import { z } from 'zod';
import type { ZodError } from 'zod';
import {
  isValidCanadianPostalCode,
  isValidCanadianProvince,
  normalizePostalCode,
} from './shipping';

export const destinationFieldNames = [
  'name',
  'email',
  'phone',
  'addressLine1',
  'addressLine2',
  'city',
  'region',
  'postalCode',
  'country',
] as const;

export type DestinationFieldName = (typeof destinationFieldNames)[number];
export type FieldErrors = Partial<Record<DestinationFieldName, string>>;

export const destinationSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(120, 'Name is too long'),
  email: z.email('Enter a valid email address').trim().max(254, 'Email is too long'),
  phone: z
    .string()
    .trim()
    .min(10, 'Enter a valid phone number')
    .max(20, 'Phone number is too long'),
  addressLine1: z
    .string()
    .trim()
    .min(3, 'Enter your street address')
    .max(120, 'Street address is too long'),
  addressLine2: z.string().trim().max(120, 'Address line 2 is too long').optional(),
  city: z.string().trim().min(2, 'Enter your city').max(80, 'City name is too long'),
  region: z
    .string()
    .trim()
    .toUpperCase()
    .refine(isValidCanadianProvince, 'Select a valid Canadian province or territory'),
  postalCode: z
    .string()
    .trim()
    .transform(normalizePostalCode)
    .refine(isValidCanadianPostalCode, 'Enter a valid Canadian postal code'),
  country: z.literal('CA', { message: 'Shipping is only available within Canada' }),
});

export const quoteRequestSchema = z.object({
  sku: z.string().trim().min(1, 'Invalid product'),
  destination: destinationSchema,
});

export const checkoutSessionSchema = quoteRequestSchema.extend({
  serviceId: z.string().min(1, 'Select a shipping method'),
  quoteId: z.string().min(1, 'Shipping quote has expired'),
});

export class ValidationError extends Error {
  readonly fieldErrors: FieldErrors;

  constructor(fieldErrors: FieldErrors, message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export function formatZodFieldErrors(error: ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = zodIssueToFieldName(issue.path);
    if (!field || fieldErrors[field]) continue;
    fieldErrors[field] = issue.message;
  }

  return fieldErrors;
}

function zodIssueToFieldName(path: PropertyKey[]): DestinationFieldName | null {
  const parts = path.map(String);

  if (parts[0] === 'destination' && parts[1]) {
    return isDestinationFieldName(parts[1]) ? parts[1] : null;
  }

  if (parts.length === 1 && isDestinationFieldName(parts[0])) {
    return parts[0];
  }

  return null;
}

function isDestinationFieldName(value: string): value is DestinationFieldName {
  return (destinationFieldNames as readonly string[]).includes(value);
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function errorResponse(
  message: string,
  status = 400,
  fieldErrors?: FieldErrors,
): Response {
  return jsonResponse({ error: message, fieldErrors: fieldErrors ?? {} }, status);
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
    const fieldErrors = formatZodFieldErrors(parsed.error);
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
  }

  return parsed.data;
}
