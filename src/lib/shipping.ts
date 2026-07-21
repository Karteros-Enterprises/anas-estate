import type { Product } from './catalog';
import type { StallionAddress, StallionRate, StallionRateRequest } from './stallion';
import { getEnv } from './env';

export type ShippingDestination = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: 'CA';
};

export type ShippingOption = {
  serviceId: string;
  carrierName: string;
  serviceName: string;
  baseCents: number;
  totalCents: number;
  transitDays: number | null;
};

const CA_PROVINCES = new Set([
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
]);

const STALLION_REGIONS = new Set(['ON', 'BC', 'QC', 'AB']);

export function normalizePostalCode(postalCode: string): string {
  return postalCode.replace(/\s+/g, '').toUpperCase();
}

export function isValidCanadianPostalCode(postalCode: string): boolean {
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(normalizePostalCode(postalCode));
}

export function isValidCanadianProvince(region: string): boolean {
  return CA_PROVINCES.has(region.toUpperCase());
}

function dollarsToCents(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new Error('Invalid money amount');
  }
  return Math.round(amount * 100);
}

export function applyShippingMarkup(baseCents: number): number {
  const { SHIPPING_MARKUP_PERCENT } = getEnv();
  return Math.round(baseCents * (1 + SHIPPING_MARKUP_PERCENT / 100));
}

function buildAddress(
  destination: ShippingDestination,
  residential: boolean,
): StallionAddress {
  return {
    name: destination.name,
    address1: destination.addressLine1,
    address2: destination.addressLine2 ?? null,
    city: destination.city,
    province_code: destination.region.toUpperCase(),
    postal_code: normalizePostalCode(destination.postalCode),
    country_code: destination.country,
    email: destination.email,
    phone: destination.phone.replace(/\D/g, ''),
    is_residential: residential,
  };
}

export function buildRateRequest(
  product: Product,
  destination: ShippingDestination,
): StallionRateRequest {
  const env = getEnv();
  const shipFromRegion = env.SHIP_FROM_REGION.toUpperCase();

  return {
    type: 'regular',
    from_address: {
      name: env.SHIP_FROM_NAME,
      address1: env.SHIP_FROM_ADDRESS_LINE_1,
      address2: env.SHIP_FROM_ADDRESS_LINE_2 ?? null,
      city: env.SHIP_FROM_CITY,
      province_code: shipFromRegion,
      postal_code: normalizePostalCode(env.SHIP_FROM_POSTAL_CODE),
      country_code: 'CA',
      email: env.SHIP_FROM_EMAIL,
      phone: env.SHIP_FROM_PHONE.replace(/\D/g, ''),
      is_residential: false,
    },
    to_address: buildAddress(destination, true),
    packages: Array.from({ length: product.package.quantity }, () => ({
      weight: product.package.weightLb,
      weight_unit: 'lbs' as const,
      length: product.package.lengthIn,
      width: product.package.widthIn,
      height: product.package.heightIn,
      size_unit: 'in' as const,
      package_contents: product.format ?? product.name,
    })),
    items: [
      {
        title: product.name,
        description: product.format ?? product.description ?? null,
        quantity: 1,
        value: product.priceCents / 100,
        currency: 'CAD',
        country_of_origin: 'GR',
        sku: product.sku,
      },
    ],
    signature_confirmation: false,
    region: STALLION_REGIONS.has(shipFromRegion)
      ? (shipFromRegion as 'ON' | 'BC' | 'QC' | 'AB')
      : null,
  };
}

export function mapStallionRates(rates: StallionRate[]): ShippingOption[] {
  return rates
    .map((rate) => {
      const baseCents = dollarsToCents(rate.total);
      return {
        serviceId: rate.service,
        carrierName: rate.carrier,
        serviceName: rate.service_name,
        baseCents,
        totalCents: applyShippingMarkup(baseCents),
        transitDays: rate.estimated_delivery_days ?? null,
      };
    })
    .filter((option) => option.totalCents > 0)
    .sort((a, b) => a.totalCents - b.totalCents);
}

export function findShippingOption(
  options: ShippingOption[],
  serviceId: string,
): ShippingOption | undefined {
  return options.find((option) => option.serviceId === serviceId);
}

export function formatAddress(destination: ShippingDestination): string {
  const lines = [
    destination.name,
    destination.addressLine1,
    destination.addressLine2,
    `${destination.city}, ${destination.region.toUpperCase()} ${normalizePostalCode(destination.postalCode)}`,
    'Canada',
  ].filter(Boolean);

  return lines.join('\n');
}
