import type { CatalogProduct } from '#shared/types';
import { listCatalogProducts } from '#server/services/catalog';

export default defineEventHandler(async (): Promise<CatalogProduct[]> => {
  const products = await listCatalogProducts();

  return products.map((product) => ({
    sku: product.sku,
    name: product.name,
    description: product.description,
    features: product.features,
    format: product.format,
    imageUrl: product.imageUrl,
    priceCents: product.priceCents,
  }));
});
