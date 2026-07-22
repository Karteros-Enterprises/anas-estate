<template>
  <main class="checkout-page">
    <section class="checkout-empty policy-section">
      <div class="checkout-empty__inner reveal">
        <p class="section-label">{{ label }}</p>
        <h1>{{ title }}</h1>
        <div class="ornament" aria-hidden="true">◇</div>
        <p>{{ description }}</p>
        <Button type="button" @click="goHome">Return home</Button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{
  error: NuxtError;
}>();

const statusCode = computed(() => props.error?.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);

const label = computed(() => (isNotFound.value ? 'Not Found' : 'Something Went Wrong'));
const title = computed(() =>
  isNotFound.value ? 'This page could not be found' : 'An unexpected error occurred',
);
const description = computed(() =>
  isNotFound.value
    ? 'The page you are looking for may have moved, or the link may be incorrect.'
    : 'Please try again in a moment. If the problem continues, return home and continue browsing.',
);

useSeoMeta({
  title: () => (isNotFound.value ? 'Page Not Found' : 'Error'),
  description: () => description.value,
  robots: 'noindex, nofollow',
});

function goHome() {
  clearError({ redirect: '/' });
}
</script>
