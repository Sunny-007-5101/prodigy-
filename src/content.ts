// All site copy lives here, exactly as supplied in the client brief.
// Editing copy = editing this file only.

export const SITE = {
  name: 'PRODIGY',
  email: 'contact@[domain]', // TODO: replace with the real address once the domain is set
  linkedin: '#', // TODO: company LinkedIn URL
  year: 2026,
};

export const NAV = [
  { id: 'about', label: 'About' },
  { id: 'solve', label: 'What we solve' },
  { id: 'team', label: 'Team' },
  { id: 'contact', label: 'Contact' },
] as const;

export const HERO = {
  // The word in `emphasis` is set in the italic serif.
  titleLines: ['A new age of', 'autonomy for the world’s', 'critical infrastructure.'],
  emphasis: 'autonomy',
  subtitle:
    'Next generation robotic and drone systems that inspect and maintain the assets the world runs on.',
  cta: 'Get in touch',
  status: 'Operating in stealth',
};

export const ABOUT = {
  label: 'Who we are',
  body:
    'Much of the work on critical infrastructure is still done by crews, helicopters and heavy equipment, at height and near live assets. The robots and drones in use today remain basic tools with limited autonomy. Prodigy is building the next generation: truly autonomous robotic and drone systems that take on the hardest work, safer, faster and at global scale.',
  // This phrase gets the accent colour once the reveal finishes.
  highlight: 'Prodigy is building the next generation',
};

export const SOLVE = {
  label: 'What we solve',
  title: 'The hardest work on the infrastructure the world depends on.',
  tiles: ['Autonomous inspection', 'Autonomous maintenance', 'Operations at height', 'On live assets'],
  focus: {
    label: 'In focus',
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
    { name: 'Jonathan Barkat', role: 'Co-founder & CEO' },
    { name: 'Ran Nussbaum', role: 'Co-founder & Chairman · Managing Partner & Co-founder, Pontifax' },
  ],
  note:
    'Our leadership team and engineers come from leading Israeli robotics and drone startups and from elite IDF technology units.',
};

export const CONTACT = {
  label: 'Contact',
  title: 'Get in touch.',
  intro: 'Interested in what we are building? We would like to hear from you.',
  fields: { name: 'Name', organization: 'Organization', email: 'Email', message: 'Message' },
  consent: 'I agree to the',
  consentLink: 'Privacy Policy',
  send: 'Send',
  sending: 'Sending',
  success: 'Thank you. We will be in touch.',
  error: 'Something went wrong. Please email us directly at',
};

export const FOOTER = {
  rights: 'All rights reserved.',
  privacy: 'Privacy',
};
