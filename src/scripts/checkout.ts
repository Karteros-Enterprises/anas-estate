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
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

type FieldErrors = Partial<Record<keyof DestinationInput, string>>;

type ApiErrorResponse = {
  error?: string;
  fieldErrors?: FieldErrors;
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

  return {
    name: getField(form, 'name'),
    email: getField(form, 'email'),
    phone: getField(form, 'phone'),
    addressLine1: getField(form, 'addressLine1'),
    addressLine2: addressLine2 || undefined,
    city: getField(form, 'city'),
    region: getField(form, 'region'),
    postalCode: getField(form, 'postalCode'),
    country: getField(form, 'country'),
  };
}

export function initCheckout(root: HTMLElement): void {
  const productSku = root.dataset.sku;
  const addressForm = root.querySelector<HTMLFormElement>('#checkout-address-form');
  const shippingSection = root.querySelector<HTMLElement>('#checkout-shipping');
  const shippingOptions = root.querySelector<HTMLElement>('#shipping-options');
  const shippingStatus = root.querySelector<HTMLElement>('#shipping-status');
  const summaryShipping = root.querySelector<HTMLElement>('#summary-shipping');
  const summaryTotal = root.querySelector<HTMLElement>('#summary-total');
  const continueButton = addressForm?.querySelector<HTMLButtonElement>('button[type="submit"]');
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
    !continueButton ||
    !payButton ||
    !errorBox
  ) {
    return;
  }

  const productPriceCents = Number.parseInt(root.dataset.priceCents ?? '0', 10);
  let quoteId: string | null = null;
  let destination: DestinationInput | null = null;
  let selectedOption: ShippingQuoteOption | null = null;
  let hasShippingRates = false;
  let isLoading = false;

  const regionSelect = addressForm.querySelector<HTMLSelectElement>('#checkout-region');
  if (regionSelect) {
    const defaultRegion = regionSelect.dataset.defaultRegion ?? 'ON';
    regionSelect.value = defaultRegion;

    regionSelect.addEventListener('change', () => {
      regionSelect.dataset.userSelected = 'true';
    });

    // Browsers may autofill after initial render; restore the default unless the user chose a province.
    window.setTimeout(() => {
      if (regionSelect.dataset.userSelected !== 'true') {
        regionSelect.value = defaultRegion;
      }
    }, 0);
  }

  const setFormError = (message: string) => {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  };

  const clearFieldErrors = () => {
    addressForm.querySelectorAll<HTMLElement>('.checkout-field').forEach((field) => {
      field.classList.remove('checkout-field--error');
      const errorEl = field.querySelector<HTMLElement>('.checkout-field__error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.hidden = true;
      }

      const control = field.querySelector<HTMLInputElement | HTMLSelectElement>('input, select');
      if (control) {
        control.removeAttribute('aria-invalid');
      }
    });
  };

  const setFieldErrors = (fieldErrors: FieldErrors) => {
    clearFieldErrors();

    for (const [fieldName, message] of Object.entries(fieldErrors)) {
      if (!message) continue;

      const field = addressForm.querySelector<HTMLElement>(`[data-field="${fieldName}"]`);
      if (!field) continue;

      const errorEl = field.querySelector<HTMLElement>('.checkout-field__error');
      field.classList.add('checkout-field--error');

      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      }

      const control = field.querySelector<HTMLInputElement | HTMLSelectElement>('input, select');
      if (control) {
        control.setAttribute('aria-invalid', 'true');
      }
    }
  };

  const clearFieldError = (fieldName: string) => {
    const field = addressForm.querySelector<HTMLElement>(`[data-field="${fieldName}"]`);
    if (!field) return;

    field.classList.remove('checkout-field--error');
    const errorEl = field.querySelector<HTMLElement>('.checkout-field__error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.hidden = true;
    }

    const control = field.querySelector<HTMLInputElement | HTMLSelectElement>('input, select');
    if (control) {
      control.removeAttribute('aria-invalid');
    }
  };

  addressForm.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select').forEach(
    (control) => {
      control.addEventListener('input', () => {
        const field = control.closest<HTMLElement>('[data-field]');
        if (field?.dataset.field) {
          clearFieldError(field.dataset.field);
        }
        setFormError('');
      });

      control.addEventListener('change', () => {
        const field = control.closest<HTMLElement>('[data-field]');
        if (field?.dataset.field) {
          clearFieldError(field.dataset.field);
        }
        setFormError('');
      });
    },
  );

  const updatePayButton = () => {
    payButton.disabled = isLoading || !hasShippingRates || !selectedOption;
  };

  const setContinueLoading = (loading: boolean) => {
    continueButton.textContent = loading ? 'Loading…' : 'Continue';
    if (loading) {
      continueButton.setAttribute('aria-busy', 'true');
    } else {
      continueButton.removeAttribute('aria-busy');
    }
  };

  const setLoading = (loading: boolean, message = '') => {
    isLoading = loading;
    shippingStatus.textContent = message;
    shippingStatus.hidden = !message;
    updatePayButton();
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
      : 'Complete shipping details';
    summaryTotal.textContent = selectedOption
      ? formatCad(productPriceCents + selectedOption.totalCents)
      : formatCad(productPriceCents);
    updatePayButton();
  };

  const clearShippingRates = () => {
    hasShippingRates = false;
    selectedOption = null;
    quoteId = null;
    shippingSection.hidden = true;
    shippingOptions.innerHTML = '';
    updateSummary();
  };

  const renderShippingOptions = (options: ShippingQuoteOption[]) => {
    if (options.length === 0) {
      clearShippingRates();
      return;
    }

    shippingOptions.innerHTML = '';
    hasShippingRates = true;

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
      title.textContent = `${option.carrierName} | ${option.serviceName}`;

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
    setFormError('');
    clearFieldErrors();
    destination = readDestination(addressForm);
    clearShippingRates();
    setLoading(true, 'Fetching shipping rates…');
    setContinueLoading(true);

    try {
      const response = await fetch('/api/shipping/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: productSku, destination }),
      });

      const data = (await response.json()) as ApiErrorResponse & {
        quoteId?: string;
        options?: ShippingQuoteOption[];
      };

      if (!response.ok) {
        if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
          setFieldErrors(data.fieldErrors);
          setFormError('');
          return;
        }

        throw new Error(data.error ?? 'Unable to fetch shipping rates');
      }

      quoteId = data.quoteId ?? null;
      renderShippingOptions(data.options ?? []);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to fetch shipping rates');
    } finally {
      setContinueLoading(false);
      setLoading(false);
    }
  });

  payButton.addEventListener('click', async () => {
    if (!destination || !selectedOption || !quoteId) {
      setFormError('Complete your shipping details and select a shipping method to continue.');
      return;
    }

    setFormError('');
    clearFieldErrors();
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

      const data = (await response.json()) as ApiErrorResponse & { url?: string };

      if (!response.ok) {
        if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
          setFieldErrors(data.fieldErrors);
          setFormError('');
          setLoading(false);
          return;
        }

        throw new Error(data.error ?? 'Unable to start checkout');
      }

      if (!data.url) {
        throw new Error('Unable to start checkout');
      }

      window.location.href = data.url;
    } catch (error) {
      setLoading(false);
      setFormError(error instanceof Error ? error.message : 'Unable to start checkout');
    }
  });

  updateSummary();
}

document.querySelectorAll<HTMLElement>('[data-checkout]').forEach(initCheckout);
