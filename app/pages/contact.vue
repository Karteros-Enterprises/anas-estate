<template>
  <main>
    <PageHero
      label="Contact and Wholesale"
      title="Contact Us"
      title-id="contact-title"
      description="For product questions, wholesale inquiries or retail partnerships, send us a message."
    />

    <section
      class="contact-section contact-section--subpage"
      id="contact"
      aria-label="Contact Ana’s Estate"
    >
      <SectionContainer class-name="contact-section__inner">
        <div class="contact-copy reveal reveal-left">
          <div class="contact-details">
            <p>
              <strong>Email</strong>
              <br />
              <a href="mailto:anas.oliveoil@gmail.com">anas.oliveoil@gmail.com</a>
            </p>
            <p>
              <strong>Imported by</strong>
              <br />
              Karteros Enterprises
              <br />
              Brampton, Ontario, Canada
            </p>
          </div>
        </div>

        <form
          class="contact-form reveal reveal-right"
          action="https://formsubmit.co/anas.oliveoil@gmail.com"
          method="POST"
        >
          <input type="hidden" name="_subject" value="Ana’s Estate website contact form submission" />
          <input type="hidden" name="_captcha" value="false" />

          <InputField id="contact-name" label="Name" name="name" autocomplete="name" required />
          <InputField
            id="contact-email"
            label="Email"
            name="email"
            type="email"
            autocomplete="email"
            required
          />
          <InputField id="contact-subject" label="Subject" name="subject" />
          <InputField
            id="contact-message"
            label="Message"
            name="message"
            multiline
            :rows="6"
            required
          />

          <Button type="submit">Send Message</Button>
        </form>
      </SectionContainer>
    </section>
  </main>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Contact',
  description: 'Contact Ana’s Estate for product questions, wholesale inquiries, and retail partnerships.',
});
</script>
