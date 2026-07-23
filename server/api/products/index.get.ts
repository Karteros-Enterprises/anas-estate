import type { CatalogProduct } from '#shared/types';
import { listCatalogProducts, toPublicCatalogProduct } from '#server/services/catalog';

export default defineEventHandler(async (): Promise<CatalogProduct[]> => {
  const products = await listCatalogProducts();
  return products.map(toPublicCatalogProduct);
});
