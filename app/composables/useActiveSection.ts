export function useActiveSection(sectionIds: string[]) {
  const activeId = ref<string | null>(null);

  onMounted(() => {
    if (!import.meta.client || sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          activeId.value = visible[0].target.id;
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0.1, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    onBeforeUnmount(() => observer.disconnect());
  });

  return { activeId };
}
