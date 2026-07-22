import { z } from 'zod';
import type { DestinationFieldName, FieldErrors } from '#shared/types';
import {
  isValidCanadianPostalCode,
  isValidCanadianProvince,
  normalizePostalCode,
} from '#shared/utils/address';

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
] as const satisfies readonly DestinationFieldName[];

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

export type DestinationInput = z.input<typeof destinationSchema>;
export type DestinationParsed = z.output<typeof destinationSchema>;

function isDestinationFieldName(value: string): value is DestinationFieldName {
  return (destinationFieldNames as readonly string[]).includes(value);
}

export function formatDestinationFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== 'string' || !isDestinationFieldName(key) || fieldErrors[key]) continue;
    fieldErrors[key] = issue.message;
  }

  return fieldErrors;
}

export function destinationPayload(destination: DestinationInput) {
  return {
    ...destination,
    addressLine2: destination.addressLine2?.trim() || undefined,
  };
}

export function validateDestination(destination: DestinationInput): {
  success: true;
  data: DestinationParsed;
} | {
  success: false;
  fieldErrors: FieldErrors;
} {
  const parsed = destinationSchema.safeParse(destinationPayload(destination));
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }
  return { success: false, fieldErrors: formatDestinationFieldErrors(parsed.error) };
}

export function validateDestinationField(
  field: DestinationFieldName,
  destination: DestinationInput,
): string | undefined {
  const value = destinationPayload(destination)[field];
  const parsed = destinationSchema.shape[field].safeParse(value);
  if (parsed.success) return undefined;
  return parsed.error.issues[0]?.message;
}
