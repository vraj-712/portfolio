import { useContext } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ActiveSectionContext } from '../context/ActiveSectionContext';

/** Registers an element as the active section (for nav/rail highlight).
 *  For sections that don't use the <Section> wrapper (custom pin layouts). */
export function useRegisterActiveSection(ref: React.RefObject<HTMLElement | null>, id: string) {
  const active = useContext(ActiveSectionContext);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !active) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) active.setActiveId(id);
        },
      });
      return () => st.kill();
    },
    { dependencies: [id], scope: ref },
  );
}
