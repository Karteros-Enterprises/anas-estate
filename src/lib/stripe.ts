import Stripe from 'stripe';
import type { Product } from './catalog';
import type { ShippingDestination, ShippingOption } from './shipping';
import { formatAddress } from './shipping';
import { getEnv } from './env';

let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getEnv().STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

type CreateCheckoutSessionInput = {
  product: Product;
  destination: ShippingDestination;
  shipping: ShippingOption;
  freightcomRequestId: string;
};

export async function createCheckoutSession({
  product,
  destination,
  shipping,
  freightcomRequestId,
}: CreateCheckoutSessionInput): Promise<string> {
  const env = getEnv();
  const stripe = getStripe();

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
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: `${shipping.carrierName} ${shipping.serviceName}`,
          fixed_amount: {
            amount: shipping.totalCents,
            currency: 'cad',
          }
        },
      }
    ],
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${env.SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.SITE_URL}/checkout/cancel?sku=${product.sku}`,
    metadata: {
      sku: product.sku,
      freightcom_request_id: freightcomRequestId,
      freightcom_service_id: shipping.serviceId,
      shipping_carrier: shipping.carrierName,
      shipping_service: shipping.serviceName,
      shipping_base_cents: String(shipping.baseCents),
      shipping_total_cents: String(shipping.totalCents),
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
