import Stripe from 'stripe';

let stripeClient: Stripe | undefined;

export function useStripe(): Stripe {
  if (!stripeClient) {
    const { stripe } = useRuntimeConfig();
    stripeClient = new Stripe(String(stripe.secretKey));
  }
  return stripeClient;
}
