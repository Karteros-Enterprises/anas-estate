<template>
  <main>
    <PageHero
      label="Customer Care"
      title="Shipping and Delivery"
      title-id="shipping-title"
      description="Information about order processing, delivery, tracking and receiving your Ana’s Estate olive oil."
    />

    <section class="policy-section">
      <div class="policy-layout">
        <aside class="policy-sidebar reveal reveal-left">
          <p class="section-label">On This Page</p>
          <nav aria-label="Shipping page navigation">
            <a href="#processing">Order Processing</a>
            <a href="#delivery">Delivery</a>
            <a href="#shipping-costs">Shipping Costs</a>
            <a href="#tracking">Order Tracking</a>
            <a href="#address">Shipping Address</a>
            <a href="#damaged-orders">Damaged Orders</a>
            <a href="#questions">Questions</a>
          </nav>
        </aside>

        <div class="policy-content">
          <article class="policy-card reveal" id="processing">
            <span class="policy-number">01</span>
            <div>
              <h2>Order Processing</h2>
              <p>
                Orders are prepared carefully to protect the bottles during transportation. Once your
                order has been processed, you will receive a confirmation at the email address
                provided during checkout.
              </p>
              <p class="policy-note">
                Add your usual order-processing timeframe here, such as “Orders are generally
                processed within 1–3 business days.”
              </p>
            </div>
          </article>

          <article class="policy-card reveal" id="delivery">
            <span class="policy-number">02</span>
            <div>
              <h2>Delivery</h2>
              <p>
                Delivery times begin after an order has been processed and may vary depending on the
                destination, carrier availability, weather and seasonal shipping volumes.
              </p>
              <p>Business days do not include weekends or statutory holidays.</p>
            </div>
          </article>

          <article class="policy-card reveal" id="shipping-costs">
            <span class="policy-number">03</span>
            <div>
              <h2>Shipping Costs</h2>
              <p>
                Available shipping methods and applicable charges are calculated in real time during
                checkout on our website before payment is completed.
              </p>
              <p>
                Shipping costs may vary according to the destination, package size, package weight and
                selected service.
              </p>
            </div>
          </article>

          <article class="policy-card reveal" id="tracking">
            <span class="policy-number">04</span>
            <div>
              <h2>Order Tracking</h2>
              <p>
                When tracking is available, the tracking number will be sent by email after the
                carrier has accepted the shipment.
              </p>
              <p>
                Tracking information may require several hours to update after the shipping
                confirmation is issued.
              </p>
            </div>
          </article>

          <article class="policy-card reveal" id="address">
            <span class="policy-number">05</span>
            <div>
              <h2>Shipping Address</h2>
              <p>
                Please review the recipient name, street address, apartment or unit number, city,
                province, postal code and contact information before completing checkout.
              </p>
              <p>
                Contact us as soon as possible if an address correction is required. Once a shipment
                has been transferred to the carrier, changes may not be possible.
              </p>
            </div>
          </article>

          <article class="policy-card reveal" id="damaged-orders">
            <span class="policy-number">06</span>
            <div>
              <h2>Damaged Orders</h2>
              <p>
                Please inspect your order when it arrives. If the package or product has been
                damaged during transportation, contact us promptly and retain the original packaging.
              </p>
              <p>
                Include your order number and clear photographs of the outer package, shipping label
                and damaged product so the issue can be reviewed.
              </p>
            </div>
          </article>

          <article class="policy-card policy-contact-card reveal" id="questions">
            <span class="policy-number">07</span>
            <div>
              <h2>Shipping Questions</h2>
              <p>
                For questions about an order, delivery or damaged package, contact us and include
                your order number.
              </p>
              <Button to="/contact">Contact Us</Button>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Shipping and Delivery',
  description: 'Shipping and delivery information for Ana’s Estate Kalamata PDO Extra Virgin Olive Oil.',
});
</script>
