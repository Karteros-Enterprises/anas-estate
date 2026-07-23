export const DEFAULT_PRODUCT_FEATURES = [
  'Koroneiki Monovarietal',
  'Early Harvest',
  'Cold Extracted',
  'PDO Kalamata',
  'Independently Lab Tested',
  '396mg/kg Polyphenols',
] as const;

export function productPath(sku: string): string {
  return `/products/${encodeURIComponent(sku)}`;
}
