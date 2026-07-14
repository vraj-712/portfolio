/* GSAP ease/duration strings — mirror of the CSS custom properties in theme.css
   so JS-driven and CSS-driven motion stay in sync. */
export const EASE = {
  expoOut: 'expo.out',
  powerOut: 'power4.out',
  backOut: 'back.out(1.7)',
  powerInOut: 'power2.inOut',
  none: 'none',
} as const;

export const DUR = {
  instant: 0.1,
  fast: 0.2,
  snappy: 0.3,
  base: 0.45,
  slow: 0.6,
  cinematic: 0.9,
} as const;
