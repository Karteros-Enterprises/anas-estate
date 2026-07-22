<template>
  <div
    class="form-field"
    :class="{ 'form-field--error': error }"
    :data-field="name"
  >
    <label :for="inputId">{{ label }}</label>
    <textarea
      v-if="multiline"
      :id="inputId"
      :value="modelValue"
      :name="name"
      :rows="rows"
      :required="required || undefined"
      :disabled="disabled || undefined"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="onInput"
      @blur="emit('blur', $event)"
    />
    <input
      v-else
      :id="inputId"
      :value="modelValue"
      :name="name"
      :type="type"
      :required="required || undefined"
      :disabled="disabled || undefined"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :autocapitalize="autocapitalize"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="onInput"
      @blur="emit('blur', $event)"
    />
    <p v-if="error" :id="errorId" class="form-field__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label: string;
    name?: string;
    id?: string;
    type?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    multiline?: boolean;
    rows?: number;
    placeholder?: string;
    autocomplete?: string;
    autocapitalize?: string;
    inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
    maxlength?: number;
  }>(),
  {
    type: 'text',
    required: false,
    disabled: false,
    multiline: false,
    rows: 6,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
}>();

const generatedId = useId();
const inputId = computed(() => props.id ?? props.name ?? generatedId);
const errorId = computed(() => `${inputId.value}-error`);

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('update:modelValue', target.value);
}
</script>
