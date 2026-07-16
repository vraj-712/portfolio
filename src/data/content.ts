/* =============================================================================
   CONTENT — the single, typed, drop-in-replaceable data layer.
   Real data supplied by Vraj (profile, education, experience, skills, projects,
   certificates, courses). Anything still unknown is marked // TODO — never invented.
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
  certificates: Certificate[];
  courses: Course[];
  vision: string;
  contact: Contact;
}

export const content: SiteContent = {
  brand: {
    name: 'Vraj Patel',
    firstName: 'Vraj',
    lastName: 'Patel',
    role: 'Full Stack Developer',
    roleFacets: ['FULL STACK', 'NEXT.JS', 'REACT NATIVE'],
    tagline: 'Curious by default. Fast by habit. Building for what comes next.',
    taglineParts: ['Curious by default.', 'Fast by habit.', 'Building for what comes next.'],
    location: 'Ahmedabad, Gujarat, India',
    summary:
      'Full stack developer at 9series building production platforms with Next.js, Postgres, and React Native — internal operations tooling, real-time collaboration, third-party integrations, and AI-assisted features.',
  },

  nav: [
    { id: 'about', label: 'About' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Work' },
    { id: 'skills', label: 'Stack' },
    { id: 'credentials', label: 'Credentials' },
    { id: 'closing', label: 'Contact' },
  ],

  marqueeWords: [
    'NEXT.JS',
    'REACT',
    'REACT NATIVE',
    'NODE.JS',
    'EXPRESS.JS',
    'TYPESCRIPT',
    'POSTGRES',
    'MONGODB',
    'REDIS',
    'PAYLOAD CMS',
    'ANDROID TV',
  ],

  about: {
    lead: 'I am a Computer Engineering graduate and full stack developer with a strong passion for backend and web development — building production platforms end to end with Next.js, Node.js, and React Native.',
    philosophy:
      "I learn by shipping. Almost every project has meant a new stack, a new integration, or a problem I hadn't solved before — and that's the part I like. I don't think good engineers know everything; they close the gap quickly and leave the codebase better than they found it.",
    education: [
      {
        degree: 'B.E.',
        field: 'Computer Engineering',
        school: 'LJ Institute of Engineering and Technology',
        period: '2021 — 2025',
        location: 'Ahmedabad, India',
      },
      {
        degree: '12th Science',
        field: 'GSEB',
        school: 'H. B. Kapadiya School',
        period: '2020 — 2021',
        location: 'Ahmedabad, India',
      },
      {
        degree: '10th',
        field: 'GSEB',
        school: 'H. B. Kapadiya School',
        period: '2018 — 2019',
        location: 'Ahmedabad, India',
      },
    ],
    interests: [
      'Backend Engineering',
      'Web Development',
      'React Native',
      'AI-assisted Development',
      'Databases',
    ],
    strengths: [
      'Adaptable',
      'Fast learner',
      'Analytical thinking',
      'Detail-oriented',
      'Collaborative',
    ],
  },

  experience: [
    {
      company: '9series',
      role: 'Jr Software Engineer',
      period: 'Jul 2025 — Present',
      location: 'Ahmedabad, India',
      summary:
        'Building internal operations tooling and client platforms end to end with Next.js and Postgres — integrations, auth, background jobs, and AI-assisted features.',
      bullets: [
        'Building Pivotal, an internal operations management portal — Next.js front and back, Postgres, RBAC, and Microsoft OAuth.',
        'Integrated third-party tooling across Slack, Jira, GitHub, Notion, Zoom, Teams, and Outlook.',
        'Shipped an AI minutes-of-meeting generation feature, plus Redis-backed jobs and queues.',
        'Delivered client platforms across creator collaboration, construction, metals, and health.',
      ],
      tech: ['Next.js', 'Postgres', 'Redis', 'React Native', 'Payload CMS', 'GetStream'],
    },
    {
      company: 'Prime Apps',
      role: 'Software Developer',
      period: 'May 2024 — May 2025',
      location: 'Ahmedabad, India',
      clients: ['SportsGrid'],
      summary:
        'React Native work across TV and mobile, backend development in Node.js and Express.js, and full-stack delivery of a learning management system.',
      bullets: [
        'Worked on a React Native project focused on TV and mobile app development for SportsGrid.',
        'Built backend services with Node.js and Express.js as part of a company assignment.',
        'Worked on MyUnify, a Learning Management System, as a full-stack developer.',
      ],
      tech: ['React Native', 'Next.js', 'React', 'Node.js', 'MongoDB', 'Payload CMS'],
    },
    {
      company: 'Prime Apps',
      role: 'Software Intern',
      period: 'Nov 2023 — May 2024',
      location: 'Ahmedabad, India',
      summary:
        'Where the foundation got built — learning the web stack end to end and putting it straight into training projects.',
      bullets: [
        'Learned the fundamentals hands-on: HTML, CSS, JavaScript, and jQuery.',
        'Picked up PHP, Laravel, and WordPress alongside SQL and relational data modelling.',
        'Applied all of it across a series of training projects before moving onto client work.',
      ],
      tech: ['HTML5', 'CSS3', 'JavaScript', 'jQuery', 'PHP', 'Laravel', 'WordPress', 'SQL'],
    },
  ],

  skills: {
    groups: [
      {
        label: 'Languages',
        items: ['JavaScript', 'TypeScript', 'Python'],
      },
      {
        // shortened from "Framework & Libraries" so the Stack headline fits its box
        label: 'Frameworks',
        items: ['React', 'Next.js', 'React Native', 'Express.js', 'Node.js', 'Tailwind CSS'],
      },
      {
        label: 'Databases',
        items: ['MongoDB', 'MySQL', 'Postgres', 'Redis'],
      },
      {
        label: 'Dev Tools',
        items: ['VS Code', 'Git & GitHub', 'Jupyter Notebooks'],
      },
      {
        label: 'AI Tools',
        items: ['Claude Code', 'Cursor'],
      },
    ],
    learning: ['RAG & AI Integration'],
  },

  expertise: [
    {
      title: 'Full Stack Next.js',
      blurb: 'Front and back in one codebase — routing, server logic, and data, shipped end to end.',
    },
    {
      title: 'React Native Development',
      blurb: 'Cross-platform apps for mobile and Android TV, built for the ten-foot view.',
    },
    {
      title: 'Third-party Integrations',
      blurb: 'Slack, Jira, GitHub, Notion, Zoom, Teams, Outlook, and GetStream wired into product flows.',
    },
    {
      title: 'Auth & RBAC',
      blurb: 'Role-based access control and Microsoft OAuth across multi-tenant internal tooling.',
    },
    {
      title: 'Database Design',
      blurb: 'Postgres and MongoDB modelling, queries, and reliable data flows.',
    },
    {
      title: 'Jobs & Queues',
      blurb: 'Redis-backed background jobs and queues for work that shouldn’t block a request.',
    },
    {
      title: 'AI-assisted Features',
      blurb: 'Shipping AI into real products — automatic minutes-of-meeting generation from calls.',
    },
    {
      title: 'Headless CMS',
      blurb: 'Payload CMS-driven content platforms with a fast Next.js front end.',
    },
  ],

  projects: [
    {
      id: 'pivotal',
      title: 'Pivotal',
      year: '2025 — 26', // TODO confirm
      role: 'Full Stack · 9series',
      blurb:
        'An internal operations management portal built front-to-back in Next.js on Postgres. Integrates Slack, Jira, GitHub, Notion, Zoom and Teams, generates meeting minutes with AI, and runs background work on Redis jobs and queues behind Microsoft OAuth and RBAC.',
      tags: ['Next.js', 'Postgres', 'Redis', 'RBAC', 'AI MoM', 'Cloudflare R2'],
      media: { type: 'image', src: '/media/projects/pivotal.svg', alt: 'Pivotal internal operations management portal' }, // TODO real media
      links: {},
    },
    {
      id: 'kavra',
      title: 'Kavra',
      year: '2025', // TODO confirm
      role: 'Full Stack · 9series',
      blurb:
        'A creator collaboration platform on Next.js and Postgres, with role-based access control and an in-product chat experience powered by GetStream.',
      tags: ['Next.js', 'Postgres', 'RBAC', 'GetStream'],
      media: { type: 'image', src: '/media/projects/kavra.svg', alt: 'Kavra creator collaboration platform' }, // TODO real media
      links: {},
    },
    {
      id: 'myunify',
      title: 'MyUnify',
      year: '2024 — 25', // TODO confirm
      role: 'Full Stack · Prime Apps',
      blurb:
        'A learning management system built with Next.js, Node.js and React on MongoDB, with Payload CMS behind it and BigBlueButton integrated for live online classes.',
      tags: ['Next.js', 'Node.js', 'React', 'MongoDB', 'Payload CMS', 'BBB'],
      media: { type: 'image', src: '/media/projects/myunify.svg', alt: 'MyUnify learning management system' }, // TODO real media
      links: {},
    },
    {
      id: 'sportsgrid',
      title: 'SportsGrid',
      year: '2024', // TODO confirm
      role: 'React Native · Prime Apps',
      blurb:
        'A TV and mobile application built in React Native for SportsGrid — screen development and API integration for the living-room ten-foot view.',
      tags: ['React Native', 'Android TV', 'Mobile', 'API Integration'],
      media: { type: 'image', src: '/media/projects/sportsgrid.svg', alt: 'SportsGrid React Native TV and mobile app' }, // TODO real media
      links: {},
    },
    {
      id: 'ablefinder',
      title: 'Ablefinder',
      year: '2025', // TODO confirm
      role: 'Full Stack · 9series',
      blurb:
        'A health-industry platform on Next.js and Postgres, with a chat experience integrated through GetStream.',
      tags: ['Next.js', 'Postgres', 'GetStream', 'Health'],
      media: { type: 'image', src: '/media/projects/ablefinder.svg', alt: 'Ablefinder health industry platform' }, // TODO real media
      links: {},
    },
    {
      id: 'buildchain',
      title: 'BuildChain',
      year: '2025', // TODO confirm
      role: 'Full Stack · 9series',
      blurb:
        'A construction-business website built headless — Payload CMS for content, Postgres for data, and a fast Next.js front end.',
      tags: ['Next.js', 'Postgres', 'Payload CMS', 'Headless CMS'],
      media: { type: 'image', src: '/media/projects/buildchain.svg', alt: 'BuildChain headless CMS website' }, // TODO real media
      links: {},
    },
    {
      id: 'rocket',
      title: 'Rocket',
      year: '2025', // TODO confirm
      role: 'React Native · 9series',
      blurb:
        'A health application in React Native — screen development, API integration, and bug fixing across the app.',
      tags: ['React Native', 'API Integration', 'Health'],
      media: { type: 'image', src: '/media/projects/rocket.svg', alt: 'Rocket health mobile app' }, // TODO real media
      links: {},
    },
    {
      id: 'tennant-metals',
      title: 'Tennant Metals',
      year: '2025', // TODO confirm
      role: 'Frontend · 9series',
      blurb:
        'A metals-industry platform with a Next.js front end and WebSocket-driven live data — supporting the team on feature development and bug fixing.',
      tags: ['Next.js', 'WebSockets', 'Frontend'],
      media: { type: 'image', src: '/media/projects/tennant-metals.svg', alt: 'Tennant Metals platform' }, // TODO real media
      links: {},
    },
  ],

  certificates: [
    { title: 'CODE WARS — Certificate of Participation', issuer: 'LDCE' },
    { title: "Hackout'23 — Certificate of Participation", issuer: 'DAIICT' },
  ],

  courses: [
    { title: 'Building with the Claude API', url: 'https://verify.skilljar.com/c/w8i3cfuqepf7' },
    { title: 'Claude Code in Action', url: 'https://verify.skilljar.com/c/ymmbk4ijvrhh' },
    { title: 'Introduction to Agent Skills', url: 'https://verify.skilljar.com/c/q6zem5r7eevh' },
    {
      title: 'Introduction to Model Context Protocol',
      url: 'https://verify.skilljar.com/c/982vuce9279u',
    },
    { title: 'Exploratory Data Analysis for Machine Learning' },
    { title: 'Data Structures' },
  ],

  vision:
    'To keep compounding — deeper into backend and system design, further into AI-assisted engineering, and toward software that reaches far more people than it does today.',

  contact: {
    email: 'patelvraju07@gmail.com',
    phone: '+91 98799 71451',
    linkedin: 'https://www.linkedin.com/in/vraj-patel-725817228/',
    github: 'https://github.com/vraj-712',
    resume: '/vraj-patel-resume.pdf', // TODO drop the real PDF in /public
    location: 'Ahmedabad, Gujarat, India',
  },
};
