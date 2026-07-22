import { createShippingQuote } from '#server/services/checkout';
import { quoteRequestSchema } from '#server/types/checkout';
import { apiError, parseBody, ValidationError } from '#server/utils/http';

export default defineEventHandler(async (event) => {
  try {
    const { items, destination } = await parseBody(event, quoteRequestSchema);
    return await createShippingQuote(items, destination);
  } catch (error) {
    console.error('Shipping quote error:', error);

    if (error instanceof ValidationError) {
      throw apiError('Please correct the highlighted fields.', 400, error.fieldErrors);
    }

    if (isError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Unable to fetch shipping rates';
    const status = message === 'Invalid JSON body' ? 400 : 502;
    throw apiError(
      status === 400 ? message : 'Unable to fetch shipping rates. Please try again.',
      status,
    );
  }
});
