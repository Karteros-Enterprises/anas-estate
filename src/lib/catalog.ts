import type Stripe from 'stripe';
import { getStripe } from './stripe';

export type Product = {
  sku: string;
  name: string;
  description?: string;
  features?: string[];
  format?: string;
  imageUrl?: string;
  priceCents: number;
  stripePriceId: string;
  stripeProductId: string;
  package: {
    weightLb: number;
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    quantity: number;
  };
  sortOrder: number;
};

let cachedProducts: Product[] | undefined;

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100);
}

export async function getProducts(): Promise<Product[]> {
  if (cachedProducts) {
    return cachedProducts;
  }

  const stripe = getStripe();
  const prices = await listCatalogPrices(stripe);

  cachedProducts = prices
    .map((price) => mapStripePriceToProduct(price))
    .filter((product): product is Product => product !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  return cachedProducts;
}

export async function getProduct(
  sku: string | null | undefined,
): Promise<Product | undefined> {
  if (!sku) return undefined;
  const products = await getProducts();
  return products.find((product) => product.sku === sku);
}

async function listCatalogPrices(stripe: Stripe): Promise<Stripe.Price[]> {
  const prices: Stripe.Price[] = [];

  for await (const stripeProduct of stripe.products.list({
    active: true,
    expand: ['data.default_price'],
  })) {
    if (stripeProduct.deleted) continue;

    const defaultPrice = stripeProduct.default_price;
    if (!defaultPrice || typeof defaultPrice === 'string') {
      console.warn(`Stripe product ${stripeProduct.id} is missing a default price, skipping`);
      continue;
    }

    if (!defaultPrice.active || defaultPrice.currency !== 'cad' || defaultPrice.type !== 'one_time') {
      continue;
    }

    if (defaultPrice.unit_amount == null) {
      console.warn(`Stripe product ${stripeProduct.id} default price has no unit_amount, skipping`);
      continue;
    }

    prices.push({
      ...defaultPrice,
      product: stripeProduct,
    });
  }

  return prices;
}

function mapStripePriceToProduct(price: Stripe.Price): Product | null {
  const stripeProduct = price.product;
  if (!stripeProduct || typeof stripeProduct === 'string' || stripeProduct.deleted) {
    console.warn(`Stripe price ${price.id} is missing an expanded product, skipping`);
    return null;
  }

  if (price.unit_amount == null) {
    console.warn(`Stripe price ${price.id} has no unit_amount, skipping`);
    return null;
  }

  const metadata = stripeProduct.metadata;
  const sku = metadata.sku?.trim();
  if (!sku) {
    console.warn(`Stripe product ${stripeProduct.id} is missing metadata.sku, skipping`);
    return null;
  }

  try {
    return {
      sku,
      name: stripeProduct.name,
      description: stripeProduct.description ?? undefined,
      features: metadata.features?.split(',').map((feature) => feature.trim()) || undefined,
      format: metadata.format?.trim() || undefined,
      imageUrl: stripeProduct.images[0],
      priceCents: price.unit_amount,
      stripePriceId: price.id,
      stripeProductId: stripeProduct.id,
      package: parsePackageMetadata(metadata, stripeProduct.id),
      sortOrder: parseSortOrder(metadata.sort_order),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid product metadata';
    console.warn(`Stripe product ${stripeProduct.id} could not be loaded: ${message}`);
    return null;
  }
}

function parsePackageMetadata(
  metadata: Stripe.Metadata,
  productId: string,
): Product['package'] {
  return {
    weightLb: parsePositiveNumber(metadata.package_weight_lb, 'package_weight_lb', productId),
    lengthIn: parsePositiveNumber(metadata.package_length_in, 'package_length_in', productId),
    widthIn: parsePositiveNumber(metadata.package_width_in, 'package_width_in', productId),
    heightIn: parsePositiveNumber(metadata.package_height_in, 'package_height_in', productId),
    quantity: parsePositiveNumber(metadata.package_quantity, 'package_quantity', productId),
  };
}

function parsePositiveNumber(
  value: string | undefined,
  fieldName: string,
  productId: string,
): number {
  const parsed = Number.parseFloat(value ?? '');
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.warn(`Stripe product ${productId} metadata.${fieldName} is not a positive number, setting to 1`);
    return 1;
  }
  return parsed;
}

function parseSortOrder(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '0', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
