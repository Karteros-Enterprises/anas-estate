<template>
  <main class="cart-page">
    <div v-if="showCart">
      <PageHero
        label="Your Cart"
        title="Shopping Cart"
        title-id="cart-title"
        description="Review your items and quantities before continuing to checkout."
      />
    </div>

    <section v-if="showEmpty" class="cart-empty" aria-label="Shopping cart">
      <div class="cart-empty__inner reveal">
        <p class="section-label">Cart</p>
        <h2>Your cart is empty</h2>
        <div class="ornament" aria-hidden="true">◇</div>
        <p>Browse our olive oil formats and add items when you are ready.</p>
        <Button to="/products">Back to shop</Button>
      </div>
    </section>

    <section v-else-if="showCart" class="cart-section" aria-label="Shopping cart">
      <SectionContainer>
        <div class="cart-content">
          <div class="cart-lines">
            <article v-for="line in lines" :key="line.sku" class="cart-line">
              <div class="cart-line__media">
                <img
                  v-if="line.imageUrl"
                  :src="line.imageUrl"
                  :alt="line.name"
                  loading="lazy"
                  width="120"
                  height="120"
                />
              </div>
              <div class="cart-line__details">
                <p v-if="line.format" class="cart-line__format">{{ line.format }}</p>
                <h2 class="cart-line__name">{{ line.name }}</h2>
                <p class="cart-line__unit-price">{{ formatCurrency(line.priceCents) }}</p>
              </div>
              <div class="cart-line__controls">
                <div class="cart-qty" role="group" :aria-label="`Quantity for ${line.name}`">
                  <button
                    type="button"
                    class="cart-qty__btn"
                    aria-label="Decrease quantity"
                    @click="setQuantity(line.sku, line.quantity - 1)"
                  >
                    −
                  </button>
                  <input
                    class="cart-qty__input"
                    type="number"
                    min="1"
                    max="99"
                    inputmode="numeric"
                    :value="line.quantity"
                    aria-label="Quantity"
                    @change="onQtyChange(line.sku, ($event.target as HTMLInputElement).value)"
                  />
                  <button
                    type="button"
                    class="cart-qty__btn"
                    aria-label="Increase quantity"
                    @click="setQuantity(line.sku, line.quantity + 1)"
                  >
                    +
                  </button>
                </div>
                <button type="button" class="cart-line__remove" @click="removeItem(line.sku)">
                  Remove
                </button>
              </div>
              <p class="cart-line__total">
                {{ formatCurrency(line.priceCents * line.quantity) }}
              </p>
            </article>
          </div>

          <aside class="cart-summary">
            <div class="cart-summary__row">
              <span>Subtotal</span>
              <strong>{{ formatCurrency(subtotalCents) }}</strong>
            </div>
            <p class="cart-summary__note">
              Shipping is calculated at checkout. All prices are in Canadian dollars.
            </p>
            <Button to="/checkout">Checkout</Button>
          </aside>
        </div>
      </SectionContainer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { formatCurrency } from '#shared/utils/format';
import type { CatalogProduct } from '#shared/types';

useSeoMeta({
  title: 'Cart',
  description: 'Review your Ana’s Estate olive oil order before checkout.',
});

const { data: products } = await useFetch<CatalogProduct[]>('/api/products');
const { items, setQuantity, removeItem, hydrated } = useCart();

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
const showCart = computed(() => hydrated.value && lines.value.length > 0);

watch(
  [items, products],
  () => {
    if (!products.value) return;
    const validSkus = new Set(products.value.map((p) => p.sku));
    for (const item of items.value) {
      if (!validSkus.has(item.sku)) removeItem(item.sku);
    }
  },
  { immediate: true },
);

const subtotalCents = computed(() =>
  lines.value.reduce((total, line) => total + line.priceCents * line.quantity, 0),
);

function onQtyChange(sku: string, value: string) {
  const quantity = Number.parseInt(value, 10);
  if (!Number.isFinite(quantity)) return;
  setQuantity(sku, quantity);
}
</script>
