import { Fragment, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useMotionProfile } from '../../../hooks/useMotionProfile';
import { clamp } from '../../../lib/utils/math';
import { cx } from '../../../lib/utils/cx';
import styles from './Marquee.module.css';

interface MarqueeProps {
  items: ReactNode[];
  speed?: number; // seconds for one content-length loop
  direction?: 'left' | 'right';
  separator?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function Marquee({
  items,
  speed = 22,
  direction = 'left',
  separator,
  className,
  ariaLabel,
}: MarqueeProps) {
  const reduced = useReducedMotion();
  const { loopScale, loopEase } = useMotionProfile();
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced) return;
      const track = trackRef.current;
      const outer = outerRef.current;
      if (!track || !outer) return;

      const from = direction === 'left' ? 0 : -50;
      const to = direction === 'left' ? -50 : 0;
      gsap.set(track, { xPercent: from });
      const loop = gsap.to(track, {
        xPercent: to,
        duration: speed * loopScale, // Mode scales the loop speed
        ease: loopEase, // 'none', or a ticker's 'steps(n)' for Terminal
        repeat: -1,
      });

      const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3' });
      let resetCall: gsap.core.Tween | null = null;

      const st = ScrollTrigger.create({
        trigger: outer,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity();
          skewTo(clamp(v * -0.006, -14, 14));
          loop.timeScale(clamp(1 + Math.abs(v) * 0.0016, 1, 6));
          resetCall?.kill();
          resetCall = gsap.delayedCall(0.35, () => {
            skewTo(0);
            loop.timeScale(1);
          });
        },
      });

      const pause = () => loop.pause();
      const play = () => loop.play();
      outer.addEventListener('pointerenter', pause);
      outer.addEventListener('pointerleave', play);
      outer.addEventListener('focusin', pause);
      outer.addEventListener('focusout', play);

      return () => {
        st.kill();
        resetCall?.kill();
        loop.kill();
        outer.removeEventListener('pointerenter', pause);
        outer.removeEventListener('pointerleave', play);
        outer.removeEventListener('focusin', pause);
        outer.removeEventListener('focusout', play);
      };
    },
    { dependencies: [reduced, direction, speed, loopScale, loopEase], scope: outerRef },
  );

  const sep = separator ?? <span className={styles.sep} aria-hidden="true">◆</span>;

  const renderGroup = (hidden: boolean) => (
    <div className={styles.group} aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <Fragment key={i}>
          <span className={styles.item}>{item}</span>
          {sep}
        </Fragment>
      ))}
    </div>
  );

  // Reduced-motion: single static, legible row.
  if (reduced) {
    return (
      <div className={cx(styles.marquee, className)} aria-label={ariaLabel}>
        <div className={styles.trackStatic}>{renderGroup(false)}</div>
      </div>
    );
  }

  return (
    <div ref={outerRef} className={cx(styles.marquee, className)} aria-label={ariaLabel}>
      <div ref={trackRef} className={styles.track}>
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </div>
  );
}
