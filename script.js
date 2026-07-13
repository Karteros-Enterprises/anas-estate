// Stripe Payment Links

const stripeLinks = {

  fiveL: "PASTE_5L_STRIPE_LINK",

  sixteenL: "PASTE_16L_STRIPE_LINK"

};

// Assign Stripe links to all Buy Now buttons

document.querySelectorAll(".stripe").forEach((button) => {

  const paymentLink = stripeLinks[button.dataset.product];

  if (paymentLink && paymentLink.startsWith("http")) {

    button.href = paymentLink;

    button.target = "_blank";

  } else {

    button.addEventListener("click", (event) => {

      event.preventDefault();

      alert(

        "Please add your Stripe Payment Link in script.js before publishing."

      );

    });

  }

});

const menuToggle = document.querySelector(".menu-toggle");

const mobileNav = document.querySelector(".mobile-nav");

if (menuToggle && mobileNav) {

  menuToggle.addEventListener("click", () => {

    const isOpen = mobileNav.classList.toggle("is-open");

    menuToggle.classList.toggle("is-open", isOpen);

    menuToggle.setAttribute("aria-expanded", String(isOpen));

  });

  mobileNav.querySelectorAll("a").forEach((link) => {

    link.addEventListener("click", () => {

      mobileNav.classList.remove("is-open");

      menuToggle.classList.remove("is-open");

      menuToggle.setAttribute("aria-expanded", "false");

    });

  });

}
