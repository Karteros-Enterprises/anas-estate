import { defineOrganization } from 'nuxt-schema-org/schema';

export default defineNuxtConfig({
  compatibilityDate: '2026-07-22',
  modules: ['@nuxt/image', '@nuxtjs/seo'],
  css: ['~/assets/global.css'],
  image: {
    domains: ['files.stripe.com'],
  },
  site: {
    url: 'https://anasestate.com',
    name: "Ana's Estate",
    description:
      'Premium Kalamata PDO Extra Virgin Olive Oil from early-harvest Koroneiki olives. Single estate, cold extracted, available in Canada.',
    defaultLocale: 'en-CA',
  },
  schemaOrg: {
    identity: defineOrganization({
      '@type': ['Organization', 'Store', 'OnlineStore'],
      name: "Ana's Estate",
      alternateName: "Ana's Estate Olive Oil",
      description:
        "Ana's Estate produces premium Kalamata PDO Extra Virgin Olive Oil from early-harvest Koroneiki olives grown in family groves in Kalamata, Greece.",
      logo: '/images/brand/logo.png',
      email: 'anas.oliveoil@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Brampton',
        addressRegion: 'Ontario',
        addressCountry: 'CA',
      },
    }),
  },
  ogImage: {
    enabled: false,
  },
  seo: {
    meta: {
      themeColor: '#001263',
      ogImage: '/images/social-preview.jpg',
      twitterCard: 'summary_large_image',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
  },
  runtimeConfig: {
    stripe: {
      secretKey: '',
    },
    stallion: {
      apiToken: '',
      apiBase: 'https://ship.stallion.ca/api/v5',
    },
    shipping: {
      markupPercent: 15,
    },
    shipFrom: {
      name: "Ana's Estate",
      contact: 'Shipping Department',
      phone: '9050000000',
      email: 'anas.oliveoil@gmail.com',
      addressLine1: '',
      addressLine2: '',
      city: 'Brampton',
      region: 'ON',
      postalCode: '',
    },
    siteUrl: 'https://anasestate.com',
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@300;400;500;600;700&display=swap',
        },
      ],
    }
  },
  routeRules: {
    '/': { isr: true },
    '/products': { swr: 300 },
    '/contact': { isr: true },
    '/policies/**': { isr: true },
    '/cart': { robots: 'noindex, nofollow' },
    '/checkout/**': { robots: 'noindex, nofollow' },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
});
