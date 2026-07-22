<template>
  <main class="checkout-page">
    <section class="checkout-empty policy-section">
      <div class="checkout-empty__inner reveal">
        <p class="section-label">Checkout</p>
        <h1>Payment not completed</h1>
        <div class="ornament" aria-hidden="true">◇</div>
        <p>Your order was not placed. You can return to checkout whenever you are ready.</p>
        <Button to="/cart">Return to cart</Button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Checkout Cancelled',
  description: 'Your Ana’s Estate checkout was cancelled.',
});
</script>
