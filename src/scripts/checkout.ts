export type ProductSku = 'bottle' | 'case-of-12';

export type ShippingQuoteOption = {
  serviceId: string;
  carrierName: string;
  serviceName: string;
  totalCents: number;
  transitDays: number | null;
};

export type DestinationInput = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  unitNumber?: string;
  city: string;
  region: string;
  postalCode: string;
};

export function formatCad(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100);
}

function getField(form: HTMLFormElement, name: string): string {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) {
    return '';
  }
  return field.value.trim();
}

export function readDestination(form: HTMLFormElement): DestinationInput {
  const addressLine2 = getField(form, 'addressLine2');
  const unitNumber = getField(form, 'unitNumber');

  return {
    name: getField(form, 'name'),
    email: getField(form, 'email'),
    phone: getField(form, 'phone'),
    addressLine1: getField(form, 'addressLine1'),
    addressLine2: addressLine2 || undefined,
    unitNumber: unitNumber || undefined,
    city: getField(form, 'city'),
    region: getField(form, 'region'),
    postalCode: getField(form, 'postalCode'),
  };
}

export function initCheckout(root: HTMLElement): void {
  const productSku = root.dataset.sku as ProductSku | undefined;
  const addressForm = root.querySelector<HTMLFormElement>('#checkout-address-form');
  const shippingSection = root.querySelector<HTMLElement>('#checkout-shipping');
  const shippingOptions = root.querySelector<HTMLElement>('#shipping-options');
  const shippingStatus = root.querySelector<HTMLElement>('#shipping-status');
  const summaryShipping = root.querySelector<HTMLElement>('#summary-shipping');
  const summaryTotal = root.querySelector<HTMLElement>('#summary-total');
  const payButton = root.querySelector<HTMLButtonElement>('#checkout-pay');
  const errorBox = root.querySelector<HTMLElement>('#checkout-error');

  if (
    !productSku ||
    !addressForm ||
    !shippingSection ||
    !shippingOptions ||
    !shippingStatus ||
    !summaryShipping ||
    !summaryTotal ||
    !payButton ||
    !errorBox
  ) {
    return;
  }

  const productPriceCents = Number.parseInt(root.dataset.priceCents ?? '0', 10);
  let quoteId: string | null = null;
  let destination: DestinationInput | null = null;
  let selectedOption: ShippingQuoteOption | null = null;

  const setError = (message: string) => {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  };

  const setLoading = (loading: boolean, message = '') => {
    shippingStatus.textContent = message;
    shippingStatus.hidden = !message;
    payButton.disabled = loading || !selectedOption;
    addressForm.querySelectorAll('button, input, select').forEach((element) => {
      if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
        element.disabled = loading;
      }
      if (element instanceof HTMLSelectElement) {
        element.disabled = loading;
      }
    });
  };

  const updateSummary = () => {
    summaryShipping.textContent = selectedOption
      ? formatCad(selectedOption.totalCents)
      : 'Select a shipping method';
    summaryTotal.textContent = selectedOption
      ? formatCad(productPriceCents + selectedOption.totalCents)
      : formatCad(productPriceCents);
    payButton.disabled = !selectedOption;
  };

  const renderShippingOptions = (options: ShippingQuoteOption[]) => {
    shippingOptions.innerHTML = '';

    options.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'shipping-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'shippingOption';
      input.value = option.serviceId;
      input.checked = index === 0;

      const copy = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = `${option.carrierName} — ${option.serviceName}`;

      const meta = document.createElement('span');
      const transit =
        option.transitDays === null ? 'Transit time varies' : `${option.transitDays} business days`;
      meta.textContent = `${formatCad(option.totalCents)} · ${transit}`;

      copy.append(title, meta);
      label.append(input, copy);
      shippingOptions.append(label);

      if (index === 0) {
        selectedOption = option;
      }
    });

    shippingOptions.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        if (!(input instanceof HTMLInputElement)) return;
        selectedOption =
          options.find((option) => option.serviceId === input.value) ?? selectedOption;
        updateSummary();
      });
    });

    shippingSection.hidden = false;
    updateSummary();
  };

  addressForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setError('');
    destination = readDestination(addressForm);
    selectedOption = null;
    quoteId = null;
    shippingSection.hidden = true;
    shippingOptions.innerHTML = '';
    updateSummary();
    setLoading(true, 'Fetching live shipping rates…');

    try {
      const response = await fetch('/api/shipping/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: productSku, destination }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to fetch shipping rates');
      }

      quoteId = data.quoteId;
      renderShippingOptions(data.options as ShippingQuoteOption[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to fetch shipping rates');
    } finally {
      setLoading(false);
    }
  });

  payButton.addEventListener('click', async () => {
    if (!destination || !selectedOption || !quoteId) {
      setError('Please calculate shipping before continuing to payment.');
      return;
    }

    setError('');
    setLoading(true, 'Redirecting to secure payment…');

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: productSku,
          destination,
          serviceId: selectedOption.serviceId,
          quoteId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to start checkout');
      }

      window.location.href = data.url;
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Unable to start checkout');
    }
  });

  updateSummary();
}

document.querySelectorAll<HTMLElement>('[data-checkout]').forEach(initCheckout);
