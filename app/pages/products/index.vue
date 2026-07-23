<template>
  <main>
    <PageHero
      label="Shop Ana’s Estate"
      title="Our Olive Oil"
      title-id="shop-title"
      description="Choose the format that best suits your table, kitchen or foodservice needs."
    />

    <section class="products products--subpage" id="products" aria-label="Our Olive Oil">
      <SectionContainer>
        <div v-if="!products?.length" class="products-empty reveal">
          <h2>Products unavailable</h2>
          <div class="ornament" aria-hidden="true">◇</div>
          <p>
            Please check back soon or get in touch if you would like to place an order.
          </p>
          <Button to="/contact">Contact us</Button>
        </div>

        <div v-else class="product-grid reveal-group">
          <ProductCard v-for="product in products" :key="product.sku" :product="product" />
        </div>
      </SectionContainer>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { CatalogProduct } from '#shared/types';
import { defineCatalogProducts } from '~/utils/defineCatalogProduct';

useSeoMeta({
  title: 'Shop',
  description: 'Shop Ana’s Estate premium Kalamata PDO Extra Virgin Olive Oil in bottle and case formats.',
});

const { data: products } = await useFetch<CatalogProduct[]>('/api/products');

useSchemaOrg([
  defineWebPage({ name: 'Shop' }),
  ...defineCatalogProducts(products.value),
]);
</script>
