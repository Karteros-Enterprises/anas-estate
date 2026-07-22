<template>
  <main class="checkout-page">
    <section v-if="showEmpty" class="checkout-empty policy-section">
      <div class="checkout-empty__inner reveal">
        <p class="section-label">Checkout</p>
        <h1>Your cart is empty</h1>
        <div class="ornament" aria-hidden="true">◇</div>
        <p>Add olive oil from the shop before continuing to checkout.</p>
        <Button to="/products">Back to shop</Button>
      </div>
    </section>

    <div v-else-if="showCheckout">
      <PageHero
        label="Secure Checkout"
        title="Complete Your Order"
        title-id="checkout-title"
        description="Enter your information below for final order details."
      />

      <section class="checkout-section checkout-section--subpage">
        <div class="checkout-layout">
          <div class="checkout-grid reveal">
            <div class="checkout-panel">
              <h2>Shipping Details</h2>
              <form class="checkout-form" autocomplete="on" novalidate @submit.prevent="requestQuotes">
                <InputField
                  id="checkout-name"
                  v-model="destination.name"
                  label="Full name"
                  name="name"
                  autocomplete="shipping name"
                  autocapitalize="words"
                  required
                  :error="fieldErrors.name"
                  @blur="onFieldBlur('name')"
                  @update:model-value="onFieldInput('name')"
                />

                <div class="checkout-form__row">
                  <InputField
                    id="checkout-email"
                    v-model="destination.email"
                    label="Email"
                    name="email"
                    type="email"
                    autocomplete="shipping email"
                    required
                    :error="fieldErrors.email"
                    @blur="onFieldBlur('email')"
                    @update:model-value="onFieldInput('email')"
                  />
                  <InputField
                    id="checkout-phone"
                    v-model="destination.phone"
                    label="Phone"
                    name="phone"
                    type="tel"
                    autocomplete="shipping tel"
                    inputmode="tel"
                    required
                    :error="fieldErrors.phone"
                    @blur="onFieldBlur('phone')"
                    @update:model-value="onFieldInput('phone')"
                  />
                </div>

                <InputField
                  id="checkout-address-line-1"
                  v-model="destination.addressLine1"
                  label="Street address"
                  name="addressLine1"
                  autocomplete="shipping address-line1"
                  required
                  :error="fieldErrors.addressLine1"
                  @blur="onFieldBlur('addressLine1')"
                  @update:model-value="onFieldInput('addressLine1')"
                />

                <InputField
                  id="checkout-address-line-2"
                  v-model="destination.addressLine2"
                  label="Apartment, suite, or unit (optional)"
                  name="addressLine2"
                  autocomplete="shipping address-line2"
                  :error="fieldErrors.addressLine2"
                  @blur="onFieldBlur('addressLine2')"
                  @update:model-value="onFieldInput('addressLine2')"
                />

                <div class="checkout-form__row">
                  <InputField
                    id="checkout-city"
                    v-model="destination.city"
                    label="City"
                    name="city"
                    autocomplete="shipping address-level2"
                    autocapitalize="words"
                    required
                    :error="fieldErrors.city"
                    @blur="onFieldBlur('city')"
                    @update:model-value="onFieldInput('city')"
                  />
                  <ProvinceSelector
                    id="checkout-region"
                    v-model="destination.region"
                    required
                    :error="fieldErrors.region"
                    @change="onFieldBlur('region')"
                  />
                </div>

                <div class="checkout-form__row">
                  <InputField
                    id="checkout-postal-code"
                    v-model="destination.postalCode"
                    label="Postal code"
                    name="postalCode"
                    autocomplete="shipping postal-code"
                    autocapitalize="characters"
                    required
                    :error="fieldErrors.postalCode"
                    @blur="onFieldBlur('postalCode')"
                    @update:model-value="onFieldInput('postalCode')"
                  />
                  <CountrySelector
                    id="checkout-country"
                    v-model="destination.country"
                    required
                    :error="fieldErrors.country"
                    @change="onFieldBlur('country')"
                  />
                </div>

                <Button type="submit" :disabled="loading || hasFieldErrors" :loading="loading && loadingAction === 'quote'">
                  {{ loading && loadingAction === 'quote' ? 'Getting rates…' : 'Get shipping options' }}
                </Button>
              </form>

              <p v-if="formError" id="checkout-error" class="checkout-error" role="alert">
                {{ formError }}
              </p>
            </div>

            <aside class="checkout-summary">
              <h2>Order Summary</h2>
              <div class="checkout-summary__products">
                <div v-for="line in lines" :key="line.sku" class="checkout-summary__product">
                  <p v-if="line.format" class="checkout-summary__format">{{ line.format }}</p>
                  <h3>{{ line.name }}</h3>
                  <p class="checkout-summary__qty">
                    {{ line.quantity }} × {{ formatCurrency(line.priceCents) }}
                  </p>
                </div>
              </div>
              <dl class="checkout-summary__lines">
                <div>
                  <dt>Products</dt>
                  <dd>{{ formatCurrency(productSubtotalCents) }}</dd>
                </div>
                <div class="checkout-summary__shipping">
                  <div class="checkout-summary__shipping-line">
                    <dt>Shipping</dt>
                    <dd>
                      {{
                        selectedOption
                          ? formatCurrency(selectedOption.totalCents)
                          : 'Complete shipping details'
                      }}
                    </dd>
                  </div>
                  <p v-if="shippingStatus" class="checkout-status">{{ shippingStatus }}</p>
                  <div
                    v-if="shippingOptions.length > 0"
                    class="summary-shipping-options"
                    role="radiogroup"
                    aria-label="Shipping method"
                  >
                    <label
                      v-for="option in shippingOptions"
                      :key="option.serviceId"
                      class="summary-shipping-option"
                    >
                      <input
                        v-model="selectedServiceId"
                        type="radio"
                        name="shipping-method"
                        :value="option.serviceId"
                      />
                      <span class="summary-shipping-option__copy">
                        <strong class="summary-shipping-option__title">{{ option.serviceName }}</strong>
                        <small class="summary-shipping-option__meta" v-if="option.transitDays != null">
                          {{ option.transitDays }} day{{ option.transitDays === 1 ? '' : 's' }}
                        </small>
                      </span>
                      <em class="summary-shipping-option__price">{{ formatCurrency(option.totalCents) }}</em>
                    </label>
                  </div>
                </div>
                <div class="checkout-summary__total">
                  <dt>Total</dt>
                  <dd>{{ formatCurrency(totalCents) }}</dd>
                </div>
              </dl>
              <Button
                block
                type="button"
                :disabled="!canPay || loading"
                :loading="loading && loadingAction === 'pay'"
                @click="startPayment"
              >
                {{ loading && loadingAction === 'pay' ? 'Redirecting…' : 'Continue to payment' }}
              </Button>
              <p class="checkout-summary__note">
                You will complete checkout securely on Stripe. All prices are in Canadian dollars.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { formatCurrency } from '#shared/utils/format';
import {
  destinationPayload,
  validateDestination,
  validateDestinationField,
} from '#shared/schemas/destination';
import type { CatalogProduct, DestinationFieldName, FieldErrors, QuoteOption } from '#shared/types';

useSeoMeta({
  title: 'Checkout',
  description: 'Complete your Anas Estate order.',
});

const { data: products } = await useFetch<CatalogProduct[]>('/api/products');
const { items, clearCart, hydrated } = useCart();

const lines = computed(() => {
  const catalogBySku = new Map((products.value ?? []).map((product) => [product.sku, product]));
  return items.value
    .map((item) => {
      const product = catalogBySku.get(item.sku);
      if (!product) return null;
      return {
        sku: item.sku,
        quantity: item.quantity,
        name: product.name,
        format: product.format,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
      };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);
});

const showEmpty = computed(() => hydrated.value && lines.value.length === 0);
const showCheckout = computed(() => hydrated.value && lines.value.length > 0);

watch(
  [items, products],
  () => {
    if (!products.value) return;
    if (items.value.length > 0 && lines.value.length === 0) {
      clearCart();
    }
  },
  { immediate: true },
);

const destination = reactive({
  name: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: 'ON',
  postalCode: '',
  country: 'CA' as const,
});

const fieldErrors = ref<FieldErrors>({});
const touchedFields = ref<Partial<Record<DestinationFieldName, boolean>>>({});
const formError = ref('');
const loading = ref(false);
const loadingAction = ref<'quote' | 'pay' | null>(null);
const quoteId = ref<string | null>(null);
const shippingOptions = ref<QuoteOption[]>([]);
const selectedServiceId = ref<string | null>(null);
const shippingStatus = ref('');

const selectedOption = computed(
  () => shippingOptions.value.find((option) => option.serviceId === selectedServiceId.value) ?? null,
);

const productSubtotalCents = computed(() =>
  lines.value.reduce((total, line) => total + line.priceCents * line.quantity, 0),
);

const totalCents = computed(
  () => productSubtotalCents.value + (selectedOption.value?.totalCents ?? 0),
);

const canPay = computed(() => Boolean(quoteId.value && selectedOption.value && !loading.value));
const hasFieldErrors = computed(() => Object.keys(fieldErrors.value).length > 0);

function setFieldError(field: DestinationFieldName, message: string | undefined) {
  if (!message) {
    if (!fieldErrors.value[field]) return;
    const next = { ...fieldErrors.value };
    delete next[field];
    fieldErrors.value = next;
    return;
  }

  fieldErrors.value = { ...fieldErrors.value, [field]: message };
}

function validateField(field: DestinationFieldName) {
  setFieldError(field, validateDestinationField(field, destination));
}

function onFieldBlur(field: DestinationFieldName) {
  touchedFields.value = { ...touchedFields.value, [field]: true };
  validateField(field);
}

function onFieldInput(field: DestinationFieldName) {
  if (!touchedFields.value[field] && !fieldErrors.value[field]) return;
  validateField(field);
}

function validateAllFields(): boolean {
  const result = validateDestination(destination);
  if (result.success) {
    fieldErrors.value = {};
    return true;
  }

  fieldErrors.value = result.fieldErrors;
  touchedFields.value = Object.fromEntries(
    Object.keys(result.fieldErrors).map((field) => [field, true]),
  ) as Partial<Record<DestinationFieldName, boolean>>;
  return false;
}

function resetShipping() {
  quoteId.value = null;
  shippingOptions.value = [];
  selectedServiceId.value = null;
  shippingStatus.value = '';
}

watch(destination, resetShipping, { deep: true });

async function requestQuotes() {
  formError.value = '';

  if (!validateAllFields()) {
    formError.value = 'Please correct the highlighted fields.';
    const firstError = document.querySelector<HTMLElement>(
      '.form-field--error input, .form-field--error select, .form-field--error textarea',
    );
    firstError?.focus();
    return;
  }

  loading.value = true;
  loadingAction.value = 'quote';
  shippingStatus.value = 'Fetching live shipping rates…';

  try {
    const payload = {
      items: lines.value.map((line) => ({ sku: line.sku, quantity: line.quantity })),
      destination: destinationPayload(destination),
    };

    const data = await $fetch<{ quoteId: string; options: QuoteOption[] }>(
      '/api/shipping/quotes',
      {
        method: 'POST',
        body: payload,
      },
    );

    quoteId.value = data.quoteId;
    shippingOptions.value = data.options;
    selectedServiceId.value = data.options[0]?.serviceId ?? null;
    shippingStatus.value = data.options.length
      ? 'Select a shipping method to continue.'
      : 'No shipping options available.';
  } catch (error: unknown) {
    resetShipping();
    const body = getFetchErrorBody(error);
    if (body?.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
      fieldErrors.value = body.fieldErrors;
      formError.value = body.error ?? 'Please correct the highlighted fields.';
    } else {
      formError.value = body?.error ?? 'Unable to fetch shipping rates';
    }
  } finally {
    loading.value = false;
    loadingAction.value = null;
  }
}

async function startPayment() {
  if (!quoteId.value || !selectedOption.value) {
    formError.value = 'Complete your shipping details to continue.';
    return;
  }

  formError.value = '';

  if (!validateAllFields()) {
    formError.value = 'Please correct the highlighted fields.';
    return;
  }

  loading.value = true;
  loadingAction.value = 'pay';

  try {
    const data = await $fetch<{ url: string }>('/api/checkout/session', {
      method: 'POST',
      body: {
        items: lines.value.map((line) => ({ sku: line.sku, quantity: line.quantity })),
        destination: destinationPayload(destination),
        quoteId: quoteId.value,
        serviceId: selectedOption.value.serviceId,
      },
    });

    if (!data.url) {
      throw new Error('Unable to start checkout');
    }

    window.location.href = data.url;
  } catch (error: unknown) {
    loading.value = false;
    loadingAction.value = null;
    const body = getFetchErrorBody(error);
    if (body?.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
      fieldErrors.value = body.fieldErrors;
      formError.value = body.error ?? 'Please correct the highlighted fields.';
    } else {
      formError.value =
        body?.error ?? (error instanceof Error ? error.message : 'Unable to start checkout');
    }
  }
}

function getFetchErrorBody(error: unknown): { error?: string; fieldErrors?: FieldErrors } | null {
  if (!error || typeof error !== 'object') return null;

  const payload = (error as { data?: unknown }).data;
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;

  // Nitro wraps createError payloads: { error: true, data: { error, fieldErrors } }
  const nested = record.data;
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>;
    if (typeof inner.error === 'string' || inner.fieldErrors) {
      return {
        error: typeof inner.error === 'string' ? inner.error : undefined,
        fieldErrors: (inner.fieldErrors as FieldErrors | undefined) ?? undefined,
      };
    }
  }

  if (typeof record.error === 'string' || record.fieldErrors) {
    return {
      error: typeof record.error === 'string' ? record.error : undefined,
      fieldErrors: (record.fieldErrors as FieldErrors | undefined) ?? undefined,
    };
  }

  if (typeof record.statusMessage === 'string') {
    return { error: record.statusMessage };
  }

  if (typeof record.message === 'string' && record.message !== 'true') {
    return { error: record.message };
  }

  return null;
}
</script>
