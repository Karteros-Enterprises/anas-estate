# Ana's Estate

Anas Estate primary marketing and eComm site built with [Astro](https://astro.build).

## Development

Copy `.env.example` to `.env` and fill in the credentials.

```bash
npm install
npm dev
```

Open [http://localhost:4321](http://localhost:4321) to preview the site locally.

## Build

```bash
npm build
```

The Node adapter produces a standalone SSR server in `dist/`. Preview the production build with:

```bash
npm preview
```

## Project structure

```
src/
  assets/images/    Source images (optimized at build time via astro:assets)
  assets/images.ts  Central image imports
  components/
    layout/         Topbar, Header, Footer
    sections/       Homepage sections
  config/site.ts    Site constants and forms
  data/             JSON-LD schema
  layouts/          Page shell (BaseLayout)
  lib/              Stripe catalog, Freightcom, shipping, and API helpers
  pages/
    api/            Shipping quotes and checkout session endpoints
    checkout/       On-site checkout flow
  scripts/          Shared client scripts (reveal, smooth-scroll, checkout)
  styles/           Global CSS
public/
  favicon/          Favicons and web manifest
  fonts/            Custom web fonts
  files/            Downloadable PDFs
  textures/         CSS background images
```

## Images

Page images use Astro's `<Image>` component from `astro:assets`, which generates responsive WebP output at build time. Source files live in `src/assets/images/`.

## Scripts

Client-side behavior is colocated with the code that uses it:

- **Header** — mobile navigation
- **HeroSection** — scroll and pointer parallax
- **index** — active section highlighting in the nav
- **BaseLayout** — scroll reveal animations and smooth anchor scrolling (shared across pages)
- **checkout** — address form, Freightcom rate selection, Stripe redirect

## Checkout and payments

Checkout uses an on-site flow at `/checkout?sku=bottle` or `/checkout?sku=case-of-12`:

1. Customer enters a Canadian shipping address
2. The server requests live parcel rates from Freightcom (with configurable markup)
3. Customer selects a shipping method
4. The server creates a Stripe Checkout Session and redirects to Stripe for payment

### Stripe Dashboard setup

Create active Stripe Products in CAD with a one-time default price. The site loads every active product from your Stripe account at request time — no per-product env variables needed.

Use a [restricted API key](https://docs.stripe.com/keys/restricted-api-keys) with Checkout Sessions write access plus Products and Prices read access for `STRIPE_SECRET_KEY`.

A product appears in the shop when it is:

- Active in Stripe
- Has an active CAD one-time default price
- Includes the required metadata below

The shop, checkout, and homepage schema use Stripe for product name, description, image, and price.

Each Stripe Product also needs metadata for checkout and shipping:

| Metadata key | Required | Example | Purpose |
| --- | --- | --- | --- |
| `sku` | Yes | `bottle` | URL identifier (`/checkout?sku=bottle`) |
| `format` | No | `Estate 750ml Bottle` | Shop subtitle and shipping package description |
| `image_alt` | No | `Ana's Estate 750ml bottle` | Image alt text (defaults to product name) |
| `schema_id` | No | `750ml-bottle` | JSON-LD `@id` suffix (defaults to `sku`) |
| `schema_size` | No | `750 ml` | JSON-LD product size |
| `sort_order` | No | `1` | Shop page ordering |
| `package_weight_lb` | Yes | `3.5` | Shipping parcel weight |
| `package_length_in` | Yes | `12` | Shipping parcel length |
| `package_width_in` | Yes | `4` | Shipping parcel width |
| `package_height_in` | Yes | `4` | Shipping parcel height |
| `package_quantity` | Yes | `1` | Number of packages |

Upload product images in the Stripe Dashboard; those URLs are used on the shop page and in structured data.

Retire the old Payment Links once the new checkout flow is live.

### Environment variables

Copy `.env.example` to `.env` and configure:

- `STRIPE_SECRET_KEY`
- `FREIGHTCOM_API_KEY`, `FREIGHTCOM_API_BASE`
- `SHIPPING_MARKUP_PERCENT`
- Ship-from address fields (`SHIP_FROM_*`)
- `SITE_URL` (production: `https://anasestate.com`)

Request Freightcom API access at [freightcom.com/shipping-api](https://www.freightcom.com/shipping-api).

## Deployment

This site runs as a **Node SSR server**, not static files alone.

1. Build: `npm build`
2. Deploy `dist/` to a Node >= 22.12 host
3. Start: `node ./dist/server/entry.mjs`
4. Set all required environment variables on the host
5. Serve over HTTPS (required for Stripe redirects)

Ensure API routes (`/api/shipping/quotes`, `/api/checkout/session`) and checkout pages are reachable from the public URL configured in `SITE_URL`.
