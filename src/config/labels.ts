/* =============================================================================
   LABELS — every UI string that isn't profile data. Rename a section, reword a
   CTA, or translate the interface entirely from right here.
   ============================================================================= */

import type { SiteLabels } from './types';

export const labels: SiteLabels = {
  hero: {
    status: 'Available for work',
    ctaPrimary: 'View Work',
    ctaSecondary: 'Get in touch',
    clock: 'IST',
    stats: { projects: 'Projects', technologies: 'Technologies', roles: 'Roles' },
  },

  sections: {
    about: 'About',
    expertise: 'Areas of Expertise',
    experience: 'Experience',
    work: 'Selected Work',
    stack: 'Tech Stack',
    credentials: 'Credentials',
    contact: 'Contact',
    marquee: 'Keywords',
  },

  about: {
    education: 'Education',
    interests: 'Interests',
    strengths: 'Strengths',
  },

  credentials: {
    certificates: 'Certificates',
    courses: 'Courses',
  },

  closing: {
    eyebrow: 'Let’s build something',
    backToTop: 'Back to top',
    contacts: { email: 'Email', phone: 'Phone', linkedin: 'LinkedIn', github: 'GitHub' },
  },

  loader: {
    label: 'LOADING',
    skip: 'Skip',
  },
};
