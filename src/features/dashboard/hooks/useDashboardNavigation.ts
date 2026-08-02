import { useEffect, useState } from 'react';

export const DASHBOARD_SECTION_IDS = ['visao-geral', 'ia', 'pipeline', 'leads', 'clientes', 'produtos', 'operacao'] as const;

export function useDashboardNavigation(presentationMode: boolean) {
  const [activeSection, setActiveSection] = useState('visao-geral');
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const scrollElement = document.getElementById('app-scroll-container');
    if (!scrollElement) return;
    let lastPosition = scrollElement.scrollTop;

    const onScroll = () => {
      const currentPosition = scrollElement.scrollTop;
      if (currentPosition < 80) setIsHidden(false);
      else if (currentPosition > lastPosition + 16) setIsHidden(true);
      else if (currentPosition < lastPosition - 16) setIsHidden(false);
      lastPosition = currentPosition;
    };

    scrollElement.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const scrollElement = document.getElementById('app-scroll-container');
    if (!scrollElement) return;
    const elements = DASHBOARD_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { root: scrollElement, rootMargin: '-18% 0px -68% 0px', threshold: [0.1, 0.25, 0.5] },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [presentationMode]);

  return { activeSection, isHidden };
}
