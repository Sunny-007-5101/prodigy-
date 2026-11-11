// All site copy lives here, exactly as supplied in the client brief.
// Editing copy = editing this file only.

export const SITE = {
  name: 'PRODIGY',
  email: 'contact@prodigy-technology.com',
  url: 'https://www.prodigy-technology.com',
  linkedin: '', // company LinkedIn page — add the URL when it exists (footer link shows only when set)
  year: 2026,
};

export const NAV = [
  { id: 'solve', label: 'What we solve' },
  { id: 'about', label: 'About' },
  { id: 'team', label: 'Team' },
  { id: 'contact', label: 'Contact' },
] as const;

export const HERO = {
  // The word in `emphasis` is set in the italic serif.
  titleLines: ['Autonomous', 'technology', 'for critical', 'infrastructure.'],
  // Phone line breaks, so no word is left alone on a line
  titleLinesMobile: ['Autonomous', 'technology', 'for critical', 'infrastructure.'],
  emphasis: 'Autonomous',
  subtitle: 'Robotic and drone systems that inspect and maintain the assets the world runs on.',
  cta: 'Get in touch',
  status: 'Operating in stealth',
};

export const ABOUT = {
  label: 'Who we are',
  body:
    'Much of the work on critical infrastructure is still done by crews, helicopters and heavy equipment, at height and near live assets.\nThe robots and drones in use today remain basic tools with limited autonomy.\nProdigy is a technology hub building the next generation: an autonomy platform, proprietary robotic and drone systems and the data layer behind them, so the hardest work gets done safer, faster and at global scale.',
  // This phrase gets the accent colour once the reveal finishes.
  highlight: 'a technology hub building the next generation',
};

export const SOLVE = {
  label: 'What we solve',
  title: 'One technology core. Multiple applications for the infrastructure the world depends on.',
  tiles: ['Autonomous inspection', 'Autonomous maintenance', 'Mapping & database', 'On live assets'],
  focus: {
    label: 'First application',
    title: 'Insulator contamination',
    body:
      'Salt, dust and industrial pollution build up on high voltage insulators. In fog, dew or light rain the layer becomes conductive and can trigger flashover, tripping lines and causing outages. Utilities worldwide manage it with recurring manual work that is costly, slow and hazardous.',
  },
  closing: 'More on what we are building, in conversation.',
};

export const TEAM = {
  label: 'Team',
  title: 'The team',
  people: [
    {
      name: 'Jonathan Barkat',
      role: 'Co-founder & CEO',
      details: [] as string[],
      email: 'jonathan.barkat@prodigy-technology.com',
      linkedin: 'https://www.linkedin.com/in/jonathan-barkat-1a4983296',
    },
    {
      name: 'Ran Nussbaum',
      role: 'Co-founder & Chairman · Managing Partner & Co-founder, Pontifax',
      details: [],
      email: 'ran@pontifax.com',
      linkedin: 'https://www.linkedin.com/in/ran-nussbaum-b402566',
    },
    {
      name: 'Ron Itzchaki',
      role: 'COO',
      details: ['Defense Systems & Field Operations Specialist', 'Former IAF Special Forces Officer'],
      email: 'ron.itzchaki@prodigy-technology.com',
      linkedin: 'https://www.linkedin.com/in/ron-itzchaki/',
    },
    {
      name: 'Shaked Shek',
      role: 'CTO',
      details: ['Strategic Technology Leadership, Robotics & Autonomy', 'Driving Autonomous Innovation from Concept to Scale'],
      email: 'shaked.shek@prodigy-technology.com',
      linkedin: 'https://www.linkedin.com/in/shaked-shek-ab752983',
    },
  ],
  note:
    'Our leadership team and engineers come from Israel’s top robotics and drone startups and elite IDF technology units.',
};

export const CONTACT = {
  label: 'Contact',
  title: 'Get in touch.',
  intro: 'Interested in what we are building? We would like to hear from you.',
  emails: ['contact@prodigy-technology.com'],
  fields: { name: 'Name', organization: 'Organization', email: 'Email', message: 'Message' },
  consent: 'I agree to the',
  consentLink: 'Privacy Policy',
  send: 'Send',
  sending: 'Sending',
  success: 'Thank you. We will be in touch.',
  error: 'Something went wrong. Please try again.',
};

export const FOOTER = {
  rights: 'All rights reserved.',
  privacy: 'Privacy',
};
