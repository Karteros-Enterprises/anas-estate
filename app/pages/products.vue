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
          <article v-for="product in products" :key="product.sku" class="product">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.name"
              loading="lazy"
              width="640"
              height="640"
            />
            <div>
              <p v-if="product.format" class="product-format">{{ product.format }}</p>
              <h3>{{ product.name }}</h3>
              <p v-if="product.description" class="product-description">
                {{ product.description }}
              </p>
              <ul>
                <template v-if="product.features?.length">
                  <li v-for="feature in product.features" :key="feature">{{ feature }}</li>
                </template>
                <template v-else>
                  <li>Koroneiki Monovarietal</li>
                  <li>Early Harvest</li>
                  <li>Cold Extracted</li>
                  <li>PDO Kalamata</li>
                  <li>Independently Lab Tested</li>
                  <li>396mg/kg Polyphenols</li>
                </template>
              </ul>
              <div class="price">{{ formatCurrency(product.priceCents) }}</div>
              <div class="product-cart-actions">
                <Button v-if="quantityFor(product.sku) === 0" type="button" @click="addItem(product.sku)">
                  Add to Cart
                </Button>
                <div v-else class="product-cart-qty">
                  <button
                    class="product-cart-qty__btn"
                    type="button"
                    aria-label="Decrease quantity"
                    @click="setQuantity(product.sku, quantityFor(product.sku) - 1)"
                  >
                    −
                  </button>
                  <span class="product-cart-qty__label">
                    {{ quantityFor(product.sku) }} In Cart
                  </span>
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
            </div>
          </article>
        </div>
      </SectionContainer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { formatCurrency } from '#shared/utils/format';

useSeoMeta({
  title: 'Shop',
  description: 'Shop Ana’s Estate premium Kalamata PDO Extra Virgin Olive Oil in bottle and case formats.',
});

const { data: products } = await useFetch('/api/products');
const { addItem, setQuantity, quantityFor } = useCart();

useSchemaOrg([
  defineWebPage({ name: 'Shop' }),
  ...(products.value ?? []).map((product) =>
    defineProduct({
      name: product.name,
      description: product.description,
      image: product.imageUrl,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: "Ana's Estate",
      },
      offers: defineOffer({
        url: '/products',
        price: (product.priceCents / 100).toFixed(2),
        priceCurrency: 'CAD',
        availability: 'https://schema.org/InStock',
      }),
    }),
  ),
]);
</script>
