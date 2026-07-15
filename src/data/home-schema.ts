import { getImage } from 'astro:assets';
import { images } from '../assets/images';
import { SITE } from '../config/site';
import { PRODUCT_LIST } from './products';

export async function getHomeJsonLd() {
  const logo = await getImage({ src: images.logo, format: 'png' });
  const socialPreviewUrl = `${SITE.url}/images/social-preview.jpg`;

  const productImages = await Promise.all(
    PRODUCT_LIST.map(async (product) => ({
      product,
      imageUrl: new URL(
        (await getImage({ src: product.image, format: 'png' })).src,
        SITE.url,
      ).href,
    })),
  );

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'OnlineStore',
        '@id': `${SITE.url}/#organization`,
        name: SITE.name,
        alternateName: "Ana's Estate",
        url: `${SITE.url}/`,
        logo: {
          '@type': 'ImageObject',
          '@id': `${SITE.url}/#logo`,
          url: new URL(logo.src, SITE.url).href,
          contentUrl: new URL(logo.src, SITE.url).href,
          caption: SITE.name,
        },
        image: {
          '@type': 'ImageObject',
          url: socialPreviewUrl,
          width: 1200,
          height: 630,
        },
        description:
          "Ana’s Estate produces premium Kalamata PDO Extra Virgin Olive Oil from early-harvest Koroneiki olives grown in family groves in Kalamata, Greece.",
        email: SITE.email,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Brampton',
          addressRegion: 'Ontario',
          addressCountry: 'CA',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: `${SITE.url}/`,
        name: SITE.name,
        alternateName: "Ana's Estate Olive Oil",
        description: 'Premium Kalamata PDO Extra Virgin Olive Oil from Greece.',
        publisher: { '@id': `${SITE.url}/#organization` },
        inLanguage: 'en-CA',
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE.url}/#webpage`,
        url: `${SITE.url}/`,
        name: 'Premium Kalamata PDO Extra Virgin Olive Oil | Ana’s Estate',
        description:
          'Shop Ana’s Estate premium Kalamata PDO Extra Virgin Olive Oil, produced in Greece from early-harvest Koroneiki olives.',
        isPartOf: { '@id': `${SITE.url}/#website` },
        about: { '@id': `${SITE.url}/#organization` },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: socialPreviewUrl,
          width: 1200,
          height: 630,
        },
        inLanguage: 'en-CA',
      },
      ...productImages.map(({ product, imageUrl }) => ({
        '@type': 'Product',
        '@id': `${SITE.url}/#${product.schemaId}`,
        name: product.schemaName,
        description: product.schemaDescription,
        image: [imageUrl],
        brand: { '@type': 'Brand', name: SITE.name },
        manufacturer: { '@id': `${SITE.url}/#organization` },
        category: 'Extra Virgin Olive Oil',
        countryOfOrigin: { '@type': 'Country', name: 'Greece' },
        size: product.schemaSize,
        itemCondition: 'https://schema.org/NewCondition',
        offers: {
          '@type': 'Offer',
          url: `${SITE.url}/checkout?sku=${product.sku}`,
          price: (product.priceCents / 100).toFixed(2),
          priceCurrency: 'CAD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': `${SITE.url}/#organization` },
        },
      })),
    ],
  };
}
