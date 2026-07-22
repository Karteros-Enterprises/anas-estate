<template>
  <main class="checkout-page">
    <section class="checkout-empty policy-section">
      <div class="checkout-empty__inner reveal">
        <p class="section-label">Thank You</p>
        <h1>Your order is confirmed</h1>
        <div class="ornament" aria-hidden="true">◇</div>
        <p>
          Payment was received successfully. A confirmation email will be sent shortly with your
          order details.
        </p>
        <Button to="/">Return home</Button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Order Confirmed',
  description: 'Thank you for your Ana’s Estate olive oil order.',
});

const { clearCart } = useCart();
onMounted(() => clearCart());
</script>
