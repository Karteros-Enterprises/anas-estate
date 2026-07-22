<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="btn"
    :class="{ 'btn--block': block }"
    :aria-label="ariaLabel"
  >
    <slot />
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    class="btn"
    :class="{ 'btn--block': block }"
    :aria-label="ariaLabel"
    :target="target"
    :rel="rel"
  >
    <slot />
  </a>
  <button
    v-else
    class="btn"
    :class="{ 'btn--block': block, 'btn--loading': loading }"
    :type="type"
    :disabled="isDisabled"
    :aria-label="ariaLabel"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true"></span>
    <span class="btn__label"><slot /></span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    to?: string;
    href?: string;
    target?: string;
    rel?: string;
    block?: boolean;
    ariaLabel?: string;
  }>(),
  {
    type: 'button',
    disabled: false,
    loading: false,
    block: false,
  },
);

const isDisabled = computed(() => props.disabled || props.loading);
</script>
