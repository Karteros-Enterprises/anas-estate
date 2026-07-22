<template>
  <div>
    <div class="topbar">
      <span>Single Estate</span>
      <b aria-hidden="true">✦</b>
      <span>Cold Extracted</span>
      <b aria-hidden="true">✦</b>
      <span>Early Harvest</span>
    </div>

    <div class="greek-line" aria-hidden="true"></div>

    <header class="site-header" ref="headerRef">
      <SectionContainer class-name="site-header__inner">
        <nav class="nav nav-left" aria-label="Primary navigation">
          <NuxtLink
            v-for="link in leftLinks"
            :key="link.href"
            :to="link.href"
            :class="{ 'is-active': isSectionActive(link.id) }"
            :aria-current="isSectionActive(link.id) ? 'page' : undefined"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <NuxtLink class="logo" :to="homeHref" aria-label="Ana’s Estate home">
          <NuxtImg src="/images/brand/logo.png" alt="Ana’s Estate" loading="eager" />
        </NuxtLink>

        <nav class="nav nav-right" aria-label="Secondary navigation">
          <NuxtLink
            :to="sectionHref('tasting')"
            :class="{ 'is-active': isSectionActive('tasting') }"
            :aria-current="isSectionActive('tasting') ? 'page' : undefined"
          >
            Taste Profile
          </NuxtLink>
          <NuxtLink to="/products" v-bind="pageLinkProps(isShopPage)">Shop</NuxtLink>
          <NuxtLink to="/contact" v-bind="pageLinkProps(isContactPage)">Contact</NuxtLink>
          <div class="header-cart">
            <span class="nav-divider" aria-hidden="true"></span>
            <NuxtLink
              class="nav-cart"
              :class="{ 'is-active': isCartPage }"
              to="/cart"
              :aria-label="cartAriaLabel"
              :aria-current="isCartPage ? 'page' : undefined"
            >
              <svg
                class="nav-cart__icon"
                viewBox="0 0 24 24"
                width="32"
                height="32"
                aria-hidden="true"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 9h14l-.9 10.5H5.9L5 9Zm3-2.8a4 4 0 0 1 8 0V9H8V6.2Z"
                />
              </svg>
              <span v-if="hydrated && itemCount > 0" class="cart-badge">{{ itemCount }}</span>
            </NuxtLink>
          </div>
        </nav>

        <button
          class="menu-toggle"
          :class="{ 'is-open': menuOpen }"
          type="button"
          :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          @click="menuOpen = !menuOpen"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </SectionContainer>

      <nav
        class="mobile-nav"
        :class="{ 'is-open': menuOpen }"
        id="mobile-menu"
        aria-label="Mobile navigation"
      >
        <NuxtLink
          v-for="link in mobileLinks"
          :key="link.href"
          :to="link.href"
          :class="{ 'is-active': link.id ? isSectionActive(link.id) : link.active }"
          :aria-current="(link.id ? isSectionActive(link.id) : link.active) ? 'page' : undefined"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>

    <NuxtPage />

    <footer class="site-footer">
      <div class="greek-line" aria-hidden="true"></div>

      <SectionContainer class-name="footer-main">
        <div class="brand-col">
          <NuxtImg src="/images/brand/logo-white.png" alt="Ana’s Estate" loading="lazy" />
          <p>Premium Extra Virgin Olive Oil from our family groves in Kalamata, Greece.</p>
          <p>Tradition. Quality. Purity.</p>
        </div>

        <div>
          <h4>Explore</h4>
          <NuxtLink :to="sectionHref('story')">Our Story</NuxtLink>
          <NuxtLink :to="sectionHref('origin')">Our Olive Oil</NuxtLink>
          <NuxtLink :to="sectionHref('harvest')">Harvest</NuxtLink>
          <NuxtLink :to="sectionHref('quality')">Quality</NuxtLink>
          <NuxtLink to="/products">Shop</NuxtLink>
          <NuxtLink v-if="isHome" :to="sectionHref('tasting')">Taste Profile</NuxtLink>
        </div>

        <div>
          <h4>Customer Care</h4>
          <NuxtLink to="/contact">Contact</NuxtLink>
          <NuxtLink to="/policies/shipping">Shipping and Delivery</NuxtLink>
          <NuxtLink to="/contact">Wholesale Inquiries</NuxtLink>
          <a href="/files/label.pdf" target="_blank" rel="noopener">Product Label</a>
        </div>

        <div>
          <h4>Stay Connected</h4>
          <p>
            {{
              isHome
                ? 'Sign up for recipes, harvest updates and news from our family groves.'
                : 'Sign up for harvest updates and news from our family groves.'
            }}
          </p>

          <form class="newsletter" action="https://formsubmit.co/anas.oliveoil@gmail.com" method="POST">
            <input
              type="hidden"
              name="_subject"
              value="Ana’s Estate newsletter signup form submission"
            />
            <input type="hidden" name="_captcha" value="false" />
            <label for="newsletter-email" hidden>Email address</label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
            <button type="submit" aria-label="Subscribe">›</button>
          </form>
        </div>
      </SectionContainer>

      <SectionContainer class-name="footer-bottom">
        <span>© {{ year }} Ana's Estate. All rights reserved.</span>
        <span>Product of Greece / Produit de Grèce</span>
        <span>Imported by Karteros Enterprises</span>
      </SectionContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { itemCount, hydrated } = useCart();

const isHome = computed(() => route.path === '/');
const currentPath = computed(() => route.path.replace(/\/$/, '') || '/');
const isShopPage = computed(() => currentPath.value === '/products');
const isContactPage = computed(() => currentPath.value === '/contact');
const isCartPage = computed(() => currentPath.value === '/cart');
const homeHref = computed(() => (isHome.value ? '#top' : '/'));
const year = new Date().getFullYear();

const activeSectionId = useState<string | null>('active-section-id', () => null);
const menuOpen = ref(false);
const headerRef = ref<HTMLElement | null>(null);

function sectionHref(id: string) {
  return isHome.value ? `#${id}` : `/#${id}`;
}

function pageLinkProps(isActive: boolean) {
  return {
    class: isActive ? 'is-active' : undefined,
    'aria-current': isActive ? ('page' as const) : undefined,
  };
}

function isSectionActive(id: string) {
  return Boolean(isHome.value && activeSectionId.value === id);
}

const cartAriaLabel = computed(() =>
  itemCount.value > 0 ? `Cart, ${itemCount.value} items` : 'Cart',
);

const leftLinks = computed(() => [
  { id: 'story', label: 'Our Story', href: sectionHref('story') },
  { id: 'origin', label: 'Our Olive Oil', href: sectionHref('origin') },
  { id: 'harvest', label: 'Harvest', href: sectionHref('harvest') },
]);

const mobileLinks = computed(() => [
  ...leftLinks.value,
  { id: 'quality', label: 'Quality', href: sectionHref('quality') },
  { id: 'tasting', label: 'Taste Profile', href: sectionHref('tasting') },
  { id: undefined, label: 'Shop', href: '/products', active: isShopPage.value },
  { id: undefined, label: 'Contact', href: '/contact', active: isContactPage.value },
]);

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node;
  if (!headerRef.value?.contains(target)) {
    menuOpen.value = false;
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') menuOpen.value = false;
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onKeydown);
});

useReveal();
useSmoothScroll();
</script>
