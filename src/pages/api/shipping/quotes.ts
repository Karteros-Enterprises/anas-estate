import type { APIRoute } from 'astro';
import { getProduct } from '../../../lib/catalog';
import { errorResponse, jsonResponse, parseJsonBody, quoteRequestSchema, ValidationError } from '../../../lib/api';
import { fetchShippingRates } from '../../../lib/freightcom';
import { buildRateRequest, mapFreightcomRates } from '../../../lib/shipping';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { sku, destination } = await parseJsonBody(request, quoteRequestSchema);
    const product = await getProduct(sku);
    if (!product) {
      return errorResponse('Product not found', 404);
    }

    const rateRequest = buildRateRequest(product, destination);
    const { requestId, rates } = await fetchShippingRates(rateRequest);
    const options = mapFreightcomRates(rates);

    if (options.length === 0) {
      return errorResponse('No shipping options are available for this address', 422);
    }

    return jsonResponse({
      quoteId: requestId,
      options: options.map((option) => ({
        serviceId: option.serviceId,
        carrierName: option.carrierName,
        serviceName: option.serviceName,
        totalCents: option.totalCents,
        transitDays: option.transitDays,
      })),
    });
  } catch (error) {
    console.error('Shipping quote error:', error);

    if (error instanceof ValidationError) {
      return errorResponse('Please correct the highlighted fields.', 400, error.fieldErrors);
    }

    const message = error instanceof Error ? error.message : 'Unable to fetch shipping rates';
    const status = message === 'Invalid JSON body' ? 400 : 502;
    return errorResponse(
      status === 400 ? message : 'Unable to fetch shipping rates. Please try again.',
      status,
    );
  }
};
