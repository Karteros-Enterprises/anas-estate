<template>
  <main id="top">
    <section class="hero" aria-labelledby="hero-title">
      <img
        class="hero-art parallax-layer"
        src="/images/hero/grove-line-art.webp"
        alt=""
        aria-hidden="true"
        data-parallax-speed="0.08"
        loading="eager"
        sizes="100vw"
      />

      <div class="hero-fade" aria-hidden="true"></div>

      <SectionContainer class-name="hero__inner">
        <div class="hero-copy parallax-layer" data-parallax-speed="0.03">
          <p class="overline gold">2025 Early Harvest</p>
          <h1 id="hero-title">
            PDO Kalamata
            <br />
            <span>Extra Virgin Olive Oil</span>
          </h1>
          <p class="fr">Huile d’olive vierge extra</p>
          <p class="caps">
            Single Estate
            <i aria-hidden="true">◆</i>
            Cold Extracted
          </p>
          <p class="script">Koroneiki Monovarietal</p>
          <p class="origin">Product of Greece / Produit de Grèce</p>
          <Button to="/products">Shop Our Olive Oil</Button>
        </div>

        <div class="hero-bottle-wrap parallax-layer" data-parallax-speed="-0.025">
          <NuxtImg
            class="hero-bottle"
            src="/images/hero/hero-bottle.png"
            alt="Ana’s Estate 750 millilitre Extra Virgin Olive Oil bottle"
            loading="eager"
            sizes="(max-width: 680px) 72vw, 560px"
          />
        </div>
      </SectionContainer>
    </section>

    <section class="story-section" id="story" aria-labelledby="story-title">
      <SectionContainer narrow>
        <div class="story-content reveal">
          <p class="section-label">Our Heritage</p>
          <h2 id="story-title">Our Family Story</h2>
          <div class="ornament" aria-hidden="true">◇</div>
          <div class="story-copy">
            <p>
              For generations, our family has cared for ancient Koroneiki olive trees growing among
              the hills of Kalamata, Greece.
            </p>
            <p>
              Each harvest is guided by patience, tradition and a deep respect for the land. The
              olives are carefully gathered and cold extracted within hours to preserve their
              freshness, vibrant aroma and natural quality.
            </p>
            <p>
              Ana’s Estate is more than olive oil. It is our family’s story, bottled in Greece and
              shared from our grove to your table.
            </p>
          </div>
          <p class="signature">Ana</p>
        </div>
      </SectionContainer>
    </section>

    <section class="origin-section" id="origin" aria-labelledby="origin-title">
      <div class="origin-bg" aria-hidden="true"></div>

      <SectionContainer class-name="origin-content">
        <div class="section-heading reveal">
          <p class="section-label">From Kalamata, Greece</p>
          <h2 id="origin-title">Rooted in Place</h2>
          <div class="ornament" aria-hidden="true">◇</div>
          <p>
            The character of our olive oil begins with the land, climate and centuries-old
            olive-growing traditions of the Kalamata region.
          </p>
        </div>

        <div class="origin-grid reveal-group">
          <article>
            <div class="icon" aria-hidden="true">
              <NuxtImg src="/images/icons/pdo.svg" alt="PDO Kalamata" width="42" height="42" />
            </div>
            <h3>PDO Kalamata</h3>
            <p>
              Protected Designation of Origin certification connects our olive oil directly to
              Kalamata and its recognized production standards.
            </p>
          </article>

          <article>
            <div class="icon" aria-hidden="true">❧</div>
            <h3>Koroneiki Olives</h3>
            <p>
              Small, intensely aromatic Koroneiki olives produce an oil with vibrant fruitiness,
              balanced bitterness and a clean peppery finish.
            </p>
          </article>

          <article>
            <div class="icon" aria-hidden="true">♧</div>
            <h3>Single Estate</h3>
            <p>
              Every olive comes from our family's groves, providing complete traceability from
              harvest to bottle.
            </p>
          </article>
        </div>
      </SectionContainer>
    </section>

    <section class="harvest-section" id="harvest" aria-labelledby="harvest-title">
      <SectionContainer>
        <div class="section-heading reveal">
          <p class="section-label">From Grove to Bottle</p>
          <h2 id="harvest-title">Our Harvest Process</h2>
          <div class="ornament" aria-hidden="true">◇</div>
          <p>
            Each stage is carefully managed to protect the fruit and preserve the flavour, aroma and
            natural quality of the finished oil.
          </p>
        </div>

        <div class="harvest-steps reveal-group">
          <article v-for="step in harvestSteps" :key="step.number">
            <NuxtImg
              class="harvest-image"
              :src="step.image"
              :alt="step.alt"
              loading="lazy"
              sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 25vw"
            />
            <div class="harvest-content">
              <span class="step-number">{{ step.number }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </article>
        </div>
      </SectionContainer>
    </section>

    <section class="quality-section" id="quality" aria-labelledby="quality-title">
      <SectionContainer class-name="quality-section__inner">
        <div class="quality-intro reveal reveal-left">
          <p class="section-label gold">Ana’s Estate Quality</p>
          <h2 id="quality-title">Authenticity in Every Drop</h2>
          <p>
            Our olive oil is defined by its origin, olive variety, harvest timing and carefully
            controlled production.
          </p>
        </div>

        <div class="quality-grid reveal-group">
          <article>
            <strong>PDO</strong>
            <span>Kalamata Certified</span>
          </article>
          <article>
            <strong>High</strong>
            <span>POLYPHENOLS</span>
          </article>
          <article>
            <strong>Low</strong>
            <span>OLEIC ACID</span>
          </article>
          <article>
            <strong>Early</strong>
            <span>Harvest</span>
          </article>
          <article>
            <strong>Cold</strong>
            <span>Extracted</span>
          </article>
          <article>
            <strong>Koroneiki</strong>
            <span>VARIETY OLIVES</span>
          </article>
        </div>
      </SectionContainer>
    </section>

    <section class="tasting-section" id="tasting" aria-labelledby="tasting-title">
      <SectionContainer>
        <div class="section-heading reveal">
          <p class="section-label">Sensory Profile</p>
          <h2 id="tasting-title">Tasting Notes</h2>
          <div class="ornament">◇</div>
        </div>

        <div class="note-grid reveal-group">
          <article v-for="note in tastingNotes" :key="note.title">
            <NuxtImg
              :src="note.image"
              alt=""
              class="tasting-icon"
              loading="lazy"
              sizes="62px"
            />
            <h3>{{ note.title }}</h3>
            <p>{{ note.description }}</p>
          </article>
        </div>
      </SectionContainer>
    </section>

    <section class="uses-section" id="uses" aria-labelledby="uses-title">
      <SectionContainer>
        <div class="section-heading reveal">
          <p class="section-label">In the Kitchen</p>
          <p class="script">Perfect For</p>
          <div class="ornament" aria-hidden="true">◇</div>
        </div>

        <div class="uses-grid reveal-group">
          <article v-for="use in kitchenUses" :key="use.title">
            <NuxtImg
              :src="use.image"
              alt=""
              aria-hidden="true"
              loading="lazy"
              sizes="72px"
            />
            <h3>{{ use.title }}</h3>
          </article>
        </div>
      </SectionContainer>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { CatalogProduct } from '#shared/types';
import { defineCatalogProducts } from '~/utils/defineCatalogProduct';

useSeoMeta({
  title: 'Premium Kalamata PDO Extra Virgin Olive Oil',
  description:
    'Shop Ana’s Estate premium Kalamata PDO Extra Virgin Olive Oil, produced in Greece from early-harvest Koroneiki olives. Single estate, cold extracted and available in Canada.',
});

const { data: products } = await useFetch<CatalogProduct[]>('/api/products');

useSchemaOrg([
  defineWebSite({
    name: "Ana's Estate",
    alternateName: "Ana's Estate Olive Oil",
    description: 'Premium Kalamata PDO Extra Virgin Olive Oil from Greece.',
  }),
  defineWebPage({
    name: 'Premium Kalamata PDO Extra Virgin Olive Oil | Ana’s Estate',
    description:
      'Shop Ana’s Estate premium Kalamata PDO Extra Virgin Olive Oil, produced in Greece from early-harvest Koroneiki olives.',
  }),
  ...defineCatalogProducts(products.value),
]);

const harvestSteps = [
  {
    image: '/images/harvest/harvest-step-1.png',
    alt: 'Early harvest of Koroneiki olives in the Ana’s Estate grove',
    number: '01',
    title: 'Early Harvest',
    description:
      'Olives are gathered during the early harvest period to capture freshness, aroma and natural intensity.',
  },
  {
    image: '/images/harvest/harvest-step-2.png',
    alt: 'Koroneiki olives being carefully gathered into harvest crates',
    number: '02',
    title: 'Carefully Gathered',
    description:
      'The fruit is handled carefully to protect the olives and preserve the quality of the oil they produce.',
  },
  {
    image: '/images/harvest/harvest-step-3.png',
    alt: 'Cold extraction of Ana’s Estate extra virgin olive oil',
    number: '03',
    title: 'Cold Extracted',
    description:
      'Extraction takes place within hours of harvest at a controlled temperature to preserve flavour and freshness.',
  },
  {
    image: '/images/harvest/harvest-step-4.png',
    alt: 'Ana’s Estate olive oil being protected and packed for shipment',
    number: '04',
    title: 'Protected and Packed',
    description:
      'The finished oil is protected from heat and light before being prepared for its journey to Canada.',
  },
] as const;

const tastingNotes = [
  {
    image: '/images/icons/tasting/icon-fruity.png',
    title: 'Fruity',
    description: 'Vibrant and fresh with a lively fruity character.',
  },
  {
    image: '/images/icons/tasting/icon-aroma.png',
    title: 'Aroma',
    description: 'Fresh grass, aromatic herbs and green tomato.',
  },
  {
    image: '/images/icons/tasting/icon-finish.png',
    title: 'Finish',
    description: 'Balanced bitterness with a clean peppery finish.',
  },
] as const;

const kitchenUses = [
  { image: '/images/icons/kitchen/icon_salads.png', title: 'Salads' },
  { image: '/images/icons/kitchen/icon_vegetables.png', title: 'Grilled Vegetables' },
  { image: '/images/icons/kitchen/icon_seafood.png', title: 'Seafood' },
  { image: '/images/icons/kitchen/icon_bread.png', title: 'Bread Dipping' },
  { image: '/images/icons/kitchen/icon_meats.png', title: 'Meats' },
  { image: '/images/icons/kitchen/icon_soups.png', title: 'Soups' },
] as const;

const activeSectionId = useState<string | null>('active-section-id', () => null);
const { activeId } = useActiveSection([
  'story',
  'origin',
  'harvest',
  'quality',
  'tasting',
  'uses',
]);

watch(
  activeId,
  (id) => {
    activeSectionId.value = id;
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  activeSectionId.value = null;
});
</script>
