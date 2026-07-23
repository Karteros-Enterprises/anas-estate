import type { CatalogProduct } from '#shared/types';
import { productPath } from '#shared/utils/product';

export function defineCatalogProduct(product: CatalogProduct) {
  return defineProduct({
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: "Ana's Estate",
    },
    category: 'Extra Virgin Olive Oil',
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Greece',
    },
    offers: defineOffer({
      url: productPath(product.sku),
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: 'CAD',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    }),
  });
}

export function defineCatalogProducts(products: CatalogProduct[] | null | undefined) {
  return (products ?? []).map(defineCatalogProduct);
}
