export type StallionAddress = {
  name: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  province_code: string;
  postal_code: string;
  country_code: string;
  email?: string | null;
  phone?: string | null;
  is_residential?: boolean;
};

export type StallionPackage = {
  weight: number;
  weight_unit?: 'lbs' | 'kg' | 'oz' | 'g';
  length?: number | null;
  width?: number | null;
  height?: number | null;
  size_unit?: 'in' | 'cm' | null;
  package_contents?: string | null;
};

export type StallionCustomsItem = {
  title: string;
  description?: string | null;
  quantity: number;
  value: number;
  currency?: string;
  country_of_origin?: string | null;
  sku?: string | null;
};

export type StallionRateRequest = {
  type?: 'regular' | 'courier';
  to_address: StallionAddress;
  from_address?: StallionAddress | null;
  packages: StallionPackage[];
  items: StallionCustomsItem[];
  signature_confirmation?: boolean | null;
  region?: 'ON' | 'BC' | 'QC' | 'AB' | null;
};

export type StallionRate = {
  postage_type_id?: number | null;
  service: string;
  carrier: string;
  service_name: string;
  subtotal: number;
  tax?: number | null;
  total: number;
  currency: string;
  estimated_delivery_days?: number | null;
};
