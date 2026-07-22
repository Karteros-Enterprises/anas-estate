import type { Product, QuoteOption, ShippingDestination, ShippingOption } from '#shared/types';
import { getCatalogProduct } from '#server/services/catalog';
import { useStripe } from '#server/services/stripe';
import { fetchStallionRates } from '#server/services/stallion';
import {
  buildRateRequest,
  findShippingOption,
  formatAddress,
  mapStallionRates,
  type RateRequestLine,
} from '#server/services/shipping';
import { type CartItemInput } from '#server/types/cart';

async function resolveCartLines(items: CartItemInput[]): Promise<RateRequestLine[]> {
  const cartItems = dedupeCartItems(items);
  const lines: RateRequestLine[] = [];

  for (const item of cartItems) {
    const product = await getCatalogProduct(item.sku);
    if (!product) {
      throw apiError(`Product not found: ${item.sku}`, 404);
    }
    lines.push({ product, quantity: item.quantity });
  }

  return lines;
}

export async function createShippingQuote(
  items: CartItemInput[],
  destination: ShippingDestination,
): Promise<{ quoteId: string; options: QuoteOption[] }> {
  const lines = await resolveCartLines(items);
  const rateRequest = buildRateRequest(lines, destination);
  const { rates } = await fetchStallionRates(rateRequest);
  const options = mapStallionRates(rates).slice(0, 3);

  if (options.length === 0) {
    throw apiError('No shipping options are available for this address', 422);
  }

  return {
    quoteId: crypto.randomUUID(),
    options: options.map((option) => ({
      serviceId: option.serviceId,
      carrierName: option.carrierName,
      serviceName: option.serviceName,
      totalCents: option.totalCents,
      transitDays: option.transitDays,
    })),
  };
}

type CreateCheckoutInput = {
  items: CartItemInput[];
  destination: ShippingDestination;
  quoteId: string;
  serviceId: string;
};

export async function createCheckoutRedirectUrl({
  items,
  destination,
  quoteId,
  serviceId,
}: CreateCheckoutInput): Promise<string> {
  const lines = await resolveCartLines(items);
  const rateRequest = buildRateRequest(lines, destination);
  const { rates } = await fetchStallionRates(rateRequest);
  const quotedOptions = mapStallionRates(rates).slice(0, 3);
  const selectedOption = findShippingOption(quotedOptions, serviceId);

  if (!selectedOption) {
    throw apiError('Selected shipping method is no longer available', 409);
  }

  return createStripeCheckoutSession({
    lines,
    destination,
    shippingOptions: [selectedOption],
    stallionQuoteId: quoteId,
  });
}

async function createStripeCheckoutSession({
  lines,
  destination,
  shippingOptions,
  stallionQuoteId,
}: {
  lines: RateRequestLine[];
  destination: ShippingDestination;
  shippingOptions: ShippingOption[];
  stallionQuoteId: string;
}): Promise<string> {
  const { siteUrl } = useRuntimeConfig();
  const stripe = useStripe();

  if (lines.length === 0) {
    throw new Error('At least one product is required');
  }

  if (shippingOptions.length === 0) {
    throw new Error('At least one shipping option is required');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'cad',
    customer_email: destination.email,
    payment_intent_data: {
      shipping: {
        name: destination.name,
        phone: destination.phone,
        address: {
          line1: destination.addressLine1,
          line2: destination.addressLine2,
          city: destination.city,
          state: destination.region.toUpperCase(),
          postal_code: destination.postalCode,
          country: destination.country,
        },
      },
    },
    shipping_options: shippingOptions.slice(0, 3).map((shipping) => ({
      shipping_rate_data: {
        type: 'fixed_amount' as const,
        display_name: shipping.serviceName,
        fixed_amount: {
          amount: shipping.totalCents,
          currency: 'cad',
        },
        metadata: {
          stallion_service: shipping.serviceId,
          shipping_carrier: shipping.carrierName,
          shipping_service: shipping.serviceName,
          shipping_base_cents: String(shipping.baseCents),
          shipping_total_cents: String(shipping.totalCents),
        },
      },
    })),
    line_items: lines.map(({ product, quantity }: { product: Product; quantity: number }) => ({
      price: product.stripePriceId,
      quantity,
    })),
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel`,
    metadata: {
      skus: lines.map(({ product, quantity }) => `${product.sku}:${quantity}`).join(','),
      stallion_quote_id: stallionQuoteId,
      ship_to_name: destination.name,
      ship_to_email: destination.email,
      ship_to_phone: destination.phone,
      ship_to_address: formatAddress(destination),
    },
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return session.url;
}
