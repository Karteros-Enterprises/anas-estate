import type { APIRoute } from 'astro';
import { getProduct } from '../../../data/products';
import {
  checkoutSessionSchema,
  errorResponse,
  jsonResponse,
  parseJsonBody,
} from '../../../lib/api';
import { fetchShippingRates } from '../../../lib/freightcom';
import { buildRateRequest, findShippingOption, mapFreightcomRates } from '../../../lib/shipping';
import { createCheckoutSession } from '../../../lib/stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { sku, destination, serviceId, quoteId } = await parseJsonBody(
      request,
      checkoutSessionSchema,
    );
    const product = getProduct(sku);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const rateRequest = buildRateRequest(product, destination);
    const { requestId, rates } = await fetchShippingRates(rateRequest);
    const options = mapFreightcomRates(rates);
    const shipping = findShippingOption(options, serviceId);

    if (!shipping) {
      return errorResponse('Selected shipping option is no longer available', 409);
    }

    if (requestId !== quoteId) {
      console.warn('Freightcom quote ID changed between quote and checkout', {
        quoteId,
        requestId,
      });
    }

    const url = await createCheckoutSession({
      product,
      destination,
      shipping,
      freightcomRequestId: requestId,
    });

    return jsonResponse({ url });
  } catch (error) {
    console.error('Checkout session error:', error);
    const message = error instanceof Error ? error.message : 'Unable to start checkout';
    const status = message === 'Invalid JSON body' || message.includes('Invalid') ? 400 : 502;
    return errorResponse(
      status === 400 ? message : 'Unable to start checkout. Please try again.',
      status,
    );
  }
};
