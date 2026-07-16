import type { Product } from './catalog';
import type { FreightcomRate, RateRequestBody, ShippingLocation } from './freightcom';
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

export function normalizePostalCode(postalCode: string): string {
  return postalCode.replace(/\s+/g, '').toUpperCase();
}

export function isValidCanadianPostalCode(postalCode: string): boolean {
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(normalizePostalCode(postalCode));
}

export function isValidCanadianProvince(region: string): boolean {
  return CA_PROVINCES.has(region.toUpperCase());
}

function moneyToCents(money: { currency: string; value: string }): number {
  const amount = Number.parseFloat(money.value);
  if (!Number.isFinite(amount)) {
    throw new Error('Invalid Freightcom money value');
  }
  return Math.round(amount * 100);
}

export function applyShippingMarkup(baseCents: number): number {
  const { SHIPPING_MARKUP_PERCENT } = getEnv();
  return Math.round(baseCents * (1 + SHIPPING_MARKUP_PERCENT / 100));
}

function buildLocation(
  destination: ShippingDestination,
  residential: boolean,
): ShippingLocation {
  return {
    name: destination.name,
    address: {
      address_line_1: destination.addressLine1,
      address_line_2: destination.addressLine2,
      city: destination.city,
      region: destination.region.toUpperCase(),
      country: destination.country,
      postal_code: normalizePostalCode(destination.postalCode),
    },
    residential,
    contact_name: destination.name,
    phone_number: { number: destination.phone.replace(/\D/g, '') },
    email_addresses: [destination.email],
  };
}

export function buildRateRequest(
  product: Product,
  destination: ShippingDestination,
): RateRequestBody {
  const env = getEnv();

  return {
    details: {
      origin: {
        name: env.SHIP_FROM_NAME,
        address: {
          address_line_1: env.SHIP_FROM_ADDRESS_LINE_1,
          address_line_2: env.SHIP_FROM_ADDRESS_LINE_2,
          city: env.SHIP_FROM_CITY,
          region: env.SHIP_FROM_REGION,
          country: 'CA',
          postal_code: normalizePostalCode(env.SHIP_FROM_POSTAL_CODE),
        },
        residential: false,
        contact_name: env.SHIP_FROM_CONTACT,
        phone_number: { number: env.SHIP_FROM_PHONE.replace(/\D/g, '') },
        email_addresses: [env.SHIP_FROM_EMAIL],
      },
      destination: buildLocation(destination, true),
      packaging_type: 'package',
      packaging_properties: {
        packages: [
          {
            measurements: {
              weight: { unit: 'lb', value: product.package.weightLb },
              cuboid: {
                unit: 'in',
                l: product.package.lengthIn,
                w: product.package.widthIn,
                h: product.package.heightIn,
              },
            },
            description: product.format,
          },
        ],
      },
      signature_requirement: 'not-required',
    },
  };
}

export function mapFreightcomRates(rates: FreightcomRate[]): ShippingOption[] {
  return rates
    .map((rate) => {
      const baseCents = moneyToCents(rate.total);
      return {
        serviceId: rate.service_id,
        carrierName: rate.carrier_name,
        serviceName: rate.service_name,
        baseCents,
        totalCents: applyShippingMarkup(baseCents),
        transitDays: rate.transit_time_not_available ? null : (rate.transit_time_days ?? null),
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
