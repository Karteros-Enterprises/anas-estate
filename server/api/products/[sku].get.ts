import type { CatalogProduct } from '#shared/types';
import { getCatalogProduct, toPublicCatalogProduct } from '#server/services/catalog';
import { apiError } from '#server/utils/http';

export default defineEventHandler(async (event): Promise<CatalogProduct> => {
  const sku = getRouterParam(event, 'sku');
  const product = await getCatalogProduct(sku);

  if (!product) {
    throw apiError('Product not found', 404);
  }

  return toPublicCatalogProduct(product);
});
