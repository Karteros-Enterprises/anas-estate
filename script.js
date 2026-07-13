// Stripe payment links

const stripeLinks = {
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


// Mobile navigation

const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("is-open");

    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  const mobileNavLinks = mobileNav.querySelectorAll("a");

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}
