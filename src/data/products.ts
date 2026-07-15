import type { ImageMetadata } from 'astro';
import { images } from '../assets/images';

export type ProductSku = 'bottle' | 'case-of-12';

export type Product = {
  sku: ProductSku;
  name: string;
  title: string;
  format: string;
  alt: string;
  image: ImageMetadata;
  priceCents: number;
  schemaId: string;
  schemaName: string;
  schemaDescription: string;
  schemaSize: string;
  package: {
    weightLb: number;
    lengthIn: number;
    widthIn: number;
    heightIn: number;
  };
};

export const PRODUCTS: Record<ProductSku, Product> = {
  bottle: {
    sku: 'bottle',
    name: 'Estate Bottle',
    title: 'Estate Bottle',
    format: 'Estate 750ml Bottle',
    alt: 'Ana’s Estate 750 millilitre Extra Virgin Olive Oil bottle',
    image: images.heroBottle,
    priceCents: 6500,
    schemaId: '750ml-bottle',
    schemaName: 'Ana’s Estate Kalamata PDO Extra Virgin Olive Oil — 750 ml',
    schemaDescription:
      'Premium single-estate Kalamata PDO Extra Virgin Olive Oil, cold extracted from early-harvest Koroneiki olives grown in Kalamata, Greece.',
    schemaSize: '750 ml',
    package: {
      weightLb: 3.5,
      lengthIn: 12,
      widthIn: 4,
      heightIn: 4,
    },
  },
  'case-of-12': {
    sku: 'case-of-12',
    name: 'Family and Kitchen Format',
    title: 'Family and Kitchen Format',
    format: 'Family Estate Pack of 12 Bottles',
    alt: 'Family Estate Pack of 12 Bottles',
    image: images.caseOf12,
    priceCents: 72000,
    schemaId: 'case-of-12',
    schemaName: 'Ana’s Estate Kalamata PDO Extra Virgin Olive Oil — Case of 12',
    schemaDescription:
      'A family estate case containing twelve 750 ml bottles of Ana’s Estate Kalamata PDO Extra Virgin Olive Oil.',
    schemaSize: '12 × 750 ml',
    package: {
      weightLb: 28,
      lengthIn: 18,
      widthIn: 14,
      heightIn: 12,
    },
  },
};

export const PRODUCT_LIST = Object.values(PRODUCTS);

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100);
}

export function getProduct(sku: string | null | undefined): Product | undefined {
  if (!sku) return undefined;
  return PRODUCTS[sku as ProductSku];
}

export function isProductSku(value: string): value is ProductSku {
  return value in PRODUCTS;
}
