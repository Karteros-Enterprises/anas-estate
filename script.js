// ==================================================
// Stripe payment links
// ==================================================

const stripeLinks = {
  bottle: "PASTE_750ML_STRIPE_LINK",
  fiveL: "PASTE_5L_STRIPE_LINK",
  sixteenL: "PASTE_16L_STRIPE_LINK"
};

const stripeButtons = document.querySelectorAll(".stripe");

stripeButtons.forEach((button) => {
  const productKey = button.dataset.product;
  const paymentLink = stripeLinks[productKey];

  if (paymentLink && paymentLink.startsWith("http")) {
    button.href = paymentLink;
    button.target = "_blank";
    button.rel = "noopener";
    return;
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();

    alert(
      "Please add your Stripe Payment Link in script.js before publishing."
    );
  });
});


// ==================================================
// Mobile navigation
// ==================================================

const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

function closeMobileMenu() {
  if (!menuToggle || !mobileNav) {
    return;
  }

  mobileNav.classList.remove("is-open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("is-open");

    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu =
      mobileNav.contains(event.target) ||
      menuToggle.contains(event.target);

    if (!clickedInsideMenu) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });
}


// ==================================================
// Smooth scrolling for page navigation
// ==================================================

const internalLinks = document.querySelectorAll('a[href^="#"]');

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    history.replaceState(null, "", targetId);
  });
});


// ==================================================
// Scroll reveal animations
// ==================================================

const revealElements = document.querySelectorAll(
  ".reveal, .reveal-group"
);

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});


// ==================================================
// Animated counters
// ==================================================

const counters = document.querySelectorAll(".counter");

function animateCounter(counter) {
  const target = Number(counter.dataset.counterTarget);
  const duration = Number(counter.dataset.counterDuration) || 1400;

  if (!Number.isFinite(target)) {
    return;
  }

  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * easedProgress);

    counter.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }

  requestAnimationFrame(updateCounter);
}

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.6
  }
);

counters.forEach((counter) => {
  counterObserver.observe(counter);
});


// ==================================================
// Scroll parallax
// ==================================================

const parallaxElements = document.querySelectorAll(
  ".parallax-layer[data-parallax-speed]"
);

let parallaxFrameRequested = false;

function updateScrollParallax() {
  const viewportHeight = window.innerHeight;

  parallaxElements.forEach((element) => {
    const speed = Number(element.dataset.parallaxSpeed) || 0;
    const rect = element.getBoundingClientRect();

    const distanceFromCenter =
      rect.top + rect.height / 2 - viewportHeight / 2;

    const yOffset = distanceFromCenter * speed;

    element.style.setProperty(
      "--parallax-y",
      `${yOffset.toFixed(2)}px`
    );
  });

  parallaxFrameRequested = false;
}

function requestScrollParallaxUpdate() {
  if (parallaxFrameRequested) {
    return;
  }

  parallaxFrameRequested = true;
  requestAnimationFrame(updateScrollParallax);
}

if (parallaxElements.length > 0) {
  window.addEventListener(
    "scroll",
    requestScrollParallaxUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestScrollParallaxUpdate
  );

  updateScrollParallax();
}


// ==================================================
// Subtle mouse parallax in the hero
// ==================================================

const hero = document.querySelector(".hero");

if (hero && window.matchMedia("(pointer: fine)").matches) {
  const heroText = hero.querySelector(".hero-copy");
  const heroBottle = hero.querySelector(".hero-bottle-wrap");
  const heroBackground = hero.querySelector(".hero-art");

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width - 0.5;

    const y =
      (event.clientY - rect.top) / rect.height - 0.5;

    if (heroText) {
      heroText.style.setProperty(
        "--parallax-x",
        `${(x * 5).toFixed(2)}px`
      );
    }

    if (heroBottle) {
      heroBottle.style.setProperty(
        "--parallax-x",
        `${(x * 9).toFixed(2)}px`
      );
    }

    if (heroBackground) {
      heroBackground.style.setProperty(
        "--parallax-x",
        `${(x * -3).toFixed(2)}px`
      );
    }

    if (heroText) {
      heroText.style.setProperty(
        "--parallax-y",
        `${(y * 3).toFixed(2)}px`
      );
    }

    if (heroBottle) {
      heroBottle.style.setProperty(
        "--parallax-y",
        `${(y * 6).toFixed(2)}px`
      );
    }

    if (heroBackground) {
      heroBackground.style.setProperty(
        "--parallax-y",
        `${(y * -2).toFixed(2)}px`
      );
    }
  });

  hero.addEventListener("pointerleave", () => {
    [heroText, heroBottle, heroBackground].forEach((element) => {
      if (!element) {
        return;
      }

      element.style.setProperty("--parallax-x", "0px");
      element.style.setProperty("--parallax-y", "0px");
    });
  });
}


// ==================================================
// Active navigation section
// ==================================================

const sections = document.querySelectorAll("main section[id]");
const navigationLinks = document.querySelectorAll(
  '.nav a[href^="#"], .mobile-nav a[href^="#"]'
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort(
        (first, second) =>
          second.intersectionRatio - first.intersectionRatio
      )[0];

    if (!visibleEntry) {
      return;
    }

    const activeId = `#${visibleEntry.target.id}`;

    navigationLinks.forEach((link) => {
      const isActive =
        link.getAttribute("href") === activeId;

      link.classList.toggle("is-active", isActive);
      link.setAttribute(
        "aria-current",
        isActive ? "page" : "false"
      );
    });
  },
  {
    threshold: [0.2, 0.4, 0.6],
    rootMargin: "-20% 0px -55% 0px"
  }
);

sections.forEach((section) => {
  sectionObserver.observe(section);
});


// ==================================================
// Reduced motion
// ==================================================

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

function handleMotionPreference() {
  if (!prefersReducedMotion.matches) {
    return;
  }

  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });

  parallaxElements.forEach((element) => {
    element.style.setProperty("--parallax-x", "0px");
    element.style.setProperty("--parallax-y", "0px");
  });
}

handleMotionPreference();

prefersReducedMotion.addEventListener(
  "change",
  handleMotionPreference
);
