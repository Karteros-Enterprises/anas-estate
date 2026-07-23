<template>
  <main>
    <template v-if="product">
      <section class="product-detail" aria-labelledby="product-title">
        <SectionContainer>
          <div class="product-detail__layout reveal-group">
            <div class="product-detail__media reveal reveal-left">
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="product.name"
                width="800"
                height="800"
              />
            </div>

            <div class="product-detail__info reveal reveal-right">
              <p class="section-label">{{ product.format || 'Shop Ana’s Estate' }}</p>
              <h1 id="product-title">{{ product.name }}</h1>
              <div class="ornament" aria-hidden="true">◇</div>
              <p v-if="product.description" class="product-detail__description">
                {{ product.description }}
              </p>

              <ul class="product-detail__features">
                <li v-for="feature in features" :key="feature">{{ feature }}</li>
              </ul>

              <div class="price">{{ formatCurrency(product.priceCents) }}</div>

              <div class="product-cart-actions">
                <Button v-if="quantity === 0" type="button" @click="addItem(product.sku)">
                  Add to Cart
                </Button>
                <div v-else class="product-cart-qty">
                  <button
                    class="product-cart-qty__btn"
                    type="button"
                    aria-label="Decrease quantity"
                    @click="setQuantity(product.sku, quantity - 1)"
                  >
                    −
                  </button>
                  <span class="product-cart-qty__label">{{ quantity }} In Cart</span>
                  <button
                    class="product-cart-qty__btn"
                    type="button"
                    aria-label="Increase quantity"
                    @click="addItem(product.sku)"
                  >
                    +
                  </button>
                </div>
              </div>

              <p class="product-detail__note">
                Shipping is calculated at checkout. All prices are in Canadian dollars.
              </p>

              <NuxtLink to="/products" class="product-detail__back">← Back to shop</NuxtLink>
            </div>
          </div>
        </SectionContainer>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { formatCurrency } from '#shared/utils/format';
import { DEFAULT_PRODUCT_FEATURES } from '#shared/utils/product';
import type { CatalogProduct } from '#shared/types';
import { defineCatalogProduct } from '~/utils/defineCatalogProduct';

const route = useRoute();
const sku = computed(() => String(route.params.sku ?? ''));

const { data: product, error } = await useFetch<CatalogProduct>(
  () => `/api/products/${encodeURIComponent(sku.value)}`,
);

const resolved = product.value;
if (error.value || !resolved) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found',
  });
}

const features = computed(() =>
  product.value?.features?.length
    ? product.value.features
    : [...DEFAULT_PRODUCT_FEATURES],
);

const { addItem, setQuantity, quantityFor } = useCart();
const quantity = computed(() => (product.value ? quantityFor(product.value.sku) : 0));

useSeoMeta({
  title: () => product.value?.name ?? 'Product',
  description: () =>
    product.value?.description
    ?? 'Shop Ana’s Estate premium Kalamata PDO Extra Virgin Olive Oil.',
  ogImage: () => product.value?.imageUrl,
});

useSchemaOrg([
  defineWebPage({
    name: resolved.name,
  }),
  defineCatalogProduct(resolved),
]);
</script>
