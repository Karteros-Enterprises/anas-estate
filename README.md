# Ana's Estate

Ana's Estate marketing and eCommerce site built with [Nuxt 4](https://nuxt.com).

## Development

Copy `.env.example` to `.env` and fill in the credentials (Nuxt maps `NUXT_*` vars onto `runtimeConfig`).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to preview the site locally.

## Build

```bash
pnpm build
```

Nitro produces a Node server under `.output/`. Preview the production build with:

```bash
pnpm preview
```

## Checkout and payments

Shopping uses a browser-persisted cart (`localStorage` via `useCart`) and an on-site checkout flow:

1. Customer adds products from `/products`
2. Cart page reviews items, then continues to `/checkout`
3. Customer enters a Canadian shipping address
4. The server requests live parcel rates from Stallion (with configurable markup)
5. Customer selects a shipping method
6. The server creates a Stripe Checkout Session and redirects for payment
7. On success, the cart is cleared

### Stripe Dashboard setup

Create active Stripe Products in CAD with a one-time default price. The site loads every active product from your Stripe account at request time.

Use a [restricted API key](https://docs.stripe.com/keys/restricted-api-keys) with Checkout Sessions write access plus Products and Prices read access for `NUXT_STRIPE_SECRET_KEY`.

Required product metadata:

| Metadata key | Required | Purpose |
| --- | --- | --- |
| `sku` | Yes | Cart / checkout identifier |
| `format` | No | Shop subtitle |
| `package_weight_lb` | Yes | Shipping weight |
| `package_length_in` | Yes | Shipping length |
| `package_width_in` | Yes | Shipping width |
| `package_height_in` | Yes | Shipping height |
| `package_quantity` | Yes | Packages per unit |
