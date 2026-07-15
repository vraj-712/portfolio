/* =============================================================================
   CONTENT — the single, typed, drop-in-replaceable data layer.
   Structure mirrors Vraj_Patel_Professional_Profile.md. Swap the string values
   for final copy; the structure (and every component) stays the same.
   Placeholders (email / phone / links / media) are marked // TODO.
   ============================================================================= */

export interface NavItem {
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
  short: string;
}

export interface AboutContent {
  lead: string;
  philosophy: string;
  education: EducationItem;
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
  frontend: SkillGroup;
  backend: SkillGroup;
  tools: SkillGroup;
  learning: string[];
}

export interface ExpertiseItem {
  title: string;
  blurb: string;
}

export interface ProjectMedia {
  type: 'image' | 'video';
  src: string;
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

export interface Contact {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  resume: string;
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
  vision: string;
  contact: Contact;
}

export const content: SiteContent = {
  brand: {
    name: 'Vraj Patel',
    firstName: 'Vraj',
    lastName: 'Patel',
    role: 'Full Stack Software Developer',
    roleFacets: ['FULL STACK', 'REACT NATIVE', 'PRODUCT-MINDED'],
    tagline:
      'Engineering with precision. Designing with purpose. Building experiences that people remember.',
    taglineParts: [
      'Engineering with precision.',
      'Designing with purpose.',
      'Building experiences that people remember.',
    ],
    location: 'Ahmedabad, Gujarat, India',
    summary:
      'Full Stack Software Developer building production web, mobile, and TV apps with modern JavaScript — focused on scalable architecture, maintainable code, and interfaces people remember.',
  },

  nav: [
    { id: 'about', label: 'About' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Work' },
    { id: 'skills', label: 'Stack' },
    { id: 'closing', label: 'Contact' },
  ],

  marqueeWords: [
    'REACT',
    'NEXT.JS',
    'REACT NATIVE',
    'ANDROID TV',
    'NODE.JS',
    'MONGODB',
    'DETAIL-ORIENTED',
    'FAST LEARNER',
    'PERFORMANCE',
    'MERN',
    'TYPESCRIPT',
  ],

  about: {
    lead: 'I build modern digital products that combine clean engineering with exceptional user experiences — production-ready web, mobile, and TV apps across the modern JavaScript ecosystem.',
    philosophy:
      'Exceptional software is created through a balance of engineering excellence and thoughtful design. Every animation, interaction, loading state, and user flow should have a purpose. I build products people enjoy using — not just products that function correctly.',
    education: {
      degree: 'Bachelor of Engineering',
      field: 'Computer Engineering',
      school: 'LJ Institute of Engineering & Technology (LJIET)',
      short: 'B.E. Computer Engineering · LJIET',
    },
    interests: [
      'Artificial Intelligence',
      'Product Development',
      'Backend Engineering',
      'UI/UX Design',
      'Motion Design',
      'Photography',
      'Modern Web',
    ],
    strengths: [
      'Analytical thinking',
      'Fast learner',
      'Detail-oriented',
      'Adaptable',
      'Collaborative',
      'Continuous improvement',
    ],
  },

  experience: [
    {
      company: 'PrimeApps',
      role: 'Full Stack Developer / React Native Developer',
      period: 'Present',
      location: 'Ahmedabad, India',
      clients: ['SportsGrid, Inc.'],
      summary:
        'Built and maintained production applications for real-world clients across web, mobile, and Android TV platforms.',
      bullets: [
        'Developed and maintained React Native apps for mobile and Android TV.',
        'Contributed to applications for SportsGrid, Inc.',
        'Built responsive frontend interfaces with React and Next.js.',
        'Developed backend APIs with Node.js and Express.js.',
        'Worked with MongoDB and RESTful API integrations.',
        'Implemented authentication systems and secure user flows.',
        'Integrated CMS platforms and modern development tooling.',
        'Owned debugging, optimization, feature work, and production deploys.',
      ],
      tech: ['React Native', 'React', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'Payload CMS'],
    },
    {
      company: 'Freelance / Contract',
      role: 'Full Stack Developer',
      period: '2022 — 2023',
      location: 'Remote',
      summary:
        'Delivered end-to-end web applications for small businesses and startups on a project basis.',
      bullets: [
        'Built and shipped MERN applications from scratch for multiple clients.',
        'Designed REST APIs, authentication flows, and MongoDB data models.',
        'Integrated Stripe payments, Cloudinary media, and third-party APIs.',
        'Owned deployment, performance tuning, and post-launch support.',
      ],
      tech: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Stripe', 'Tailwind CSS'],
    },
    {
      company: 'Nexus Web Studio',
      role: 'Frontend Developer',
      period: '2021 — 2022',
      location: 'Ahmedabad, India',
      summary: 'Built responsive, accessible interfaces for a range of client web products.',
      bullets: [
        'Developed responsive UIs in React and Next.js from Figma designs.',
        'Built reusable component libraries and design-system primitives.',
        'Implemented authentication, dashboards, and data-driven views.',
        'Improved Lighthouse performance and accessibility scores.',
      ],
      tech: ['React', 'Next.js', 'JavaScript', 'CSS3', 'REST APIs'],
    },
    {
      company: 'CodeCraft Labs',
      role: 'Web Developer Intern',
      period: '2020 — 2021',
      location: 'Ahmedabad, India',
      summary: 'First professional experience building for the web across the stack.',
      bullets: [
        'Contributed to production features under senior-developer mentorship.',
        'Built UI components with HTML, CSS, and JavaScript, then React.',
        'Wrote and consumed REST APIs with Node.js and Express.',
        'Learned Git workflows, code review, and agile delivery.',
      ],
      tech: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'Git'],
    },
  ],

  skills: {
    frontend: {
      label: 'Frontend',
      items: [
        'React',
        'Next.js',
        'React Native',
        'JavaScript (ES6+)',
        'TypeScript',
        'HTML5',
        'CSS3',
        'Tailwind CSS',
        'Redux',
        'Zustand',
        'GSAP',
        'Framer Motion',
        'SASS/SCSS',
        'Material UI',
      ],
    },
    backend: {
      label: 'Backend',
      items: [
        'Node.js',
        'Express.js',
        'REST APIs',
        'GraphQL',
        'MongoDB',
        'PostgreSQL',
        'Prisma',
        'Socket.io',
        'JWT',
        'Auth & Authorization',
      ],
    },
    tools: {
      label: 'Tools & Platforms',
      items: [
        'Git',
        'GitHub',
        'Docker',
        'Firebase',
        'Cloudinary',
        'Payload CMS',
        'Vite',
        'Postman',
        'Figma',
        'Vercel',
        'AWS',
        'npm',
        'pnpm',
      ],
    },
    learning: ['Redis', 'AI / LLM APIs'],
  },

  expertise: [
    { title: 'Full Stack Web Development', blurb: 'End-to-end products from data model to interface, MERN and Next.js.' },
    { title: 'Cross-platform Mobile Development', blurb: 'React Native apps that ship to mobile and Android TV from one codebase.' },
    { title: 'React Native TV Development', blurb: 'Media-rich, performance-tuned TV experiences and focus navigation.' },
    { title: 'API Development', blurb: 'RESTful APIs with Node.js/Express, auth, and clean integration contracts.' },
    { title: 'Performance Optimization', blurb: 'Profiling, rendering, and delivery work that makes products feel instant.' },
    { title: 'Responsive UI Development', blurb: 'Interfaces that hold up from small screens to the living-room ten-foot view.' },
    { title: 'Database Integration', blurb: 'MongoDB modeling, queries, and reliable data flows.' },
    { title: 'Modern JavaScript Ecosystem', blurb: 'TypeScript-first, current tooling, maintainable architecture.' },
  ],

  projects: [
    {
      id: 'rn-tv',
      title: 'React Native TV Application',
      year: '2024',
      role: 'UI · API · Performance',
      blurb:
        'A television application focused on performance, usability, and media-rich experiences — UI development, API integration, performance improvements, feature work, and bug fixing.',
      tags: ['React Native', 'Android TV', 'Performance', 'Media'],
      media: { type: 'image', src: '/media/projects/tv-app.svg', alt: 'React Native TV application interface' }, // TODO real media
      links: {}, // TODO
    },
    {
      id: 'lms',
      title: 'Learning Management System',
      year: '2023',
      role: 'Frontend',
      blurb:
        'Frontend for an LMS: responsive layouts, authentication flows, interactive dashboards, and a modern React architecture.',
      tags: ['React', 'Auth', 'Dashboards', 'Responsive'],
      media: { type: 'image', src: '/media/projects/lms.svg', alt: 'Learning Management System dashboard' }, // TODO real media
      links: {}, // TODO
    },
    {
      id: 'mern',
      title: 'Full Stack MERN Applications',
      year: '2023',
      role: 'Full Stack',
      blurb:
        'Complete web apps in MongoDB, Express, React, Node — authentication, CRUD, REST APIs, and reusable component architecture.',
      tags: ['MongoDB', 'Express', 'React', 'Node.js'],
      media: { type: 'image', src: '/media/projects/mern.svg', alt: 'MERN stack web application' }, // TODO real media
      links: {}, // TODO
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce Storefront',
      year: '2024',
      role: 'Full Stack',
      blurb:
        'A headless commerce storefront with product catalog, cart, checkout, and order management — server-rendered for speed and SEO.',
      tags: ['Next.js', 'Stripe', 'Payload CMS', 'SSR'],
      media: { type: 'image', src: '/media/projects/ecommerce.svg', alt: 'E-commerce storefront' }, // TODO real media
      links: {}, // TODO
    },
    {
      id: 'chat',
      title: 'Real-Time Chat Platform',
      year: '2024',
      role: 'Full Stack',
      blurb:
        'A real-time messaging app with presence, typing indicators, and channels — powered by WebSockets and a Node backend.',
      tags: ['Socket.io', 'Node.js', 'MongoDB', 'React'],
      media: { type: 'image', src: '/media/projects/chat.svg', alt: 'Real-time chat platform' }, // TODO real media
      links: {}, // TODO
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      year: '2023',
      role: 'Frontend',
      blurb:
        'A data-dense dashboard with interactive charts, filters, and live-updating KPIs built on a reusable component system.',
      tags: ['React', 'Charts', 'REST', 'Dashboards'],
      media: { type: 'image', src: '/media/projects/analytics.svg', alt: 'Analytics dashboard' }, // TODO real media
      links: {}, // TODO
    },
    {
      id: 'fitness',
      title: 'Fitness Tracker App',
      year: '2023',
      role: 'Mobile',
      blurb:
        'A cross-platform mobile app for workout logging, streaks, and progress charts with offline support and cloud sync.',
      tags: ['React Native', 'Firebase', 'Offline', 'Charts'],
      media: { type: 'image', src: '/media/projects/fitness.svg', alt: 'Fitness tracker mobile app' }, // TODO real media
      links: {}, // TODO
    },
    {
      id: 'booking',
      title: 'Event Booking System',
      year: '2022',
      role: 'Full Stack',
      blurb:
        'A booking platform with seat selection, authentication, payments, and an admin panel for managing events and orders.',
      tags: ['MongoDB', 'Express', 'React', 'Payments'],
      media: { type: 'image', src: '/media/projects/booking.svg', alt: 'Event booking system' }, // TODO real media
      links: {}, // TODO
    },
    {
      id: 'cms',
      title: 'Headless CMS Portal',
      year: '2022',
      role: 'Full Stack',
      blurb:
        'A content portal on a headless CMS with role-based access, structured collections, and a fast Next.js front end.',
      tags: ['Payload CMS', 'Next.js', 'Auth', 'TypeScript'],
      media: { type: 'image', src: '/media/projects/cms.svg', alt: 'Headless CMS portal' }, // TODO real media
      links: {}, // TODO
    },
  ],

  vision:
    'My long-term objective is to build impactful software that reaches millions — growing as a full stack engineer while exploring AI-powered applications, scalable systems, and premium digital experiences.',

  contact: {
    email: 'hello@vrajpatel.dev', // TODO real
    phone: '+91 00000 00000', // TODO real
    linkedin: 'https://linkedin.com/in/vrajpatel', // TODO real
    github: 'https://github.com/vrajpatel', // TODO real
    resume: '/vraj-patel-resume.pdf', // TODO real
    location: 'Ahmedabad, Gujarat, India',
  },
};
