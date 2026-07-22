import type { StallionRateRequest, StallionRate } from '#server/types/stallion';

type RateListResponse = {
  data?: StallionRate[];
};

function buildHeaders(): HeadersInit {
  const { stallion } = useRuntimeConfig();
  return {
    Authorization: `Bearer ${stallion.apiToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

function apiUrl(path: string): string {
  const base = String(useRuntimeConfig().stallion.apiBase).replace(/\/$/, '');
  return `${base}${path}`;
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.message === 'string') return body.message;
    if (typeof body?.error?.message === 'string') return body.error.message;
    if (typeof body?.error === 'string') return body.error;
    return JSON.stringify(body);
  } catch {
    return response.statusText || 'Unknown Stallion API error';
  }
}

export async function fetchStallionRates(body: StallionRateRequest): Promise<{
  rates: StallionRate[];
}> {
  const response = await fetch(apiUrl('/rates'), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Stallion rate request failed: ${await parseError(response)}`);
  }

  const data = (await response.json()) as RateListResponse;
  return { rates: data.data ?? [] };
}
