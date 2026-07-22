import type { ZodSchema, ZodError } from 'zod';
import type { DestinationFieldName, FieldErrors } from '#shared/types';
import { destinationFieldNames } from '#shared/schemas/destination';

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

export async function parseBody<T>(event: H3Event, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await readBody(event);
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON body' });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = formatZodFieldErrors(parsed.error);
    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidationError(fieldErrors);
    }

    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues.map((issue) => issue.message).join(', '),
    });
  }

  return parsed.data;
}

export function apiError(
  message: string,
  statusCode = 400,
  fieldErrors?: FieldErrors,
) {
  return createError({
    statusCode,
    statusMessage: message,
    data: { error: message, fieldErrors: fieldErrors ?? {} },
  });
}
