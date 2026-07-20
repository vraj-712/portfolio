/** Contract every loader variant implements. The shell (Intro.tsx) owns the
 *  overlay, skip, scroll-lock and exit wipe; a variant only plays its content
 *  and calls onReady() when it's finished. */
export interface IntroVariantProps {
  reduced: boolean;
  /** Variant finished — the shell wipes the curtain away and hands off. */
  onReady: () => void;
}
