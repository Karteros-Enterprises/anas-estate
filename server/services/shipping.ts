import type { Product, ShippingDestination, ShippingOption } from '#shared/types';
import { normalizePostalCode } from '#shared/utils/address';
import type {
  StallionAddress,
  StallionRate,
  StallionRateRequest,
} from '#server/types/stallion';

const STALLION_REGIONS = new Set(['ON', 'BC', 'QC', 'AB']);

function dollarsToCents(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new Error('Invalid money amount');
  }
  return Math.round(amount * 100);
}

export function applyShippingMarkup(baseCents: number): number {
  const { shipping } = useRuntimeConfig();
  return Math.round(baseCents * (1 + Number(shipping.markupPercent) / 100));
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

export type RateRequestLine = {
  product: Product;
  quantity: number;
};

export function buildRateRequest(
  lines: RateRequestLine[],
  destination: ShippingDestination,
): StallionRateRequest {
  if (lines.length === 0) {
    throw new Error('At least one product is required');
  }

  const { shipFrom } = useRuntimeConfig();
  const shipFromRegion = String(shipFrom.region).toUpperCase();

  const packages = lines.flatMap(({ product, quantity }) =>
    Array.from({ length: product.package.quantity * quantity }, () => ({
      weight: product.package.weightLb,
      weight_unit: 'lbs' as const,
      length: product.package.lengthIn,
      width: product.package.widthIn,
      height: product.package.heightIn,
      size_unit: 'in' as const,
      package_contents: product.format ?? product.name,
    })),
  );

  const items = lines.map(({ product, quantity }) => ({
    title: product.name,
    description: product.format ?? product.description ?? null,
    quantity,
    value: product.priceCents / 100,
    currency: 'CAD' as const,
    country_of_origin: 'GR',
    sku: product.sku,
  }));

  return {
    type: 'regular',
    from_address: {
      name: String(shipFrom.name),
      address1: String(shipFrom.addressLine1),
      address2: shipFrom.addressLine2 ? String(shipFrom.addressLine2) : null,
      city: String(shipFrom.city),
      province_code: shipFromRegion,
      postal_code: normalizePostalCode(String(shipFrom.postalCode)),
      country_code: 'CA',
      email: String(shipFrom.email),
      phone: String(shipFrom.phone).replace(/\D/g, ''),
      is_residential: false,
    },
    to_address: buildAddress(destination, true),
    packages,
    items,
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
