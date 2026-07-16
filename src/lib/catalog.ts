import type Stripe from 'stripe';
import { getStripePriceIds } from './env';
import { getStripe } from './stripe';

export type Product = {
  sku: string;
  name: string;
  description: string;
  format: string;
  imageUrl: string | undefined;
  imageAlt: string;
  priceCents: number;
  stripePriceId: string;
  stripeProductId: string;
  schemaId: string;
  schemaSize: string | undefined;
  package: {
    weightLb: number;
    lengthIn: number;
    widthIn: number;
    heightIn: number;
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
  const prices = await Promise.all(
    getStripePriceIds().map((priceId) =>
      stripe.prices.retrieve(priceId, { expand: ['product'] }),
    ),
  );

  cachedProducts = prices
    .map((price) => mapStripePriceToProduct(price))
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

function mapStripePriceToProduct(price: Stripe.Price): Product {
  const stripeProduct = price.product;
  if (!stripeProduct || typeof stripeProduct === 'string' || stripeProduct.deleted) {
    throw new Error(`Stripe price ${price.id} is missing an expanded product`);
  }

  if (price.unit_amount == null) {
    throw new Error(`Stripe price ${price.id} has no unit_amount`);
  }

  const metadata = stripeProduct.metadata;
  const sku = metadata.sku?.trim();
  if (!sku) {
    throw new Error(`Stripe product ${stripeProduct.id} is missing metadata.sku`);
  }

  return {
    sku,
    name: stripeProduct.name,
    description: stripeProduct.description ?? '',
    format: metadata.format?.trim() || stripeProduct.name,
    imageUrl: stripeProduct.images[0],
    imageAlt: metadata.image_alt?.trim() || stripeProduct.name,
    priceCents: price.unit_amount,
    stripePriceId: price.id,
    stripeProductId: stripeProduct.id,
    schemaId: metadata.schema_id?.trim() || sku,
    schemaSize: metadata.schema_size?.trim() || undefined,
    package: parsePackageMetadata(metadata, stripeProduct.id),
    sortOrder: parseSortOrder(metadata.sort_order),
  };
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
  };
}

function parsePositiveNumber(
  value: string | undefined,
  fieldName: string,
  productId: string,
): number {
  const parsed = Number.parseFloat(value ?? '');
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Stripe product ${productId} is missing valid metadata.${fieldName}`);
  }
  return parsed;
}

function parseSortOrder(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '0', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
