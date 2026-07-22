export function useReveal() {
  if (!import.meta.client) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  onMounted(() => {
    const selector = '.reveal, .reveal-group';

    const observer = reduceMotion
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              entry.target.classList.add('is-visible');
              observer?.unobserve(entry.target);
            }
          },
          { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
        );

    function reveal(el: Element) {
      if (!(el instanceof HTMLElement)) return;
      if (!el.matches(selector) || el.classList.contains('is-visible')) return;

      if (reduceMotion || !observer) {
        el.classList.add('is-visible');
        return;
      }

      observer.observe(el);
    }

    function revealTree(root: ParentNode) {
      if (root instanceof Element && root.matches(selector)) reveal(root);
      root.querySelectorAll?.(selector).forEach(reveal);
    }

    revealTree(document);

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) revealTree(node);
        });
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    onBeforeUnmount(() => {
      observer?.disconnect();
      mutationObserver.disconnect();
    });
  });
}
