<template>
  <div :class="['section-container', { 'section-container--narrow': narrow }, className]">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  className?: string;
  narrow?: boolean;
}>();
</script>
