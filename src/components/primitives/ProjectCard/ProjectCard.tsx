import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCursorTarget } from '../../../hooks/useCursorTarget';
import { useIsCoarsePointer } from '../../../hooks/useIsCoarsePointer';
import { clamp } from '../../../lib/utils/math';
import { cx } from '../../../lib/utils/cx';
import type { Project } from '../../../data/content';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
  distort?: boolean;
}

export function ProjectCard({ project, index, total, distort = true }: ProjectCardProps) {
  const coarse = useIsCoarsePointer();
  const cursorProps = useCursorTarget('view', 'VIEW');
  const cardRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!distort || coarse) return;
      const media = mediaRef.current;
      if (!media) return;

      const skewTo = gsap.quickTo(media, 'skewX', { duration: 0.5, ease: 'power3' });
      const scaleTo = gsap.quickTo(media, 'scale', { duration: 0.5, ease: 'power3' });
      let prevX = 0;
      let prevT = 0;

      const onEnter = (e: PointerEvent) => {
        prevX = e.clientX;
        prevT = performance.now();
        scaleTo(1.04);
      };
      const onMove = (e: PointerEvent) => {
        const now = performance.now();
        const dt = now - prevT || 16;
        const vx = (e.clientX - prevX) / dt;
        skewTo(clamp(vx * 6, -10, 10));
        prevX = e.clientX;
        prevT = now;
      };
      const onLeave = () => {
        skewTo(0);
        scaleTo(1);
      };

      media.addEventListener('pointerenter', onEnter);
      media.addEventListener('pointermove', onMove);
      media.addEventListener('pointerleave', onLeave);
      return () => {
        media.removeEventListener('pointerenter', onEnter);
        media.removeEventListener('pointermove', onMove);
        media.removeEventListener('pointerleave', onLeave);
      };
    },
    { dependencies: [distort, coarse], scope: cardRef },
  );

  const { media } = project;
  const hasLinks = Boolean(project.links.live || project.links.source);
  // Placeholder art is drawn from theme tokens so it re-themes with the site.
  // Real (raster/video) media is rendered as-is once dropped in.
  const isPlaceholder = media.src.endsWith('.svg');

  return (
    <article ref={cardRef} className={styles.card} {...cursorProps}>
      <div ref={mediaRef} className={styles.media} data-variant={index % 4}>
        {isPlaceholder ? (
          <div className={styles.ph} role="img" aria-label={media.alt}>
            <span className={cx(styles.phShape, styles.phAccent)} />
            <span className={cx(styles.phShape, styles.phInk1)} />
            <span className={cx(styles.phShape, styles.phInk2)} />
            <span className={styles.phTag}>// PLACEHOLDER</span>
          </div>
        ) : media.type === 'video' ? (
          <video
            className={styles.mediaEl}
            src={media.src}
            poster={media.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-label={media.alt}
          />
        ) : (
          <img
            className={styles.mediaEl}
            src={media.src}
            alt={media.alt}
            loading="lazy"
            decoding="async"
          />
        )}
        <span className={styles.counter}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <span className={styles.role}>{project.role}</span>
      </div>

      <div className={styles.info}>
        <div className={styles.head}>
          <h3 className={styles.title}>{project.title}</h3>
          <span className={styles.year}>{project.year}</span>
        </div>
        <p className={styles.blurb}>{project.blurb}</p>
        <ul className={styles.tags}>
          {project.tags.map((t) => (
            <li key={t} className={styles.tag}>
              {t}
            </li>
          ))}
        </ul>
        {hasLinks && (
          <div className={styles.links}>
            {project.links.live && (
              <a href={project.links.live} className={styles.link} target="_blank" rel="noreferrer">
                Live ↗
              </a>
            )}
            {project.links.source && (
              <a href={project.links.source} className={styles.link} target="_blank" rel="noreferrer">
                Source ↗
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
