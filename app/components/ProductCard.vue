<template>
  <article class="product">
    <NuxtLink :to="productPath(product.sku)" class="product__link">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        loading="lazy"
        width="640"
        height="640"
      />
      <div class="product__body">
        <p v-if="product.format" class="product-format">{{ product.format }}</p>
        <h3>{{ product.name }}</h3>
        <p v-if="product.description" class="product-description">
          {{ product.description }}
        </p>
        <ul>
          <li v-for="feature in features" :key="feature">{{ feature }}</li>
        </ul>
        <div class="price">{{ formatCurrency(product.priceCents) }}</div>
      </div>
    </NuxtLink>
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
  </article>
</template>

<script setup lang="ts">
import { formatCurrency } from '#shared/utils/format';
import { DEFAULT_PRODUCT_FEATURES, productPath } from '#shared/utils/product';
import type { CatalogProduct } from '#shared/types';

const props = defineProps<{
  product: CatalogProduct;
}>();

const features = computed(() =>
  props.product.features?.length
    ? props.product.features
    : [...DEFAULT_PRODUCT_FEATURES],
);

const { addItem, setQuantity, quantityFor } = useCart();
const quantity = computed(() => quantityFor(props.product.sku));
</script>
