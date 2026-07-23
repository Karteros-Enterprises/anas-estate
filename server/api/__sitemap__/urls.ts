import type { SitemapUrlInput } from '#sitemap/types';
import { listCatalogProducts } from '#server/services/catalog';
import { productPath } from '#shared/utils/product';

export default defineSitemapEventHandler(async () => {
  const products = await listCatalogProducts();

  return products.map(
    (product): SitemapUrlInput => ({
      loc: productPath(product.sku),
      _encoded: true,
      changefreq: 'weekly',
      priority: 0.8,
      ...(product.imageUrl
        ? {
            images: [
              {
                loc: product.imageUrl,
                title: product.name,
              },
            ],
          }
        : {}),
    }),
  );
});
