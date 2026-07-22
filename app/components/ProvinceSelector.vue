<template>
  <div
    class="form-field"
    :class="{ 'form-field--error': error }"
    :data-field="name"
  >
    <label :for="selectId">{{ label }}</label>
    <select
      :id="selectId"
      :value="modelValue"
      :name="name"
      :required="required || undefined"
      :disabled="disabled || undefined"
      :autocomplete="autocomplete"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      @change="onChange"
      @blur="emit('blur', $event)"
    >
      <option
        v-for="province in CANADIAN_PROVINCES"
        :key="province.value"
        :value="province.value"
      >
        {{ province.label }}
      </option>
    </select>
    <p v-if="error" :id="errorId" class="form-field__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { CANADIAN_PROVINCES } from '#shared/utils/geo';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    name?: string;
    id?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    autocomplete?: string;
  }>(),
  {
    modelValue: '',
    label: 'Province',
    name: 'region',
    required: false,
    disabled: false,
    autocomplete: 'shipping address-level1',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
  blur: [event: FocusEvent];
}>();

const generatedId = useId();
const selectId = computed(() => props.id ?? props.name ?? generatedId);
const errorId = computed(() => `${selectId.value}-error`);

function onChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
  emit('change', target.value);
}
</script>
