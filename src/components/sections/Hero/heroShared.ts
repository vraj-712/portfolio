/* Data shared by the desktop and mobile hero variants — one source of truth so
   the two purpose-built layouts never drift apart. */
import { content, labels } from '../../../site.config';

const { brand, skills, projects, experience, contact } = content;

export const CITY = brand.location.split(',')[0] ?? brand.location;

export const STATS = [
  { n: projects.length, label: labels.hero.stats.projects },
  { n: skills.groups.reduce((sum, g) => sum + g.items.length, 0), label: labels.hero.stats.technologies },
  { n: experience.length, label: labels.hero.stats.roles },
] as const;

export const SOCIALS = [
  { label: 'GH', full: 'GitHub', href: contact.github },
  { label: 'LI', full: 'LinkedIn', href: contact.linkedin },
  { label: 'EM', full: 'Email', href: `mailto:${contact.email}` },
] as const;

export const pad = (n: number) => String(n).padStart(2, '0');

/** The accent bloom's reveal shape is a Mode signature, computed per scroll
 *  progress (0 = hidden → 1 = full): a hard rectangular wipe for Terminal, a
 *  corner bloom for Kinetic, a centred circle otherwise. Driven imperatively so
 *  the ScrollTrigger is never rebuilt when the Mode changes. Shared by both the
 *  desktop (pinned) and mobile (scrubbed) heroes. */
export function bloomShapeAt(theme: string, p: number): string {
  switch (theme) {
    case 'terminal':
      return `inset(0 ${(1 - p) * 100}% 0 0)`;
    case 'kinetic':
      return `circle(${p * 165}% at 12% 88%)`;
    default:
      return `circle(${p * 135}% at 50% 52%)`;
  }
}

/** Local time in Ahmedabad (IST), independent of the visitor's timezone. */
export function istTime(): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return '';
  }
}
