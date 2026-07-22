export function useSmoothScroll() {
  if (!import.meta.client) return;

  onMounted(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const destination = document.querySelector(href);
      if (!destination) return;

      event.preventDefault();
      destination.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    };

    document.addEventListener('click', onClick);
    onBeforeUnmount(() => document.removeEventListener('click', onClick));
  });
}
