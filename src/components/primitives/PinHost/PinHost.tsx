import type { ReactNode } from 'react';

/** A stable, React-owned wrapper for any section that pins.
 *
 *  ScrollTrigger's `pin: true` WRAPS the pinned element in a `.pin-spacer` div
 *  that React knows nothing about. When the pinned `<section>` is a direct child
 *  of `<main>`, React's fiber still models that section as a child of `<main>` —
 *  so the moment React inserts or removes any OTHER child of `<main>`, it calls
 *  `main.insertBefore(node, section)` against a node that now lives inside the
 *  spacer. That throws `NotFoundError` and unmounts the entire app.
 *
 *  The trigger in practice was the compact breakpoint: crossing it swaps
 *  Hero and Experience between their desktop and mobile components, which is
 *  exactly such an insert. Result was a blank page, in production builds too.
 *
 *  Keeping a stable div between `<main>` and the pinned section means the
 *  spacer is created INSIDE this wrapper. `<main>`'s children stay exactly what
 *  React believes them to be, so sibling references never go stale.
 *
 *  Note this fixes the class of bug, not one instance: any future section that
 *  pins is safe as long as it is wrapped here. See SITE_AUDIT.md. */
export function PinHost({ children }: { children: ReactNode }) {
  return <div data-pin-host="">{children}</div>;
}
