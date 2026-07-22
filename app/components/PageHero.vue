<template>
  <section class="page-hero" :aria-labelledby="titleId">
    <div class="page-hero-art" aria-hidden="true"></div>

    <div class="page-hero-content reveal">
      <p class="section-label">{{ label }}</p>
      <h1 :id="titleId">{{ title }}</h1>
      <div class="ornament" aria-hidden="true">◇</div>
      <p>{{ description }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  title: string;
  titleId: string;
  description: string;
}>();
</script>
