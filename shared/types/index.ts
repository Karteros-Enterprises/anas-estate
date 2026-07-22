export type CartItem = {
  sku: string;
  quantity: number;
};

export type CatalogProduct = {
  sku: string;
  name: string;
  description?: string;
  features?: string[];
  format?: string;
  imageUrl?: string;
  priceCents: number;
};

export type Product = CatalogProduct & {
  stripePriceId: string;
  stripeProductId: string;
  package: {
    weightLb: number;
    lengthIn: number;
    widthIn: number;
    heightIn: number;
    quantity: number;
  };
  sortOrder: number;
};

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

export type QuoteOption = {
  serviceId: string;
  carrierName: string;
  serviceName: string;
  totalCents: number;
  transitDays: number | null;
};

export type DestinationFieldName =
  | 'name'
  | 'email'
  | 'phone'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'region'
  | 'postalCode'
  | 'country';

export type FieldErrors = Partial<Record<DestinationFieldName, string>>;
