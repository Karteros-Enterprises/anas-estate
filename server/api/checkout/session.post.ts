import { createCheckoutRedirectUrl } from '#server/services/checkout';
import { checkoutSessionSchema } from '#server/types/checkout';
import { apiError, parseBody, ValidationError } from '#server/utils/http';

export default defineEventHandler(async (event) => {
  try {
    const { items, destination, quoteId, serviceId } = await parseBody(
      event,
      checkoutSessionSchema,
    );

    const url = await createCheckoutRedirectUrl({
      items,
      destination,
      quoteId,
      serviceId,
    });

    return { url };
  } catch (error) {
    console.error('Checkout session error:', error);

    if (error instanceof ValidationError) {
      throw apiError('Please correct the highlighted fields.', 400, error.fieldErrors);
    }

    if (isError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Unable to start checkout';
    const status = message === 'Invalid JSON body' ? 400 : 502;
    throw apiError(
      status === 400 ? message : 'Unable to start checkout. Please try again.',
      status,
    );
  }
});
