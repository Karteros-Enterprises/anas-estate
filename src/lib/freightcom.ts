import { getEnv } from './env';

type Money = {
  currency: string;
  value: string;
};

export type FreightcomRate = {
  carrier_name: string;
  service_name: string;
  service_id: string;
  total: Money;
  base?: Money;
  transit_time_days?: number;
  transit_time_not_available?: boolean;
};

type RatePollResponse = {
  status: {
    done: boolean;
    total: number;
    complete: number;
  };
  rates?: FreightcomRate[];
};

type RateRequestResponse = {
  request_id: string;
};

type ShippingLocation = {
  name: string;
  address: {
    address_line_1: string;
    address_line_2?: string;
    unit_number?: string;
    city: string;
    region: string;
    country: string;
    postal_code: string;
  };
  residential: boolean;
  contact_name: string;
  phone_number: { number: string };
  email_addresses: string[];
};

type RateRequestBody = {
  details: {
    origin: ShippingLocation;
    destination: ShippingLocation;
    packaging_type: 'package';
    packaging_properties: {
      packages: Array<{
        measurements: {
          weight: { unit: 'lb'; value: number };
          cuboid: { unit: 'in'; l: number; w: number; h: number };
        };
        description: string;
      }>;
    };
    signature_requirement: 'not-required';
  };
};

const POLL_INTERVAL_MS = 750;
const MAX_POLL_ATTEMPTS = 40;

function buildHeaders(): HeadersInit {
  const { FREIGHTCOM_API_KEY } = getEnv();
  return {
    Authorization: FREIGHTCOM_API_KEY,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

function apiUrl(path: string): string {
  const base = getEnv().FREIGHTCOM_API_BASE.replace(/\/$/, '');
  return `${base}${path}`;
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.message === 'string') return body.message;
    return JSON.stringify(body);
  } catch {
    return response.statusText || 'Unknown Freightcom API error';
  }
}

export async function requestRates(body: RateRequestBody): Promise<string> {
  const response = await fetch(apiUrl('/rate'), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  if (response.status !== 202 && !response.ok) {
    throw new Error(`Freightcom rate request failed: ${await parseError(response)}`);
  }

  const data = (await response.json()) as RateRequestResponse;
  if (!data.request_id) {
    throw new Error('Freightcom rate request did not return a request_id');
  }

  return data.request_id;
}

export async function pollRates(requestId: string): Promise<FreightcomRate[]> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const response = await fetch(apiUrl(`/rate/${requestId}`), {
      method: 'GET',
      headers: buildHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Freightcom rate poll failed: ${await parseError(response)}`);
    }

    const data = (await response.json()) as RatePollResponse;
    if (data.status?.done) {
      return data.rates ?? [];
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error('Freightcom rate lookup timed out');
}

export async function fetchShippingRates(body: RateRequestBody): Promise<{
  requestId: string;
  rates: FreightcomRate[];
}> {
  const requestId = await requestRates(body);
  const rates = await pollRates(requestId);
  return { requestId, rates };
}

export type { RateRequestBody, ShippingLocation };
