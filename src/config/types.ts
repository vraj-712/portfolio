/* =============================================================================
   CONFIG TYPES — the shape every part of site.config.ts must satisfy.
   These interfaces are what stop a rebrand from putting a value in the wrong
   place: fill the data in ./content.ts, ./labels.ts and ./theme.ts and
   TypeScript checks it here. (SEO metadata is static HTML in index.html.)
   ============================================================================= */

import type {
  CursorThemeId,
  FontPairId,
  PaletteId,
  ThemeMode,
} from '../settings/types';

/* ----------------------------------------------------------------------------
   Content — the résumé/profile data (the bulk of a rebrand).
   ---------------------------------------------------------------------------- */

export interface NavItem {
  /** Must match the target section's DOM id. */
  id: string;
  label: string;
}

export interface Brand {
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  roleFacets: string[]; // hero word-swap
  tagline: string; // the personal brand line
  taglineParts: [string, string, string]; // tuple → safe indexed access under noUncheckedIndexedAccess
  location: string;
  summary: string;
}

export interface EducationItem {
  degree: string;
  field: string;
  school: string;
  period: string;
  location: string;
}

export interface AboutContent {
  lead: string;
  philosophy: string;
  education: EducationItem[];
  interests: string[];
  strengths: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  clients?: string[];
  summary: string;
  bullets: string[];
  tech: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Skills {
  /** Ordered categories — the Stack section rolls through these. */
  groups: SkillGroup[];
  learning: string[];
}

export interface ExpertiseItem {
  title: string;
  blurb: string;
}

export interface ProjectMedia {
  type: 'image' | 'video';
  src: string; // path under /public, e.g. /media/projects/foo.svg
  poster?: string;
  alt: string;
}

export interface ProjectLinks {
  live?: string;
  source?: string;
}

export interface Project {
  id: string;
  title: string;
  year: string;
  role: string;
  blurb: string;
  tags: string[];
  media: ProjectMedia;
  links: ProjectLinks;
}

export interface Certificate {
  title: string;
  issuer: string;
}

export interface Course {
  title: string;
  url?: string;
}

export interface Contact {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  resume: string; // path under /public, e.g. /resume.pdf
  location: string;
}

export interface SiteContent {
  brand: Brand;
  nav: NavItem[];
  marqueeWords: string[];
  about: AboutContent;
  experience: ExperienceItem[];
  skills: Skills;
  expertise: ExpertiseItem[];
  projects: Project[];
  certificates: Certificate[];
  courses: Course[];
  vision: string;
  contact: Contact;
}

/* ----------------------------------------------------------------------------
   Labels — every UI string that is NOT profile data. Section headings, CTAs,
   the status chip, stat captions. Kept here so nothing reads as hardcoded copy
   inside a component.
   ---------------------------------------------------------------------------- */

export interface SiteLabels {
  hero: {
    status: string; // the availability chip, e.g. "Available for work"
    ctaPrimary: string; // e.g. "View Work"
    ctaSecondary: string; // e.g. "Get in touch"
    clock: string; // timezone suffix on the live clock, e.g. "IST"
    /** Captions under the three hero stats (the numbers are derived). */
    stats: { projects: string; technologies: string; roles: string };
  };
  /** Section eyebrows (the small label above each section heading). */
  sections: {
    about: string;
    expertise: string;
    experience: string;
    work: string;
    stack: string;
    credentials: string;
    contact: string;
    marquee: string; // a11y label for the keyword marquee
  };
  about: { education: string; interests: string; strengths: string };
  credentials: { certificates: string; courses: string };
  closing: {
    eyebrow: string; // e.g. "Let’s build something"
    backToTop: string; // e.g. "Back to top"
    contacts: { email: string; phone: string; linkedin: string; github: string };
  };
  loader: { label: string; skip: string }; // e.g. "LOADING", "Skip"
}

/* ----------------------------------------------------------------------------
   Theme — the visual identity the site boots with. Feeds DEFAULT_SETTINGS,
   the first-paint CSS, and the "primary" palette preset. Colors are hex.
   ---------------------------------------------------------------------------- */

export interface ThemeConfig {
  /** Preset id this palette registers under (shown in the Settings panel). */
  paletteId: PaletteId;
  /** Display name for that preset, e.g. "Midnight · Cyan". */
  paletteName: string;
  mode: ThemeMode; // 'light' | 'dark' — must agree with the base color
  colorBase: string; // page canvas
  colorInk: string; // text / borders
  colorAccent: string; // reveal / focus / emphasis
  fontPair: FontPairId;
  cursorTheme: CursorThemeId;
  // Layout / motion knobs the site starts at (the panel can still change them).
  typeScale: number; // 0.85 – 1.3
  spacing: number; // 0.8 – 1.3
  radius: number; // 0 – 28 px
  borderWidth: number; // 1 – 5 px
  hardShadows: boolean;
  reduceMotion: boolean;
  motionSpeed: number; // 0.5 – 2
  smoothScroll: boolean;
}

/** The whole site, in one typed object. (SEO metadata lives as static HTML in
 *  index.html, not in the config.) */
export interface SiteConfig {
  content: SiteContent;
  labels: SiteLabels;
  theme: ThemeConfig;
}
